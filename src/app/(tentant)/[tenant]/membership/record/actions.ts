"use server";
import { tenantDb } from "@/src/lib/tenantDb"
import { Prisma } from "@prisma/client";
import { BaseMember } from "@/src/class/member"
import type { ReturnList } from "@/types/form"
import { combineMiddlewares } from '@/src/lib/middleware';
import { withTenantAuth } from '@/src/lib/middleware.filters';
import { UtfToTimeZone } from '@/src/lib/timezone'

//Get member List
async function getRaw(schemaName: string, page: number = 1, limit: number = 20, keyword: string = "", startDate: string | undefined, endDate: string | undefined): Promise<ReturnList> {
    const offset = (page - 1) * limit;
    const db = await tenantDb(schemaName);
    const memberTable = Prisma.raw(`"${schemaName}"."MembershipRecord"`);
    const studentTable = Prisma.raw(`"${schemaName}"."Student"`);
    const conditions = [];
    const dataRanger = await UtfToTimeZone(schemaName, [startDate, endDate])
    if (keyword) { const searchKeyword = `%${keyword}%`; conditions.push(Prisma.sql`((s."name" ILIKE ${searchKeyword}) OR (s."student_number" ILIKE ${searchKeyword}))`); }
    if (dataRanger[0]) { conditions.push(Prisma.sql`m.created_at >= ${dataRanger[0]}::timestamptz`); }
    if (dataRanger[1]) { conditions.push(Prisma.sql`m.created_at <= ${dataRanger[1]}::timestamptz`); }
    const whereClause = conditions.length > 0 ? Prisma.sql`WHERE ${Prisma.join(conditions, ' AND ')}` : Prisma.empty;
    const [list, countRes] = await Promise.all([
        db.$queryRaw<any[]>`SELECT m.*,s.student_number,s.name as "studentName"
        FROM ${memberTable} m LEFT JOIN ${studentTable} s ON m.student_id = s.id ${whereClause} ORDER BY m.created_at DESC LIMIT ${limit} OFFSET ${offset}`,
        db.$queryRaw<[{ count: bigint }]>`SELECT COUNT(*) as count FROM ${memberTable} m LEFT JOIN ${studentTable} s ON m.student_id = s.id ${whereClause}`
    ]);
    const formatList = await Promise.all(list.map(item => BaseMember.membershipRecordListFormat(item, schemaName)))
    const totalItems = Number(countRes[0]?.count ?? 0);
    const totalPages = Math.ceil(totalItems / limit) || 1;
    return { code: 0, data: { list: formatList, total: totalPages, page, } }
}


export const getMembers = combineMiddlewares(withTenantAuth)(getRaw);
