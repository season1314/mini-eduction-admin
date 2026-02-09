
import bcrypt from "bcryptjs";
import { tenantDb } from "@/src/lib/tenantDb"
import { Prisma } from "@prisma/client";
import { valid } from "@/src/lib/validators";
import { FormState } from "@/types/form";


export default async function editAdminRaw(schemaName: string,prevState: FormState, formData: FormData): Promise<FormState> {
    const { adminId, name, password, confirmPwd } = Object.fromEntries(formData as any);

    if (!adminId) { return { code: 1, message: 'Please provide a valid admin id.', timestamp: Date.now() } }


    if (!schemaName) { return { code: 1, message: 'Organization key cannot null', timestamp: Date.now() } }

    //verify data
    const nameError = valid(name, 'Name').required().length(2, 70).getErrors()[0]
    const passError = password ? valid(password, 'Password').required().length(6, 32).getErrors()[0] : ''
    const rePwdError = confirmPwd ? valid(confirmPwd, 'Conform Password').required().length(6, 32).getErrors()[0] : ''

    if (nameError || passError || rePwdError) {
        return { code: 2, error: { name: nameError, password: passError, confirmPwd: rePwdError }, timestamp: Date.now() }
    }

    if ((password || confirmPwd) && password !== confirmPwd) {
        return { code: 2, error: { password: 'Passwords do not match', confirmPwd: 'Passwords do not match' }, timestamp: Date.now() };
    }
    const db = await tenantDb(schemaName);
    const tenantTable = Prisma.raw(`"${schemaName}"."Admin"`);

    //verify admin existed
    const admins = await db.$queryRaw<any[]>` SELECT "id", "name", "email", "role" FROM ${tenantTable} WHERE "id" = ${adminId}::integer  LIMIT 1`;
    const admin = admins[0]

    if (!admin) { return { code: 1, message: "This administrator is not existed in database", timestamp: Date.now() } }

    if (admin.role == 'SUPER') { return { code: 1, message: "This super administrator can not be edit", timestamp: Date.now() } }

    //check data change,no any change return success directly
    if (admin.name == name && !password) { return { code: 0, message: "Successful update administrator", timestamp: Date.now() } }


    //process update
    try {
        const updates = [Prisma.sql`"name" = ${name}`, Prisma.sql`"updated_at" = NOW()`];
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            updates.push(Prisma.sql`"password" = ${hashedPassword}`);
        }
        await db.$executeRaw`
            UPDATE ${tenantTable}
            SET ${Prisma.join(updates, ', ')}
            WHERE "id" = ${adminId}::integer
        `;
        return { code: 0, timestamp: Date.now(),message:"Updata successful" };
    } catch (e) {
        return { code: 1, message: "Update failed.", timestamp: Date.now() };
    }
}
