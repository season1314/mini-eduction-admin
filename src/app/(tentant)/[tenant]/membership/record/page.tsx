"use client"
import DataTableComponent from "@/src/components/table"
import { useEffect, use, useState } from "react";
import { useAction } from "@/src/hook/useAction";
import { getMembers } from "./actions";
import type { ReturnList } from "@/types/form";
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { cn } from "@/lib/utils";
import DateRangerComponent from "@/src/components/dateRanger"
import { Field } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Search, ListRestart } from 'lucide-react';

//table title column 
const tableTitle = [
    { name: "Student Name", key: 'studentName' },
    { name: "Student No.", key: 'studentNo' },
    { name: "Old Expiry Date", key: 'oldExpiryString' },
    { name: "New Expiry Date", key: 'newExpiryString' },
    { name: "Created At", key: 'createdAtString', width: '180px' },
    // { name: "Created By", key: 'createdBy', width: '200px' },
    // { name: "Note", key: 'note', width: '200px'}
]

export type MembershipRecordData = {
    studentName: string;
    studentNo: string;
    oldExpiryString: string;
    newExpiryString: string;
    createdAtString: string;
    createdBy: string;
    oldExpiry: Date;
    newExpiry: Date;
    note: string
}

export default function MemberRecordPage({ params }: { params: Promise<{ tenant: string }> }) {
    const { tenant } = use(params);
    const [page, setPage] = useState(1);
    const [keyword, setKeyword] = useState("");
    const { data, loading, error, execute } = useAction<ReturnList, any[]>(getMembers);
    const [dateRange, setDateRange] = useState<{ start: string | undefined | null; end: string | undefined | null; }>({ start: undefined, end: undefined });
    const [clearDateRanger, setClearDateRanger] = useState(false)
    const handleSearch = (type: string) => {
        if (type == "search") {
            execute(tenant, 1, 20, keyword, dateRange.start, dateRange.end)
        } else {
            setKeyword("")
            setClearDateRanger(true)
            setDateRange({ start: undefined, end: undefined })
            execute(tenant, 1, 20, "", undefined, undefined)
        }
    };

    const handleTablePagination = (page: number) => {
        if (page == data?.data?.page) { return }
        execute(tenant, page, 20, keyword, dateRange.start, dateRange.end);
    }

    const handleDateRange = (selectedDate: { start: string | null | undefined, end: string | null | undefined }) => {
        setDateRange(selectedDate)
    };

    useEffect(() => {
        if (tenant) { execute(tenant, page, 20, keyword, dateRange.start, dateRange.end) }
    }, [tenant, page, execute]);

    return (
        <div className="space-y-6">
            <div className="w-full flex items-center justify-between">
                <div className="w-[70%]">
                    <Field orientation="horizontal">
                        <Input type="search" placeholder="Search by student number or name..." className="w-[300px] h-[38px]"
                            value={keyword} onChange={(e) => setKeyword(e.target.value)} />
                        <DateRangerComponent defaultText="Created from ~ end" onAction={handleDateRange} clear={clearDateRanger} />
                        <Button onClick={() => handleSearch("search")}><Search /></Button>
                        <Button variant="outline" onClick={() => handleSearch("reset")}><ListRestart /></Button>
                    </Field>
                </div>
                <div className="w-[30%] font-bold">
                </div>
            </div>
            <div className="w-full flex justify-between">
                <div className={cn("transition-opacity duration-200 w-[70%] h-[calc(100vh-240px)]", loading ? "opacity-50 pointer-events-none" : "opacity-100")}>
                    <DataTableComponent
                        title={tableTitle}
                        list={data?.data?.list}
                        totalPages={data?.data?.total}
                        currentPage={data?.data?.page}
                        onAction={() => { }}
                        onPagination={handleTablePagination} />
                </div>
                <div></div>
            </div>
        </div>
    )
}