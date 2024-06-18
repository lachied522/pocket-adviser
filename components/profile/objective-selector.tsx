import { OBJECTIVE_MAP } from "./objectives";

import { Card } from "@/components/ui/card";
import { cn } from "@/components/utils";
  
interface ObjectiveSelectorProps {
    value: string
    onChange: (event: any) => void
}

export default function ObjectiveSelector({ value, onChange }: ObjectiveSelectorProps) {
    return (
        <div className='flex flex-wrap gap-2 items-stretch justify-center p-2'>
            {Object.entries(OBJECTIVE_MAP).map(([objective, props], index) => (
            <Card
                key={`objective-card-${index}`}
                onClick={() => onChange(objective)}
                className={cn(
                    'w-[250px] h-[140px] flex flex-col items-center justify-between p-5 cursor-pointer hover:bg-blue-50',
                    value === objective && 'bg-blue-100 border-blue-200 hover:bg-blue-100'
                )}
            >
                <div className="flex flex-row items-start gap-3.5">
                    <props.Icon size={24} />

                    <h6 className="text-center">{props.name}</h6>
                </div>

                <div className="text-sm text-center text-slate-700 mb-1">
                    {props.text}
                </div>

                <div className="text-xs">Time Horizon {props.timeHorizon}</div>
            </Card>
            ))}
        </div>
    );
}