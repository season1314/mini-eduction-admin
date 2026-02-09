"use client"
import { useActionState, useEffect, useState, } from "react";
import { Loader2 } from 'lucide-react';
import { editAdmin } from "./actions";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { FormState } from "@/types/form";
import { Save, ListRestart } from 'lucide-react';

export type AdminDate = {
    id: number;
    name: string;
    email: string;
    password?: string;
    confirmPwd?: string;
}

export default function EditAdminForm({ tenant, onSuccess, data }: { tenant: string, onSuccess: () => void, data: AdminDate }) {
    const editAdminWithTenant = editAdmin.bind(null, tenant);
    const [state, formAction, isPending] = useActionState<FormState, FormData>(editAdminWithTenant, { code: -1, timestamp: 1 });
    const rawData = data
    const [formDataState, setFormDataState] = useState(data);
    const [error, setError] = useState<Record<string, string | undefined>>({
        password: "",
        name: "",
        confirmPwd: ""
    });

    useEffect(() => {
        if (state.code == 2 && state.error) { setError(state.error) }
        if (state.code == 1) { toast.error(state.message) }
        if (state.code == 0) { toast.success(state.message); onSuccess(); }
    }, [state]);



    return (
        <form action={formAction} className="grid gap-4 py-4">
            <Input id="id" name="adminId" type="hidden" required value={formDataState.id} />
            <div className="grid gap-2">
                <Label htmlFor="email">Email </Label>
                <Input id="email" name="email" type="email" placeholder="example@domain.com" required
                    value={formDataState.email}
                    disabled
                />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="name">Name <a className="text-[10px] text-destructive font-medium block h-[10px] leading-[10px]">{error.name}</a></Label>
                <Input id="name" name="name" placeholder="John Hao / Sarah m Lee / mike" required
                    value={formDataState.name}
                    onChange={(e) => setFormDataState({ ...formDataState, name: e.target.value })}
                    onFocus={() => setError({ ...error, name: '' })}
                />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="password">Password <a className="text-[10px] text-destructive font-medium block h-[10px] leading-[10px]">{error.password}</a></Label>
                <Input id="password" name="password" type="password" placeholder="if you do not wish to change the current password leave fields blank"
                    value={formDataState.password}
                    onChange={(e) => setFormDataState({ ...formDataState, password: e.target.value })}
                    onFocus={() => setError({ ...error, password: '' })}
                />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="confirmPwd">Confirm Password <a className="text-[10px] text-destructive font-medium block h-[10px] leading-[10px]">{error.confirmPwd}</a></Label>
                <Input id="confirmPwd" name="confirmPwd" type="password" placeholder="if you do not wish to change the current password leave fields blank"
                    value={formDataState.confirmPwd}
                    onChange={(e) => setFormDataState({ ...formDataState, confirmPwd: e.target.value })}
                    onFocus={() => setError({ ...error, confirmPwd: '' })}
                />
            </div>

            <div className="flex justify-end gap-3 mt-4">
                <Button type="button" disabled={isPending} variant="outline" onClick={()=>setFormDataState(rawData)}>
                    <ListRestart />
                </Button>
                <Button type="submit" disabled={isPending}>
                    {isPending ? <Loader2 className="h-10 w-10 animate-spin text-primary text-white" /> : <Save />}
                </Button>
            </div>
        </form>
    )
}