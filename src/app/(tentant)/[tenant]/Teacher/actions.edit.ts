import { tenantDb } from "@/src/lib/tenantDb"
import { Prisma } from "@prisma/client";
import { valid } from "@/src/lib/validators";
import { FormState } from "@/types/form";


export default async function editTeacherRaw(schemaName: string, prevState: FormState, formData: FormData): Promise<FormState> {
    const { teacherId, name, birth, gender, phone, contact, des, color } = Object.fromEntries(formData as any);

    if (!teacherId) { return { code: 1, message: 'Please provide a valid teacher id.', timestamp: Date.now() } }


    if (!schemaName) { return { code: 1, message: 'Organization key cannot null', timestamp: Date.now() } }

    //verify data
    const nameError = valid(name, 'Name').required().length(2, 70).getErrors()[0]

    if (nameError) {
        return { code: 2, error: { name: nameError }, timestamp: Date.now() }
    }

    const db = await tenantDb(schemaName);
    const tenantTable = Prisma.raw(`"${schemaName}"."Teacher"`);

    //verify teacher existed
    const teachers = await db.$queryRaw<any[]>` SELECT "id", "name", "email" FROM ${tenantTable} WHERE "id" = ${teacherId}::integer  LIMIT 1`;
    const teacher = teachers[0]
    

    if (!teacher) { return { code: 1, message: "This teacher is not existed in database", timestamp: Date.now() } }


    //process update
    try {
        const GenderType = `"template_schema"."Gender"`;
        const birthParam = (birth && birth !== "") ? birth : null;
        const genderParam = (gender && gender !== "") ? gender: 'UNKNOWN'
        const updates = [Prisma.sql`"name" = ${name}`, Prisma.sql`"updated_at" = NOW()`];
        updates.push(Prisma.sql`"birth_date" = ${birthParam}::DATE`);
        updates.push(Prisma.sql`"gender" = ${genderParam}::${Prisma.raw(GenderType)}`);
        updates.push(Prisma.sql`"phone_number" = ${phone}`);
        updates.push(Prisma.sql`"contact" = ${contact}`);
        updates.push(Prisma.sql`"des" = ${des}`);
        updates.push(Prisma.sql`"color" = ${color}`);
        await db.$executeRaw`
            UPDATE ${tenantTable}
            SET ${Prisma.join(updates, ', ')}
            WHERE "id" = ${teacherId}::integer
        `;
        return { code: 0, timestamp: Date.now(), message: "Updata successful" };
    } catch (e) {
        console.log(e)
        return { code: 1, message: "Update failed.", timestamp: Date.now() };
    }
}
