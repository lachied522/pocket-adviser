"use client";
import { Card, CardContent } from "@/components/ui/card";

import { cn } from "@/components/utils";

const PREFERENCE_OPTIONS = [
  'Financial Services',
  'Energy',
  'Basic Materials',
  'Consumer Cyclical',
  'Communication Services',
  'Industrials',
  'Consumer Defensive',
  'Real Estate',
  'Technology',
  'E-Commerce',
  'Healthcare',
  'Utilities',
  'Lithium',
  'Renewable Energy',
  'Artificial Intelligence',
  'Pharmaceuticals',
  'Banks',
  'Cybersecurity',
  'Gold',
  'Iron Ore',
  'Uranium',
  'Semiconductors',
  'Aerospace',
  'Cloud Computing',
  'Electric Vehicles',
  'Food & Beverage',
  'Agriculture',
  'Leisure'
] as const;

interface PreferencesSelectorProps {
  value: { [key: string]: 'like' | 'dislike' }
  onChange: (event: any) => void
}

export default function PreferencesSelector({ value, onChange }: PreferencesSelectorProps) {
  const togglePreference = (name: string) => {
      const newValue = { ...value }; // clone preferences

      switch (value[name]) {
        case 'like': 
          newValue[name] = 'dislike';
          break;
        case 'dislike': 
          delete newValue[name];
          break;
        default:
          newValue[name] = 'like';
      }
      
      onChange(newValue);
  }

  return (
      <div className="md:max-w-[1000px] flex flex-wrap text-center items-center justify-center gap-3.5 sm:gap-3 py-6 mx-auto">
        {PREFERENCE_OPTIONS.map((name, index) => (
            <Card
                key={`preference-option-${index}`}
                onClick={() => togglePreference(name)}
                className={cn(
                    "flex items-center justify-center rounded-xl cursor-pointer",
                    value[name]==="like" && "text-green-400 bg-green-100 border-solid border-green-200",
                    value[name]==="dislike" && "text-red-400 bg-red-100 border-red-200"
                )}
            >
              <CardContent className="text-xs font-medium px-3 sm:px-4 py-2 select-none">
                  {name}
              </CardContent>
            </Card>
        ))}
      </div>
  );
}