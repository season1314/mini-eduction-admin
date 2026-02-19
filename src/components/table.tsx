"use client"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table"
import {
    Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious,
} from "@/components/ui/pagination"
import { SquarePen, ShieldCheck, Trash2, Transgender, Venus, Mars, CircleQuestionMark, FileText } from 'lucide-react';
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { ReactNode, useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"


interface DataTableProps {
    title: { name: string, key: string, type?: any[], disabled?: string[] }[]
    list?: any[],
    totalPages?: number,
    currentPage?: number,
    onAction: (type: string, record: any) => void;
    onPagination: (page: number) => void;
}



type RenderFunc = (val: any, row: any, index: number, onAction: (type: string, data: any) => void, isDisabled?: boolean) => ReactNode;

const RENDER_STRATEGIES: Record<string, RenderFunc> = {
    EDIT: (_, row, index, onAction, isDisabled) => (
        <Button variant="ghost" size="sm" onClick={() => onAction("EDIT", row)} disabled={isDisabled}>
            <SquarePen className="mr-1 h-4 w-4" />
        </Button>
    ),
    PERMISSION: (_, row, index, onAction, isDisabled) => (
        <Button variant="ghost" size="sm" className="text-purple-600" onClick={() => onAction("PERMISSION", row)} disabled={isDisabled}>
            <ShieldCheck className="mr-1 h-4 w-4" />
        </Button>
    ),
    DELETE: (_, row, index, onAction, isDisabled) => (
        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700" onClick={() => onAction("DELETE", row)} disabled={isDisabled}>
            <Trash2 className="mr-1 h-4 w-4" />
        </Button>
    ),
    SWITCH: (val, row, index, onAction, isDisabled) => (
        <Switch checked={val === 'ACTIVE'} onClick={() => onAction("SWITCH", row)} disabled={isDisabled} />
    ),

    GENDER: (val) => (
        <div className="flex justify-center items-center w-full">
            {val === "MALE" ? <Mars className="text-blue-600 h-4 w-4" /> :
                val === "FEMALE" ? <Venus className="text-rose-500 h-4 w-4" /> :
                    val === "OTHER" ? <Transgender className="text-slate-600 h-4 w-4" /> :
                        <CircleQuestionMark className="text-gray-700 mr-1 h-4 w-4" />}
        </div>
    ),

    DETAIL: (_, row, index, onAction) => (
        <Button variant="ghost" size="sm" className="text-purple-600" onClick={() => onAction("DETAIL", row)}>
            <FileText className="mr-1 h-4 w-4" />
        </Button>
    ),

    COLOR: (val, row) => (
        <div className="flex justify-center items-center w-full">
            <div style={{ color: `${row.color}` }}>{val}</div>
        </div>
    ),

    MEMBER: (val, row, index, onAction) => {
        if (row.membershipStatus == 'NONE') {
            return (
                <div className="flex justify-center items-center w-full">
                    <Tooltip>
                        <TooltipTrigger>
                            <Badge className="bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300" onClick={() => onAction('MEMBER', row)}>NONE</Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Click to create membership</p>
                        </TooltipContent>
                    </Tooltip>
                </div>
            )
        }
        if (row.membershipStatus == 'EXPIRED') {
            return (
                <div className="flex justify-center items-center w-full">
                    <Tooltip>
                        <TooltipTrigger>
                            <Badge className="bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300" onClick={() => onAction('MEMBER', row)}>EXPIRED</Badge>
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
                            <Badge className="bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300" onClick={() => onAction('MEMBER', row)}>ACTIVE</Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Expired date: {row.membershipExpiryString}</p>
                        </TooltipContent>
                    </Tooltip>
                </div>
            )

        }
    }
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


export default function DataTableComponent({ title, list = [], totalPages = 1, currentPage = 1, onAction, onPagination }: DataTableProps) {
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
            <div className="border bg-white rounded-md h-[calc(100vh-300px)] w-full overflow-auto">
                <div className="min-w-[1200px]">
                    <Table>
                        <TableHeader className="sticky top-0 z-10 bg-white shadow-[0_1px_0_0_rgba(0,0,0,0.1)]">
                            <TableRow>
                                {title.map((item, index) => (
                                    <TableHead key={index} className="text-center font-bold">
                                        {item.name}
                                    </TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {!isFirstLoading ? list.length > 0 ? (
                                list.map((row, rowIndex) => (
                                    <TableRow key={row.id}>
                                        {title.map((column, colIndex) => (
                                            <TableCell key={colIndex} className="text-center">
                                                {column.type ? (
                                                    column.type.map((type, index) => {
                                                        const render = RENDER_STRATEGIES[type];
                                                        return render ? <span key={type}>{render(row[column.key], row, index, onAction, column.disabled && row[column.disabled[0]] == column.disabled[1] && true)}</span> : null;
                                                    })
                                                ) : (
                                                    row[column.key]
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
                                    <div className="flex flex-col items-center justify-center space-y-3">
                                        <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
                                        <p className="text-sm">Loading...</p>
                                    </div>
                                </TableCell>
                            </TableRow>)}
                        </TableBody>
                    </Table>
                </div>
            </div>

            <div className="flex items-center justify-end space-x-2">
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
                                className={
                                    currentPage === 1
                                        ? "pointer-events-none opacity-50 cursor-not-allowed"
                                        : "cursor-pointer"
                                } />
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