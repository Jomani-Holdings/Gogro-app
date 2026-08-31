import { z } from "zod";

export const stepOneSchema = z
  .object({
    fullName: z.string().trim().min(2, "Please enter your full name and surname"),
    email: z.email("Please enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
    contactNumber: z
      .string()
      .trim()
      .min(1, "Please enter your contact number"),
    idOrPassport: z
      .string()
      .trim()
      .min(1, "Please enter your ID or passport number"),
    physicalAddress: z
      .string()
      .trim()
      .min(1, "Please enter your physical address"),
    carMakeModelYear: z
      .string()
      .trim()
      .min(1, "Please enter your car make, model and year"),
    carRegistration: z
      .string()
      .trim()
      .min(1, "Please enter your car registration number"),
    consent: z.boolean().refine((value) => value === true, {
      message: "You must consent to the processing of your information",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const ehailingPlatforms = [
  "UBER",
  "BOLT",
  "IN DRIVE",
  "Private trips",
  "Other",
] as const;

export const driverTypes = ["Fleet", "Own Car"] as const;

export const weeklyCreditBands = [
  "R 0 - R 1 000",
  "R 1 001 - R 2 000",
  "R 2 001 - R 3 000",
] as const;

export const stepTwoSchema = z
  .object({
    ehailingPlatform: z.enum(ehailingPlatforms, {
      message: "Please select your eHailing platform",
    }),
    ehailingPlatformOther: z.string().optional(),
    driverType: z.enum(driverTypes, {
      message: "Please select your driver type",
    }),
    garageId: z.string().min(1, "Please select your preferred garage"),
    weeklyCreditBand: z.enum(weeklyCreditBands, {
      message: "Please select your weekly fuel credit",
    }),
  })
  .refine(
    (data) =>
      data.ehailingPlatform !== "Other" ||
      (data.ehailingPlatformOther ?? "").trim().length > 0,
    {
      message: "Please tell us which platform you drive with",
      path: ["ehailingPlatformOther"],
    }
  );

export const heardAboutUsOptions = [
  "Social Media",
  "Fuel Garage",
  "eHailing WhatsApp Groups",
] as const;

export const stepThreeSchema = z.object({
  heardAboutUs: z.enum(heardAboutUsOptions, {
    message: "Please tell us how you heard about us",
  }),
  referenceName: z.string().trim().optional(),
});

export type StepOneInput = z.input<typeof stepOneSchema>;
export type StepTwoInput = z.input<typeof stepTwoSchema>;
export type StepThreeInput = z.input<typeof stepThreeSchema>;
