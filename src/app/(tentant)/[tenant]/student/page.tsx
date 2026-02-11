"use client"
import DataTableComponent from "@/src/components/table"
import { useEffect, use, useState } from "react";
import { Search, ListRestart, UserPlus } from 'lucide-react';
import { useAction } from "@/src/hook/useAction";
import { getStudent, switchStatus } from "./actions";
import type { ReturnList } from "@/types/form";
import { Button } from "@/components/ui/button"
import { Field } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import TeacherForm from "./create-teacher-form"
// import EditTeacherForm from "./edit-teacher-form"
// import DesTeacherForm from "./des-teacher-form"
// import type { TeacherDate } from "./edit-teacher-form"
import AlertDialogComponent from "@/src/components/alertDialog"
import { toast } from "sonner";
import { cn } from "@/lib/utils";


const tableTitle = [
    { name: "Id", key: 'id' },
    { name: "Name", key: 'name' },
    { name: "Email", key: 'email' },
    { name: "Status", key: 'status', type: ['SWITCH'], disabled: ['role', 'SUPER'] },
    { name: "Phone", key: 'phone' },
    { name: "Gender", key: 'gender', type: ['GENDER'] },
    { name: "Opt", key: 'opt', type: ['DETAIL', 'EDIT', 'DELETE'], disabled: ['role', 'SUPER'] }]



export default function StudentListPage({ params }: { params: Promise<{ tenant: string }> }) {
    const { tenant } = use(params);
    const [page, setPage] = useState(1);
    const [keyword, setKeyword] = useState("");
    const { data, loading, error, execute } = useAction<ReturnList, any[]>(getStudent);
    const [openDialog, setOpenDialog] = useState({ title: "", des: "", type: "", dialog: false, alert: false })
    // const [teacherData, setTeacherData] = useState<TeacherDate | null>(null);



    const handleSearch = (_keyword: string) => {if (tenant) { execute(tenant, 1, 20, _keyword); setKeyword(_keyword) }};


    const handleTableAction = async (type: string, record: any) => {
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

    const handleTablePagination = (page: number) => {
        if (page == data?.data?.page) { return }
        execute(tenant, page, 20, keyword);
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
        <div className="space-y-6">
            <div className="w-full flex items-center justify-between">
                <div>
                    <Field orientation="horizontal">
                        <Input type="search" placeholder="Search email or name keyword" className="w-[300px] h-[38px]" value={keyword} onChange={(e) => setKeyword(e.target.value)} />
                        <Button onClick={() => handleSearch(keyword)}><Search /></Button>
                        <Button variant="outline" onClick={() => handleSearch('')}><ListRestart /></Button>
                    </Field>
                </div>
                <div>
                    <Button onClick={() => setOpenDialog({ title: 'Create New Teacher', des: "Fill in the details below to create a new teacher. Changes are applied instantly.", type: "CREATE", dialog: true, alert: false })}><UserPlus /></Button>
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


            {/* <Dialog open={openDialog.dialog} onOpenChange={() => setOpenDialog(prev => ({ ...prev, alert: false, dialog: false }))}>
                <DialogContent className="sm:max-w-[725px]" onPointerDownOutside={(e) => e.preventDefault()} onOpenAutoFocus={(e) => {if (openDialog.type === "DETAIL") {e.preventDefault()}}}>
                    <DialogHeader><DialogTitle>{openDialog.title}</DialogTitle><DialogDescription>{openDialog.des}</DialogDescription></DialogHeader>
                    {openDialog.type == "CREATE" ? (<TeacherForm tenant={tenant} onSuccess={() => { setOpenDialog(prev => ({ ...prev, alert: false, dialog: false })); execute(tenant, 1, 20, keyword); }} />) :
                        openDialog.type == "EDIT" ? teacherData && (<EditTeacherForm tenant={tenant} data={teacherData} onSuccess={() => { setOpenDialog(prev => ({ ...prev, alert: false, dialog: false })); execute(tenant, page, 20, keyword) }} />) :
                            openDialog.type == "DETAIL" ? teacherData && (<DesTeacherForm tenant={tenant} data={teacherData} onSuccess={() => { }} />) : (<></>)
                    }
                </DialogContent>
            </Dialog> */}

            {/* <AlertDialogComponent open={openDialog.alert} content={`This will PERMANENTLY DELETE teacher.This action is irreversible and all data cannot be recovered.`} buttonCnt="Delete" type="DELETE" data={teacherData} onAction={handleDeleteAction} title={`Delete ${teacherData?.email} ?`} /> */}
        </div>
    )
}