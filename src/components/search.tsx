"use client"
import { Button } from "@/components/ui/button"
import { Field } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useState} from "react"
import { Search, ListRestart } from 'lucide-react';
import DateRangerComponent from './dateRanger'



interface searchType {
    placeholder: string // search input placeHolder content
    onAction: (keyword: any) => void; // handle submit and reset button (keyword:search keyword)
    isSelect?: boolean // hide/show search type select
    selectItems?: any[] // search type content
}

export default function SearchComponent({ onAction, placeholder }: searchType) {
    const [keyword, setKeyword] = useState("");

    return (
        <div>
            <Field orientation="horizontal">
                <Input type="search" placeholder={placeholder} className="w-[300px] h-[38px]" value={keyword} onChange={(e) => setKeyword(e.target.value)} />
                <Button onClick={() => onAction(keyword)}><Search /></Button>
                <Button variant="outline" onClick={() => onAction("")}><ListRestart /></Button>
            </Field>
        </div >
    )
}
