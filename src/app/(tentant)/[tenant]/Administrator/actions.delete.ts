import { tenantDb } from "@/src/lib/tenantDb"
import { Prisma } from "@prisma/client";
import { FormState } from "@/types/form";

export default async function deleteAdminRaw(schemaName: string, adminId: string): Promise<FormState> {
    //verify admin id
    if (!adminId) { return { code: 1, message: 'Please provide a valid admin id.', timestamp: Date.now() } }

    if (!schemaName) { return { code: 1, message: 'Organization key cannot null', timestamp: Date.now() } }

    const db = await tenantDb(schemaName);
    const tenantTable = Prisma.raw(`"${schemaName}"."Admin"`);
    const publicTenantTable = Prisma.raw(`"public"."Tenant"`)
    const publicTenantUserTable = Prisma.raw(`"public"."TenantUser"`)

    //verify admin existed
    const admins = await db.$queryRaw<any[]>` SELECT "id", "name", "email", "role","status" FROM ${tenantTable} WHERE "id" = ${adminId}::integer  LIMIT 1`;
    const admin = admins[0]

    if (!admin) { return { code: 1, message: "This administrator is not existed in database", timestamp: Date.now() } }
    if (admin.role == 'SUPER') { return { code: 1, message: "This super administrator can not be delete", timestamp: Date.now() } }

    const tenant = await db.$queryRaw<any[]>`SELECT id, key, status FROM ${publicTenantTable} WHERE "key" = ${schemaName} AND "status" = 'ACTIVE' LIMIT 1`

    if (!tenant[0]) {
        return { code: 1, message: 'Organization does not exist or is inactive. ', timestamp: Date.now() }
    }

    try {
        await db.$transaction(async (tx) => {
            await tx.$executeRaw` DELETE FROM ${publicTenantUserTable} WHERE "tenant_id" = ${tenant[0].id} AND "email" = ${admin.email}`;
            await tx.$executeRaw` DELETE FROM ${tenantTable} WHERE "id" = ${adminId}`;
        })
        return { code: 0, message: "Successful delete administrator", timestamp: Date.now()};

    } catch (error: any) {
        const errorMessages: Record<string, string> = {
            "TENANT_NOT_FOUND": "Organization does not exist.",
            "ID_EXISTED": "This id is not exist"
        };
        return {
            code: 1,
            message: errorMessages[error.message] || "Database Error",
            timestamp: Date.now()
        };
    }
}