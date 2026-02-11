import { createStudent } from './actions';
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

describe('create Student Server Action Test', () => {
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
        (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_pwd_123');

        // 模拟 Session 数据 (匹配你代码中的 session.user_id 和 metadata)
        (authStorage.getStore as jest.Mock).mockReturnValue({
            user_id: 'student_1',
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
            email: 'newstudent@test.com',
            name: 'Newstudent',
            studentNo:"11231231123"
        };

        const data = { ...base, ...overrides };
        Object.entries(data).forEach(([key, value]) => {
            fd.append(key, value as string);
        });

        return fd;
    };



    it('should create student successfully and return code 0', async () => {

        mockDb.$queryRaw
            .mockResolvedValueOnce([{ id: 'tenant_1', key: SCHEMA, status: 'ACTIVE' }])
            .mockResolvedValueOnce([{ count: BigInt(0) }]);

        const formData = getMockFormData();

        // 执行 Action (此时 createstudent 已被剥离中间件外壳)
        const result = await createStudent(
            SCHEMA,
            { code: -1, timestamp: 0 },
            formData
        );

        // 断言结果
        expect(result.code).toBe(0);
    });

    it('should return code 1 if student number already exists', async () => {
        mockDb.$queryRaw.mockReset();

        mockDb.$queryRaw.mockImplementation(async (sql: any) => {

            const str = JSON.stringify(sql).toLowerCase();


            if (str.includes('count')) {
                return [{ count: BigInt(1) }];
            }

            return [{ id: 'tenant_1', key: SCHEMA, status: 'ACTIVE' }];
        });

        const formData = getMockFormData({ student_number: '1234567890' });
        const result = await createStudent(SCHEMA, { code: -1, timestamp: 0 }, formData);

        expect(result.code).toBe(1);
        expect(result.message).toBe('This student number is already in use');
    });


    it('should return code 1 if session is expired', async () => {
        (authStorage.getStore as jest.Mock).mockReturnValue(null);

        const formData = getMockFormData();
        const result = await createStudent(SCHEMA, { code: -1, timestamp: 0 }, formData);

        expect(result.code).toBe(1);
        expect(result.message).toContain('Session expired');
    });
});