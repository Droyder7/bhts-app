import Loader from "@/components/loader";
import { useOTPOperations } from "@/features/auth/hooks/useOTPOperations";
import { authClient } from "@/lib/auth-client";
import { OTPVerificationForm } from "./otp-verification-form";
import { PhoneNumberForm } from "./phone-number-form";

/**
 * OTPLoginForm component handles the complete OTP-based authentication flow.
 * It manages the two-step process: phone number input and OTP verification.
 *
 * Features:
 * - Modular design with separate components for each step
 * - Robust error handling with proper TypeScript types
 * - Accessible UI with proper ARIA labels and error messages
 * - Custom hook for business logic separation
 */
export default function OTPLoginForm() {
  const { isPending } = authClient.useSession();
  const {
    step,
    phoneNumber,
    isLoading,
    sendOTP,
    verifyOTP,
    resendOTP,
    goBackToPhoneStep,
  } = useOTPOperations();

  // Show loading spinner while session is being fetched
  if (isPending) {
    return <Loader />;
  }

  return (
    <div className="space-y-4">
      {step === "phone" ? (
        <PhoneNumberForm
          onSubmit={sendOTP}
          isLoading={isLoading}
          disabled={isPending}
        />
      ) : (
        <OTPVerificationForm
          phoneNumber={phoneNumber}
          onVerify={verifyOTP}
          onResend={resendOTP}
          onGoBack={goBackToPhoneStep}
          isLoading={isLoading}
          disabled={isPending}
        />
      )}
    </div>
  );
}
