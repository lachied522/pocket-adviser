"use client";
import Image from "next/image";

import { useFormContext } from "react-hook-form";

import {
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    RadioGroup,
    RadioGroupItem
} from "@/components/ui/radio-group";

import type { FormValues } from "./form-schema";

export default function RiskTolerance() {
    const form = useFormContext<FormValues>();
    return (
        <div className='flex flex-col gap-6 px-2'>
            <div className='flex flex-col items-start gap-2'>
                <h3 className='text-lg font-medium'>Help us understand your relationship with risk*</h3>
                <p className='text-sm'>
                    * Risk of an investment is defined as the probability that it will incur a financial loss. 
                    The higher the risk of an investment, the greater both the potential gain and 
                    potential loss will be.
                </p>
            </div>

            <FormField
                control={form.control}
                name="riskToleranceQ1"
                render={({field}) => (
                    <FormItem>
                        <FormLabel className='text-base'>
                            <span className='mr-2'>1.</span> Which of the following best describes
                            your association with financial risk?
                        </FormLabel>
                        <FormControl>
                            <RadioGroup
                                onValueChange={field.onChange}
                                defaultValue={String(field.value)}
                                className="flex flex-wrap justify-center gap-5 px-5 py-8"
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
                    <FormItem>
                        <FormLabel className='text-base'>
                            <span className='mr-2'>2.</span> What is your willingness to take on financial risk?
                        </FormLabel>
                        <FormControl>
                            <RadioGroup 
                                onValueChange={field.onChange}
                                defaultValue={String(field.value)}
                                className="flex flex-wrap justify-center gap-5 px-5 py-8"
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
                    <FormItem>
                        <FormLabel className='text-base'>
                            <span className='mr-2'>3.</span> What range of returns do you expect to
                            receive from your portfolio?
                        </FormLabel>
                        <FormControl>
                            <RadioGroup 
                                onValueChange={field.onChange}
                                defaultValue={String(field.value)}
                                className="flex flex-wrap justify-center gap-5 px-5 py-8"
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
                    <FormItem>
                        <FormLabel className='text-base'>
                            <span className='mr-2'>4.</span> How much could the <strong>total value</strong> of all your
                            portfolio fall before you begin to feel uncomfortable?
                        </FormLabel>
                        <FormControl>
                            <RadioGroup 
                                onValueChange={field.onChange}
                                defaultValue={String(field.value)}
                                className="flex flex-wrap justify-center gap-5 px-5 py-8"
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