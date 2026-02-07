"use client"
import DataTable from "@/src/components/table"
import { useActionState, useEffect, use, useState, useTransition } from "react";
import { useAction } from "@/src/hook/useAction";
import { getAdmins,createAdmin } from "./actions";
import type { ReturnData } from "./actions";



const tableTitle = [
    { name: "Id", key: 'id' },
    { name: "Email", key: 'email' },
    { name: "Role", key: 'role' },
    { name: "Status", key: 'status', type: ['SWITCH'] },
    { name: "Created", key: 'createdBy' },
    { name: "Opt", key: 'opt', type: ['EDIT','DELETE','PERMISSION'] }]



export default function AdminListPage({ params }: { params: Promise<{ tenant: string }> }) {
    const { tenant } = use(params);
    const [page, setPage] = useState(1);
    const [keyword, setKeyword] = useState("");
    const { data, loading, error, execute } = useAction<ReturnData, any[]>(getAdmins);
    const [state, formAction] = useActionState(createAdmin, { code: -1, timestamp: 1 });

    useEffect(() => {
        if (tenant) {
            execute(page, tenant, 20, keyword);
            console.log(data)
        }
    }, [tenant, page, keyword, execute]);


    return (
        <div className="space-y-6">
            <DataTable title={tableTitle} list={data?.data?.list} />
        </div>
    )
}