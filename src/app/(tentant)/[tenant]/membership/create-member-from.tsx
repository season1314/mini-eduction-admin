"use client"
import { useActionState, useEffect, useState } from "react";
import { ChevronDownIcon } from "lucide-react"
import * as React from "react"
import { Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input"
import { FormState } from "@/types/form";
import { Save } from 'lucide-react';
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { Textarea } from "@/components/ui/textarea"
import type { studentDate } from "../student/edit-student-form"
import { createMember } from "./actions"


interface MemberFormState {
    studentId: number;
    memberOldExpiry: Date | undefined;
    memberNewExpiry: Date | undefined;
    note: string;
    studentNo: string;
    studentName: string
}


export default function MemberForm({ tenant, onSuccess, data }: { tenant: string, onSuccess: () => void, data: studentDate }) {
    const createMemberWithTenant = createMember.bind(null, tenant);
    const [state, formAction, isPending] = useActionState<FormState, FormData>(createMemberWithTenant, { code: -1, timestamp: 1 });
    const [openStart, setOpenStart] = React.useState(false)
    const [formDataState, setFormDataState] = useState<MemberFormState>({
        studentName: data.name,
        studentId: data.id,
        studentNo: data.studentNo,
        memberOldExpiry: data.membershipExpiry && new Date(data.membershipExpiry),
        memberNewExpiry: data.membershipExpiry && new Date(data.membershipExpiry),
        note: "",
    });

    useEffect(() => {
        // if (state.code == 2 && state.error) { setError(state.error) }
        // if (state.code == 1) { toast.error(state.message) }
        // if (state.code == 0) { toast.success(state.message); onSuccess(); }
    }, [state]);
    return (
        <form action={formAction} className="grid gap-4 py-4">
            <input type="hidden" name="studentName" value={formDataState.studentName} />
            <input type="hidden" name="studentNo" value={formDataState.studentNo} />
            <input type="hidden" name="studentId" value={formDataState.studentId} />
            <input type="hidden" name="memberOldExpiry" value={formDataState.memberOldExpiry?.toISOString() || ""} />
            <input type="hidden" name="memberNewExpiry" value={formDataState.memberNewExpiry?.toISOString() || ""} />
            <div className="grid gap-2">
                <Label htmlFor="studentNo">Student Info</Label>
                <div className="text-sm font-medium leading-none h-[20px] flex items-center">{formDataState.studentName} | {formDataState.studentNo}</div>
            </div>

            <div className="grid gap-4">
                <Label htmlFor="birth">Expiry date</Label>
                <Popover open={openStart} onOpenChange={setOpenStart}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            id="date-picker-optional"
                            className={`justify-between font-normal ${!formDataState.memberNewExpiry ? "text-muted-foreground" : ""}`}>
                            {formDataState.memberNewExpiry ? format(formDataState.memberNewExpiry, "PPP") : "Select expiry date"}
                            <ChevronDownIcon />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                        <Calendar
                            mode="single"
                            captionLayout="dropdown"
                            selected={formDataState.memberNewExpiry}
                            startMonth={new Date(new Date().getFullYear() - 5, 0)}
                            endMonth={new Date(new Date().getFullYear() + 5, 11)}
                            onSelect={(date) => {
                                if (!date) return;
                                const dateString = date.toLocaleDateString('en-CA');
                                const utcDate = new Date(`${dateString}T00:00:00.000Z`);
                                setFormDataState({ ...formDataState, memberNewExpiry: utcDate })
                                setOpenStart(false)
                            }}
                        />
                    </PopoverContent>
                </Popover>
            </div>
            <div className="grid gap-4">
                <Label htmlFor="des">
                    Note
                </Label>
                <Textarea
                    id="note"
                    name="note"
                    placeholder="Additional notes about the teacher (e.g., teaching style, specialties, or specific availability needs)."
                    value={formDataState.note}
                    onChange={(e) => setFormDataState({ ...formDataState, note: e.target.value })}
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
