
import { switchStatus } from './actions';
import { tenantDb } from '@/src/lib/tenantDb';

jest.mock('@/src/lib/tenantDb');

jest.mock('@/src/lib/middleware', () => ({
    combineMiddlewares: (...middlewares: any[]) => (originalFn: any) => {
        return originalFn;
    },
}));

jest.mock('@/src/lib/middleware.filters', () => ({
    withTenantAuth: jest.fn(),
}));

describe('switchStatus Server Action (Schema: startaii)', () => {
    let mockDb: any;
    const SCHEMA = 'startaii';
    const ADMIN_ID = 'admin_123';

    beforeEach(() => {
        jest.clearAllMocks();
        mockDb = {
            $queryRaw: jest.fn(),
            $executeRaw: jest.fn(),
        };
        (tenantDb as jest.Mock).mockResolvedValue(mockDb);
    });

    it('SUCCESS: should switch status from ACTIVE to INACTIVE', async () => {
        mockDb.$queryRaw.mockResolvedValueOnce([{
            id: ADMIN_ID,
            role: 'ADMIN',
            status: 'ACTIVE'
        }]);

        const result = await switchStatus(ADMIN_ID, SCHEMA);

        expect(result.code).toBe(0);
        expect(result.message).toContain('Successful update');
        
        expect(mockDb.$executeRaw).toHaveBeenCalled();
    });

    it('SUCCESS: should switch status from INACTIVE to ACTIVE', async () => {
        // 模拟当前状态为 INACTIVE
        mockDb.$queryRaw.mockResolvedValueOnce([{
            id: ADMIN_ID,
            role: 'ADMIN',
            status: 'INACTIVE'
        }]);

        const result = await switchStatus(ADMIN_ID, SCHEMA);

        expect(result.code).toBe(0);
        expect(mockDb.$executeRaw).toHaveBeenCalled();
    });

    it('FORBIDDEN: should not allow switching status of SUPER administrator', async () => {

        mockDb.$queryRaw.mockResolvedValueOnce([{
            id: ADMIN_ID,
            role: 'SUPER',
            status: 'ACTIVE'
        }]);

        const result = await switchStatus(ADMIN_ID, SCHEMA);

        expect(result.code).toBe(1);
        expect(result.message).toContain('super administrator can not be edit');

        expect(mockDb.$executeRaw).not.toHaveBeenCalled();
    });

    it('NOT FOUND: should return code 1 if administrator does not exist', async () => {

        mockDb.$queryRaw.mockResolvedValueOnce([]);

        const result = await switchStatus('wrong_id', SCHEMA);

        expect(result.code).toBe(1);
        expect(result.message).toContain('not existed');
    });

    it('VALIDATION: should return error if adminId is missing', async () => {

        const result = await switchStatus('', SCHEMA);

        expect(result.code).toBe(1);
    });
});