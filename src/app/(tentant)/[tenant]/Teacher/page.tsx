"use client"
import DataTableComponent from "@/src/components/table"
import { useEffect, use, useState } from "react";
import { useAction } from "@/src/hook/useAction";
import { getTeachers } from "./actions";
import type { ReturnList } from "@/types/form";
import TeacherForm from "./create-teacher-form"
import EditTeacherForm from "./edit-teacher-form"
import { cn } from "@/lib/utils";
import SearchComponent from "@/src/components/search"
import ToggleGroupComponent from "@/src/components/toggleGroup"
import DeleteTeacherForm from "./delete-teacher-form"
import { setOperationList } from "@/lib/commonFunc"

export type TeacherData = {
    id: number;
    name: string;
    email: string;
    teacherNo: string;
    birth?: Date;
    birthDisplay?: string;
    color?: string;
    createdAt: string;
    createdBy: string;
    gender?: string;
    phone?: string;
    des?: string;
    contact?: string;
    registration: string;
    status?: string;
    confirmTeacherNo?: string
}



//table title column 
const tableTitle = [
    { name: "Teacher No.", key: 'teacherNo' },
    { name: "Teacher Name", key: 'name' },
    { name: "Status", key: 'status', type: ['STATUS'] },
    { name: "Email", key: 'email' },
    { name: "Registration Time", key: 'registration', type: ['CREATE'] },
]

//operations list
const operationList = [
    { value: 'USERCREATE', icon: "UserPlus", disabled: false },
    { value: 'USEREDIT', icon: "UserCog", disabled: true },
    { value: 'USERDELETE', icon: "UserX", disabled: true }
]



export default function TeacherListPage({ params }: { params: Promise<{ tenant: string }> }) {
    const { tenant } = use(params);
    const [page, setPage] = useState(1);
    const [keyword, setKeyword] = useState("");
    const { data, loading, error, execute } = useAction<ReturnList, any[]>(getTeachers);
    const [teacherData, setTeacherData] = useState<TeacherData | null>(null);
    const [operations, setOperations] = useState(operationList)
    const [optSelection, setOptSelection] = useState('USERCREATE')
    const [tableId, setTableId] = useState(0)

    const handleSearch = (_keyword: string) => {
        if (tenant) { execute(tenant, 1, 20, _keyword); setKeyword(_keyword) }
        setOperations(setOperationList([false, true, true], operationList));
        setTableId(0); setOptSelection('USERCREATE');
        setTeacherData(null)
    };


    const handleTableAction = async (type: string, record: any) => {
        if (record) {
            setOperations(setOperationList([false, false, false], operationList))
            setTableId(record.id);
            setOptSelection('USEREDIT');
            setTeacherData(record)
        } else {
            setOperations(setOperationList([false, true, true], operationList));
            setTableId(0); setOptSelection('USERCREATE');
            setTeacherData(null)
        }
    }

    const handleTablePagination = (page: number) => {
        if (page == data?.data?.page) { return }
        execute(tenant, page, 20, keyword);
    }

    const handleOperation = (value: string) => {
        if (value === "USERCREATE") {
            setOperations(setOperationList([false, true, true], operationList))
            setTeacherData(null)
            setTableId(0)
        } else {
            setOperations(setOperationList([false, false, false], operationList))
        }
        setOptSelection(value)
    }

    const handleSuccess = (type: string) => {
        if (type == "USERCREATE") {
            execute(tenant, 1, 20, keyword);
            setTeacherData(null)
            setTableId(0)
            return
        }
        if (type == "USERDELETE") {
            setOperations(setOperationList([false, true, true], operationList))
            setOptSelection('USERCREATE')
            setTeacherData(null)
            setTableId(0)
            execute(tenant, page, 20, keyword);
            return
        }
        if (type == "USEREDIT") {
            execute(tenant, page, 20, keyword);
            return
        }
    }

    useEffect(() => {
        if (tenant) { execute(tenant, page, 20, keyword) }
    }, [tenant, page, execute]);

    return (
        <div className="space-y-6">
            <div className="w-full flex items-center justify-between">
                <div className="w-[54%]">
                    <SearchComponent placeholder="Search by teacher number or name..." onAction={handleSearch} />
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
                    {teacherData && optSelection == "USEREDIT" && <EditTeacherForm tenant={tenant} data={teacherData} onSuccess={() => handleSuccess('USEREDIT')} />}
                    {teacherData && optSelection == "USERDELETE" && <DeleteTeacherForm tenant={tenant} data={teacherData} onSuccess={() => handleSuccess('USERDELETE')} />}
                    {!teacherData && <TeacherForm tenant={tenant} onSuccess={() => handleSuccess('USERCREATE')} />}

                </div>
            </div>
        </div>
    )
}