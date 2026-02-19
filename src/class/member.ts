
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

    private constructor(props: BaseMemberProps) {
        Object.assign(this, props);
    }

    static membershipRecordFormat(data: any, session?: any) {
        return new BaseMember({
            id: data.id ?? data.memberId,
            oldExpiry: data.memberOldExpiry ?? null,
            newExpiry: data.memberNewExpiry ?? null,
            note: data.note,
            studentId: data.studentId ?? data.student_id,
            studentRecord: data.studentRecord ?? data.student_record ?? { studentName: data.studentName, studentNo: data.studentNo } ?? {},
            updatedAt: new Date(),
            createdAt: new Date(),
            createdId: data.createdId ?? data.created_id ?? session.user_id ?? null,
            createdBy: data.createdBy ?? data.created_by ?? session?.metadata ?? null
        });
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
}


export class Membership {
    id: number;
    studentId: number;
    studentNo: string;
    expiry: Date | null;
    updatedAt: Date;
    createdAt: Date;
    lastModified: string;
    studentName:string;
    createdAtString:string;
    expiryDisplay:string;

    constructor(data: any, session?: any, timezone?: string) {
        this.id = data.id || data.teacherId || data.studentId;
        this.studentId = data.studentId || data.student_id;
        this.createdAt = data.createdAt || data.created_at || new Date();
        this.updatedAt = data.updatedAt || data.updated_at || new Date();
        this.studentNo = data.studentNo || data.student_number || null;
        this.expiry = data.membership_expiry ? dayjs(data.membership_expiry).tz(timezone).toDate() : null;
        if (data.membership_expiry || data.expiry) {
            const expiryDay = dayjs(data.membership_expiry || data.expiry).startOf('day');
            this.expiry = expiryDay.toDate();
            this.expiryDisplay = expiryDay.format('DD/MM/YYYY');
        } else {
            this.expiry = null;
            this.expiryDisplay = '-';
        }
        this.updatedAt = data.updated_at
        this.createdAt = data.created_at
        this.studentName = data.studentName
        this.createdAtString = dayjs.utc(this.createdAt).tz(timezone).format('DD/MM/YYYY HH:mm')
        this.lastModified = dayjs.utc(this.updatedAt).tz(timezone).format('DD/MM/YYYY HH:mm')
    }

    static async formatList<T extends typeof Membership>(this: T, data: any, schemaName: string, session?: any,): Promise<InstanceType<T>> {
        const tz = await getSystemTimeZone(schemaName);
        return new this(data, session, tz).toObject();
    }

    toObject() {
        return JSON.parse(JSON.stringify(this));
    }

}
