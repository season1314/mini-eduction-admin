export type FormState = {
    message?: string;
    data?: { [key: string]: any | undefined; };
    error?: { [key: string]: string | undefined; };
    code: number;  //0:success 1:system error 2:param error 3:multi-tenancy
    timestamp: number
};



export interface ReturnList{
    code: number;
    data?: { list: any[], total: number, page: number };
    message?: string
}

