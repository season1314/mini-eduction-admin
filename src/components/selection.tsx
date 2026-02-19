import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"


interface selectionType {
    defaultText: string
    onAction: (val: string) => void;
    items: { value: string, label: string }[]
    className: string
    id: string
    value: string
}


export default function SelectionComponent({ defaultText, items, className, id, onAction, value }: selectionType) {
    return (
        <Select name={id} onValueChange={(val) => onAction(val)} value={value || ""}>
            <SelectTrigger className={className}>
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