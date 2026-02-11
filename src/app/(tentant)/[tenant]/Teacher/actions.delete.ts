import { tenantDb } from "@/src/lib/tenantDb"
import { Prisma } from "@prisma/client";
import { FormState } from "@/types/form";

export default async function deleteRaw(schemaName: string, teacherId: string): Promise<FormState> {
    //verify teacher id
    if (!teacherId) { return { code: 1, message: 'Please provide a valid teacher id.', timestamp: Date.now() } }

    if (!schemaName) { return { code: 1, message: 'Organization key cannot null', timestamp: Date.now() } }

    const db = await tenantDb(schemaName);
    const tenantTable = Prisma.raw(`"${schemaName}"."Teacher"`);

    //verify teacher existed
    const teachers = await db.$queryRaw<any[]>` SELECT "id", "name", "email","status" FROM ${tenantTable} WHERE "id" = ${teacherId}::integer  LIMIT 1`;
    const teacher = teachers[0]
    if (!teacher) { return { code: 1, message: "This teacher is not existed in database", timestamp: Date.now() } }

    try {
        await db.$executeRaw` DELETE FROM ${tenantTable} WHERE "id" = ${teacherId}`
        return { code: 0, message: "Successful delete teacher", timestamp: Date.now() };

    } catch (error: any) {
        console.log(error)
        const err = error as Error;
        return {
            code: 1,
            message: err.message || "Database Error",
            timestamp: Date.now()
        }
    }
}