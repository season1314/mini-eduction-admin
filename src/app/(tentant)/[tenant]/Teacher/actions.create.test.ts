import { createTeacher } from './actions';
import { authStorage } from '@/src/lib/authContext';
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
jest.mock('@/src/lib/authContext');

describe('createTeacher Server Action Test', () => {
    let mockDb: any;
    const SCHEMA = 'startaii';

    beforeEach(() => {
        jest.clearAllMocks();

        mockDb = {
            $queryRaw: jest.fn(),
            $executeRaw: jest.fn(),
            $transaction: jest.fn(async (callback) => await callback(mockDb)),
        };

        (tenantDb as jest.Mock).mockResolvedValue(mockDb);

        (authStorage.getStore as jest.Mock).mockReturnValue({
            user_id: 'admin_1',
            metadata: { email: 'creator@test.com' }
        });
    });

    /**
     * 辅助函数：构造真实的全局 FormData 对象
     * 使用 any 返回类型来避开 TypeScript 的类型冲突
     */
    const getMockFormData = (overrides = {}): any => {
        // 使用 globalThis 确保调用的是全局内置的 FormData 构造函数
        const fd = new globalThis.FormData();

        const base = {
            email: 'newadmin@test.com',
            name: 'NewAdmin',
        };

        const data = { ...base, ...overrides };
        Object.entries(data).forEach(([key, value]) => {
            fd.append(key, value as string);
        });

        return fd;
    };



    it('should create teacher successfully and return code 0', async () => {

        mockDb.$queryRaw.mockResolvedValueOnce([{ count: BigInt(0) }]);

        const formData = getMockFormData();

        const result = await createTeacher(
            SCHEMA,
            { code: -1, timestamp: 0 },
            formData
        );

        // 断言结果
        expect(result.code).toBe(0);
    });

    it('should return code 1 if email already exists', async () => {
        mockDb.$queryRaw.mockReset();

        mockDb.$queryRaw.mockImplementation(async (sql: any) => {

            const str = JSON.stringify(sql).toLowerCase();

            if (str.includes('count')) {
                return [{ count: BigInt(1) }];
            }

            return [{ id: 'tenant_1', key: SCHEMA, status: 'ACTIVE' }];
        });

        const formData = getMockFormData({ email: 'existing@test.com' });
        const result = await createTeacher(SCHEMA, { code: -1, timestamp: 0 }, formData);

        expect(result.code).toBe(1);
        expect(result.message).toBe('This email is already in use');
    });


    it('should return code 1 if session is expired', async () => {
        (authStorage.getStore as jest.Mock).mockReturnValue(null);

        const formData = getMockFormData();
        const result = await createTeacher(SCHEMA, { code: -1, timestamp: 0 }, formData);

        expect(result.code).toBe(1);
        expect(result.message).toContain('Session expired');
    });
});