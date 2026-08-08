import { z } from "zod"; // ← remove `string` import

export const userDataSchema = z.object({
  name: z
    .string({ error: "Name is required." })
    .min(1, { message: "Name is required." })
    .max(100, { message: "Name must be less than 100 characters." }),
  avatar: z
    .string({ error: "Avatar is required." })
    .min(1, { message: "Avatar is required." }),
  email: z
    .string({ error: "Email is required." })
    .min(1, { message: "Email is required." })
    .email({ message: "Please enter a valid email address." }),
});

export const organizationSchema = z.object({
  name: z
    .string({ error: "Organization name is required." })
    .min(2, { message: "Organization name must be at least 2 characters." })
    .max(100, {
      message: "Organization name must be less than 100 characters.",
    }),
  description: z
    .string()
    .max(500, { message: "Description must be less than 500 characters." })
    .optional()
    .or(z.literal("")),
  phone: z
    .string({ error: "Phone number is required." })
    .min(1, { message: "Phone number is required." })
    .regex(/^\+?[0-9\s-]{7,20}$/, {
      message: "Please enter a valid phone number.",
    }),
  address: z
    .string({ error: "Address is required." })
    .min(1, { message: "Address is required." })
    .max(200, { message: "Address must be less than 200 characters." }),
  p_o_box: z
    .string()
    .max(20, { message: "P.O. Box must be less than 20 characters." })
    .optional()
    .or(z.literal("")),
});

export const invoiceItemSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  quantity: z.coerce.number().min(1),
  unitPrice: z.coerce.number().min(0),
  total: z.coerce.number().min(0),
});

export const invoiceSchema = z.object({
  clientId: z.string().min(1),
  invoiceNumber: z.string().min(1),
  status: z.enum(["pending", "cancled", "draft", "paid", "sent"]), // Match DB spelling
  issueDate: z.string().min(1),
  dueDate: z.string().min(1),
  subtotal: z.coerce.number().min(0),
  tax: z.coerce.number().min(0),
  total: z.coerce.number().min(0),
  notes: z.string().optional(),
  invoiceItems: z.array(invoiceItemSchema).min(1),
});

export type InvoiceItemType = z.infer<typeof invoiceItemSchema>;
export type invoiceType = z.infer<typeof invoiceSchema>;
export type orgType = z.infer<typeof organizationSchema>;
export type userType = z.infer<typeof userDataSchema>;
