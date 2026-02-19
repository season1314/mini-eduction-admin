"use client"
import DataTableComponent from "@/src/components/table"
import { useEffect, use, useState } from "react";
import { UserPlus } from 'lucide-react';
import { useAction } from "@/src/hook/useAction";
import { getStudent, switchStatus } from "./actions";
import type { ReturnList } from "@/types/form";
import { Button } from "@/components/ui/button";
import SelectionComponent from "@/src/components/selection"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import StudentForm from "./create-student-form"
import DateRangerComponent from "@/src/components/dateRanger"
import MemberForm from "../membership/create-member-from"
import { Field } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Search, ListRestart } from 'lucide-react';


// import EditTeacherForm from "./edit-teacher-form"
// import DesTeacherForm from "./des-teacher-form"
import type { studentDate } from "./edit-student-form"
import AlertDialogComponent from "@/src/components/alertDialog"
import { toast } from "sonner";
import { cn } from "@/lib/utils";


const selection = [
    { value: 'ALL', label: 'ALL' },
    { value: 'NONE', label: 'NONE' },
    { value: 'ACTIVE', label: 'ACTIVE' },
    { value: 'EXPIRED', label: 'EXPIRED' },
]

const tableTitle = [
    { name: "Id", key: 'id' },
    { name: "Student Name", key: 'name' },
    { name: "Student No.", key: 'studentNo' },
    { name: "Status", key: 'status', type: ['SWITCH'] },
    { name: "Membership", key: 'membership', type: ['MEMBER'] },
    { name: "Email", key: 'email' },
    { name: "Phone", key: 'phone' },
    { name: "Registration Time", key: 'registration' },
    { name: "Opt", key: 'opt', type: ['DETAIL', 'EDIT', 'DELETE'] }
]


const dialogCnt = {
    create: ["Create New Student", "Fill in the details below to create a new student. Changes are applied instantly.", "CREATE"]
}



