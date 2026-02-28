"use client"
import DataTableComponent from "@/src/components/table"
import { useEffect, use, useState } from "react";
import { useAction } from "@/src/hook/useAction";
import { getStudent } from "./actions";
import type { ReturnList } from "@/types/form";
import { Button } from "@/components/ui/button";
import SelectionComponent from "@/src/components/selection"
import DateRangerComponent from "@/src/components/dateRanger"
import { Field } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Search, ListRestart } from 'lucide-react';
import { cn } from "@/lib/utils";
import ToggleGroupComponent from "@/src/components/toggleGroup"
import StudentForm from "./create-student-form"
import EditStudentForm from "./edit-student-form"
import DeleteStudentForm from "./delete-student-form"
import { setOperationList } from "@/lib/commonFunc"
import MemberForm from "../membership/create-member-from";


const selection = [
    { value: 'ALL', label: 'ALL' },
    { value: 'NONE', label: 'NONE' },
    { value: 'ACTIVE', label: 'ACTIVE' },
    { value: 'EXPIRED', label: 'EXPIRED' },
]

const tableTitle = [
    { name: "Student No.", key: 'studentNo' },
    { name: "Student Name", key: 'name' },
    { name: "Status", key: 'status', type: ['STATUS'] },
    { name: "Membership", key: 'membership', type: ['MEMBER'] },
    { name: "Registration Time", key: 'registration' },
]

const operationList = [
    { value: 'USERCREATE', icon: "UserPlus", disabled: false },
    { value: 'USEREDIT', icon: "UserCog", disabled: true },
    { value: 'USERMEMBER', icon: "UserStar", disabled: true },
    { value: 'USERDELETE', icon: "UserX", disabled: true }
]


export type StudentData = {
    id: number;
    name: string;
    email: string;
    studentNo: string;
    birth?: Date;
    createdAt: string;
    createdBy: string;
    gender?: string;
    phone?: string;
    des?: string;
    contact?: string;
    membershipExpiry?: Date
    emContact: string;
    emPhone: string;
    status: string;
    confirmStudentNo?: string
}

