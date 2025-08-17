import { useForm } from "@tanstack/react-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { phoneNumberSchema } from "@/features/auth/schemas";
import type { PhoneNumberFormData } from "@/types/auth";

interface PhoneNumberFormProps {
  onSubmit: (phoneNumber: string) => Promise<boolean>;
  isLoading: boolean;
  disabled?: boolean;
}

export const PhoneNumberForm: React.FC<PhoneNumberFormProps> = ({
  onSubmit,
  isLoading,
  disabled = false,
}) => {
  const form = useForm({
    defaultValues: {
      phoneNumber: "",
    } as PhoneNumberFormData,
    onSubmit: async ({ value }) => {
      await onSubmit(value.phoneNumber);
    },
    validators: {
      onSubmit: phoneNumberSchema,
    },
  });

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    form.handleSubmit();
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="mb-4 font-semibold text-lg">Login with Phone</h2>
      </div>

      <form onSubmit={handleFormSubmit} className="space-y-4">
        <div>
          <form.Field name="phoneNumber">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>Phone Number</Label>
                <Input
                  id={field.name}
                  name={field.name}
                  type="tel"
                  required
                  placeholder="+1234567890"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  disabled={disabled || isLoading}
                  aria-describedby={
                    field.state.meta.errors.length > 0
                      ? `${field.name}-error`
                      : undefined
                  }
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
              aria-label={isLoading ? "Sending OTP..." : "Send OTP"}
            >
              {isLoading ? "Sending OTP..." : "Send OTP"}
            </Button>
          )}
        </form.Subscribe>
      </form>
    </div>
  );
};
