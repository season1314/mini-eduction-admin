
import { deleteTeacher } from './actions';
import { tenantDb } from '@/src/lib/tenantDb';


jest.mock('@/src/lib/middleware', () => ({
    combineMiddlewares: (...middlewares: any[]) => (originalFn: any) => {
        return originalFn;
    },
}));

jest.mock('@/src/lib/middleware.filters', () => ({
    withTenantAuth: jest.fn(),
}));

// Mock DB Utility
jest.mock('@/src/lib/tenantDb');

describe('deleteAdmin Server Action', () => {
    let mockDb: any;
    let mockTx: any;
    const SCHEMA = 'startaii';
    const TEACHER_ID = 'uuid_123';

    beforeEach(() => {
        jest.clearAllMocks();


        mockDb = {
            $queryRaw: jest.fn(),
            $transaction: jest.fn(async (callback) => await callback(mockTx)),
            $executeRaw: jest.fn(), // 加上这一行
        };

        (tenantDb as jest.Mock).mockResolvedValue(mockDb);
    });

    it('SUCCESS: should delete teacher from tenant tables', async () => {
        mockDb.$queryRaw.mockResolvedValueOnce([{ id: TEACHER_ID }]);

        mockDb.$executeRaw.mockResolvedValueOnce(1); 
    
        const result = await deleteTeacher(TEACHER_ID, SCHEMA);
    
        expect(result.code).toBe(0);
    });

    it('NOT FOUND: should return error if teacher does not exist', async () => {
        mockDb.$queryRaw.mockResolvedValueOnce([]); // Empty result

        const result = await deleteTeacher('wrong_id', SCHEMA);

        expect(result.code).toBe(1);
        expect(result.message).toContain('not existed');
    });


    it('CATCH: should return "Database Error"', async () => {
        mockDb.$queryRaw.mockResolvedValueOnce([{ id: 't1' }]);

        // Force the delete operation to crash
        mockDb.$executeRaw.mockRejectedValueOnce(new Error('Random DB Error'));
        const result = await deleteTeacher(TEACHER_ID, SCHEMA);
        expect(result.code).toBe(1);
    });
});