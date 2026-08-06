import z from "zod";

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

export const orgSchema = z.object({
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

export type orgType = z.infer<typeof orgSchema>;
export type userType = z.infer<typeof userDataSchema>;
