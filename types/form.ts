export type FormState = {
    message?: string;
    data?: { [key: string]: any | undefined; };
    error?: { [key: string]: string | undefined; };
    code: Number  //0:success 1:system error 2:param error 3:multi-tenancy
    timestamp: number
};
