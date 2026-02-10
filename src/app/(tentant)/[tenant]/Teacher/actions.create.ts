import { tenantDb } from "@/src/lib/tenantDb"
import { Prisma } from "@prisma/client";
import { valid } from "@/src/lib/validators";
import { FormState } from "@/types/form";
import { authStorage } from '@/src/lib/authContext';




export default async function createTeacherRaw(schemaName: string, prevState: FormState, formData: FormData): Promise<FormState> {

    const { email, name, birth, gender, phone, contact, des, color } = Object.fromEntries(formData as any);

    //verify data
    const emailError = valid(email, ' ').required().email().getErrors()[0]
    const nameError = valid(name, ' ').required().length(2, 70).getErrors()[0]
    if (emailError || nameError) {
        return { code: 2, error: { email: emailError, name: nameError }, timestamp: Date.now() }
    }

    if (!schemaName) {
        return { code: 1, message: 'Organization key cannot null', timestamp: Date.now() }
    }

    //get session for created
    const session = authStorage.getStore();

    if (!session?.user_id) {
        return { code: 1, message: 'Session expired. Please log in again.', timestamp: Date.now() }
    }


    //verify the email not existed in tenant
    const db = await tenantDb(schemaName);
    const tenantTable = Prisma.raw(`"${schemaName}"."Teacher"`);

    //verify email not existed in tenant admin
    const isEmailExisted = await db.$queryRaw<[{ count: bigint }]>`SELECT COUNT(*) as count FROM ${tenantTable} WHERE "email" = ${email}`

    if (Number(isEmailExisted[0].count) > 0) {
        return { code: 1, message: "This email is already in use", timestamp: Date.now() };
    }

    //create new teacher
    const GenderType = `"template_schema"."Gender"`;
    const birthParam = (birth && birth !== "") ? birth : null;
    const genderParam = (gender && gender !== "") ? gender : 'UNKNOWN'

    try {
        await db.$queryRaw`
        INSERT INTO ${tenantTable} 
        ("email", "name", "birth_date","gender","phone_number","updated_at", "contact","des","created_id", "created_by","color") 
        VALUES (${email}, ${name}, ${birthParam}::DATE, ${genderParam}::${Prisma.raw(GenderType)},${phone},NOW(),${contact},${des}, ${session.user_id}, ${session.metadata.email},${color})`;

        return { code: 0, message: 'Successful create new teacher', timestamp: Date.now() }

    } catch (error) {
        console.log(error)
        const err = error as Error;
        return {
            code: 1,
            message: err.message || "Database Error",
            timestamp: Date.now()
        }
    }
}