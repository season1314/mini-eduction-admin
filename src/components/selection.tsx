import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"


interface selectionType {
    defaultText: string
    onAction: (val: string) => void;
    items: { value: string, label: string }[]
    className: string
    value: string
}


export default function SelectionComponent({ defaultText, items, className, onAction, value }: selectionType) {
    return (
        <Select onValueChange={(val) => onAction(val)} value={value || ""} name={defaultText}>
            <SelectTrigger className={className} name={defaultText} id={defaultText}>
                <SelectValue placeholder={defaultText} />
            </SelectTrigger>
            <SelectContent>
                <SelectGroup>
                    {items && items.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                            {item.label}
                        </SelectItem>
                    ))}
                </SelectGroup>
            </SelectContent>
        </Select>
    )
}