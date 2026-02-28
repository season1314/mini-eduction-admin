import { tenantDb } from "@/src/lib/tenantDb"
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
dayjs.extend(utc);
dayjs.extend(timezone);

let memoizedTimeZones: Record<string, string> = {};
export async function getSystemTimeZone(schemaName: string): Promise<string> {
    if (memoizedTimeZones[schemaName]) {
        return memoizedTimeZones[schemaName];
    }
    const db = await tenantDb(schemaName);
    const tenantTable = `"${schemaName}"."SystemConfigs"`;
    const config = await db.$queryRawUnsafe<{ config_value: string }[]>(`SELECT config_value FROM ${tenantTable} WHERE config_key = 'timezone' LIMIT 1`);
    const timeZone = config?.[0]?.config_value || 'Pacific/Auckland';
    memoizedTimeZones[schemaName] = timeZone;
    return timeZone
}

export function clearTimeZoneCache(schemaName: string) {
    if (memoizedTimeZones[schemaName]) {
        delete memoizedTimeZones[schemaName];
    }
}


export async function UtfToTimeZone(schemaName: string, dates: any[]) {
    const tz = await getSystemTimeZone(schemaName)
    const newDates: any[] = []
    dates.map((item) => {
        let date
        if (!item) {
            date = null
        } else {
            date = dayjs.tz(item.replace('Z', ''), tz).utc().toISOString();
        }
        newDates.push(date)
    })
    return newDates
}

export function FormatUtfToTzString(date: Date,tz:string) {
    const string = dayjs.utc(date).tz(tz).format('DD/MM/YYYY HH:mm');
    return string
}