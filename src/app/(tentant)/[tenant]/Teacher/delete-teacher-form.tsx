"use client"
import { useActionState, useEffect, useState } from "react";
import { Loader2 } from 'lucide-react';
import { deleteTeacher } from "./actions";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner";
import { FormState } from "@/types/form";
import { Trash2 } from 'lucide-react';
import type { TeacherData } from "./page"


export default function TeacherForm({ tenant, onSuccess, data }: { tenant: string, onSuccess: () => void, data?: TeacherData | null | undefined }) {
    if (!data) {
        return <></>
    }
    const DeleteTeacherWithTenant = deleteTeacher.bind(null, tenant);
    const [state, formAction, isPending] = useActionState<FormState, FormData>(DeleteTeacherWithTenant, { code: -1, timestamp: 1 });
    const [formDataState, setFormDataState] = useState<TeacherData>(data);

    useEffect(() => {
        if (state.code == 1) { toast.error(state.message) }
        if (state.code == 0) { toast.success(state.message); onSuccess(); }
    }, [state]);

    useEffect(() => {
        setFormDataState(data)
    }, [data])

    return (
        <div>
            <form className="grid gap-4 py-4" action={formAction}>
            <input id="id" name="teacherId" type="hidden" required value={formDataState.id} />
                <div className="grid gap-4">
                    <div className="font-bold">Delete Teacher</div>
                    <div className="grid gap-2 text-[14px]">
                        <div>
                            <a className="font-bold mr-5">Name</a>
                            <a className="mr-5">{formDataState?.name}</a>
                        </div>
                        <div>
                            <a className="font-bold mr-5">Number</a>
                            <a className="mr-5">{formDataState?.teacherNo}</a>
                        </div>
                        <div>
                            <a className="font-bold mr-5">Email</a>
                            <a className=" mr-5">{formDataState?.email}</a>
                        </div>
                    </div>
                    <div className="grid gap-4 text-red-600">
                        <div>This will PERMANENTLY DELETE teacher.</div>
                        <div>This action is irreversible and all data cannot be recovered.</div>
                        <Input id="confirmTeacherNo" name="confirmTeacherNo" type="text" placeholder={`Enter Teacher Number to confirm`} required
                            onChange={(e) => setFormDataState({ ...formDataState, confirmTeacherNo: e.target.value })}
                        />
                    </div>
                </div>

                <div className="flex justify-between gap-3 mt-4">
                    <div className="flex justify-start gap-3">
                        <Button type="submit" disabled={isPending}>
                            {isPending ? <Loader2 className="h-10 w-10 animate-spin text-primary text-white" /> : <Trash2 />}
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    )
}
