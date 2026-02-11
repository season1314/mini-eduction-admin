"use client"
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { format } from "date-fns"
import type { TeacherDate } from "./edit-teacher-form"


export default function TeacherForm({ tenant, onSuccess, data }: { tenant: string, onSuccess: () => void, data: TeacherDate }) {
    const [formDataState, setFormDataState] = useState<TeacherDate>(data);

    return (
        <form className="grid gap-4 py-2">
            <div className="grid grid-cols-2 gap-6">
                <div className="grid gap-6"><Label><a className="font-bold text-foreground">Id :</a> {formDataState.id}</Label></div>
                <div className="grid gap-6"><Label><a className="font-bold text-foreground">Email :</a> {formDataState.email}</Label></div>
            </div>
            <div className="grid grid-cols-2 gap-6">
                <div className="grid gap-6"><Label><a className="font-bold text-foreground">Name :</a>{formDataState.name}</Label></div>
                <div className="grid gap-6"><Label><a className="font-bold text-foreground">Birthday :</a>{formDataState.birthISO || "Unknown"}</Label></div>
            </div>
            <div className="grid grid-cols-2 gap-6">
                <div className="grid gap-6">
                    <Label>
                        <a className="font-bold text-foreground">Color:</a>
                        <div className="h-3 w-20" style={{ backgroundColor: formDataState.color || '#000000' }}></div>
                    </Label>
                </div>
                <div className="grid gap-6">
                    <Label><a className="font-bold text-foreground">Phone:</a>{formDataState.phone}</Label>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
                <div className="grid gap-6">
                    <Label><a className="font-bold text-foreground">Gender:</a>{formDataState.gender}</Label>
                </div>
                <div className="grid gap-6">
                    <Label><a className="font-bold text-foreground">Contact:</a>{formDataState.contact}</Label>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
                <div className="grid gap-6">
                    <Label><a className="font-bold text-foreground">Create At:</a>{formDataState.createdAt}</Label>
                </div>
                <div className="grid gap-6">
                    <Label><a className="font-bold text-foreground">Create By:</a>{formDataState.createdBy}</Label>
                </div>
            </div>
            <div className="grid gap-2">
                <Label><a className="font-bold text-foreground">Description: </a></Label>
                <div
                    className="min-h-[200px] max-h-[200px] w-full overflow-y-auto whitespace-pre-wrap break-words rounded-md border p-3 text-sm leading-relaxed no-scrollbar"
                >
                    {formDataState.des || "No description provided"}
                </div>
            </div>
        </form>
    )
}
