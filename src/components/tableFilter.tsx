// "use client"
// import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuGroup, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

// import { X, Check } from 'lucide-react';


// interface AlertType {
//     data: any,
//     title: string
//     content: string,
//     buttonCnt: string,
//     type?: string,
//     open: boolean;
//     onAction: (confirmed: boolean, data: any) => void;
//     onOpenChange?: (open: boolean) => void;
// }

// export default function TableFilterComponent({ title, content, data, onAction, open, onOpenChange }: AlertType) {
//     return (
//         <DropdownMenu>
//             <DropdownMenuTrigger asChild>
//                 <Button variant="ghost" size="icon" className="rounded-full">
//                     <Avatar>
//                         <AvatarImage src="https://github.com/shadcn.png" alt="shadcn" />
//                         <AvatarFallback>LR</AvatarFallback>
//                     </Avatar>
//                 </Button>
//             </DropdownMenuTrigger>
//             <DropdownMenuContent align="end">
//                 <DropdownMenuGroup>
//                     <DropdownMenuItem>
//                         <BadgeCheckIcon />
//                         Account
//                     </DropdownMenuItem>
//                     <DropdownMenuItem>
//                         <CreditCardIcon />
//                         Billing
//                     </DropdownMenuItem>
//                     <DropdownMenuItem>
//                         <BellIcon />
//                         Notifications
//                     </DropdownMenuItem>
//                 </DropdownMenuGroup>
//                 <DropdownMenuSeparator />
//                 <DropdownMenuItem>
//                     <LogOutIcon />
//                     Sign Out
//                 </DropdownMenuItem>
//             </DropdownMenuContent>
//         </DropdownMenu>
//     )
// }
