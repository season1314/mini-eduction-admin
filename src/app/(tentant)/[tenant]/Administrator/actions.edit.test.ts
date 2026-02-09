import { editAdmin } from './actions';
import { tenantDb } from '@/src/lib/tenantDb';
import bcrypt from 'bcryptjs';

jest.mock('@/src/lib/middleware', () => ({
    combineMiddlewares: (...middlewares: any[]) => (originalFn: any) => {
        return originalFn;
    },
}));

jest.mock('@/src/lib/middleware.filters', () => ({
    withTenantAuth: jest.fn(),
}));


jest.mock('bcryptjs');
jest.mock('@/src/lib/tenantDb');

describe('editAdmin Server Action', () => {
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
        (bcrypt.hash as jest.Mock).mockResolvedValue('new_hashed_password');
    });


    const getMockFormData = (overrides = {}): any => {
        const fd = new globalThis.FormData();
        const base = {
            adminId: ADMIN_ID,
            name: 'Updated Name',
            // password, conformPwd 
        };
        Object.entries({ ...base, ...overrides }).forEach(([k, v]) => {
            fd.append(k, v as string);
        });
        return fd;
    };


    it('SUCCESS: should update name and password successfully', async () => {

        mockDb.$queryRaw.mockResolvedValueOnce([{
            id: ADMIN_ID,
            name: 'Old Name',
            role: 'ADMIN'
        }]);

        const formData = getMockFormData({
            password: 'password123',
            confirmPwd: 'password123'
        });

        const result = await editAdmin(SCHEMA, { code: -1, timestamp: 0 }, formData);

        expect(result.code).toBe(0);
        expect(mockDb.$executeRaw).toHaveBeenCalled();

        expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
    });

    it('NO CHANGE: should return code 0 directly if data is identical', async () => {

        mockDb.$queryRaw.mockResolvedValueOnce([{
            id: ADMIN_ID,
            name: 'Old Name',
            role: 'ADMIN'
        }]);

        const formData = getMockFormData({ name: 'Old Name' });

        const result = await editAdmin(SCHEMA, { code: -1, timestamp: 0 }, formData);

        expect(result.code).toBe(0);
        expect(result.message).toContain('Successful update');

        expect(mockDb.$executeRaw).not.toHaveBeenCalled();
    });

    it('FORBIDDEN: should not allow editing SUPER administrator', async () => {
        mockDb.$queryRaw.mockResolvedValueOnce([{
            id: ADMIN_ID,
            name: 'Super Boss',
            role: 'SUPER'
        }]);

        const formData = getMockFormData();
        const result = await editAdmin(SCHEMA, { code: -1, timestamp: 0 }, formData);

        expect(result.code).toBe(1);
        expect(result.message).toContain('super administrator can not be edit');
    });

    it('NOT FOUND: should return code 1 if adminId is invalid', async () => {

        mockDb.$queryRaw.mockResolvedValueOnce([]);

        const formData = getMockFormData({ adminId: 'invalid_id' });
        const result = await editAdmin(SCHEMA, { code: -1, timestamp: 0 }, formData);

        expect(result.code).toBe(1);
        expect(result.message).toContain('not existed');
    });

    it('VALIDATION: should return code 2 if passwords do not match', async () => {
        const formData = getMockFormData({
            password: 'pass12',
            conformPwd: 'pass23'
        });

        const result = await editAdmin(SCHEMA, { code: -1, timestamp: 0 }, formData);

        expect(result.code).toBe(2);
        expect(result.error?.password).toBe('Passwords do not match');
    });
});