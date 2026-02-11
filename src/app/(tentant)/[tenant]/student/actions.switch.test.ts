
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
    const STUDENT_ID = 'student_123';

    beforeEach(() => {
        jest.clearAllMocks();
        mockDb = {
            $queryRaw: jest.fn(),
            $executeRaw: jest.fn(),
        };
        (tenantDb as jest.Mock).mockResolvedValue(mockDb);
    });

    it('SUCCESS: should switch status from ACTIVE to BANNED', async () => {
        mockDb.$queryRaw.mockResolvedValueOnce([{
            id: STUDENT_ID,
            status: 'ACTIVE'
        }]);

        const result = await switchStatus(STUDENT_ID, SCHEMA);

        expect(result.code).toBe(0);
        expect(result.message).toContain('Successful update');
        
        expect(mockDb.$executeRaw).toHaveBeenCalled();
    });

    it('SUCCESS: should switch status from BANNED to ACTIVE', async () => {
        // 模拟当前状态为 INACTIVE
        mockDb.$queryRaw.mockResolvedValueOnce([{
            id: STUDENT_ID,
            status: 'BANNED'
        }]);

        const result = await switchStatus(STUDENT_ID, SCHEMA);

        expect(result.code).toBe(0);
        expect(mockDb.$executeRaw).toHaveBeenCalled();
    });


    it('NOT FOUND: should return code 1 if student does not exist', async () => {

        mockDb.$queryRaw.mockResolvedValueOnce([]);

        const result = await switchStatus('wrong_id', SCHEMA);

        expect(result.code).toBe(1);
        expect(result.message).toContain('not existed');
    });

    it('VALIDATION: should return error if studentId is missing', async () => {

        const result = await switchStatus('', SCHEMA);

        expect(result.code).toBe(1);
    });
});