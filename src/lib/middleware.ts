export type ActionResponse<T = any> = {
    code: number;
    message: string;
    data?: T;
};

export const combineMiddlewares = (...middlewares: any[]) => {
    return (handler: any) => {
        return middlewares.reduceRight((acc, middleware) => middleware(acc), handler);
    };
};