"use server";
import { combineMiddlewares } from '@/src/lib/middleware';
import { withTenantAuth } from '@/src/lib/middleware.filters';
import { tenantDb } from "@/src/lib/tenantDb"
import { Prisma } from "@prisma/client";
import type { ReturnList } from "@/types/form"
import { Student } from "@/src/class/user"
import { FormState } from "@/types/form";
import { authStorage } from '@/src/lib/authContext';
import { UtfToTimeZone } from '@/src/lib/timezone'


//Get student list
async function getRaw(schemaName: string, page: number = 1, limit: number = 20, keyword: string = "", startDate: string | undefined, endDate: string | undefined, expiryStatus: string): Promise<ReturnList> {
    const offset = (page - 1) * limit;
    const db = await tenantDb(schemaName);
    const tenantTableStudent = Prisma.raw(`"${schemaName}"."Student"`);
    const tenantTableMembership = Prisma.raw(`"${schemaName}"."Membership"`);
    const dataRanger = await UtfToTimeZone(schemaName, [startDate, endDate])
    const conditions = [];
    if (keyword) { const searchKeyword = `%${keyword}%`; conditions.push(Prisma.sql`("name" ILIKE ${searchKeyword} OR "student_number" ILIKE ${searchKeyword})`) }
    if (dataRanger[0]) { conditions.push(Prisma.sql`s.created_at >= ${dataRanger[0]}::timestamptz`); }
    if (dataRanger[1]) { conditions.push(Prisma.sql`s.created_at <= ${dataRanger[1]}::timestamptz`); }
    if (expiryStatus && expiryStatus == 'NONE') { conditions.push(Prisma.sql`m.student_id IS NULL`); }
    if (expiryStatus && expiryStatus == 'ACTIVE') { const today = new Date(); today.setHours(0, 0, 0, 0); conditions.push(Prisma.sql`m.membership_expiry >= ${today}`) }
    if (expiryStatus && expiryStatus === 'EXPIRED') { const today = new Date(); today.setHours(0, 0, 0, 0); conditions.push(Prisma.sql`m.membership_expiry < ${today}`); }
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

    const isStudentExisted = await db.$queryRaw<[{ count: bigint }]>`SELECT COUNT(*) as count FROM ${tenantTable} WHERE "student_number" = ${student.studentNo}`

    if (Number(isStudentExisted[0].count) > 0) { return { code: 1, message: "This student number is already in use", timestamp: Date.now() } }

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


//Edit student
async function editRaw(schemaName: string, prevState: FormState, formData: FormData): Promise<FormState> {
    if (!schemaName) { return { code: 1, message: 'Organization key cannot null', timestamp: Date.now() } }
    const rawData = Object.fromEntries(formData as any);
    const session = authStorage.getStore();
    const student = new Student(rawData, session)
    const isStudentId = student.validateId('student')
    if (isStudentId.hasError === true) { return { code: 1, message: isStudentId.message, timestamp: Date.now() } }
    const validDate = student.validateBaseForm()
    if (validDate.hasError === true) { return { code: 2, message: validDate.message, timestamp: Date.now() } }
    const validCreator = student.validateCreator()
    if (validCreator.hasError === true) { return { code: 1, message: validCreator.message, timestamp: Date.now() } }
    const db = await tenantDb(schemaName);
    const tenantTable = Prisma.raw(`"${schemaName}"."Student"`);
    const isStudentNoExisted = await db.$queryRaw<any[]>` SELECT "id", "name", "email" FROM ${tenantTable} WHERE "id" = ${student.id}::integer  LIMIT 1`;
    if (!isStudentNoExisted || !isStudentNoExisted[0]) return { code: 1, message: "This teacher is not existed in database", timestamp: Date.now() }
    try {
        const GenderType = `"template_schema"."Gender"`;
        const StatusType = `"template_schema"."Status"`;
        const birthParam = student.birth ? student.birth : null;
        const genderParam = student.gender ? student.gender : 'UNKNOWN'
        const updates = [Prisma.sql`"name" = ${student.name}`, Prisma.sql`"updated_at" = ${student.updatedAt}`];
        updates.push(Prisma.sql`"email" = ${student.email}`);
        updates.push(Prisma.sql`"birth_date" = ${birthParam}::timestamptz`);
        updates.push(Prisma.sql`"gender" = ${genderParam}::${Prisma.raw(GenderType)}`);
        updates.push(Prisma.sql`"phone_number" = ${student.phone}`);
        updates.push(Prisma.sql`"contact" = ${student.contact}`);
        updates.push(Prisma.sql`"status" = ${student.status}::${Prisma.raw(StatusType)}`);
        updates.push(Prisma.sql`"emergency_contact" = ${student.emContact}`);
        updates.push(Prisma.sql`"emergency_phone" = ${student.emPhone}`);
        await db.$executeRaw`UPDATE ${tenantTable} SET ${Prisma.join(updates, ',')} WHERE "id" = ${student.id}::integer`;
        return { code: 0, timestamp: Date.now(), message: "Updata successful" };
    } catch (e) {
        console.log(e)
        return { code: 1, message: "Update failed.", timestamp: Date.now() };
    }
}


//Delete student
async function deleteRaw(schemaName: string, prevState: FormState, formData: FormData): Promise<FormState> {
    const { studentId, confirmStudentNo } = Object.fromEntries(formData as any);
    if (!studentId) { return { code: 1, message: 'Please provide a valid student id.', timestamp: Date.now() } }
    if (!confirmStudentNo) { return { code: 1, message: 'Please enter student number confirm deletion.', timestamp: Date.now() } }
    if (!schemaName) { return { code: 1, message: 'Organization key cannot null', timestamp: Date.now() } }
    const db = await tenantDb(schemaName);
    const tenantTable = Prisma.raw(`"${schemaName}"."Student"`);
    const student = await db.$queryRaw<any[]>` SELECT "id", "name", "email","status","student_number" as "studentNo" FROM ${tenantTable} WHERE "id" = ${studentId}::integer  LIMIT 1`;
    const stud = student[0]
    if (!stud) { return { code: 1, message: "This student is not existed in database", timestamp: Date.now() } }
    if (stud.studentNo !== confirmStudentNo) { return { code: 1, message: "Please enter student number confirm deletion", timestamp: Date.now() } }
    try {
        await db.$executeRaw` DELETE FROM ${tenantTable} WHERE "id" = ${studentId}::integer`
        return { code: 0, message: "Successful delete student", timestamp: Date.now() };
    } catch (error: any) {
        console.log(error)
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

export const deleteStudent = combineMiddlewares(withTenantAuth)(deleteRaw)