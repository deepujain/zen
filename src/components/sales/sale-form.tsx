
"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useData } from "@/hooks/use-api-data"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"
import { CalendarIcon } from "lucide-react"
import { Calendar } from "../ui/calendar"
import { cn } from "@/lib/utils"
import { format, parseISO } from "date-fns"

const formSchema = z.object({
  customerName: z.string().min(2, { message: "Customer name must be at least 2 characters." }),
  mobileNumber: z.string().regex(/^(?:\+91)?\s*\d{10}$/, { message: "Invalid mobile number format. Must be 10 digits, optionally with +91." }),
  amount: z.coerce.number().min(0, { message: "Amount cannot be negative." }),
  paymentMethod: z.enum(["UPI", "Cash", "Card", "Member"]),
  therapyType: z.string().min(1, { message: "Please select a therapy type." }),
  therapist: z.string().min(1, { message: "Please select a therapist." }),
  room: z.string().min(1, { message: "Please select a room." }),
  date: z.date(),
  checkIn: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: "Invalid time format (HH:MM)." }),
  checkOut: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: "Invalid time format (HH:MM)." }),
}).refine(data => {
  if (data.paymentMethod === 'Member' && data.amount > 0) {
    return false; // If paymentMethod is Member, amount must be 0
  }
  if (data.paymentMethod !== 'Member' && data.amount <= 0) {
    return false; // If not Member, amount must be positive
  }
  return true;
}, {
  message: "Amount must be 0 for 'Member' payment, and positive for other payment methods.",
  path: ["amount"], // Path to the field that caused the error
});

type SaleFormProps = {
  setOpen: (open: boolean) => void;
  initialData?: Sale; // Optional initial data for editing
  onSaleSaved: (saleId: string) => void; // Callback to notify parent of saved sale
};

export default function SaleForm({ setOpen, initialData, onSaleSaved }: SaleFormProps) {
  const { toast } = useToast()
  const { staff, therapies, rooms, addSale, updateSale } = useData();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerName: initialData?.customerName || "",
      mobileNumber: initialData?.customerPhone || "+91 98765 43210",
      amount: initialData?.amount || 0,
      paymentMethod: initialData?.paymentMethod || "Cash", // Default to 'Cash'
      therapyType: initialData?.therapyType || "",
      therapist: staff.find(s => s.id === initialData?.therapistId)?.fullName || "",
      room: rooms.find(r => r.id === initialData?.roomId)?.name || "",
      date: initialData?.date ? parseISO(initialData.date) : new Date(),
      checkIn: initialData?.startTime ? format(parseISO(initialData.startTime), 'HH:mm') : '00:00',
      checkOut: initialData?.endTime ? format(parseISO(initialData.endTime), 'HH:mm') : '00:00',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const therapist = staff.find(s => s.fullName === values.therapist);
    const room = rooms.find(r => r.name === values.room);

    if (!therapist || !room) {
      toast({ variant: 'destructive', title: 'Error', description: 'Invalid therapist or room selected.'});
      return;
    }

    const saleData = {
      id: initialData?.id || `sale-${Date.now()}`,
      customerName: values.customerName,
      customerPhone: values.mobileNumber,
      amount: values.amount,
      paymentMethod: values.paymentMethod,
      therapyType: values.therapyType,
      therapistId: therapist.id,
      roomId: room.id,
      date: format(values.date, 'yyyy-MM-dd'),
      startTime: new Date(`${format(values.date, 'yyyy-MM-dd')}T${values.checkIn}:00`).toISOString(),
      endTime: new Date(`${format(values.date, 'yyyy-MM-dd')}T${values.checkOut}:00`).toISOString(),
    };

    if (initialData) {
      updateSale(saleData);
      toast({
        title: "Sale Updated",
        description: `Sale for ${values.customerName} has been successfully updated.`,
      });
    } else {
      addSale(saleData);
      toast({
        title: "Sale Recorded",
        description: `Sale for ${values.customerName} has been successfully recorded.`,
      });
    }
    onSaleSaved(saleData.id); // Call onSaleSaved with the ID of the saved sale
    setOpen(false);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
        <FormField
          control={form.control}
          name="customerName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Customer Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter customer name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="mobileNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mobile Number</FormLabel>
              <FormControl>
                <Input placeholder="+91 98765 43210" {...field} />
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
              <FormLabel>Amount</FormLabel>
              <FormControl>
                <Input type="number" placeholder="0.00" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="paymentMethod"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Payment</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="UPI">UPI</SelectItem>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="Card">Card</SelectItem>
                  <SelectItem value="Member">Member</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="therapyType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Therapy Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select therapy type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {therapies.map(therapy => (
                    <SelectItem key={therapy.id} value={therapy.name}>{therapy.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="therapist"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Therapist</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select therapist" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {staff.filter(s => s.role === 'Therapist').map(s => (
                    <SelectItem key={s.id} value={s.fullName}>{s.fullName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="room"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Room</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select room" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {rooms.map(room => (
                    <SelectItem key={room.id} value={room.name}>{room.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
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
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
            <FormField
            control={form.control}
            name="checkIn"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Check In</FormLabel>
                <FormControl>
                    <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="checkOut"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Check Out</FormLabel>
                <FormControl>
                    <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>

        <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit">Save Sale</Button>
        </div>
      </form>
    </Form>
  )
}
