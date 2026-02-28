"use client"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ChevronDownIcon } from "lucide-react"
import dynamic from "next/dynamic"
const Calendar = dynamic(() => import("@/components/ui/calendar").then(mod => mod.Calendar), { ssr: false });
import dayjs from "dayjs";
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);


interface dataRangerType {
    defaultText: string
    onAction: (date: { start: string | null | undefined, end: string | null | undefined }) => void;
    clear: boolean
}

export default function DateRangerComponent({ defaultText, onAction, clear = false }: dataRangerType) {
    const [mounted, setMounted] = useState(false);
    const [dateRange, setDateRange] = useState<{ start: Date | undefined; end: Date | undefined; }>({ start: undefined, end: undefined });
    const handleOpenChange = (open: boolean) => {
        if (!open && onAction) {
            const startTimestamp = dateRange?.start
                ? dayjs(dateRange.start).utc(true).startOf('day').toISOString()
                : null;
            const endTimestamp = dateRange?.end
                ? dayjs(dateRange.end).utc(true).endOf('day').toISOString()
                : null;
            onAction({ start: startTimestamp, end: endTimestamp });
        }
    };
    useEffect(
        () => {
            setMounted(true);
            setDateRange({ start: undefined, end: undefined });
        }, [clear]);
    return (
        <div className="flex gap-2">
            <Popover onOpenChange={handleOpenChange}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        suppressHydrationWarning
                        className={`justify-between font-normal w-[240px] ${!dateRange.start && !dateRange.end ? "text-muted-foreground" : "text-foreground"}`}
                    >
                        {!mounted ? defaultText : (
                            dateRange.start || dateRange.end
                                ? `${dateRange.start ? dayjs(dateRange.start).format("DD/MM/YYYY") : "Before"} ~ ${dateRange.end ? dayjs(dateRange.end).format("DD/MM/YYYY") : "Now"}`
                                : defaultText
                        )}
                        <ChevronDownIcon />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                    <div className="flex flex-row">
                        <Calendar mode="single" selected={dateRange.start} captionLayout="dropdown"
                            onSelect={(date) => { setDateRange((prev) => ({ ...prev, start: date })); }}
                            disabled={(date) => dateRange.end ? dayjs(date).isAfter(dayjs(dateRange.end), 'day') : false}
                        />
                        <Calendar mode="single" selected={dateRange.end} captionLayout="dropdown"
                            onSelect={(date) => { setDateRange((prev) => ({ ...prev, end: date })); }}
                            disabled={(date) => dateRange.start ? dayjs(date).isBefore(dayjs(dateRange.start), 'day') : false}
                        />
                    </div>
                </PopoverContent>
            </Popover>
        </div >
    )
}
