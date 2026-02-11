import { tenantDb } from "@/src/lib/tenantDb"
import { Prisma } from "@prisma/client";
import { valid } from "@/src/lib/validators";
import { FormState } from "@/types/form";
import { authStorage } from '@/src/lib/authContext';




export default async function createRaw(schemaName: string, prevState: FormState, formData: FormData): Promise<FormState> {

    const { email, name, birth, gender, phone, contact, des, studentNo, emContact, emPhone } = Object.fromEntries(formData as any);

    let emailError = "";

    if (email) { emailError = valid(email, ' ').email().getErrors()[0] }
    const nameError = valid(name, ' ').required().length(2, 70).getErrors()[0]
    const studentNoError = valid(studentNo, '').required().length(2, 100).getErrors()[0]

    if (emailError || nameError || studentNoError) {
        return { code: 2, error: { email: emailError, name: nameError, studentNo: studentNoError }, timestamp: Date.now() }
    }

    if (!schemaName) {
        return { code: 1, message: 'Organization key cannot null', timestamp: Date.now() }
    }

    //get session for created
    const session = authStorage.getStore();

    if (!session?.user_id) {
        return { code: 1, message: 'Session expired. Please log in again.', timestamp: Date.now() }
    }

    const db = await tenantDb(schemaName);
    const tenantTable = Prisma.raw(`"${schemaName}"."Teacher"`);

    //verify studentNo not existed in tenant student
    const isStudentExisted = await db.$queryRaw<[{ count: bigint }]>`SELECT COUNT(*) as count FROM ${tenantTable} WHERE "student_number" = ${studentNo}`

    if (Number(isStudentExisted[0].count) > 0) {
        return { code: 1, message: "This student number is already in use", timestamp: Date.now() };
    }

    //create new student
    const GenderType = `"template_schema"."Gender"`;
    const birthParam = (birth && birth !== "") ? birth : null;
    const genderParam = (gender && gender !== "") ? gender : 'UNKNOWN'

    try {
        await db.$queryRaw`
        INSERT INTO ${tenantTable} 
        ("email", "emergency_contact" , "emergency_phone","student_number","name", "birth_date","gender","phone_number","updated_at", "contact","des","created_id", "created_by") 
        VALUES (${email},${emContact},${emPhone},${studentNo}, ${name}, ${birthParam}::DATE, ${genderParam}::${Prisma.raw(GenderType)},${phone},NOW(),${contact},${des}, ${session.user_id}, ${session.metadata.email})`;

        return { code: 0, message: 'Successful create new student', timestamp: Date.now() }

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