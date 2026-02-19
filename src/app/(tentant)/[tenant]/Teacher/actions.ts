"use server";
import { combineMiddlewares } from '@/src/lib/middleware';
import { withTenantAuth } from '@/src/lib/middleware.filters';
import { tenantDb } from "@/src/lib/tenantDb"
import { Prisma } from "@prisma/client";
import { FormState } from "@/types/form";
import { authStorage } from '@/src/lib/authContext';
import { Teacher } from '@/src/class/user'
import type { ReturnList } from "@/types/form"

//Create new teacher
async function createRaw(schemaName: string, prevState: FormState, formData: FormData): Promise<FormState> {
    if (!schemaName) { return { code: 1, message: 'Organization key cannot null', timestamp: Date.now() } }
    const rawData = Object.fromEntries(formData as any);
    const session = authStorage.getStore();
    const teacher = new Teacher(rawData, session)
    const validDate = teacher.validateBaseForm()
    if (validDate.hasError === true) { return { code: 2, error: validDate.error, timestamp: Date.now() } }
    const validCreator = teacher.validateCreator()
    if (validCreator.hasError === true) { return { code: 1, message: validCreator.message, timestamp: Date.now() } }
    const db = await tenantDb(schemaName);
    const tenantTable = Prisma.raw(`"${schemaName}"."Teacher"`);
    const isTeacherNoExisted = await db.$queryRaw<[{ count: bigint }]>`SELECT COUNT(*) as count FROM ${tenantTable} WHERE "teacher_number" = ${teacher.teacherNo}`
    if (Number(isTeacherNoExisted[0].count) > 0) { return { code: 1, message: "This teacher number is already in use", timestamp: Date.now() } }

    try {

        await db.$queryRaw`
            INSERT INTO ${tenantTable} 
            ("teacher_number","email", "name", "birth_date","gender","phone_number","updated_at", "contact","des","created_id", "created_by","color") 
            VALUES (${teacher.teacherNo},${teacher.email}, ${teacher.name}, ${teacher.birth}::timestamptz, ${teacher.gender}::"template_schema"."Gender",
            ${teacher.phone},${teacher.updatedAt},${teacher.contact},${teacher.des}, ${teacher.createdId}, ${teacher.createdBy},${teacher.color})`;
        return { code: 0, message: 'Successful create new teacher', timestamp: Date.now() }

    } catch (error) {
        console.log(error)
        const err = error as Error;
        return {
            code: 1,
            message: err.message || "Database Error",
            timestamp: Date.now()
        }
    }
}

//Get teacher list
async function getRaw(schemaName: string, page: number = 1, limit: number = 20, keyword: string = ""): Promise<ReturnList> {
    const offset = (page - 1) * limit;
    const db = await tenantDb(schemaName);
    const tableIdentifier = Prisma.raw(`"${schemaName}"."Teacher"`);
    const whereClause = keyword ? Prisma.sql`WHERE "name" ILIKE ${'%' + keyword + '%'} OR "teacher_number" ILIKE ${'%' + keyword + '%'}` : Prisma.empty;
    const [list, countRes] = await Promise.all([
        db.$queryRaw<any[]>`SELECT id, email, status, name, color,gender,contact, des, phone_number,birth_date, created_at,created_id,created_by,teacher_number FROM ${tableIdentifier} ${whereClause} ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`,
        db.$queryRaw<[{ count: bigint }]>`SELECT COUNT(*) as count FROM ${tableIdentifier} ${whereClause} `
    ]);
    const formatList = await Promise.all( list.map(item => Teacher.formatList(item, schemaName))
    );
    const totalItems = Number(countRes[0]?.count ?? 0);
    const totalPages = Math.ceil(totalItems / limit) || 1;
    return { code: 0, data: { list: formatList, total: totalPages, page, } }
}

