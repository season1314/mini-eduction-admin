"use server";
import { tenantDb } from "@/src/lib/tenantDb"
import { Prisma } from "@prisma/client";
import { FormState } from "@/types/form";

export default async function switchStatusRaw(schemaName: string, teacherId: string): Promise<FormState> {
    //verify admin id
    if (!teacherId) { return { code: 1, message: 'Please provide a valid admin id.', timestamp: Date.now() } }

    if (!schemaName) { return { code: 1, message: 'Organization key cannot null', timestamp: Date.now() } }


    const db = await tenantDb(schemaName);
    const tenantTable = Prisma.raw(`"${schemaName}"."Teacher"`);

    //verify admin existed
    const teachers = await db.$queryRaw<any[]>` SELECT "id", "name", "email","status" FROM ${tenantTable} WHERE "id" = ${teacherId}  LIMIT 1`;
    const teacher = teachers[0]

    if (!teacher) { return { code: 1, message: "This teacher is not existed in database", timestamp: Date.now() } }

    const enumType = Prisma.raw(`"template_schema"."Status"`);

    let updates = []
    if (teacher.status == 'ACTIVE') {
        updates = [Prisma.sql`"status" = 'BANNED'::${enumType}`];
    } else {
        updates = [Prisma.sql`"status" = 'ACTIVE'::${enumType}`];
    }

    //update admin status
    await db.$executeRaw`
    UPDATE ${tenantTable}
    SET ${Prisma.join(updates, ', ')}
    WHERE "id" = ${teacherId}`;

    return { code: 0, message: "Successful update teacher status", timestamp: Date.now() };
}
