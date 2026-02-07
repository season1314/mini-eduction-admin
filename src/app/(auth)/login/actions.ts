"use server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { valid } from "@/src/lib/validators";
import { headers } from "next/headers";
import { tenantDb } from "@/src/lib/tenantDb"
import { SessionManager } from "@/src/lib/session";
import { FormState } from "@/types/form";

const prisma = new PrismaClient();

/**
 * 
 * @param prevState 
 * @param formData 
 * @returns 
 */

export async function loginAction(prevState: FormState, formData: FormData): Promise<FormState> {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const headerList = await headers();
    const ip = headerList.get("x-forwarded-for") || "unknown";
    try {
        const userError = valid(email, 'Email').required().email().getErrors()[0]
        const passError = valid(password, 'Password').required().length(6, 32).getErrors()[0]

        if (passError || userError) {
            return { code: 2, error: { email: userError, password: passError }, timestamp: Date.now() }
        }


        //query email -> TenantUser -> Tenant
        const tenancy = (await prisma.$queryRaw`SELECT t.key, t.name,t.schema_name, u.email AS user_email, u.id AS tenant_user_id 
            FROM public."Tenant" t
            JOIN public."TenantUser" u ON t.id = u.tenant_id
            WHERE u.email = ${email}`) as any[];

        if (tenancy.length == 0) return { code: 1, message: 'Your organization has not been set up yet. Please contact your administrator.', timestamp: Date.now() }

        if (tenancy.length > 1) return { code: 3, data: { tenancyList: tenancy }, timestamp: Date.now() }

        const schemaName = tenancy[0]?.key
        const db = await tenantDb(schemaName);
        const [admin] = await db.$queryRaw<any[]>`SELECT * FROM "Admin" WHERE LOWER(email) = LOWER(${email}) LIMIT 1`;

        if (!admin) {
            return { code: 1, message: 'The admin account does not exist in this organization. Please check your email or contact support.', data: { tenant: schemaName }, timestamp: Date.now() }
        }

        if (admin.status !== 'ACTIVE') {
            return { code: 1, message: 'Your account has been deactivated. Please contact your organization administrator.', data: { tenant: schemaName }, timestamp: Date.now() }
        }

        const isPasswordCorrect = await bcrypt.compare(password, admin.password);

        if (!isPasswordCorrect) return { code: 1, message: 'Incorrect password. Please try again.', data: { tenant: schemaName }, timestamp: Date.now() }


        await SessionManager.create(admin.id, schemaName, {});

        return { code: 0, message: 'Successful Login', timestamp: Date.now(), data: { schemaName, } };

    } catch (e) {
        console.log(e)
        return { code: 1, message: 'An unexpected error occurred. Please try again later.', timestamp: Date.now() };
    }
}