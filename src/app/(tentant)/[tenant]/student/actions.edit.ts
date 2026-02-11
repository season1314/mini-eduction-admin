import { tenantDb } from "@/src/lib/tenantDb"
import { Prisma } from "@prisma/client";
import { valid } from "@/src/lib/validators";
import { FormState } from "@/types/form";


export default async function editRaw(schemaName: string, prevState: FormState, formData: FormData): Promise<FormState> {
    const { studentId, email, name, birth, gender, phone, contact, des, emContact, emPhone } = Object.fromEntries(formData as any);

    if (!studentId) { return { code: 1, message: 'Please provide a valid student id.', timestamp: Date.now() } }


    if (!schemaName) { return { code: 1, message: 'Organization key cannot null', timestamp: Date.now() } }

    //verify data
    let emailError = "";

    if (email) { emailError = valid(email, ' ').email().getErrors()[0] }


    const nameError = valid(name, 'Name').required().length(2, 70).getErrors()[0]

    if (nameError || emailError) {
        return { code: 2, error: { name: nameError, email: emailError }, timestamp: Date.now() }
    }

    const db = await tenantDb(schemaName);
    const tenantTable = Prisma.raw(`"${schemaName}"."Student"`);

    //verify teacher existed
    const student = await db.$queryRaw<any[]>` SELECT "id", "name", "email" FROM ${tenantTable} WHERE "id" = ${studentId}::integer  LIMIT 1`;
    const study = student[0]


    if (!study) { return { code: 1, message: "This student is not existed in database", timestamp: Date.now() } }


    //process update
    try {
        const GenderType = `"template_schema"."Gender"`;
        const birthParam = (birth && birth !== "") ? birth : null;
        const genderParam = (gender && gender !== "") ? gender : 'UNKNOWN'
        const updates = [Prisma.sql`"name" = ${name}`, Prisma.sql`"updated_at" = NOW()`];
        updates.push(Prisma.sql`"birth_date" = ${birthParam}::DATE`);
        updates.push(Prisma.sql`"gender" = ${genderParam}::${Prisma.raw(GenderType)}`);
        updates.push(Prisma.sql`"phone_number" = ${phone}`);
        updates.push(Prisma.sql`"contact" = ${contact}`);
        updates.push(Prisma.sql`"des" = ${des}`);
        updates.push(Prisma.sql`"email" = ${email}`);
        updates.push(Prisma.sql`"emergency_contact" = ${emContact}`);
        updates.push(Prisma.sql`"emergency_phone" = ${emPhone}`);
        await db.$executeRaw`
            UPDATE ${tenantTable}
            SET ${Prisma.join(updates, ', ')}
            WHERE "id" = ${studentId}::integer
        `;
        return { code: 0, timestamp: Date.now(), message: "Updata successful" };
    } catch (e) {
        console.log(e)
        return { code: 1, message: "Update failed.", timestamp: Date.now() };
    }
}
