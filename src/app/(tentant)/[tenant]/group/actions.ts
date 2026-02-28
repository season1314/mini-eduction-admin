"use server";
import { tenantDb } from "@/src/lib/tenantDb"
import { Prisma } from "@prisma/client";
import type { ReturnList } from "@/types/form"
import { combineMiddlewares } from '@/src/lib/middleware';
import { withTenantAuth } from '@/src/lib/middleware.filters';
import { FormState } from "@/types/form";
import { valid } from "@/src/lib/validators";
import { authStorage } from '@/src/lib/authContext';
import { FormatUtfToTzString,getSystemTimeZone} from '@/src/lib/timezone'

//Get Class List
async function getRaw(schemaName: string, page: number = 1, limit: number = 20, keyword: string = ""): Promise<ReturnList> {
    const offset = (page - 1) * limit;
    const db = await tenantDb(schemaName);
    const classTable = Prisma.raw(`"${schemaName}"."Class"`);
    const studentTable = Prisma.raw(`"${schemaName}"."ClassStudent"`);
    const whereClause = keyword ? Prisma.sql`WHERE "name" ILIKE ${'%' + keyword + '%'}` : Prisma.empty;

    const [list, countRes] = await Promise.all([
        db.$queryRaw<any[]>`SELECT c.id,c.name,c.description,c.created_by as "createdBy",c.updated_at as "updatedAt",c.created_at as "createdAt",COUNT(s.student_id)::INT AS "studentCount"
        FROM ${classTable} c LEFT JOIN ${studentTable} s ON c.id = s.class_id ${whereClause} GROUP BY c.id ORDER BY c.created_at DESC LIMIT ${limit} OFFSET ${offset}`,
        db.$queryRaw<[{ count: bigint }]>`SELECT COUNT(*) as count FROM ${classTable} ${whereClause}`
    ]);

    const tz = await getSystemTimeZone(schemaName)

    const formatList = list.map((item) => {
        item.createAtString = FormatUtfToTzString(item.createdAt,tz)
        item.updatedAtString =FormatUtfToTzString(item.updatedAt,tz)
        item.des = item.des || '-'
        return item
    })

    const totalItems = Number(countRes[0]?.count ?? 0);
    const totalPages = Math.ceil(totalItems / limit) || 1;
    return { code: 0, data: { list: formatList, total: totalPages, page, } }
}


//Create class
async function createRaw(schemaName: string, prevState: FormState, formData: FormData) {
    if (!schemaName) { return { code: 1, message: 'Organization key cannot null', timestamp: Date.now() } }
    const { name, des } = Object.fromEntries(formData as any);
    const nameError = valid(name, ' ').required().length(2, 70).getErrors()[0]
    if (nameError) { return { code: 2, error: { name: nameError }, timestamp: Date.now() } }
    const session = authStorage.getStore();
    if (!session?.user_id) { return { code: 1, message: 'Session expired. Please log in again.', timestamp: Date.now() } }
    const db = await tenantDb(schemaName);
    const tenantTable = Prisma.raw(`"${schemaName}"."Class"`);
    const isClassNameExisted = await db.$queryRaw<any[]>`SELECT id FROM ${tenantTable} WHERE "name" = ${name} LIMIT 1`
    if (isClassNameExisted && isClassNameExisted.length > 0) { return { code: 1, message: 'A class with this name already exists', timestamp: Date.now() } }

    try {
        await db.$executeRaw` INSERT INTO ${tenantTable} ("name", "description", "updated_at","created_id","created_by") 
        VALUES (${name}, ${des}, NOW(),${session.user_id},${session.metadata.email})`;
        return { code: 0, message: "Successful created membership" }
    } catch (error) {
        console.log(error)
        return {
            code: 1,
            message: error || "Database Error",
            timestamp: Date.now()
        };
    }
}

export const createClass = combineMiddlewares(withTenantAuth)(createRaw);
export const getClass = combineMiddlewares(withTenantAuth)(getRaw);
