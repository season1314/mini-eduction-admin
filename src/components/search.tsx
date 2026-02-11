"use client"
import { Button } from "@/components/ui/button"
import { Field } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { Search, ListRestart } from 'lucide-react';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"


interface searchType {
    placeholder: string
    onAction: (type: string, keyword: any) => void;
    isSelect?: boolean
    selectContent?:any[]
}


export default function SearchComponent({ onAction, placeholder, isSelect = false }: searchType) {
    const [keyword, setKeyword] = useState("");
    return (
        <div>
            <Field orientation="horizontal">
                <Select defaultValue="studentNo">
                    <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger><SelectContent>
                        <SelectGroup>
                            <SelectItem value="name">Name</SelectItem>
                            <SelectItem value="studentNo">Student No.</SelectItem>
                        </SelectGroup>
                    </SelectContent>
                </Select>
                <Input type="search" placeholder={placeholder} className="w-[300px] h-[38px]" value={keyword} onChange={(e) => setKeyword(e.target.value)} />
                <Button onClick={() => onAction("", keyword)}><Search /></Button>
                <Button variant="outline" onClick={() => onAction("", "")}><ListRestart /></Button>
            </Field>
        </div >
    )
}
