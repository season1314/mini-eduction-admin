import {  editTeacher } from './actions';
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

describe('editATeacher Server Action', () => {
    let mockDb: any;
    const SCHEMA = 'startaii';
    const TEACHER_ID = 'teacher_123';

    beforeEach(() => {
        jest.clearAllMocks();
        mockDb = {
            $queryRaw: jest.fn(),
            $executeRaw: jest.fn(),
        };
        (tenantDb as jest.Mock).mockResolvedValue(mockDb);
    });


    const getMockFormData = (overrides = {}): any => {
        const fd = new globalThis.FormData();
        const base = {
            teacherId: TEACHER_ID,
            name: 'Updated Name',
        };
        Object.entries({ ...base, ...overrides }).forEach(([k, v]) => {
            fd.append(k, v as string);
        });
        return fd;
    };


    it('SUCCESS: should update name successfully', async () => {

        mockDb.$queryRaw.mockResolvedValueOnce([{
            id: TEACHER_ID,
            name: 'Old Name',
        }]);

        const formData = getMockFormData({
            name: 'New Name',
            email: 'old@example.com' 
        });

        const result = await editTeacher(SCHEMA, { code: -1, timestamp: 0 }, formData);

        expect(result.code).toBe(0);
        expect(mockDb.$executeRaw).toHaveBeenCalled();
    });


    it('NOT FOUND: should return code 1 if adminId is invalid', async () => {

        mockDb.$queryRaw.mockResolvedValueOnce([]);

        const formData = getMockFormData({ teacherId: 'invalid_id' });
        const result = await editTeacher(SCHEMA, { code: -1, timestamp: 0 }, formData);

        expect(result.code).toBe(1);
        expect(result.message).toContain('not existed');
    });

});