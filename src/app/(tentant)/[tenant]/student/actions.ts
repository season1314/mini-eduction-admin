"use server";
import { combineMiddlewares } from '@/src/lib/middleware';
import { withTenantAuth } from '@/src/lib/middleware.filters';
import editRaw from "./actions.edit";
// import deleteTeacherRaw from "./actions.delete"
import switchStatusRaw from "./actions.switch"
import { tenantDb } from "@/src/lib/tenantDb"
import { Prisma } from "@prisma/client";
import type { ReturnList } from "@/types/form"
import { Student } from "@/src/class/user"
import { valid } from "@/src/lib/validators";
import { FormState } from "@/types/form";
import { authStorage } from '@/src/lib/authContext';


//Get student list
async function getRaw(schemaName: string, page: number = 1, limit: number = 20, keyword: string = "", startDate: Date | undefined, endDate: Date | undefined, expiryStatus: string): Promise<ReturnList> {
    const offset = (page - 1) * limit;
    const db = await tenantDb(schemaName);
    const tenantTableStudent = Prisma.raw(`"${schemaName}"."Student"`);
    const tenantTableMembership = Prisma.raw(`"${schemaName}"."Membership"`);
    const conditions = [];
    if (keyword) { const searchKeyword = `%${keyword}%`; conditions.push(Prisma.sql`("name" ILIKE ${searchKeyword} OR "student_number" ILIKE ${searchKeyword})`) }
    if (startDate) { conditions.push(Prisma.sql`s.created_at >= ${startDate}::timestamptz`); }
    if (endDate) { conditions.push(Prisma.sql`s.created_at <= ${endDate}::timestamptz`); }
    if (expiryStatus && expiryStatus == 'NONE') { conditions.push(Prisma.sql`m.student_id IS NULL`); }
    if (expiryStatus && expiryStatus == 'ACTIVE') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        conditions.push(Prisma.sql`m.membership_expiry >= ${today}`)
    }
    if (expiryStatus && expiryStatus === 'EXPIRED') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        conditions.push(Prisma.sql`m.membership_expiry < ${today}`);
    }

    const whereClause = conditions.length > 0 ? Prisma.sql`WHERE ${Prisma.join(conditions, ' AND ')}` : Prisma.empty;
    
    const [list, countRes] = await Promise.all([

        db.$queryRaw<any[]>`SELECT s.id, s.email, s.status, s.name, s.gender, s.contact, s.des, s.phone_number, s.birth_date, 
            s.created_at, s.student_number, s.emergency_contact, s.emergency_phone,s.created_id,s.created_by,m.membership_expiry
        FROM ${tenantTableStudent} s LEFT JOIN ${tenantTableMembership} m ON s.id = m.student_id
        ${whereClause} ORDER BY s.created_at DESC LIMIT ${limit} OFFSET ${offset}`,

        db.$queryRaw<[{ count: bigint }]>`SELECT COUNT(*) as count FROM ${tenantTableStudent} s LEFT JOIN ${tenantTableMembership} m ON s.id = m.student_id
        ${whereClause}`
    ]);

    const formatList = await Promise.all(list.map(item => Student.formatList(item, schemaName)));
    console.log(formatList)
    const totalItems = Number(countRes[0]?.count ?? 0);
    const totalPages = Math.ceil(totalItems / limit) || 1
    return { code: 0, data: { list: formatList, total: totalPages, page, } }
}


//Create new student
async function createRaw(schemaName: string, prevState: FormState, formData: FormData): Promise<FormState> {
    if (!schemaName) { return { code: 1, message: 'Organization key cannot null', timestamp: Date.now() } }
    const rawData = Object.fromEntries(formData as any);
    const session = authStorage.getStore();
    const student = new Student(rawData, session)
    const validDate = student.validateBaseForm()
    if (validDate.hasError === true) { return { code: 2, error: validDate.error, timestamp: Date.now() } }
    const validCreator = student.validateCreator()
    if (validCreator.hasError === true) { return { code: 1, message: validCreator.message, timestamp: Date.now() } }

    const db = await tenantDb(schemaName);
    const tenantTable = Prisma.raw(`"${schemaName}"."Student"`);

    //verify studentNo not existed in tenant student
    const isStudentExisted = await db.$queryRaw<[{ count: bigint }]>`SELECT COUNT(*) as count FROM ${tenantTable} WHERE "student_number" = ${student.studentNo}`

    if (Number(isStudentExisted[0].count) > 0) { return { code: 1, message: "This student number is already in use", timestamp: Date.now() } }

    //create new student
    const GenderType = `"template_schema"."Gender"`;

    try {
        await db.$queryRaw`
        INSERT INTO ${tenantTable} 
        ("email", "emergency_contact" , "emergency_phone","student_number","name", "birth_date","gender","phone_number","updated_at", "contact","des","created_id", "created_by") 
        VALUES (${student.email},${student.emContact},${student.emPhone},${student.studentNo}, ${student.name}, ${student.birth}::DATE, 
        ${student.gender}::${Prisma.raw(GenderType)},${student.phone},${student.updatedAt},${student.contact},${student.des}, 
        ${student.createdId}, ${student.createdBy})`;
        return { code: 0, message: 'Successful create new student', timestamp: Date.now() }
    } catch (error) {
        const err = error as Error;
        return {
            code: 1,
            message: err.message || "Database Error",
            timestamp: Date.now()
        }
    }
}


export const getStudent = combineMiddlewares(withTenantAuth)(getRaw);

export const createStudent = combineMiddlewares(withTenantAuth)(createRaw);

export const editStudent = combineMiddlewares(withTenantAuth)(editRaw)

export const switchStatus = combineMiddlewares(withTenantAuth)(switchStatusRaw)

// export const deleteTeacher = combineMiddlewares(withTenantAuth)(deleteTeacherRaw)