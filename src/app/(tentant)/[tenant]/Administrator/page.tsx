"use client"
import DataTableComponent from "@/src/components/table"
import { useEffect, use, useState } from "react";
import { UserPlus } from 'lucide-react';
import { useAction } from "@/src/hook/useAction";
import { getAdmins, deleteAdmin, switchStatus } from "./actions";
import type { ReturnList } from "@/types/form";
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import AdminForm from "./create-admin-form"
import EditAdminForm from "./edit-admin-form"
import type { AdminDate } from "./edit-admin-form"
import AlertDialogComponent from "@/src/components/alertDialog"
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import SearchComponent from "@/src/components/search"


const tableTitle = [
    { name: "Id", key: 'id' },
    { name: "Name", key: 'name' },
    { name: "Email", key: 'email' },
    { name: "Status", key: 'status', type: ['SWITCH'], disabled: ['role', 'SUPER'] },
    { name: "Registration Date", key: 'createAt' },
    { name: "Created By", key: 'createdBy' },
    { name: "Opt", key: 'opt', type: ['EDIT', 'DELETE', 'PERMISSION'], disabled: ['role', 'SUPER'] }]



export default function AdminListPage({ params }: { params: Promise<{ tenant: string }> }) {
    const { tenant } = use(params);
    const [page, setPage] = useState(1);
    const [keyword, setKeyword] = useState("");
    const { data, loading, error, execute } = useAction<ReturnList, any[]>(getAdmins);
    const [openCreate, setOpenCreate] = useState(false)
    const [openEdit, setOpenEdit] = useState(false)
    const [adminData, setAdminData] = useState<AdminDate | null>(null);
    const [openDelete, setOpenDelete] = useState(false)

    const handleSearch = (_keyword: string) => {
        if (tenant) {
            execute(tenant, 1, 20, _keyword);
            setKeyword(_keyword)
        }
    };


    const handleTableAction = async (type: string, record: any) => {
        if (type == "EDIT") {
            setAdminData({ id: record?.id || 0, name: record?.name || "", email: record?.email || "", password: "", confirmPwd: "" });
            setOpenEdit(true)
        }
        if (type == "DELETE") {
            setAdminData({ id: record?.id || 0, name: record?.name || "", email: record?.email || "", password: "", confirmPwd: "" });
            setOpenDelete(true)
        }
        if (type == "SWITCH") {
            const res = await switchStatus(tenant, record.id)
            if (res.code == 0) {
                toast.success(res.message)
                execute(tenant, 1, 20, keyword);
            } else {
                toast.error(res.message)
            }

        }
    };

    const handleTablePagination = (page: number) => {
        if (page == data?.data?.page) {
            return
        }
        execute(tenant, page, 20, keyword);
    }

    const handleDeleteAction = async (confirm: boolean, data: any) => {
        if (confirm == true) {
            const res = await deleteAdmin(tenant, data.id)
            if (res.code == 0) {
                toast.success(res.message)
            } else {
                toast.error(res.message)
            }
            execute(tenant, page, 20, keyword);
            setOpenDelete(false)
        } else {
            setOpenDelete(false)
        }
    }

    useEffect(() => {
        if (tenant) {
            execute(tenant, page, 20, keyword);
        }
    }, [tenant, page, execute]);


    return (
        <div className="space-y-6">
            <div className="w-full flex items-center justify-between">
                <div>
                    <SearchComponent placeholder="Search email or name keyword" onAction={handleSearch} />
                </div>
                <div>
                    <Button onClick={() => setOpenCreate(!openCreate)}><UserPlus /></Button>
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
            <Dialog open={openCreate} onOpenChange={setOpenCreate}>
                <DialogContent className="sm:max-w-[725px]" onPointerDownOutside={(e) => e.preventDefault()}>
                    <DialogHeader>
                        <DialogTitle>Create New Admin</DialogTitle>
                        <DialogDescription>
                            Fill in the details below to create a new admin. Changes are applied instantly.
                        </DialogDescription>
                    </DialogHeader>
                    <AdminForm
                        tenant={tenant}
                        onSuccess={() => { setOpenCreate(false); execute(tenant, 1, 20, keyword); }}
                    />
                </DialogContent>
            </Dialog>

            <Dialog open={openEdit} onOpenChange={setOpenEdit}>
                <DialogContent className="sm:max-w-[725px]" onPointerDownOutside={(e) => e.preventDefault()}>
                    <DialogHeader>
                        <DialogTitle>Edit Admin Info</DialogTitle>
                        <DialogDescription>
                            Update the administrator's profile information below.
                        </DialogDescription>
                    </DialogHeader>
                    {adminData && (<EditAdminForm
                        tenant={tenant}
                        data={adminData}
                        onSuccess={() => { setOpenEdit(false); execute(tenant, page, 20, keyword); }}
                    />)}
                </DialogContent>
            </Dialog>
            <AlertDialogComponent open={openDelete} content={`This will PERMANENTLY DELETE administrator account.This action is irreversible and all data cannot be recovered.`} buttonCnt="Delete" type="DELETE" data={adminData} onAction={handleDeleteAction} title={`Delete ${adminData?.email} ?`} />
        </div>
    )
}