import { z } from "zod";

export const expressJoinSchema = z.object({
  fullName: z.string().trim().min(2, "Please enter your full name and surname"),
  email: z.email("Please enter a valid email address"),
  phone: z.string().trim().min(7, "Please enter your contact number"),
  serviceId: z.string().min(1, "Please select a service"),
  consent: z.boolean().refine((value) => value === true, {
    message: "You must consent to the processing of your information",
  }),
});

export type ExpressJoinInput = z.input<typeof expressJoinSchema>;
