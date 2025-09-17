
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
import type { Staff } from "@/lib/types"
import { useData } from "@/hooks/use-api-data"

const formSchema = z.object({
  fullName: z.string().min(2, { message: "Full name must be at least 2 characters." }),
  role: z.enum(["Manager", "Therapist", "Receptionist"], { required_error: "Please select a role." }),
  phoneNumber: z.string().regex(/^\d{10}$/, { message: "Phone number must be 10 digits." }),
  experienceYears: z.coerce.number().min(0, { message: "Experience cannot be negative." }),
  gender: z.enum(["Male", "Female"], { required_error: "Please select a gender." }),
})

type EditStaffFormProps = {
  staffMember: Staff;
  setOpen: (open: boolean) => void;
};


export default function EditStaffForm({ staffMember, setOpen }: EditStaffFormProps) {
  const { toast } = useToast()
  const { updateStaff } = useData();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: staffMember.fullName,
      role: staffMember.role,
      phoneNumber: staffMember.phoneNumber.replace('+91', '').replace(/\s/g, ''),
      experienceYears: staffMember.experienceYears,
      gender: staffMember.gender,
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    const updatedStaffMember: Staff = {
      ...staffMember,
      ...values,
      phoneNumber: `+91 ${values.phoneNumber.substring(0,5)} ${values.phoneNumber.substring(5)}`,
    };
    updateStaff(updatedStaffMember);

    toast({
      title: "Staff Member Updated",
      description: `${values.fullName}'s details have been successfully updated.`,
    })
    setOpen(false)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter full name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Therapist">Therapist</SelectItem>
                  <SelectItem value="Manager">Manager</SelectItem>
                  <SelectItem value="Receptionist">Receptionist</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phoneNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 border border-input bg-background rounded-md px-3 h-10">
                        <span>🇮🇳</span>
                        <span>+91</span>
                    </div>
                    <Input placeholder="9876543210" {...field} />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="experienceYears"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Experience (years)</FormLabel>
              <FormControl>
                <Input type="number" placeholder="e.g., 5" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="gender"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Gender</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Male">Male</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit">Save Changes</Button>
        </div>
      </form>
    </Form>
  )
}
