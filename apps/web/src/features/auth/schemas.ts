import { z } from "zod";

export const OTP_LENGTH = 6;

// Validation constants
export const VALIDATION_MESSAGES = {
  PHONE_MIN_LENGTH: "Phone number must be at least 10 digits",
  PHONE_INVALID_FORMAT: "Please enter a valid phone number",
  OTP_INVALID_FORMAT: "OTP must contain only numbers",
  OTP_VALID_LENGTH: `OTP must of ${OTP_LENGTH} digits`,
} as const;

// Phone number validation schema
export const phoneNumberSchema = z.object({
  phoneNumber: z
    .string()
    .min(10, VALIDATION_MESSAGES.PHONE_MIN_LENGTH)
    .regex(/^((\+)?91)?[6789]\d{9}$/, VALIDATION_MESSAGES.PHONE_INVALID_FORMAT),
});

// OTP code validation schema
export const otpCodeSchema = z.object({
  code: z
    .string()
    .regex(/^\d+$/, VALIDATION_MESSAGES.OTP_INVALID_FORMAT)
    .length(OTP_LENGTH, VALIDATION_MESSAGES.OTP_VALID_LENGTH),
});

// Export types for use in components
export type PhoneNumberFormData = z.infer<typeof phoneNumberSchema>;
export type OTPCodeFormData = z.infer<typeof otpCodeSchema>;