export default function StudentListPage({ params }: { params: Promise<{ tenant: string }> }) {
    const { tenant } = use(params);
    const [page, setPage] = useState(1);
    const [keyword, setKeyword] = useState("");
    const { data, loading, error, execute } = useAction<ReturnList, any[]>(getStudent);
    const [openDialog, setOpenDialog] = useState({ title: "", des: "", type: "", dialog: false, alert: false })
    const [studentData, setStudentData] = useState<studentDate | null>(null);
    const [dateRange, setDateRange] = useState<{ start: Date | undefined; end: Date | undefined; }>({ start: undefined, end: undefined });
    const [expiryStatus, setExpiryStatus] = useState("")

    const handleSearch = (type: string) => {
        if (type == 'search') {
            execute(tenant, 1, 20, keyword, dateRange.start, dateRange.end, expiryStatus)
        } else if (type == 'reset') {
            setKeyword("")
            setDateRange({ start: undefined, end: undefined })
            setExpiryStatus("")
            execute(tenant, 1, 20, "", undefined, undefined, "")
        } else {

        }
    };

    const handleDateRange = (selectedDate: Date | undefined, type: 'start' | 'end') => {
        setDateRange((prev) => ({ ...prev, [type]: selectedDate }));
    };

    const handleTablePagination = (page: number) => {
        if (page == data?.data?.page) { return }
        execute(tenant, 1, 20, keyword, dateRange.start, dateRange.end, expiryStatus)
    }



    const handleTableAction = async (type: string, record: any) => {
        if (type == "MEMBER") {
            setStudentData(record);
            setOpenDialog({ title: "Manage Membership", des: "Create a new membership or extend the current membership duration for this student.", type: "MEMBER", dialog: true, alert: false })
        }
        // if (type == "EDIT") { setTeacherData(record); setOpenDialog({ title: "Edit Teacher Info", des: "Update the teacher's profile information below.", type: "EDIT", dialog: true, alert: false }) }
        // if (type == "DELETE") { setTeacherData(record); setOpenDialog({ title: "", des: "", type: "DELETE", dialog: false, alert: true }) }
        // if (type == "DETAIL") {setTeacherData(record); setOpenDialog({ title: record?.name || "", des: record?.email || "", type: "DETAIL", dialog: true, alert: false })}
        // if (type == "SWITCH") {
        //     const res = await switchStatus(tenant, record.id)
        //     if (res.code == 0) {
        //         toast.success(res.message); execute(tenant, 1, 20, keyword);
        //     } else { toast.error(res.message) }
        // }
    }

    const handleDeleteAction = async (confirm: boolean, data: any) => {
        // if (confirm == true) {
        //     const res = await deleteTeacher(tenant, data.id)
        //     if (res.code == 0) { toast.success(res.message) }
        //     else { toast.error(res.message) }
        //     execute(tenant, page, 20, keyword);
        //     setOpenDialog({ title: "", des: "", type: "", dialog: false, alert: false })
        // } else {
        //     setOpenDialog({ title: "", des: "", type: "", dialog: false, alert: false })
        // }
    }



    useEffect(() => {
        if (tenant) { execute(tenant, page, 20, keyword) }
    }, [tenant, page, execute]);


    return (
        <div className="space-y-4">
            <div className="w-full flex items-center justify-between">
                <div>
                    <Field orientation="horizontal">
                        <Input type="search" placeholder="Search by student number or name..." className="w-[300px] h-[38px]" 
                                value={keyword} onChange={(e) => setKeyword(e.target.value)} />
                        <DateRangerComponent defaultText="Registration from ~ end" start={dateRange.start} end={dateRange.end} onAction={handleDateRange} />
                        <SelectionComponent defaultText="Membership status" items={selection} onAction={(val) => { setExpiryStatus(val) }} className="w-[200px]"
                            key={1} id={`student-select-1`} value={expiryStatus} />
                        <Button onClick={() => handleSearch("search")}><Search /></Button>
                        <Button variant="outline" onClick={() => handleSearch("reset")}><ListRestart /></Button>
                    </Field>
                </div>
                <div>
                    <Button onClick={() => setOpenDialog({
                        title: dialogCnt.create[0], des: dialogCnt.create[1],
                        type: dialogCnt.create[2], dialog: true, alert: false
                    })}>
                        <UserPlus />
                    </Button>
                </div>
            </div>
            <div className={cn(
                "transition-opacity duration-200",
                loading ? "opacity-50 pointer-events-none" : "opacity-100"
            )}>
                <DataTableComponent
                    title={tableTitle}
                    list={data?.data?.list}
                    totalPages={data?.data?.total}
                    currentPage={data?.data?.page}
                    onAction={handleTableAction}
                    onPagination={handleTablePagination} />
            </div>
            <Dialog open={openDialog.dialog} onOpenChange={() => setOpenDialog(prev => ({ ...prev, alert: false, dialog: false }))}>
                <DialogContent className="sm:max-w-[725px]" onPointerDownOutside={(e) => e.preventDefault()} onOpenAutoFocus={(e) => { if (openDialog.type === "DETAIL") { e.preventDefault() } }}>
                    <DialogHeader><DialogTitle>{openDialog.title}</DialogTitle><DialogDescription>{openDialog.des}</DialogDescription></DialogHeader>
                    {openDialog.type == "CREATE" ? (<StudentForm tenant={tenant} onSuccess={() => { setOpenDialog(prev => ({ ...prev, alert: false, dialog: false })); execute(tenant, 1, 20, keyword); }} />) :
                        openDialog.type == "MEMBER" ? studentData && (<MemberForm data={studentData} tenant={tenant} onSuccess={() => { setOpenDialog(prev => ({ ...prev, alert: false, dialog: false })); execute(tenant, 1, 20, keyword); }} />) : <></>
                        // openDialog.type == "EDIT" ? teacherData && (<EditTeacherForm tenant={tenant} data={teacherData} onSuccess={() => { setOpenDialog(prev => ({ ...prev, alert: false, dialog: false })); execute(tenant, page, 20, keyword) }} />) :
                        //     openDialog.type == "DETAIL" ? teacherData && (<DesTeacherForm tenant={tenant} data={teacherData} onSuccess={() => { }} />) : (<></>)
                    }
                </DialogContent>
            </Dialog>

            {/* <AlertDialogComponent open={openDialog.alert} content={`This will PERMANENTLY DELETE teacher.This action is irreversible and all data cannot be recovered.`} buttonCnt="Delete" type="DELETE" data={teacherData} onAction={handleDeleteAction} title={`Delete ${teacherData?.email} ?`} /> */}
        </div>
    )
}