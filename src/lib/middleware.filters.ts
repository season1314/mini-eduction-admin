import { SessionManager } from './session';
import { redirect } from 'next/navigation';

export const withTenantAuth = (handler: any) => async (...args: any[]) => {
    const schemaName = args[1];

    if (schemaName === 'public' || !schemaName) {
        return await handler(...args);
    }

    const session = await SessionManager.verify();
    if (!session) {
        return { code: 401, error: "SESSION_EXPIRED" };
    }
    if (schemaName !== session?.tenant_key) {
        return { code: 403, error: "TENANT_MISMATCH" };
    }
    
    return await handler(...args);
};


// export const withAdminRole = (handler: any) => async (...args: any[]) => {
//   const session = await getServerSession();

//   if (session?.user.role !== 'ADMIN') {
//     return { code: 403, message: "权限不足，仅限管理员" };
//   }
//   return handler(...args);
// };