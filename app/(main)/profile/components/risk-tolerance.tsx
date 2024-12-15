"use client";
import { useFormContext } from "react-hook-form";

import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
} from "@/components/ui/form";
import {
    RadioGroup,
    RadioGroupItem
} from "@/components/ui/radio-group";

import type { FormValues } from "./form-schema";

export default function RiskTolerance() {
    const form = useFormContext<FormValues>();
    return (
        <div className='flex flex-col gap-6 sm:gap-12 px-2'>
            <p className='text-xs sm:text-sm'>
                <span className='font-medium'>Note.</span> Risk of an investment is defined as the probability that it will incur a financial loss. 
                The higher the risk of an investment, the greater both the <b>potential gain</b> and <b>potential loss</b> will be.
            </p>

            <FormField
                control={form.control}
                name="experience"
                render={({field}) => (
                    <FormItem className='grid grid-cols-1 md:grid-cols-[0.3fr_0.7fr] items-center gap-6 md:gap-12 md:pr-3'>
                        <FormLabel className='text-base'>
                            How many years experience do you have investing in stocks?
                        </FormLabel>
                        <FormControl>
                            <RadioGroup
                                onValueChange={field.onChange}
                                defaultValue={String(field.value)}
                                className="w-full flex flex-wrap justify-center md:justify-between gap-3 py-3"
                            >
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                    <FormControl>
                                        <RadioGroupItem value="1" />
                                    </FormControl>
                                    <FormLabel className="font-normal">0</FormLabel>
                                </FormItem>
                                <FormItem  className="flex items-center space-x-3 space-y-0">
                                    <FormControl>
                                        <RadioGroupItem value="2" />
                                    </FormControl>
                                    <FormLabel className="font-normal">1-2</FormLabel>
                                </FormItem>
                                <FormItem  className="flex items-center space-x-3 space-y-0">
                                    <FormControl>
                                        <RadioGroupItem value="3" />
                                    </FormControl>
                                    <FormLabel className="font-normal">3-4</FormLabel>
                                </FormItem>
                                <FormItem  className="flex items-center space-x-3 space-y-0">
                                    <FormControl>
                                        <RadioGroupItem value="4" />
                                    </FormControl>
                                    <FormLabel className="font-normal">5-6</FormLabel>
                                </FormItem>
                                <FormItem  className="flex items-center space-x-3 space-y-0">
                                    <FormControl>
                                        <RadioGroupItem value="5" />
                                    </FormControl>
                                    <FormLabel className="font-normal">7+</FormLabel>
                                </FormItem>
                            </RadioGroup>
                        </FormControl>
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="riskToleranceQ1"
                render={({field}) => (
                    <FormItem className='grid grid-cols-1 md:grid-cols-[0.3fr_0.7fr] items-center gap-6 md:gap-12 md:pr-3'>
                        <FormLabel className='text-base'>
                            Which of the following best describes your association with financial risk?
                        </FormLabel>
                        <FormControl>
                            <RadioGroup
                                onValueChange={field.onChange}
                                defaultValue={String(field.value)}
                                className="w-full flex flex-wrap justify-center md:justify-between gap-3 py-3"
                            >
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                    <FormControl>
                                        <RadioGroupItem value="1" />
                                    </FormControl>
                                    <FormLabel className="font-normal">Danger</FormLabel>
                                </FormItem>
                                <FormItem  className="flex items-center space-x-3 space-y-0">
                                    <FormControl>
                                        <RadioGroupItem value="2" />
                                    </FormControl>
                                    <FormLabel className="font-normal">Uncertainty</FormLabel>
                                </FormItem>
                                <FormItem  className="flex items-center space-x-3 space-y-0">
                                    <FormControl>
                                        <RadioGroupItem value="3" />
                                    </FormControl>
                                    <FormLabel className="font-normal">Indifference</FormLabel>
                                </FormItem>
                                <FormItem  className="flex items-center space-x-3 space-y-0">
                                    <FormControl>
                                        <RadioGroupItem value="4" />
                                    </FormControl>
                                    <FormLabel className="font-normal">Opportunity</FormLabel>
                                </FormItem>
                                <FormItem  className="flex items-center space-x-3 space-y-0">
                                    <FormControl>
                                        <RadioGroupItem value="5" />
                                    </FormControl>
                                    <FormLabel className="font-normal">Thrill</FormLabel>
                                </FormItem>
                            </RadioGroup>
                        </FormControl>
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="riskToleranceQ2"
                render={({field}) => (
                    <FormItem className='grid grid-cols-1 md:grid-cols-[0.3fr_0.7fr] items-center gap-6 md:gap-12 md:pr-3'>
                        <FormLabel className='text-base'>
                            What is your willingness to take on financial risk?
                        </FormLabel>
                        <FormControl>
                            <RadioGroup 
                                onValueChange={field.onChange}
                                defaultValue={String(field.value)}
                                className="w-full flex flex-wrap justify-center md:justify-between gap-3 py-3"
                            >
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                    <FormControl>
                                        <RadioGroupItem value="1" />
                                    </FormControl>
                                    <FormLabel className="font-normal">Very low</FormLabel>
                                </FormItem>
                                <FormItem  className="flex items-center space-x-3 space-y-0">
                                    <FormControl>
                                        <RadioGroupItem value="2" />
                                    </FormControl>
                                    <FormLabel className="font-normal">Low</FormLabel>
                                </FormItem>
                                <FormItem  className="flex items-center space-x-3 space-y-0">
                                    <FormControl>
                                        <RadioGroupItem value="3" />
                                    </FormControl>
                                    <FormLabel className="font-normal">Average</FormLabel>
                                </FormItem>
                                <FormItem  className="flex items-center space-x-3 space-y-0">
                                    <FormControl>
                                        <RadioGroupItem value="4" />
                                    </FormControl>
                                    <FormLabel className="font-normal">High</FormLabel>
                                </FormItem>
                                <FormItem  className="flex items-center space-x-3 space-y-0">
                                    <FormControl>
                                        <RadioGroupItem value="5" />
                                    </FormControl>
                                    <FormLabel className="font-normal">Very high</FormLabel>
                                </FormItem>
                            </RadioGroup>
                        </FormControl>
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="riskToleranceQ3"
                render={({field}) => (
                    <FormItem className='grid grid-cols-1 md:grid-cols-[0.3fr_0.7fr] items-center gap-6 md:gap-12 md:pr-3'>
                        <FormLabel className='text-base'>
                            What range of returns do you expect to receive from your portfolio?
                        </FormLabel>
                        <FormControl>
                            <RadioGroup 
                                onValueChange={field.onChange}
                                defaultValue={String(field.value)}
                                className="w-full flex flex-wrap justify-center md:justify-between gap-3 py-3"
                            >
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                    <FormControl>
                                        <RadioGroupItem value="1" />
                                    </FormControl>
                                    <FormLabel className="font-normal">4% to 5%</FormLabel>
                                </FormItem>
                                <FormItem  className="flex items-center space-x-3 space-y-0">
                                    <FormControl>
                                        <RadioGroupItem value="2" />
                                    </FormControl>
                                    <FormLabel className="font-normal">2% to 6%</FormLabel>
                                </FormItem>
                                <FormItem  className="flex items-center space-x-3 space-y-0">
                                    <FormControl>
                                        <RadioGroupItem value="3" />
                                    </FormControl>
                                    <FormLabel className="font-normal">0% to 7%</FormLabel>
                                </FormItem>
                                <FormItem  className="flex items-center space-x-3 space-y-0">
                                    <FormControl>
                                        <RadioGroupItem value="4" />
                                    </FormControl>
                                    <FormLabel className="font-normal">-2% to 10%</FormLabel>
                                </FormItem>
                                <FormItem  className="flex items-center space-x-3 space-y-0">
                                    <FormControl>
                                        <RadioGroupItem value="5" />
                                    </FormControl>
                                    <FormLabel className="font-normal">-5% to 20%</FormLabel>
                                </FormItem>
                            </RadioGroup>
                        </FormControl>
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="riskToleranceQ4"
                render={({field}) => (
                    <FormItem className='grid grid-cols-1 md:grid-cols-[0.3fr_0.7fr] items-center gap-6 md:gap-12 md:pr-3'>
                        <FormLabel className='text-base'>
                            How much could the <strong>total value</strong> of all your
                            portfolio fall before you begin to feel uncomfortable?
                        </FormLabel>
                        <FormControl>
                            <RadioGroup 
                                onValueChange={field.onChange}
                                defaultValue={String(field.value)}
                                className="w-full flex flex-wrap justify-center md:justify-between gap-3 py-3"
                            >
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                    <FormControl>
                                        <RadioGroupItem value="1" />
                                    </FormControl>
                                    <FormLabel className="font-normal">&lt;10%</FormLabel>
                                </FormItem>
                                <FormItem  className="flex items-center space-x-3 space-y-0">
                                    <FormControl>
                                        <RadioGroupItem value="2" />
                                    </FormControl>
                                    <FormLabel className="font-normal">10%</FormLabel>
                                </FormItem>
                                <FormItem  className="flex items-center space-x-3 space-y-0">
                                    <FormControl>
                                        <RadioGroupItem value="3" />
                                    </FormControl>
                                    <FormLabel className="font-normal">20%</FormLabel>
                                </FormItem>
                                <FormItem  className="flex items-center space-x-3 space-y-0">
                                    <FormControl>
                                        <RadioGroupItem value="4" />
                                    </FormControl>
                                    <FormLabel className="font-normal">30%</FormLabel>
                                </FormItem>
                                <FormItem  className="flex items-center space-x-3 space-y-0">
                                    <FormControl>
                                        <RadioGroupItem value="5" />
                                    </FormControl>
                                    <FormLabel className="font-normal">&gt;50%</FormLabel>
                                </FormItem>
                            </RadioGroup>
                        </FormControl>
                    </FormItem>
                )}
            />
        </div>
    )
}