//Edit teacher info
async function editRaw(schemaName: string, prevState: FormState, formData: FormData): Promise<FormState> {
    if (!schemaName) { return { code: 1, message: 'Organization key cannot null', timestamp: Date.now() } }

    const rawData = Object.fromEntries(formData as any);
    const session = authStorage.getStore();
    const teacher = new Teacher(rawData, session)
    const validId = teacher.validateId('teacher')
    if (validId.hasError === true) return { code: 1, message: validId.message, timestamp: Date.now() }
    const validDate = teacher.validateBaseForm()
    if (validDate.hasError === true) return { code: 2, error: validDate.error, timestamp: Date.now() }


    const db = await tenantDb(schemaName);
    const tenantTable = Prisma.raw(`"${schemaName}"."Teacher"`);
    const isTeacherNoExisted = await db.$queryRaw<any[]>` SELECT "id", "name", "email" FROM ${tenantTable} WHERE "id" = ${teacher.id}::integer  LIMIT 1`;
    if (!isTeacherNoExisted || !isTeacherNoExisted[0]) return { code: 1, message: "This teacher is not existed in database", timestamp: Date.now() }

    try {
        const GenderType = `"template_schema"."Gender"`;
        const birthParam = teacher.birth ? teacher.birth : null;
        const genderParam = teacher.gender ? teacher.gender : 'UNKNOWN'
        const updates = [Prisma.sql`"name" = ${teacher.name}`, Prisma.sql`"updated_at" = ${teacher.updatedAt}`];
        updates.push(Prisma.sql`"email" = ${teacher.email}`);
        updates.push(Prisma.sql`"birth_date" = ${birthParam}::timestamptz`);
        updates.push(Prisma.sql`"gender" = ${genderParam}::${Prisma.raw(GenderType)}`);
        updates.push(Prisma.sql`"phone_number" = ${teacher.phone}`);
        updates.push(Prisma.sql`"contact" = ${teacher.contact}`);
        updates.push(Prisma.sql`"des" = ${teacher.des}`);
        updates.push(Prisma.sql`"color" = ${teacher.color}`);
        await db.$executeRaw`UPDATE ${tenantTable} SET ${Prisma.join(updates, ', ')} WHERE "id" = ${teacher.id}::integer`;
        return { code: 0, timestamp: Date.now(), message: "Updata successful" };
    } catch (e) {
        console.log(e)
        return { code: 1, message: "Update failed.", timestamp: Date.now() };
    }
}

//Switch teacher status
async function switchStatusRaw(schemaName: string, teacherId: string): Promise<FormState> {
    if (!teacherId) { return { code: 1, message: 'Please provide a valid teacher id.', timestamp: Date.now() } }
    if (!schemaName) { return { code: 1, message: 'Organization key cannot null', timestamp: Date.now() } }
    const db = await tenantDb(schemaName);
    const tenantTable = Prisma.raw(`"${schemaName}"."Teacher"`);
    const teachers = await db.$queryRaw<any[]>` SELECT "id", "name", "email","status" FROM ${tenantTable} WHERE "id" = ${teacherId}  LIMIT 1`;
    const teacher = teachers[0]
    if (!teacher) { return { code: 1, message: "This teacher is not existed in database", timestamp: Date.now() } }
    const enumType = Prisma.raw(`"template_schema"."Status"`);
    let updates = []
    if (teacher.status == 'ACTIVE') {
        updates = [Prisma.sql`"status" = 'BANNED'::${enumType}`];
    } else {
        updates = [Prisma.sql`"status" = 'ACTIVE'::${enumType}`];
    }
    await db.$executeRaw`
    UPDATE ${tenantTable}
    SET ${Prisma.join(updates, ', ')}
    WHERE "id" = ${teacherId}`;

    return { code: 0, message: "Successful update teacher status", timestamp: Date.now() };
}

//Delete teacher
async function deleteRaw(schemaName: string, teacherId: string): Promise<FormState> {
    if (!teacherId) { return { code: 1, message: 'Please provide a valid teacher id.', timestamp: Date.now() } }
    if (!schemaName) { return { code: 1, message: 'Organization key cannot null', timestamp: Date.now() } }
    const db = await tenantDb(schemaName);
    const tenantTable = Prisma.raw(`"${schemaName}"."Teacher"`);
    const teachers = await db.$queryRaw<any[]>` SELECT "id", "name", "email","status" FROM ${tenantTable} WHERE "id" = ${teacherId}::integer  LIMIT 1`;
    const teacher = teachers[0]
    if (!teacher) { return { code: 1, message: "This teacher is not existed in database", timestamp: Date.now() } }

    try {
        await db.$executeRaw` DELETE FROM ${tenantTable} WHERE "id" = ${teacherId}`
        return { code: 0, message: "Successful delete teacher", timestamp: Date.now() };

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



export const getTeachers = combineMiddlewares(withTenantAuth)(getRaw);

export const createTeacher = combineMiddlewares(withTenantAuth)(createRaw);

export const editTeacher = combineMiddlewares(withTenantAuth)(editRaw)

export const switchStatus = combineMiddlewares(withTenantAuth)(switchStatusRaw)

export const deleteTeacher = combineMiddlewares(withTenantAuth)(deleteRaw)