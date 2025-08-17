import { useCallback, useState } from "react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import type { OTPStep } from "@/types/auth";
import { getErrorMessage } from "@/types/auth";

interface UseOTPOperationsReturn {
  step: OTPStep;
  phoneNumber: string;
  isLoading: boolean;
  sendOTP: (phoneNumber: string) => Promise<boolean>;
  verifyOTP: (code: string) => Promise<boolean>;
  resendOTP: () => Promise<boolean>;
  goBackToPhoneStep: () => void;
  setPhoneNumber: (phoneNumber: string) => void;
}

export const useOTPOperations = (): UseOTPOperationsReturn => {
  const [step, setStep] = useState<OTPStep>("phone");
  const [phoneNumber, setPhoneNumberState] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const sendOTP = useCallback(async (phone: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      await authClient.phoneNumber.sendOtp({
        phoneNumber: phone,
      });
      setPhoneNumberState(phone);
      setStep("verify");
      toast.success("OTP sent successfully to your phone number");
      return true;
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage || "Failed to send OTP");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const verifyOTP = useCallback(
    async (code: string): Promise<boolean> => {
      if (!phoneNumber) {
        toast.error("Phone number is missing. Please start over.");
        setStep("phone");
        return false;
      }

      setIsLoading(true);
      try {
        await authClient.phoneNumber.verify({
          phoneNumber,
          code,
        });
        toast.success("Login successful");
        return true;
      } catch (error) {
        const errorMessage = getErrorMessage(error);
        toast.error(errorMessage || "Invalid OTP code");
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [phoneNumber],
  );

  const resendOTP = useCallback(async (): Promise<boolean> => {
    if (!phoneNumber) {
      toast.error("Phone number is missing. Please start over.");
      setStep("phone");
      return false;
    }

    setIsLoading(true);
    try {
      await authClient.phoneNumber.sendOtp({ phoneNumber });
      toast.success("OTP resent successfully");
      return true;
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage || "Failed to resend OTP");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [phoneNumber]);

  const goBackToPhoneStep = useCallback(() => {
    setStep("phone");
    setPhoneNumberState("");
  }, []);

  const setPhoneNumber = useCallback((phone: string) => {
    setPhoneNumberState(phone);
  }, []);

  return {
    step,
    phoneNumber,
    isLoading,
    sendOTP,
    verifyOTP,
    resendOTP,
    goBackToPhoneStep,
    setPhoneNumber,
  };
};
