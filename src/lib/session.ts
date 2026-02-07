import { prisma } from './prisma';
import { v4 as uuidv4 } from 'uuid';
import { cookies } from 'next/headers';

export const SessionManager = {

    async create(userId: number, tenantKey: string, metadata = {}) {
        const sessionId = uuidv4();
        const duration = 60 * 60 * 72; // 24小时
        const expiresAt = new Date(Date.now() + duration * 1000);


        await prisma.$executeRawUnsafe(
            `DELETE FROM public."Session" WHERE "user_id" = $1::int AND "tenant_key" = $2`,
            userId,
            tenantKey
        );

        await prisma.$executeRawUnsafe(
            `INSERT INTO public."Session" 
            (id, "user_id", "tenant_key", metadata, "expires_at", "created_at") 
            VALUES ($1, $2::int, $3, $4::jsonb, $5, NOW())`,
            sessionId,
            userId,
            tenantKey,
            JSON.stringify(metadata),
            expiresAt
        );

        const cookieStore = await cookies();
        cookieStore.set("session_id", sessionId, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            path: "/",
            maxAge: duration,
        });

        return sessionId;
    },

    async verify() {
        const cookieStore = await cookies();
        const sessionId = cookieStore.get("session_id")?.value;

        if (!sessionId) return null;

        const sessions = await prisma.$queryRawUnsafe<any[]>(
            `SELECT * FROM public."Session" WHERE id = $1 LIMIT 1`,
            sessionId
        );
        const session = sessions.length > 0 ? sessions[0] : null;
        if (!session || session.expiresAt < new Date()) {
            if (session) await this.revoke(sessionId);
            return null;
        }

        return session;
    },

    async revoke(sessionId: string) {
        await prisma.session.delete({ where: { id: sessionId } }).catch(() => { });
        const cookieStore = await cookies();
        cookieStore.delete("session_id");
    }
};