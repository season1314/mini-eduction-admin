"use client"
import { useActionState, useEffect, useState } from "react";
import { Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label";
import { FormState } from "@/types/form";
import { Save } from 'lucide-react';
import { Textarea } from "@/components/ui/textarea"
import { createClass } from "./actions"
import { toast } from "sonner";
import type { classData } from "./page"
import { Input } from "@/components/ui/input"

export default function ClassForm({ tenant, onSuccess }: { tenant: string, onSuccess: () => void }) {
    const createClassWithTenant = createClass.bind(null, tenant);
    const [state, formAction, isPending] = useActionState<FormState, FormData>(createClassWithTenant, { code: -1, timestamp: 1 });
    const [error, setError] = useState<Record<string, string | undefined>>({
        name: "",
    });
    const [formDataState, setFormDataState] = useState<classData>({
        name: "",
        des: ""
    });

    useEffect(() => {
        if (state.code == 2 && state.error) { setError(state.error) }
        if (state.code == 1) { toast.error(state.message) }
        if (state.code == 0) { toast.success(state.message); onSuccess(); }
    }, [state]);
    return (
        <form action={formAction} className="grid gap-4 py-4">
            <div className="grid gap-4">
                <Label htmlFor="name">Class Name<a className="text-[10px] text-destructive font-medium block h-[10px] leading-[10px]">{error.name}</a></Label>
                <Input id="name" name="name" placeholder="G-000-000000" required
                    value={formDataState.name}
                    onChange={(e) => setFormDataState({ ...formDataState, name: e.target.value })}
                    onFocus={() => setError({ ...error, name: '' })}
                />
            </div>
            <div className="grid gap-4">
                <Label htmlFor="des">
                    Description
                </Label>
                <Textarea
                    id="note"
                    name="note"
                    placeholder="Additional notes about the teacher (e.g., teaching style, specialties, or specific availability needs)."
                    value={formDataState.des}
                    onChange={(e) => setFormDataState({ ...formDataState, des: e.target.value })}
                    className="h-[100px] resize-none"
                />
            </div>
            <div className="flex justify-end gap-3 mt-4">
                <Button type="submit" disabled={isPending}>
                    {isPending ? <Loader2 className="h-10 w-10 animate-spin text-primary text-white" /> : <Save />}
                </Button>
            </div>
        </form>
    )
}
