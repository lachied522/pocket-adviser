"use client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";

import { cn } from "@/components/utils";

const SECTORS = [
  {
    name: 'Financials',
    key: 'financial-services',
  },
  {
    name: 'Energy',
    key: 'energy',
  },
  {
    name: 'Materials',
    key: 'materials',
  },
  {
    name: 'Consumer Discretionary',
    key: 'consumer-cyclical',
  },
  {
    name: 'Communication Services',
    key: 'communication-services',
  },
  {
    name: 'Industrials',
    key: 'industrials',
  },
  {
    name: 'Consumer Staples',
    key: 'consumer-defensive',
  },
  {
    name: 'Real Estate',
    key: 'real-estate',
  },
  {
    name: 'Technology',
    key: 'technology',
  },
  {
    name: 'Healthcare',
    key: 'healthcare',
  },
  {
    name: 'Utilities',
    key: 'utilities',
  },
  {
    name: 'Lithium',
    key: 'lithium',
  },
  {
    name: 'Green Energy',
    key: 'renewables',
  },
  {
    name: 'Artificial Intelligence',
    key: 'ai',
  },
  {
    name: 'Pharmaceuticals',
    key: 'pharmaceuticals',
  },
  {
    name: 'Retailers',
    key: 'retail',
  },
  {
    name: 'Banks',
    key: 'banks',
  },
  {
    name: 'Cybersecurity',
    key: 'cybersecurity',
  },
  {
    name: 'Gold',
    key: 'gold',
  },
  {
    name: 'Iron Ore',
    key: 'iron',
  },
]

interface PreferencesSelectorProps {
  value: { [key: string]: 'like' | 'dislike' }
  onChange: (event: any) => void
}

export default function PreferencesSelector({ value, onChange }: PreferencesSelectorProps) {
  const togglePreference = (sector: typeof SECTORS[number]) => {
    if (!value) {
        onChange({
        [sector.key]: 'like'
      })
      return;
    }

    const newValue = { ...value }; // clone preferences

    switch (value[sector.key]) {
      case 'like': 
        newValue[sector.key] = 'dislike';
        break;
      case 'dislike': 
        delete newValue[sector.key];
        break;
      default:
        newValue[sector.key] = 'like';
    }
    
    onChange(newValue);
  }

  return (
      <div className="md:max-w-[1000px] flex flex-wrap text-center items-center justify-center gap-3.5 sm:gap-3 px-2 py-6 mx-auto">
        {SECTORS.map((sector, index) => (
            <Card
                key={`sector-preference-${index}`}
                onClick={() => togglePreference(sector)}
                className={cn(
                    "flex items-center justify-center rounded-xl cursor-pointer",
                    value?.[sector.key]==="like" && "text-green-400 bg-green-100 border-solid border-green-200",
                    value?.[sector.key]==="dislike" && "text-red-400 bg-red-100 border-red-200"
                )}
            >
              <CardContent className="text-xs md:text-sm font-medium p-2 md:p-3">
                {sector.name}
              </CardContent>
            </Card>
        ))}
      </div>
  );
}