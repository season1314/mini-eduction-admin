"use client"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ChevronDownIcon } from "lucide-react"
import dynamic from "next/dynamic"
const Calendar = dynamic(() => import("@/components/ui/calendar").then(mod => mod.Calendar), { ssr: false });


interface dataRangerType {
    defaultText: string
    onAction: (date: Date | undefined, type: 'start' | 'end') => void;
    start: Date | undefined;
    end: Date | undefined;
}

export default function DateRangerComponent({ defaultText, start, end, onAction }: dataRangerType) {
    const [open, setOpen] = useState(false)
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);
    return (
        <div className="flex gap-2">
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        suppressHydrationWarning
                        className={`justify-between font-normal w-[240px] ${!start && !end ? "text-muted-foreground" : "text-foreground"}`}
                    >
                        {!mounted ? defaultText : (
                            start || end
                                ? `${start ? start.toLocaleDateString('en-GB') : "Before"} ~ ${end ? end.toLocaleDateString('en-GB') : "Now"}`
                                : defaultText
                        )}
                        <ChevronDownIcon />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                    <div className="flex flex-row">
                        <Calendar mode="single" selected={start} captionLayout="dropdown"
                            onSelect={(date) => { onAction(date, 'start') }}
                        />
                        <Calendar mode="single" selected={end} captionLayout="dropdown"
                            onSelect={(date) => { onAction(date, 'end') }} />
                    </div>
                </PopoverContent>
            </Popover>
        </div >
    )
}
