import { tenantDb } from "@/src/lib/tenantDb"
import { Prisma } from "@prisma/client";
import dayjs from 'dayjs';
import type { ReturnList } from "@/types/form"



export default async function getRaw(schemaName: string, page: number = 1, limit: number = 20, keyword: string = ""): Promise<ReturnList> {
    const offset = (page - 1) * limit;
    const db = await tenantDb(schemaName);
    const tableIdentifier = Prisma.raw(`"${schemaName}"."Teacher"`);
    const whereClause = keyword ? Prisma.sql`WHERE "name" ILIKE ${'%' + keyword + '%'} OR "email" ILIKE ${'%' + keyword + '%'}` : Prisma.empty;

    const [list, countRes] = await Promise.all([
        db.$queryRaw<any[]>`SELECT id, email, status, name, color,gender,contact, des, phone_number as "phone",birth_date as "birth", created_at as "createdAt",created_id as "createdId",created_by as "createdBy" FROM ${tableIdentifier} ${whereClause} ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`,
        db.$queryRaw<[{ count: bigint }]>`SELECT COUNT(*) as count FROM ${tableIdentifier} ${whereClause} `
    ]);

    const formatList = list.map((item) => {
        item.createdAt = dayjs(item.createdAt).format('DD/MM/YYYY HH:mm')
        item.birthISO = item.birth ? dayjs(item.birth).format('DD/MM/YYYY') : ""
        return item
    })

    const totalItems = Number(countRes[0]?.count ?? 0);
    const totalPages = Math.ceil(totalItems / limit) || 1;
    return { code: 0, data: { list: formatList, total: totalPages, page, } }
}
