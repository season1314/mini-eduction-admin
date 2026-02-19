import { tenantDb } from "@/src/lib/tenantDb"
import { Prisma } from "@prisma/client";

let memoizedTimeZone: string | null = null;
export async function getSystemTimeZone(schemaName: string): Promise<string> {
    if (memoizedTimeZone) {
        return memoizedTimeZone;
    }
    const db = await tenantDb(schemaName);
    const tenantTable = `"${schemaName}"."SystemConfigs"`;
    const config = await db.$queryRawUnsafe<{ config_value: string }[]>(`SELECT config_value FROM ${tenantTable} WHERE config_key = 'timezone' LIMIT 1`);
    memoizedTimeZone = config?.[0]?.config_value || 'Pacific/Auckland';
    return memoizedTimeZone as string;
}

export function clearTimeZoneCache() {
    memoizedTimeZone = null;
}