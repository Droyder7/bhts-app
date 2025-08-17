import { useForm } from "@tanstack/react-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OTP_LENGTH, otpCodeSchema } from "@/features/auth/schemas";
import type { OTPFormData } from "@/types/auth";

interface OTPVerificationFormProps {
  phoneNumber: string;
  onVerify: (code: string) => Promise<boolean>;
  onResend: () => Promise<boolean>;
  onGoBack: () => void;
  isLoading: boolean;
  disabled?: boolean;
}

export const OTPVerificationForm: React.FC<OTPVerificationFormProps> = ({
  phoneNumber,
  onVerify,
  onResend,
  onGoBack,
  isLoading,
  disabled = false,
}) => {
  const form = useForm({
    defaultValues: {
      code: "",
    } as OTPFormData,
    onSubmit: async ({ value }) => {
      await onVerify(value.code);
    },
    validators: {
      onSubmit: otpCodeSchema,
    },
  });

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    form.handleSubmit();
  };

  const handleResend = async () => {
    await onResend();
  };

  const handleGoBack = () => {
    onGoBack();
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="mb-4 font-semibold text-lg">Verify OTP</h2>
      </div>

      <div className="mb-4 text-center text-gray-600 text-sm">
        We've sent an OTP to <strong>{phoneNumber}</strong>
      </div>

      <form onSubmit={handleFormSubmit} className="space-y-4">
        <div>
          <form.Field name="code">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>Enter OTP</Label>
                <Input
                  id={field.name}
                  name={field.name}
                  type="text"
                  required
                  placeholder="123456"
                  maxLength={OTP_LENGTH}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="text-center text-lg tracking-widest"
                  disabled={disabled || isLoading}
                  aria-describedby={
                    field.state.meta.errors.length > 0
                      ? `${field.name}-error`
                      : undefined
                  }
                  autoComplete="one-time-code"
                />
                {field.state.meta.errors.length > 0 && (
                  <div id={`${field.name}-error`} role="alert">
                    {field.state.meta.errors.map((error) => (
                      <p key={error?.message} className="text-red-500 text-sm">
                        {error?.message}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            )}
          </form.Field>
        </div>

        <form.Subscribe>
          {(state) => (
            <Button
              type="submit"
              className="w-full"
              disabled={
                !state.canSubmit || state.isSubmitting || isLoading || disabled
              }
              aria-label={isLoading ? "Verifying..." : "Verify OTP"}
            >
              {isLoading ? "Verifying..." : "Verify OTP"}
            </Button>
          )}
        </form.Subscribe>
      </form>

      <div className="flex items-center justify-between">
        <Button
          variant="link"
          onClick={handleGoBack}
          className="text-gray-600 text-sm hover:text-gray-800"
          disabled={isLoading || disabled}
          aria-label="Change phone number"
        >
          ← Change Phone Number
        </Button>
        <Button
          variant="link"
          onClick={handleResend}
          disabled={isLoading || disabled}
          className="text-indigo-600 text-sm hover:text-indigo-800"
          aria-label="Resend OTP"
        >
          Resend OTP
        </Button>
      </div>
    </div>
  );
};
