"use client"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table"
import {
    Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious,
} from "@/components/ui/pagination"
import { ReactNode, useState, useEffect, useRef } from "react";
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Dot } from 'lucide-react';


interface DataTableProps {
    title: { name: string, key: string, type?: any[], disabled?: string[], width?: string }[]
    list?: any[],
    totalPages?: number,
    currentPage?: number,
    onAction: (type: string, record: any) => void;
    onPagination: (page: number) => void;
    selectionId?: number
}

interface EllipsisCellProps {
    children: ReactNode
}

type RenderFunc = (val: any, row: any, index: number, onAction: (type: string, data: any) => void, isDisabled?: boolean) => ReactNode;

const RENDER_STRATEGIES: Record<string, RenderFunc> = {
    MEMBER: (val, row, index, onAction) => {
        if (row.membershipStatus == 'NONE') {
            return (
                <div className="flex justify-center items-center w-full">
                 <Badge className="bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">NONE</Badge>
                </div>
            )
        }
        if (row.membershipStatus == 'EXPIRED') {
            return (
                <div className="flex justify-center items-center w-full">
                    <Tooltip>
                        <TooltipTrigger>
                            <Badge className="bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300">EXPIRED</Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Expired date: {row.membershipExpiryString}</p>
                        </TooltipContent>
                    </Tooltip>
                </div>
            )
        }
        if (row.membershipStatus == 'ACTIVE') {
            return (
                <div className="flex justify-center items-center w-full">
                    <Tooltip>
                        <TooltipTrigger>
                            <Badge className="bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300">ACTIVE</Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Expired date: {row.membershipExpiryString}</p>
                        </TooltipContent>
                    </Tooltip>
                </div>
            )

        }
    },
    STATUS: (val, row, index, onAction) => {
        return <div className="w-full flex items-center justify-center"><Dot className={val === 'ACTIVE' ? "text-emerald-400" : "text-rose-400"} strokeWidth={5} /></div>
    },
    CREATE: (val, row, index) => (
        <div className="flex justify-center items-center w-full">
            <Tooltip>
                <TooltipTrigger>
                    {row.registration}
                </TooltipTrigger>
                <TooltipContent>
                    {row.createdBy}
                </TooltipContent>
            </Tooltip>
        </div>
    )

};

const getVisiblePages = (current: number, total: number) => {
    if (total <= 7) {
        return Array.from({ length: total }, (_, i) => i + 1);
    }

    const pages: (number | string)[] = [];

    if (current <= 4) {
        for (let i = 1; i <= 5; i++) pages.push(i);
        pages.push("ellipsis-right");
        pages.push(total);
    } else if (current >= total - 3) {
        pages.push(1);
        pages.push("ellipsis-left");
        for (let i = total - 4; i <= total; i++) pages.push(i);
    } else {
        pages.push(1);
        pages.push("ellipsis-left");
        pages.push(current - 1);
        pages.push(current);
        pages.push(current + 1);
        pages.push("ellipsis-right");
        pages.push(total);
    }

    return pages;
};

const contentClass = "border bg-white rounded-[5px] h-[calc(100vh-240px)] w-full overflow-auto"
const optClass = "sticky right-0 z-20 bg-white border-l-1 border-b border-slate-200"
const tableHeaderClass = "sticky top-0 z-10 bg-white shadow-[0_1px_0_0_rgba(0,0,0,0.1)]"
const loadingContentClass = "flex flex-col items-center justify-center space-y-3"
const loadingSpanClass = "animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"

const paginationContentClass = "flex items-center justify-end space-x-2"


