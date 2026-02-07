"use server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { tenantDb } from "@/src/lib/tenantDb"
import { Prisma } from "@prisma/client";
import { combineMiddlewares } from '@/src/lib/middleware';
import { withTenantAuth } from '@/src/lib/middleware.filters';
import dayjs from 'dayjs';
import { valid } from "@/src/lib/validators";
import { FormState } from "@/types/form";

const prisma = new PrismaClient();

export interface ReturnData {
    code: number;
    data?: { list: any[], total: number, page: number };
    message?: string
}

interface FormData {
    id?: number;
    name: string;
    role: string;
    email: string;
}


//Get administrator list
async function getAdminsRaw(page: number = 1, schemaName: string, limit: number = 20, keyword: string = ""): Promise<ReturnData> {
    const offset = (page - 1) * limit;
    const db = await tenantDb(schemaName);
    const tableIdentifier = Prisma.raw(`"${schemaName}"."Admin"`);
    const whereClause = keyword ? Prisma.sql`WHERE "name" ILIKE ${'%' + keyword + '%'} OR "email" ILIKE ${'%' + keyword + '%'}` : Prisma.empty;

    const [list, countRes] = await Promise.all([
        db.$queryRaw<any[]>`SELECT id, email, role, status, created_at as "createdAt",created_id as "createdId",created_by as createdBy FROM ${tableIdentifier} ${whereClause} ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`,
        db.$queryRaw<[{ count: bigint }]>`SELECT COUNT(*) as count FROM ${tableIdentifier} ${whereClause} `
    ]);

    const formatList = list.map((item) => {
        item.createAt = dayjs(item.createdAt).format('D MMM YYYY HH:mm')
        item.createdBy = item.createdId == 0 ? 'System' : item.createdBy
        return item
    })
    const totalItems = Number(countRes[0]?.count ?? 0);
    const totalPages = Math.ceil(totalItems / limit);
    return { code: 0, data: { list: formatList, total: totalPages, page, } }
}

//Create new administrator 
async function createAdminRaw(prevState: FormState, formData: FormData): Promise<FormState> {
    const { email, tenant: schemaName, name, password, conformPwd } = Object.fromEntries(formData as any);

    const userError = valid(email, 'Email').required().email().getErrors()[0]
    const nameError = valid(name, 'Name').required().length(2, 10).getErrors()[0]
    const passError = valid(password, 'Password').required().length(6, 32).getErrors()[0]
    const rePwdError = valid(conformPwd, 'Conform Password').required().length(6, 32).getErrors()[0]

    if (nameError || userError || passError || rePwdError) {
        return { code: 2, error: { email: userError, name: nameError, password: password, conformPwd: rePwdError }, timestamp: Date.now() }
    }

    if (!schemaName) {
        return { code: 1, message: 'Organization key cannot null', timestamp: Date.now() }
    }

    //verify the email not existed in tenant
    const db = await tenantDb(schemaName);
    const tenantTable = Prisma.raw(`"${schemaName}"."Admin"`);
    const publicTable = Prisma.raw(`"public"."User"`)

    const [tenant, isEmailExisted] = await Promise.all([
        await db.$queryRaw<any[]>`SELECT id, key, status, FROM ${publicTable} WHERE "key" = ${schemaName} AND "status" = 'ACTIVE' LIMIT 1`,
        await db.$queryRaw<[{ count: bigint }]>`SELECT COUNT(*) as count FROM ${tenantTable} WHERE "email" = ${email}`]
    )

    if (!tenant[0]) {
        return { code: 1, message: 'Organization does not exist or is inactive. ', timestamp: Date.now() }
    }

    if (Number(isEmailExisted[0].count) > 0) {
        return { code: 1, message: "This email is already in use", timestamp: Date.now() };
    }

    try {
        await db.$transaction(async (tx) => {
            await tx.$executeRaw` INSERT INTO ${publicTable} ("email", "tenant_id", "tenant_key","created_at") VALUES (${email}, ${tenant[0].id}, ${tenant[0].key}, NOW())`;
            

        })

    } catch (error) {

    }


    return { code: 0, timestamp: 1 }
}

//Edit administrator status
async function editAdminRaw(forData: any[]): Promise<ReturnData> {
    return { code: 0 }
}

//Switch administrator status
async function switchStatus(adminId: string): Promise<ReturnData> {
    return { code: 0 }
}

//Reset password status
async function resetPassword(adminId: string): Promise<ReturnData> {
    return { code: 0 }
}

//Delete administrator
async function deleteAdminRaw(adminId: string): Promise<ReturnData> {
    return { code: 0 }

}




export const getAdmins = combineMiddlewares(withTenantAuth)(getAdminsRaw);

export const createAdmin = combineMiddlewares(withTenantAuth)(createAdminRaw);