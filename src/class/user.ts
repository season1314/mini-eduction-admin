import { valid } from "@/src/lib/validators";
import dayjs from 'dayjs';
import { getSystemTimeZone } from "@/src/lib/timezone"
import bcrypt from 'bcryptjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
dayjs.extend(utc);
dayjs.extend(timezone);

interface ValidationResult {
    hasError: boolean;
    error?: Record<string, string | undefined>;
    message?: string
}

type UserStatus = 'ACTIVE' | 'BANNED';

type UserGender = 'MALE' | 'FEMALE' | 'OTHER' | 'UNKNOWN';

type MemberStatus = 'ACTIVE' | 'EXPIRED' | 'UPCOMING' | 'NONE'

export class BaseUser {
    id?: number;
    name: string;
    createdAt: Date;
    updatedAt: Date;
    createdId: number;
    createdBy: string;
    email: string;
    status: UserStatus;
    contact: string;
    registration: string
    constructor(data: any, session?: any, timezone?: string) {
        this.id = data.id || data.teacherId || data.studentId;
        this.name = data.name;
        this.createdAt = data.createdAt || data.created_at || new Date();
        this.updatedAt = data.updatedAt || data.updated_at || new Date();
        this.createdId = data.createdId || data.created_id || session?.user_id || null;
        this.createdBy = data.createdBy || data.created_by || session?.metadata.email || null;
        this.contact = data.contact;
        this.email = data.email;
        this.status = data.status || 'ACTIVE'
        this.registration = dayjs.utc(this.createdAt).tz(timezone).format('DD/MM/YYYY HH:mm')
    }


    static async formatList<T extends typeof BaseUser>(this: T, data: any, schemaName: string, session?: any,): Promise<InstanceType<T>> {
        const tz = await getSystemTimeZone(schemaName); //timezone format
        return new this(data, session, tz).toObject();
    }



    validateCreator() {
        if (!this.createdId || !this.createdBy) {
            return { hasError: true, message: "Session expired. Please log in again." }
        }
        return { hasError: false }
    }

    validateId(modeName: string) {
        if (!this.id) {
            return { hasError: true, message: `Please provide a valid ${modeName} id.` }
        }
        return { hasError: false }
    }

    toObject() {
        return JSON.parse(JSON.stringify(this));
    }
}

export class Administrator extends BaseUser {

}

export class TeacherStudent extends BaseUser {
    gender: UserGender;
    birth: Date | null;
    birthDisplay: string;
    phone: string;
    des: string
    constructor(data: any, session?: any, timezone?: string) {
        super(data, session, timezone);
        this.gender = data.gender;
        this.birth = data.birth || data.birth_date || null;
        this.birthDisplay = this.birth ? dayjs(this.birth).tz(timezone).format('DD/MM/YYYY') : '-'
        this.phone = data.phone_number || data.phone
        this.des = data.des
    }
}

export class Teacher extends TeacherStudent {
    teacherNo: string
    color: string
    constructor(data: any, session?: any, timezone?: string) {
        super(data, session, timezone)
        this.teacherNo = data.teacherNo || data.teacher_number
        this.color = data.color
    }

    validateBaseForm(): ValidationResult {
        let emailError = ""
        if (this.email) { emailError = valid(this.email, ' ').email().getErrors()[0] }
        const nameError = valid(this.name, ' ').required().length(2, 70).getErrors()[0];
        const teacherNoError = valid(this.teacherNo, '').required().length(2, 70).getErrors()[0]
        return {
            hasError: !!(emailError || nameError || teacherNoError),
            error: { email: emailError, name: nameError, teacherNo: teacherNoError }
        };
    }
}

export class Student extends TeacherStudent {
    studentNo: string;
    emContact: string;
    emPhone: string;
    membershipStatus?: MemberStatus;
    membershipExpiry?: Date;
    membershipStart?: Date;
    membershipExpiryString?: string;
    membershipStartString?: string;

    constructor(data: any, session?: any, timezone?: string) {
        super(data, session, timezone);
        this.studentNo = data.studentNo || data.student_number
        this.emContact = data.emContact || data.emergency_contact
        this.emPhone = data.emPhone || data.emergency_phone
        this.membershipExpiry = data.membershipExpiry || data.membership_expiry;
        this.refreshMembershipDisplay(timezone);
    }

    validateBaseForm(): ValidationResult {
        let emailError = ""
        if (this.email) { emailError = valid(this.email, ' ').email().getErrors()[0] }
        const nameError = valid(this.name, ' ').required().length(2, 70).getErrors()[0];
        const studentNoError = valid(this.studentNo, '').required().length(2, 70).getErrors()[0]
        return {
            hasError: !!(emailError || nameError || studentNoError),
            error: { email: emailError, name: nameError, teacherNo: studentNoError }
        };
    }

    refreshMembershipDisplay(timezone?: string) {
        this.membershipExpiryString = this.membershipExpiry
            ? dayjs(this.membershipExpiry).tz(timezone).format('DD/MM/YYYY')
            : '-';
        this.membershipStatus = this.calculateStatus();
    }

    private calculateStatus(): MemberStatus {
        if (!this.membershipExpiry) return 'NONE';
        const now = dayjs();
        const expiryDate = dayjs(this.membershipExpiry);
        return expiryDate.isBefore(now, 'day') ? 'EXPIRED' : 'ACTIVE';
    }
}