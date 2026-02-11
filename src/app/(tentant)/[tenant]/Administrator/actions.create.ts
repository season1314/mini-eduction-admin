import bcrypt from "bcryptjs";
import { tenantDb } from "@/src/lib/tenantDb"
import { Prisma } from "@prisma/client";
import { valid } from "@/src/lib/validators";
import { FormState } from "@/types/form";
import { authStorage } from '@/src/lib/authContext';




export default async function createRaw(schemaName: string, prevState: FormState, formData: FormData): Promise<FormState> {

    const { email, name, password, confirmPwd } = Object.fromEntries(formData as any);

    //verify data
    const userError = valid(email, ' ').required().email().getErrors()[0]
    const nameError = valid(name, ' ').required().length(2, 70).getErrors()[0]
    const passError = valid(password, ' ').required().length(6, 32).getErrors()[0]
    const rePwdError = valid(confirmPwd, ' ').required().length(6, 32).getErrors()[0]

    if (nameError || userError || passError || rePwdError) {
        return { code: 2, error: { email: userError, name: nameError, password: passError, confirmPwd: rePwdError }, timestamp: Date.now()}
    }

    if (!schemaName) {
        return { code: 1, message: 'Organization key cannot null', timestamp: Date.now() }
    }

    if (password !== confirmPwd) {
        return { code: 2, error: { password: 'Passwords not match', confirmPwd: 'Passwords not match' }, timestamp: Date.now() }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    //get session for created
    const session = authStorage.getStore();

    if (!session?.user_id) {
        return { code: 1, message: 'Session expired. Please log in again.', timestamp: Date.now() }
    }


    //verify the email not existed in tenant
    const db = await tenantDb(schemaName);
    const tenantTable = Prisma.raw(`"${schemaName}"."Admin"`);
    const publicTenantTable = Prisma.raw(`"public"."Tenant"`)
    const publicTenantUserTable = Prisma.raw(`"public"."TenantUser"`)

    //verify tenant existed and  email not existed in tenant admin
    const [tenant, isEmailExisted] = await Promise.all([
        db.$queryRaw<any[]>`SELECT id, key, status FROM ${publicTenantTable} WHERE "key" = ${schemaName} AND "status" = 'ACTIVE' LIMIT 1`,
        db.$queryRaw<[{ count: bigint }]>`SELECT COUNT(*) as count FROM ${tenantTable} WHERE "email" = ${email}`]
    )

    if (!tenant[0]) {
        return { code: 1, message: 'Organization does not exist or is inactive. ', timestamp: Date.now() }
    }

    if (Number(isEmailExisted[0].count) > 0) {
        return { code: 1, message: "This email is already in use", timestamp: Date.now() };
    }


    //create relation in public schema and new admin in tenant schema
    const roleType = `"template_schema"."Role"`;
    try {
        await db.$transaction(async (tx) => {
            await tx.$executeRaw` INSERT INTO ${publicTenantUserTable} ("email", "tenant_id", "tenant_key","updated_at") 
            VALUES (${email}, ${tenant[0].id}, ${tenant[0].key}, NOW())`;
            await tx.$executeRaw` INSERT INTO ${tenantTable} ("email","password","name","role","updated_at","created_id","created_by") 
            VALUES (${email}, ${hashedPassword}, ${name},${'ADMIN'}::text::${Prisma.raw(roleType)}, NOW(), ${session.user_id}, ${session.metadata.email})`
        })
        return { code: 0, message: "Successful created new admin", timestamp: Date.now() };

    } catch (error: any) {
        const errorMessages: Record<string, string> = {
            "TENANT_NOT_FOUND": "Organization does not exist.",
            "EMAIL_EXISTED": "This email is already in use."
        };
        console.log(error)
        return {
            code: 1,
            message: errorMessages[error.message] || "Database Error",
            timestamp: Date.now()
        };
    }
}