"use client"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { LucideIcon, UserPlus, UserCog, UserX,UserStar } from 'lucide-react';


interface ToggleGroupType {
    list: { icon: string, value: string, disabled: boolean }[];
    onSelect: (value: string) => void;
    selectedValue: string
}

const ICON_MAP: Record<string, LucideIcon> = {
    UserPlus: UserPlus,
    UserCog: UserCog,
    UserX: UserX,
    UserStar:UserStar
};

export default function ToggleGroupComponent({ list, onSelect, selectedValue }: ToggleGroupType) {
    return (
        <div className="flex flex-col gap-4">
            <ToggleGroup type="single" size="sm" defaultValue="top" variant="outline" className="rounded-[5px]" value={selectedValue} onValueChange={(value)=>
                value && onSelect(value)}>
                {list.map((item) => {
                    const IconComponent = ICON_MAP[item.icon];
                    return (<ToggleGroupItem value={item.value} key={item.value} disabled={item.disabled} className="data-[state=on]:bg-sky-100">
                        {IconComponent ? (<IconComponent />) :
                            (<span className="text-xs">{item.value}</span>)}
                    </ToggleGroupItem>)
                })}
            </ToggleGroup>
        </div>
    )
}
