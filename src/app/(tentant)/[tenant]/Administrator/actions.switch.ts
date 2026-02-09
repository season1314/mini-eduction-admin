"use server";
import { tenantDb } from "@/src/lib/tenantDb"
import { Prisma } from "@prisma/client";
import { FormState } from "@/types/form";

export default async function switchStatusRaw(schemaName: string, adminId: string): Promise<FormState> {
    //verify admin id
    if (!adminId) { return { code: 1, message: 'Please provide a valid admin id.', timestamp: Date.now() } }

    if (!schemaName) { return { code: 1, message: 'Organization key cannot null', timestamp: Date.now() } }


    const db = await tenantDb(schemaName);
    const tenantTable = Prisma.raw(`"${schemaName}"."Admin"`);

    //verify admin existed
    const admins = await db.$queryRaw<any[]>` SELECT "id", "name", "email", "role","status" FROM ${tenantTable} WHERE "id" = ${adminId}  LIMIT 1`;
    const admin = admins[0]

    if (!admin) { return { code: 1, message: "This administrator is not existed in database", timestamp: Date.now() } }
    if (admin.role == 'SUPER') { return { code: 1, message: "This super administrator can not be edit", timestamp: Date.now() } }


    const enumType = Prisma.raw(`"template_schema"."Status"`);

    let updates = []
    if (admin.status == 'ACTIVE') {
        updates = [Prisma.sql`"status" = 'BANNED'::${enumType}`];
    } else {
        updates = [Prisma.sql`"status" = 'ACTIVE'::${enumType}`];
    }

    //update admin status
    await db.$executeRaw`
    UPDATE ${tenantTable}
    SET ${Prisma.join(updates, ', ')}
    WHERE "id" = ${adminId}`;

    return { code: 0, message: "Successful update administrator status", timestamp: Date.now() };
}
