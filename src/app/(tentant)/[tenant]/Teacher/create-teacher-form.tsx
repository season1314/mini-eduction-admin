"use client"
import { useActionState, useEffect, useState } from "react";
import { ChevronDownIcon } from "lucide-react"
import * as React from "react"
import { Loader2 } from 'lucide-react';
import { createTeacher } from "./actions";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { FormState } from "@/types/form";
import { Save } from 'lucide-react';
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"


export default function TeacherForm({ tenant, onSuccess }: { tenant: string, onSuccess: () => void }) {
    const createTeacherWithTenant = createTeacher.bind(null, tenant);
    const [state, formAction, isPending] = useActionState<FormState, FormData>(createTeacherWithTenant, { code: -1, timestamp: 1 });
    const [open, setOpen] = React.useState(false)
    const [formDataState, setFormDataState] = useState({
        email: "",name: "",phone: "",teacherNo:"",contact: "",color: "#000000",
        des: "",gender: "UNKNOWN",birth: undefined as Date | undefined
    });
    const [error, setError] = useState<Record<string, string | undefined>>({email: "",name: "",teacherNo:""});

    useEffect(() => {
        if (state.code == 2 && state.error) { setError(state.error) }
        if (state.code == 1) { toast.error(state.message) }
        if (state.code == 0) { toast.success(state.message); onSuccess(); }
    }, [state]);
    
    return (
        <form action={formAction} className="grid gap-4 py-4">
            <input type="hidden" name="gender" value={formDataState.gender} />
            <input type="hidden" name="birth" value={formDataState.birth?.toISOString() || ""} />
            <div className="grid gap-2">
                    <Label htmlFor="teacherNo">Teacher No.<a className="text-[10px] text-destructive font-medium block h-[10px] leading-[10px]">{error.teacherNo}</a></Label>
                    <Input id="teacherNo" name="teacherNo" type="text" placeholder="TID:0000000000" required
                        value={formDataState.teacherNo}
                        onChange={(e) => setFormDataState({ ...formDataState, teacherNo: e.target.value })}
                        onFocus={() => setError({ ...error, teacherNo: '' })}
                    />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="email">Email <a className="text-[10px] text-destructive font-medium block h-[10px] leading-[10px]">{error.email}</a></Label>
                    <Input id="email" name="email" type="email" placeholder="example@domain.com" required
                        value={formDataState.email}
                        onChange={(e) => setFormDataState({ ...formDataState, email: e.target.value })}
                        onFocus={() => setError({ ...error, email: '' })}
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
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" name="phone" placeholder="00-000-00000000"
                        value={formDataState.phone}
                        onChange={(e) => setFormDataState({ ...formDataState, phone: e.target.value })}
                        onFocus={() => setError({ ...error, phone: '' })}
                    />
                </div>
            
                <div className="grid gap-2">
                    <Label htmlFor="contact">Contact</Label>
                    <Input id="contact" name="contact" placeholder="WhatApp / Wechat / Line"
                        value={formDataState.contact}
                        onChange={(e) => setFormDataState({ ...formDataState, contact: e.target.value })}
                        onFocus={() => setError({ ...error, contact: '' })}
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="birth">Date of Birth</Label>
                    <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                id="date-picker-optional"
                                className={`justify-between font-normal ${!formDataState.birth ? "text-muted-foreground" : ""}`}

                            >
                                {formDataState.birth ? format(formDataState.birth, "PPP") : "Select birthday"}
                                <ChevronDownIcon />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={formDataState.birth}
                                captionLayout="dropdown"
                                defaultMonth={formDataState.birth}
                                onSelect={(date) => {
                                    setFormDataState({ ...formDataState, birth: date })
                                    setOpen(false)
                                }}
                            />
                        </PopoverContent>
                    </Popover>
                </div>
                <div className="grid grid-cols-2">
                    <div className="grid gap-2">
                        <Label htmlFor="gender">Gender</Label>
                        <Select value={formDataState.gender} onValueChange={(newValue: string) => setFormDataState({ ...formDataState, gender: newValue })}>
                            <SelectTrigger className="w-[120px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectItem value="MALE">Male</SelectItem>
                                    <SelectItem value="FEMALE">Female</SelectItem>
                                    <SelectItem value="OTHER">Other</SelectItem>
                                    <SelectItem value="UNKNOWN">Unknown</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="gender">Color</Label>
                        <Input
                            type="color"
                            name="color"
                            className="w-[120px] h-10 p-1 cursor-pointer"
                            value={formDataState.color}
                            onChange={(e) => setFormDataState({ ...formDataState, color: e.target.value })}
                        />
                    </div>
                </div>
            </div>
            <div className="grid gap-4">
                <Label htmlFor="des">
                    Description
                </Label>
                <Textarea
                    id="des"
                    name="des"
                    placeholder="Additional notes about the teacher (e.g., teaching style, specialties, or specific availability needs)."
                    value={formDataState.des}
                    onChange={(e) => setFormDataState({ ...formDataState, des: e.target.value })}
                    onFocus={() => setError({ ...error, des: '' })}
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
