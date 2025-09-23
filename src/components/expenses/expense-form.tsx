"use client";

import * as React from "react";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon, IndianRupee } from "lucide-react";

const categoryIcons: Record<string, string> = {
  Supplies: '🛒',
  Rent: '🏠',
  Salary: '💰',
  Housekeeping: '🧹',
  Security: '👮',
  Refreshments: '🥤',
  Water: '💧',
  Snacks: '🍪',
  Marketing: '📢',
  'Phone Recharge': '📱',
  Diesel: '⛽',
  Other: '📝',
};

const expenseFormSchema = z.object({
  date: z.date({
    required_error: "A date is required",
  }),
  description: z.string().min(1, "Description is required"),
  amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Amount must be a positive number",
  }),
  category: z.enum(Object.keys(categoryIcons) as [string, ...string[]], {
    required_error: "Please select a category",
  }),
});

type ExpenseFormValues = z.infer<typeof expenseFormSchema>;

interface ExpenseFormProps {
  onSubmit: (values: ExpenseFormValues) => void;
  defaultDate?: Date;
  trigger?: React.ReactNode;
}

export function ExpenseForm({ onSubmit, defaultDate, trigger }: ExpenseFormProps) {
  const [open, setOpen] = React.useState(false);
  
  console.log('Form initialization - Default date:', defaultDate?.toISOString());
  
  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: {
      date: defaultDate || new Date(),
      description: "",
      amount: "",
      category: "Supplies",
    },
  });

  const handleSubmit = (values: ExpenseFormValues) => {
    console.log('Form submission values:', values);
    onSubmit(values);
    form.reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button>Add Expense</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Expense</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel htmlFor="expense-date">Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          id="expense-date"
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                          {...field}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date() || date < new Date("2000-01-01")
                        }
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="expense-description">Description</FormLabel>
                  <FormControl>
                    <Input 
                      id="expense-description"
                      placeholder="Enter expense description" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="expense-amount">Amount (₹)</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <IndianRupee className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="expense-amount"
                        type="number"
                        placeholder="0.00"
                        className="pl-10"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="expense-category">Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger id="expense-category">
                        <SelectValue placeholder="Select a category">
                          {field.value && (
                            <div className="flex items-center gap-2">
                              <span className="text-xl">{categoryIcons[field.value]}</span>
                              <span>{field.value}</span>
                            </div>
                          )}
                        </SelectValue>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(categoryIcons).map(([category, icon]) => (
                        <SelectItem key={category} value={category}>
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{icon}</span>
                            <span>{category}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full">Add Expense</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
