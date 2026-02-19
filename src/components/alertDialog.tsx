"use client"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

import { X, Check } from 'lucide-react';


interface AlertType {
    data: any,
    title: string
    content: string,
    buttonCnt: string,
    type?: string,
    open: boolean;
    onAction: (confirmed: boolean, data: any) => void;
    onOpenChange?: (open: boolean) => void;
}

export default function AlertDialogComponent({ title, content, data, onAction, open, onOpenChange }: AlertType) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {content}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel variant="outline" onClick={() => onAction(false, data)}><X /></AlertDialogCancel>
                    <AlertDialogAction onClick={() => onAction(true, data)}><Check /></AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