export default function DataTableComponent({ title, list = [], totalPages = 1, currentPage = 1, onAction, onPagination, selectionId = 0 }: DataTableProps) {
    const [isFirstLoading, setIsFirstLoading] = useState(true);
    const pages = getVisiblePages(currentPage, totalPages);


    useEffect(() => {
        if (list && list.length > 0) {
            setIsFirstLoading(false);
        } else {
            const timer = setTimeout(() => {
                setIsFirstLoading(false);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [list]);


    return (
        <div className="space-y-6">
            <div className={contentClass}>
                <div>
                    <Table className="border-separate border-spacing-0">
                        <TableHeader className={tableHeaderClass}>
                            <TableRow>
                                {title.map((item, index) => (
                                    <TableHead key={index} className={`text-center font-semibold ${item.key === 'opt' ? optClass : ""}`}
                                        style={{ minWidth: item.width, maxWidth: item.width }}>
                                        {item.name}
                                    </TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {!isFirstLoading ? list.length > 0 ? (
                                list.map((row, rowIndex) => (
                                    <TableRow key={row.id} onClick={() => { onAction("ROW", row.id === selectionId ? '' : row) }} className={`cursor-pointer ${selectionId == row.id ? "bg-sky-100 hover:bg-sky-100" : ""}`}>
                                        {title.map((column, colIndex) => (
                                            <TableCell key={colIndex} className={`text-center border-b ${column.key === 'opt' ? optClass : ""}`}
                                                style={{ maxWidth: column.width, minWidth: column.width }}>
                                                {column.type ? (
                                                    column.type.map((type, index) => {
                                                        const render = RENDER_STRATEGIES[type];
                                                        return render ?
                                                            <span key={type}>{render(row[column.key], row, index, onAction, column.disabled && row[column.disabled[0]] == column.disabled[1] && true)}</span> : null;
                                                    })
                                                ) : (
                                                    <EllipsisCell>{row[column.key]}</EllipsisCell>
                                                )}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={title.length} className="text-center py-10">No Data Available</TableCell>
                                </TableRow>
                            ) : (<TableRow>
                                <TableCell colSpan={title.length} className="text-center py-10">
                                    <div className={loadingContentClass}>
                                        <div className={loadingSpanClass} />
                                        <p className="text-sm">Loading...</p>
                                    </div>
                                </TableCell>
                            </TableRow>)}
                        </TableBody>
                    </Table>
                </div>
            </div>

            <div className={paginationContentClass}>
                <Pagination>
                    <PaginationContent>
                        <PaginationItem>
                            <PaginationPrevious onClick={(e) => {
                                if (currentPage === 1) {
                                    e.preventDefault();
                                    return;
                                }
                                onPagination(currentPage - 1);
                            }}
                                className={currentPage === 1 ? "pointer-events-none opacity-50 cursor-not-allowed" : "cursor-pointer"} />
                        </PaginationItem>
                        {pages.map((p) => (
                            <PaginationItem key={p}>
                                {
                                    p == 'ellipsis-left' ? (<PaginationLink className="cursor-pointer" onClick={() => onPagination((Number(currentPage) - 5) > 1 ? (Number(currentPage) - 5) : 1)}>...</PaginationLink>) :
                                        p == 'ellipsis-right' ? (<PaginationLink className="cursor-pointer" onClick={() => onPagination((Number(currentPage) + 5) < totalPages ? (Number(currentPage) + 5) : totalPages)}>...</PaginationLink>) :
                                            (<PaginationLink isActive={currentPage === p} onClick={() => onPagination(Number(p))} className="cursor-pointer">{p}</PaginationLink>)
                                }
                            </PaginationItem>
                        ))}
                        <PaginationItem>
                            <PaginationNext href="#" onClick={(e) => {
                                if (currentPage >= totalPages) {
                                    e.preventDefault();
                                    return;
                                }
                                onPagination(currentPage + 1);
                            }}
                                className={
                                    currentPage >= totalPages
                                        ? "pointer-events-none opacity-50 cursor-not-allowed"
                                        : "cursor-pointer"
                                } />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            </div>
        </div>
    )
}

export function EllipsisCell({ children }: EllipsisCellProps) {
    const textRef = useRef<HTMLDivElement | null>(null)
    const [isOverflow, setIsOverflow] = useState(false)

    useEffect(() => {
        const el = textRef.current
        if (!el) return

        const checkOverflow = () => {
            setIsOverflow(el.scrollWidth > el.clientWidth)
        }

        checkOverflow()

        const resizeObserver = new ResizeObserver(checkOverflow)
        resizeObserver.observe(el)

        return () => resizeObserver.disconnect()
    }, [])

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <div
                    ref={textRef}
                    className={`truncate w-full ${isOverflow ? "cursor-pointer" : "cursor-default"}`}
                >
                    {children}
                </div>
            </TooltipTrigger>
            {isOverflow && (
                <TooltipContent>
                    {children}
                </TooltipContent>
            )}
        </Tooltip>
    )
}