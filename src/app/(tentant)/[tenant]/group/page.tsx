"use client"
import DataTableComponent from "@/src/components/table"
import { useEffect, use, useState } from "react";
import { Plus } from 'lucide-react';
import { useAction } from "@/src/hook/useAction";
import { getClass } from "./actions";
import type { ReturnList } from "@/types/form";
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import ClassForm from "./create-group-from"

import AlertDialogComponent from "@/src/components/alertDialog"
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import SearchComponent from "@/src/components/search"


const tableTitle = [
    { name: "Id", key: 'id', width: '50px' },
    { name: "Class Name", key: 'name', width: '180px' },
    { name: "Student Count", key: 'studentCount', width: '180px' },
    { name: "Student Operation", key: 'studentCount', width: '180px', type: ['USERCONF'] },
    { name: "Description", key: 'des', width: '200px' },
    { name: "Created Time", key: 'createAtString', width: '180px' },
    { name: "Created Admin", key: 'createdBy', width: '200px' },
    { name: "Operations", key: 'opt', type: ['EDIT', 'DELETE'], width: '120px' }]


export type classData = {
    id?: number;
    name: string;
    des: string;
}

const dialogCnt = {
    create: ["Create New Student", "Fill in the details below to create a new student. Changes are applied instantly.", "CREATE"],
    edit: ["Edit Student Info", "Update the student's profile information below.", "EDIT"],
    member: ["Manage Membership", "Create a new membership or extend the current membership duration for this student", "MEMBER"]
}


export default function ClassListPage({ params }: { params: Promise<{ tenant: string }> }) {
    const { tenant } = use(params);
    const [page, setPage] = useState(1);
    const [keyword, setKeyword] = useState("");
    const { data, loading, error, execute } = useAction<ReturnList, any[]>(getClass);
    const [openDialog, setOpenDialog] = useState({ title: "", des: "", type: "", dialog: false, alert: false })
    const [classData, setClassData] = useState<classData | null>(null);
    const [studentListShow, setStudentListShow] = useState(false);

    const handleSearch = (type: string) => {
        if (type == 'search') {
            execute(tenant, 1, 20, keyword)
        } else {
            setKeyword("")
            execute(tenant, 1, 20, "")
        }
    };

    const handleTablePagination = (page: number) => {
        if (page == data?.data?.page) { return }
        execute(tenant, page, 20, keyword)
    }



    const handleTableAction = async (type: string, record: any) => {
        if (type == "USERCONF") {
             setStudentListShow(!studentListShow)
        }
        // if (type == "MEMBER") {
        //     setStudentData(record);
        //     setOpenDialog({ title: dialogCnt.member[0], des: dialogCnt.member[1], type: dialogCnt.member[2], dialog: true, alert: false })
        // }
        // if (type == "EDIT") {
        //     setStudentData(record);
        //     setOpenDialog({ title: dialogCnt.edit[0], des: dialogCnt.edit[1], type: dialogCnt.edit[2], dialog: true, alert: false })
        // }
        // if (type == "DELETE") { setStudentData(record); setOpenDialog({ title: "", des: "", type: "DELETE", dialog: false, alert: true }) }
        // // if (type == "DETAIL") {setTeacherData(record); setOpenDialog({ title: record?.name || "", des: record?.email || "", type: "DETAIL", dialog: true, alert: false })}
        // if (type == "SWITCH") {
        //     const res = await switchStatus(tenant, record.id)
        //     if (res.code == 0) {
        //         toast.success(res.message); execute(tenant, page, 20, keyword, dateRange.start, dateRange.end, expiryStatus);
        //     } else { toast.error(res.message) }
        // }
    }

    // const handleDeleteAction = async (confirm: boolean, data: any) => {
    //     if (confirm == true) {
    //         const res = await deleteStudent(tenant, data.id)
    //         if (res.code == 0) { toast.success(res.message) }
    //         else { toast.error(res.message) }
    //         execute(tenant, page, 20, keyword, dateRange.start, dateRange.end, expiryStatus)
    //         setOpenDialog({ title: "", des: "", type: "", dialog: false, alert: false })
    //     } else {
    //         setOpenDialog({ title: "", des: "", type: "", dialog: false, alert: false })
    //     }
    // }

    // const handleDeleteAction = async (confirm: boolean, data: any) => {
    //     if (confirm == true) {
    //         const res = await deleteAdmin(tenant, data.id)
    //         if (res.code == 0) {
    //             toast.success(res.message)
    //         } else {
    //             toast.error(res.message)
    //         }
    //         execute(tenant, page, 20, keyword);
    //         setOpenDelete(false)
    //     } else {
    //         setOpenDelete(false)
    //     }
    // }

    useEffect(() => {
        if (tenant) {
            execute(tenant, page, 20, keyword);
        }
    }, [tenant, page, execute]);


    return (
        <div className="space-y-6">
            <div className="w-full flex items-center justify-between">
                <div>
                    <SearchComponent placeholder="Search by class name..." onAction={handleSearch} />
                </div>
                <div>
                    <Button onClick={() => setOpenDialog({ title: dialogCnt.create[0], des: dialogCnt.create[1], type: dialogCnt.create[2], dialog: true, alert: false })}><Plus /></Button>
                </div>
            </div>
            <div className="w-full flex items-center justify-between">
                <div className={cn(
                    "transition-opacity duration-200 w-full",
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
            </div>
            <Dialog open={openDialog.dialog} onOpenChange={() => setOpenDialog(prev => ({ ...prev, alert: false, dialog: false }))}>
                <DialogContent className="sm:max-w-[725px]" onPointerDownOutside={(e) => e.preventDefault()} onOpenAutoFocus={(e) => { if (openDialog.type === "DETAIL") { e.preventDefault() } }}>
                    <DialogHeader><DialogTitle>{openDialog.title}</DialogTitle><DialogDescription>{openDialog.des}</DialogDescription></DialogHeader>
                    {openDialog.type == "CREATE" ? (<ClassForm tenant={tenant} onSuccess={() => { setOpenDialog(prev => ({ ...prev, alert: false, dialog: false })); execute(tenant, 1, 20, keyword) }} />) : <></>
                        // openDialog.type == "MEMBER" ? studentData && (<MemberForm data={studentData} tenant={tenant} onSuccess={() => { setOpenDialog(prev => ({ ...prev, alert: false, dialog: false })); execute(tenant, 1, 20, keyword, dateRange.start, dateRange.end, expiryStatus) }} />) :
                        //     openDialog.type == "EDIT" ? studentData && (<EditStudentForm tenant={tenant} data={studentData} onSuccess={() => { setOpenDialog(prev => ({ ...prev, alert: false, dialog: false })); execute(tenant, 1, 20, keyword, dateRange.start, dateRange.end, expiryStatus) }} />) : <></>
                        //     openDialog.type == "DETAIL" ? teacherData && (<DesTeacherForm tenant={tenant} data={teacherData} onSuccess={() => { }} />) : (<></>)
                    }
                </DialogContent>
            </Dialog>
        </div>
    )
}