export default function StudentListPage({ params }: { params: Promise<{ tenant: string }> }) {
    const { tenant } = use(params);
    const [page, setPage] = useState(1);
    const [keyword, setKeyword] = useState("");
    const [operations, setOperations] = useState(operationList)
    const { data, loading, error, execute } = useAction<ReturnList, any[]>(getStudent);
    const [studentData, setStudentData] = useState<StudentData | null>(null);
    const [dateRange, setDateRange] = useState<{ start: string | undefined | null; end: string | undefined | null; }>({ start: undefined, end: undefined });
    const [expiryStatus, setExpiryStatus] = useState("")
    const [optSelection, setOptSelection] = useState('USERCREATE')
    const [clearDateRanger, setClearDateRanger] = useState(false)
    const [tableId, setTableId] = useState(0)

    const handleOperation = (value: string) => {
        setOptSelection(value)
        if (value === "USERCREATE") {
            setOperations(setOperationList([false, true, true, true], operationList))
            setStudentData(null)
            setTableId(0)
            return
        }
        setOperations(setOperationList([false, false, false, false], operationList))
    }


    const handleSuccess = (type: string) => {
        if (type == "USERCREATE") {
            execute(tenant, 1, 20, keyword);
            setStudentData(null)
            setTableId(0)
            return
        }
        if (type == "USERDELETE") {
            setOperations(setOperationList([false, true, true, true], operationList))
            setOptSelection('USERCREATE')
            setStudentData(null)
            setTableId(0)
            execute(tenant, page, 20, keyword, dateRange.start, dateRange.end, expiryStatus)
            return
        }
        if (type == "USEREDIT") {
            execute(tenant, page, 20, keyword, dateRange.start, dateRange.end, expiryStatus)
            return
        }
        if (type == "USERMEMBER") {
            execute(tenant, page, 20, keyword, dateRange.start, dateRange.end, expiryStatus)
            return
        }
    }

    const handleSearch = (type: string) => {
        setOperations(setOperationList([false, true, true, true], operationList));
        setTableId(0); setOptSelection('USERCREATE');
        setStudentData(null)
        if (type == "search") {
            execute(tenant, 1, 20, keyword, dateRange.start, dateRange.end, expiryStatus)
        } else {
            setExpiryStatus("")
            setClearDateRanger(!clearDateRanger)
            execute(tenant, 1, 20, keyword, null, null, "")
        }
    };

    const handleDateRange = (selectedDate: { start: string | null | undefined, end: string | null | undefined }) => {
        setDateRange(selectedDate)
    };

    const handleTablePagination = (page: number) => {
        if (page == data?.data?.page) { return }
        execute(tenant, page, 20, keyword, dateRange.start, dateRange.end, expiryStatus)
    }



    const handleTableAction = async (type: string, record: any) => {
        if (!record) {
            setOperations(setOperationList([false, true, true, true], operationList));
            setOptSelection('USERCREATE');
            setTableId(0);
            setStudentData(null)
        } else {
            setOperations(setOperationList([false, false, false, false], operationList))
            setTableId(record.id);
            setStudentData(record)
            if (optSelection == "USERCREATE" || optSelection == "USERDELETE") {
                setOptSelection('USEREDIT');
            }
        }
    }


    useEffect(() => {
        if (tenant) { execute(tenant, page, 20, keyword, dateRange.start, dateRange.end, expiryStatus) }
    }, [tenant, page, execute]);


    return (
        <div className="space-y-4">
            <div className="w-full flex items-center justify-between">
                <div className="w-[54%]">
                    <Field orientation="horizontal">
                        <Input type="search" placeholder="Search by student number or name..." className="w-[300px] h-[38px]"
                            value={keyword} onChange={(e) => setKeyword(e.target.value)} />
                        <DateRangerComponent defaultText="Registration from ~ end" onAction={handleDateRange} clear={clearDateRanger} />
                        <SelectionComponent defaultText="Membership status" items={selection} onAction={(val) => { setExpiryStatus(val) }} className="w-[200px]" value={expiryStatus} />
                        <Button onClick={() => handleSearch("search")}><Search /></Button>
                        <Button variant="outline" onClick={() => handleSearch("reset")}><ListRestart /></Button>
                    </Field>
                </div>
                <div className="w-[45%] font-bold">
                    <ToggleGroupComponent list={operations} onSelect={handleOperation} selectedValue={optSelection} />
                </div>
            </div>

            <div className="w-full flex justify-between">
                <div className={cn("transition-opacity duration-200 w-[54%] h-[calc(100vh-240px)]", loading ? "opacity-50 pointer-events-none" : "opacity-100")}>
                    <DataTableComponent
                        title={tableTitle}
                        list={data?.data?.list}
                        totalPages={data?.data?.total}
                        currentPage={data?.data?.page}
                        onAction={handleTableAction}
                        onPagination={handleTablePagination}
                        selectionId={tableId}
                    />
                </div>
                <div className={cn("transition-opacity duration-200 w-[45%] ml-[1%] min-w-[400px] border border-gray-200 rounded-[5px] px-[20px]", loading ? "opacity-50 pointer-events-none" : "opacity-100")}>
                    {!studentData && <StudentForm tenant={tenant} onSuccess={() => handleSuccess('USERCREATE')} />}
                    {studentData && optSelection == "USEREDIT" && <EditStudentForm tenant={tenant} data={studentData} onSuccess={() => handleSuccess('USEREDIT')} />}
                    {studentData && optSelection == "USERDELETE" && <DeleteStudentForm tenant={tenant} data={studentData} onSuccess={() => handleSuccess('USERDELETE')} />}
                    {studentData && optSelection == "USERMEMBER" && <MemberForm tenant={tenant} data={studentData} onSuccess={() => handleSuccess('USERMEMBER')} />}

                </div>
            </div>
        </div>
    )
}