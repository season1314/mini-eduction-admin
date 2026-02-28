"use server";
import { combineMiddlewares } from '@/src/lib/middleware';
import { withTenantAuth } from '@/src/lib/middleware.filters';
import { tenantDb } from "@/src/lib/tenantDb"
import { Prisma } from "@prisma/client";
import { BaseMember } from "@/src/class/member"
import { FormState } from "@/types/form";
import { authStorage } from '@/src/lib/authContext';


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
        return { code: 0, message: "Successful updated or created membership", timestamp: Date.now() }
    } catch (error) {
        console.log(error)
        return { code: 1, message: "Database error", timestamp: Date.now() }

    }
}




export const createMember = combineMiddlewares(withTenantAuth)(createRaw);
