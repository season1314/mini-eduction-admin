"use client"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"
import { SquarePen, ShieldCheck, Trash2 } from 'lucide-react';
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ReactNode } from "react";


interface DataTableProps {
    title: { name: string, key: string, type?: any[] }[]
    list?: any[]
}



type RenderFunc = (val: any, row: any, index: number) => ReactNode;

const RENDER_STRATEGIES: Record<string, RenderFunc> = {
    EDIT: (_, row) => (
        <Button variant="ghost" size="sm" onClick={() => console.log("Edit", row)}>
            <SquarePen className="mr-1 h-4 w-4" />
        </Button>
    ),
    PERMISSION: (_, row) => (
        <Button variant="ghost" size="sm" className="text-purple-600">
            <ShieldCheck className="mr-1 h-4 w-4" />
        </Button>
    ),
    DELETE: (_, row) => (
        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
            <Trash2 className="mr-1 h-4 w-4" />
        </Button>
    ),
    SWITCH: (val, row) => (
        <Switch checked={val === 'ACTIVE'} />
    )
};


export default function DataTable({ title, list = [] }: DataTableProps) {

    return (
        <div className="space-y-6">
            <div className="border bg-white min-h-[600px]">
                <Table>
                    <TableHeader>
                        <TableRow>
                            {title.map((item, index) => (
                                <TableHead key={index} className="text-center font-bold">
                                    {item.name}
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {list.length > 0 ? (
                            list.map((row, rowIndex) => (
                                <TableRow key={rowIndex}>
                                    {title.map((column, colIndex) => (
                                        <TableCell key={colIndex} className="text-center">
                                            {column.type ? (
                                                column.type.map((type, index) => {
                                                    const render = RENDER_STRATEGIES[type];
                                                    return render ? <span key={type}>{render(row[column.key], row, index)}</span> : null;
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
                                <TableCell colSpan={title.length} className="text-center py-10">
                                    No data available.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* 分页部分 */}
            <div className="flex items-center justify-end space-x-2">
                <Pagination>
                    <PaginationContent>
                        <PaginationItem>
                            <PaginationPrevious href="#" />
                        </PaginationItem>
                        <PaginationItem>
                            <PaginationLink href="#" isActive>1</PaginationLink>
                        </PaginationItem>
                        <PaginationItem>
                            <PaginationLink href="#">2</PaginationLink>
                        </PaginationItem>
                        <PaginationItem>
                            <PaginationLink href="#">3</PaginationLink>
                        </PaginationItem>
                        <PaginationItem>
                            <PaginationNext href="#" />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            </div>
        </div>
    )
}