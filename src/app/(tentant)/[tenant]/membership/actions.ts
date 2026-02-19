"use server";
import { combineMiddlewares } from '@/src/lib/middleware';
import { withTenantAuth } from '@/src/lib/middleware.filters';
import { tenantDb } from "@/src/lib/tenantDb"
import { Prisma } from "@prisma/client";
import { BaseMember,Membership } from "@/src/class/member"
import { FormState } from "@/types/form";
import { authStorage } from '@/src/lib/authContext';
import type { ReturnList } from "@/types/form"


//Create or update new expiry date
async function createRaw(schemaName: string, prevState: FormState, formData: FormData): Promise<FormState> {
    if (!schemaName) { return { code: 1, message: 'Organization key cannot null', timestamp: Date.now() } }
    const rawData = Object.fromEntries(formData as any);
    const session = authStorage.getStore();
    const member = BaseMember.membershipRecordFormat(rawData, session)
    const validDate = member.validateBaseForm()
    if (validDate.hasError === true) { return { code: 1, message: validDate.message, timestamp: Date.now() } }
    const validCreator = member.validateCreator()
    if (validCreator.hasError === true) return { code: 1, message: validCreator.message, timestamp: Date.now() }
    const membershipTable = Prisma.raw(`"${schemaName}"."Membership"`);
    const memberShipRecordTable = Prisma.raw(`"${schemaName}"."MembershipRecord"`)
    const db = await tenantDb(schemaName);
    try {
        await db.$transaction(async (tx) => {
            await tx.$executeRaw`INSERT INTO ${membershipTable} ("membership_expiry", "created_at","updated_at","student_id") 
                VALUES (${member.newExpiry}::timestamptz, ${member.createdAt}::timestamptz, ${member.updatedAt}::timestamptz, ${member.studentId}::Integer)
                ON CONFLICT ("student_id") 
                DO UPDATE SET "membership_expiry" = EXCLUDED."membership_expiry","updated_at" = ${member.updatedAt}::timestamptz`;

            await tx.$executeRaw` INSERT INTO ${memberShipRecordTable} (
                "old_expiry","new_expiry","note","created_at","student_id","student_record","created_id","created_record") 
                VALUES (${member.oldExpiry ? member.oldExpiry : null}::timestamptz, ${member.newExpiry}::timestamptz, ${member.note}, ${member.createdAt}::timestamptz, 
                        ${member.studentId}::Integer, ${member.studentRecord},${member.createdId}::Integer,${member.createdBy})`
        })
        return { code: 0, message: "Successful update or create membership", timestamp: Date.now() }
    } catch (error) {
        console.log(error)
        return { code: 1, message: "Database error", timestamp: Date.now() }

    }
}

//Get member List
async function getRaw(schemaName: string, page: number = 1, limit: number = 20, keyword: string = ""): Promise<ReturnList> {
    const offset = (page - 1) * limit;
    const db = await tenantDb(schemaName);
    const memberTable = Prisma.raw(`"${schemaName}"."Membership"`);
    const studentTable = Prisma.raw(`"${schemaName}"."Student"`);
    const whereClause = keyword ? Prisma.sql`WHERE s."name" ILIKE ${'%' + keyword + '%'} OR s."student_number" ILIKE ${'%' + keyword + '%'}` : Prisma.empty;
    const [list, countRes] = await Promise.all([
        db.$queryRaw<any[]>`SELECT m.id, m.student_id, m.updated_at, m.created_at,m.membership_expiry,s.name as "studentName",s.student_number as "studentNo" 
        FROM ${memberTable} m LEFT JOIN ${studentTable} s ON m.student_id = s.id ${whereClause} ORDER BY m.membership_expiry DESC LIMIT ${limit} OFFSET ${offset}`,
        db.$queryRaw<[{ count: bigint }]>`SELECT COUNT(*) as count FROM ${memberTable} m LEFT JOIN ${studentTable} s ON m.student_id = s.id ${whereClause}`
    ]);

    const formatList = await Promise.all(list.map(item => Membership.formatList(item, schemaName)))
    const totalItems = Number(countRes[0]?.count ?? 0);
    const totalPages = Math.ceil(totalItems / limit) || 1;

    console.log(formatList)
    return { code: 0, data: { list: formatList, total: totalPages, page, } }
}



export const createMember = combineMiddlewares(withTenantAuth)(createRaw);

export const getMembers = combineMiddlewares(withTenantAuth)(getRaw);
