import { getAdmins } from './actions';
import { tenantDb } from "@/src/lib/tenantDb";
import { Prisma } from "@prisma/client";

jest.mock("@/src/lib/tenantDb");

describe('Administrator Actions data test', () => {
    let mockDb: any;

    beforeEach(() => {
        mockDb = {
            $queryRaw: jest.fn()
        };
        (tenantDb as jest.Mock).mockResolvedValue(mockDb);
    });

    test('Pagination Logic', async () => {

        const mockList = [{ id: 1, name: 'Admin A' }, { id: 2, name: 'Admin B' }];
        const mockCount = [{ count: BigInt(45) }];

        mockDb.$queryRaw
            .mockResolvedValueOnce(mockList)
            .mockResolvedValueOnce(mockCount);



        const result = await getAdmins(3, 'startaii', 20);

        expect(mockDb.$queryRaw).toHaveBeenCalledWith(
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
        await getAdmins(1, 'startaii', 20, keyword);

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

        const result = await getAdmins(1, 'startaii', 20);

        expect(result.code).toBe(0);
        expect(result.data?.total).toBe(0);
    });
});