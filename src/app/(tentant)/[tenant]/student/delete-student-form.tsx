"use client"
import { useActionState, useEffect, useState } from "react";
import { Loader2 } from 'lucide-react';
import { deleteStudent } from "./actions";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner";
import { FormState } from "@/types/form";
import { Trash2 } from 'lucide-react';
import type { StudentData } from "./page"


export default function TeacherForm({ tenant, onSuccess, data }: { tenant: string, onSuccess: () => void, data?: StudentData | null | undefined }) {
    if (!data) {
        return <></>
    }
    const DeleteStudentWithTenant = deleteStudent.bind(null, tenant);
    const [state, formAction, isPending] = useActionState<FormState, FormData>(DeleteStudentWithTenant, { code: -1, timestamp: 1 });
    const [formDataState, setFormDataState] = useState<StudentData>(data);

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
            <input id="id" name="studentId" type="hidden" required value={formDataState.id} />
            <input id="id" name="studentId" type="hidden" required value={formDataState.id} />
                <div className="grid gap-4">
                    <div className="font-bold">Delete Student</div>
                    <div className="grid gap-2 text-[14px]">
                        <div>
                            <a className="font-bold mr-5">Name</a>
                            <a className="mr-5">{formDataState?.name}</a>
                        </div>
                        <div>
                            <a className="font-bold mr-5">Number</a>
                            <a className="mr-5">{formDataState?.studentNo}</a>
                        </div>
                        <div>
                            <a className="font-bold mr-5">Email</a>
                            <a className=" mr-5">{formDataState?.email}</a>
                        </div>
                    </div>
                    <div className="grid gap-4 text-red-600">
                        <div>This will PERMANENTLY DELETE student.</div>
                        <div>This action is irreversible and all data cannot be recovered.</div>
                        <Input id="confirmStudentNo" name="confirmStudentNo" type="text" placeholder={`Enter Student Number to confirm`} required
                            onChange={(e) => setFormDataState({ ...formDataState, confirmStudentNo: e.target.value })}
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
