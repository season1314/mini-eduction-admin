
import { deleteAdmin } from './actions';
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
    const ADMIN_ID = 'admin_uuid_123';

    beforeEach(() => {
        jest.clearAllMocks();

        // 2. Setup Transaction Mock
        // We need a separate object to represent the transaction 'tx' client
        mockTx = {
            $executeRaw: jest.fn(),
        };

        mockDb = {
            $queryRaw: jest.fn(),
            // Simulate $transaction by executing the callback with our mockTx
            $transaction: jest.fn(async (callback) => await callback(mockTx)),
        };

        (tenantDb as jest.Mock).mockResolvedValue(mockDb);
    });

    it('SUCCESS: should delete admin from both public and tenant tables', async () => {
        // Step 1: Mock Admin check (found)
        mockDb.$queryRaw.mockResolvedValueOnce([{
            id: ADMIN_ID,
            email: 'admin@test.com',
            role: 'ADMIN'
        }]);

        // Step 2: Mock Tenant check (active)
        mockDb.$queryRaw.mockResolvedValueOnce([{
            id: 'tenant_id_001',
            key: SCHEMA,
            status: 'ACTIVE'
        }]);

        const result = await deleteAdmin(ADMIN_ID, SCHEMA);

        console.log('Result:', result);

        expect(result.code).toBe(0);
        
        // Ensure transaction was used
        expect(mockDb.$transaction).toHaveBeenCalled();
        // Ensure both DELETE queries were executed inside the transaction
        expect(mockTx.$executeRaw).toHaveBeenCalledTimes(2);
    });

    it('FORBIDDEN: should return code 1 when trying to delete a SUPER admin', async () => {
        mockDb.$queryRaw.mockResolvedValueOnce([{
            id: ADMIN_ID,
            role: 'SUPER'
        }]);

        const result = await deleteAdmin(ADMIN_ID, SCHEMA);

        expect(result.code).toBe(1);
        expect(result.message).toContain('super administrator can not be delete');
        expect(mockDb.$transaction).not.toHaveBeenCalled();
    });

    it('NOT FOUND: should return error if admin does not exist', async () => {
        mockDb.$queryRaw.mockResolvedValueOnce([]); // Empty result

        const result = await deleteAdmin('wrong_id', SCHEMA);

        expect(result.code).toBe(1);
        expect(result.message).toContain('not existed');
    });

    it('TENANT ERROR: should return error if organization is inactive', async () => {
        // Admin found
        mockDb.$queryRaw.mockResolvedValueOnce([{ id: ADMIN_ID, role: 'ADMIN' }]);
        // Tenant NOT found or INACTIVE
        mockDb.$queryRaw.mockResolvedValueOnce([]);

        const result = await deleteAdmin(ADMIN_ID, SCHEMA);

        expect(result.code).toBe(1);
        expect(result.message).toContain('Organization does not exist or is inactive');
    });

    it('CATCH: should return "Database Error" if transaction fails', async () => {
        mockDb.$queryRaw.mockResolvedValueOnce([{ id: ADMIN_ID, email: 'a@b.com', role: 'ADMIN' }]);
        mockDb.$queryRaw.mockResolvedValueOnce([{ id: 't1' }]);

        // Force the delete operation to crash
        mockTx.$executeRaw.mockRejectedValueOnce(new Error('Random DB Error'));

        const result = await deleteAdmin(ADMIN_ID, SCHEMA);

        expect(result.code).toBe(1);
        expect(result.message).toBe('Database Error');
    });
});