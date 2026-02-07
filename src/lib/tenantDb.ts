// lib/tenantDb.ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as {
    prismaClients: Record<string, PrismaClient>;
};

const clients = globalForPrisma.prismaClients || {};
if (process.env.NODE_ENV !== "production") globalForPrisma.prismaClients = clients;

export async function tenantDb(schemaName: string) {
    if (clients[schemaName]) {
        return clients[schemaName];
    }
    const connectionLimit = 3;

    const client = new PrismaClient({
        datasources: {
            db: {
                url: `${process.env.DATABASE_URL}&schema=${schemaName}&connection_limit=${connectionLimit}&search_path=${schemaName},public`,
            },
        },
    });

    clients[schemaName] = client;
    return client;
}