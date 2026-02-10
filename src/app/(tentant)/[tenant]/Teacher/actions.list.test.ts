
jest.mock('uuid', () => ({
    v4: () => 'test-uuid-value',
}));

jest.mock('next/headers', () => ({
    cookies: jest.fn(async () => ({
        get: jest.fn((name: string) => ({ value: 'mock-session-id' })),
        set: jest.fn(),
        delete: jest.fn(),
    })),
}));

jest.mock('@/src/lib/session', () => ({
    SessionManager: {
        verify: jest.fn(async () => ({
            user_id: 1,
            tenant_key: 'startaii'
        }))
    }
}));

import { getTeachers } from './actions';
import { tenantDb } from "@/src/lib/tenantDb";
import { Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import { authStorage } from '@/src/lib/authContext';

jest.mock("@/src/lib/tenantDb");



//List
describe('Teacher Actions data test', () => {
    let mockDb: any;

    beforeEach(() => {
        mockDb = {
            $queryRaw: jest.fn()
        };
        (tenantDb as jest.Mock).mockResolvedValue(mockDb);
    });

    test('Pagination Logic', async () => {

        const mockList = [{ id: 1, name: 'teacher A' }, { id: 2, name: 'teacher B' }];
        const mockCount = [{ count: BigInt(45) }];

        mockDb.$queryRaw
            .mockResolvedValueOnce(mockList)
            .mockResolvedValueOnce(mockCount);



        const result = await getTeachers( 'startaii',3, 20);

        expect(mockDb.$queryRaw).toHaveBeenCalledWith(
            expect.anything(),
            expect.anything(),
            expect.anything(),
            20,
            40
        );

        expect(result.data?.total).toBe(3);
    });

    test('Search Filtering', async () => {
        mockDb.$queryRaw.mockResolvedValueOnce([]).mockResolvedValueOnce([{ count: BigInt(0) }]);

        const keyword = "test";
        await getTeachers('startaii', 1, 20, keyword);

        const listCallArgs = mockDb.$queryRaw.mock.calls[0];
        const listSqlJson = JSON.stringify(listCallArgs);

        expect(listSqlJson).toContain('ILIKE');

        expect(listSqlJson).toContain('%test%');

        const countCallArgs = mockDb.$queryRaw.mock.calls[1];
        expect(JSON.stringify(countCallArgs)).toContain('%test%');
    });

    test('Empty Data Handling', async () => {
        mockDb.$queryRaw
            .mockResolvedValueOnce([])
            .mockResolvedValueOnce([]);

        const result = await getTeachers('startaii', 1, 20);

        expect(result.code).toBe(0);
        expect(result.data?.total).toBe(0);
    });
});


