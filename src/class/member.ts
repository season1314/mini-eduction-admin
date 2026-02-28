
import dayjs from 'dayjs';
import { getSystemTimeZone } from "@/src/lib/timezone"
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
dayjs.extend(utc);
dayjs.extend(timezone);


export type BaseMemberProps = {
    id?: number;
    oldExpiry?: Date;
    newExpiry: Date;
    note: string;
    studentId: number;
    studentRecord: any[];
    updatedAt: Date;
    createdAt: Date;
    createdId: number | null;
    createdBy: string | null;
    studentName?: string;
    studentNo?: string;
    oldExpiryString?: string;
    newExpiryString?: string;
    createdAtString?: string;
    color?: string
};

export class BaseMember {
    id?: number;
    oldExpiry?: Date;
    newExpiry!: Date;
    note!: string;
    studentId!: number;
    studentRecord!: any[];
    updatedAt!: Date;
    createdAt!: Date;
    createdId!: number | null;
    createdBy!: string | null;
    studentName?: string;
    studentNo?: string;
    oldExpiryString?: string;
    newExpiryString?: string;
    createdAtString?: string;
    color?: string

    private constructor(props: BaseMemberProps) {
        Object.assign(this, props);
    }

    static membershipRecordFormat(data: any, session?: any) {
        return new BaseMember({
            id: data.id ?? data.memberId,
            oldExpiry: data.memberOldExpiry ?? null,
            newExpiry: data.memberNewExpiry ?? null,
            note: data.note || '-',
            studentId: data.studentId ?? data.student_id,
            studentRecord: data.studentRecord ?? data.student_record ?? { studentName: data.studentName, studentNo: data.studentNo },
            updatedAt: new Date(),
            createdAt: new Date(),
            createdId: data.createdId ?? data.created_id ?? session.user_id ?? null,
            createdBy: data.createdBy ?? data.created_by ?? session?.metadata ?? null
        });
    }

    static async membershipRecordListFormat(data: any, schemaName: string) {
        const tz = await getSystemTimeZone(schemaName)
        const sRecord = data.student_record ?? data.studentRecord
        const oldExpiry = data.old_expiry ?? data.oldExpiry
        const newExpiry = data.new_expiry ?? data.newExpiry
        return new BaseMember({
            id: data.id ? Number(data.id) : data.id,
            oldExpiry: oldExpiry,
            newExpiry: newExpiry,
            oldExpiryString: oldExpiry ? dayjs(oldExpiry).format('DD/MM/YYYY') : '-',
            newExpiryString: newExpiry ? dayjs(newExpiry).format('DD/MM/YYYY') : '-',
            note: data.note || '-',
            studentId: data.student_id ?? data.studentId,
            studentRecord: sRecord,
            studentName: data.studentName ?? sRecord.studentName,
            studentNo: data.studentNo ?? sRecord.studentNo,
            updatedAt: data.updated_at,
            createdAt: data.created_at,
            createdAtString: data.created_at ? dayjs(data.created_at).tz(tz).format('DD/MM/YYYY HH:mm') : '-',
            createdId: data.created_id,
            createdBy: data.created_record?.email
        }).toObject()
    }

    validateBaseForm() {
        if (!this.studentId) {
            return { hasError: true, message: "Please choose a student." };
        }
        if (!this.newExpiry) {
            return { hasError: true, message: "Please choose new expiry date" }
        }
        return { hasError: false };
    }
    validateCreator() {
        if (!this.createdId || !this.createdBy) {
            return { hasError: true, message: "Session expired. Please log in again." }
        }
        return { hasError: false }
    }
    toObject() {
        return JSON.parse(JSON.stringify(this));
    }

}