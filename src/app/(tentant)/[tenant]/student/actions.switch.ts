"use server";
import { tenantDb } from "@/src/lib/tenantDb"
import { Prisma } from "@prisma/client";
import { FormState } from "@/types/form";

export default async function switchStatusRaw(schemaName: string, studentId: string): Promise<FormState> {
    //verify student id
    if (!studentId) { return { code: 1, message: 'Please provide a valid student id.', timestamp: Date.now() } }

    if (!schemaName) { return { code: 1, message: 'Organization key cannot null', timestamp: Date.now() } }


    const db = await tenantDb(schemaName);
    const tenantTable = Prisma.raw(`"${schemaName}"."Student"`);

    //verify teacher existed
    const student = await db.$queryRaw<any[]>` SELECT "id", "name", "email","status" FROM ${tenantTable} WHERE "id" = ${studentId}  LIMIT 1`;
    const study = student[0]

    if (!study) { return { code: 1, message: "This teacher is not existed in database", timestamp: Date.now() } }

    const enumType = Prisma.raw(`"template_schema"."Status"`);

    let updates = []
    if (study.status == 'ACTIVE') {
        updates = [Prisma.sql`"status" = 'BANNED'::${enumType}`];
    } else {
        updates = [Prisma.sql`"status" = 'ACTIVE'::${enumType}`];
    }

    //update teacher status
    await db.$executeRaw`
    UPDATE ${tenantTable}
    SET ${Prisma.join(updates, ', ')}
    WHERE "id" = ${studentId}`;

    return { code: 0, message: "Successful update teacher status", timestamp: Date.now() };
}
