// Authentication related types
export interface AuthError {
  message: string;
  code?: string;
  statusCode?: number;
}

export interface OTPSendResponse {
  success: boolean;
  message?: string;
}

export interface OTPVerifyResponse {
  success: boolean;
  message?: string;
  user?: {
    id: string;
    email: string;
    phoneNumber?: string;
    role: string;
  };
}

export interface PhoneNumberFormData {
  phoneNumber: string;
}

export interface OTPFormData {
  code: string;
}

export type OTPStep = "phone" | "verify";

// Error handling utilities
export const isAuthError = (error: unknown): error is AuthError => {
  return (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as AuthError).message === "string"
  );
};

export const getErrorMessage = (error: unknown): string => {
  if (isAuthError(error)) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  return "An unexpected error occurred";
};
