import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import { toast } from "sonner";
import z from "zod";
import { authClient } from "@/lib/auth-client";
import Loader from "./loader";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

type OTPStep = "phone" | "verify";

export default function OTPLoginForm() {
  const { isPending } = authClient.useSession();
  const [step, setStep] = useState<OTPStep>("phone");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const phoneForm = useForm({
    defaultValues: {
      phoneNumber: "",
    },
    onSubmit: async ({ value }) => {
      setIsLoading(true);
      try {
        await authClient.phoneNumber.sendOtp({
          phoneNumber: value.phoneNumber,
        });
        setPhoneNumber(value.phoneNumber);
        setStep("verify");
        toast.success("OTP sent successfully to your phone number");
      } catch (error: any) {
        toast.error(error?.message || "Failed to send OTP");
      } finally {
        setIsLoading(false);
      }
    },
    validators: {
      onSubmit: z.object({
        phoneNumber: z
          .string()
          .min(10, "Phone number must be at least 10 digits")
          .regex(/^\+?[1-9]\d{1,14}$/, "Please enter a valid phone number"),
      }),
    },
  });

  const otpForm = useForm({
    defaultValues: {
      code: "",
    },
    onSubmit: async ({ value }) => {
      setIsLoading(true);
      try {
        await authClient.phoneNumber.verify({
          phoneNumber: phoneNumber,
          code: value.code,
        });
        toast.success("Login successful");
      } catch (error: any) {
        toast.error(error?.message || "Invalid OTP code");
      } finally {
        setIsLoading(false);
      }
    },
    validators: {
      onSubmit: z.object({
        code: z
          .string()
          .min(4, "OTP must be at least 4 digits")
          .max(8, "OTP must be at most 8 digits")
          .regex(/^\d+$/, "OTP must contain only numbers"),
      }),
    },
  });

  if (isPending) {
    return <Loader />;
  }

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="mb-4 font-semibold text-lg">
          {step === "phone" ? "Login with Phone" : "Verify OTP"}
        </h2>
      </div>

      {step === "phone" ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            phoneForm.handleSubmit();
          }}
          className="space-y-4"
        >
          <div>
            <phoneForm.Field name="phoneNumber">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>Phone Number</Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="tel"
                    placeholder="+1234567890"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                  {field.state.meta.errors.map((error) => (
                    <p key={error?.message} className="text-red-500 text-sm">
                      {error?.message}
                    </p>
                  ))}
                </div>
              )}
            </phoneForm.Field>
          </div>

          <phoneForm.Subscribe>
            {(state) => (
              <Button
                type="submit"
                className="w-full"
                disabled={!state.canSubmit || state.isSubmitting || isLoading}
              >
                {isLoading ? "Sending OTP..." : "Send OTP"}
              </Button>
            )}
          </phoneForm.Subscribe>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="mb-4 text-center text-gray-600 text-sm">
            We've sent an OTP to <strong>{phoneNumber}</strong>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              otpForm.handleSubmit();
            }}
            className="space-y-4"
          >
            <div>
              <otpForm.Field name="code">
                {(field) => (
                  <div className="space-y-2">
                    <Label htmlFor={field.name}>Enter OTP</Label>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="text"
                      placeholder="123456"
                      maxLength={8}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="text-center text-lg tracking-widest"
                    />
                    {field.state.meta.errors.map((error) => (
                      <p key={error?.message} className="text-red-500 text-sm">
                        {error?.message}
                      </p>
                    ))}
                  </div>
                )}
              </otpForm.Field>
            </div>

            <otpForm.Subscribe>
              {(state) => (
                <Button
                  type="submit"
                  className="w-full"
                  disabled={!state.canSubmit || state.isSubmitting || isLoading}
                >
                  {isLoading ? "Verifying..." : "Verify OTP"}
                </Button>
              )}
            </otpForm.Subscribe>
          </form>

          <div className="flex items-center justify-between">
            <Button
              variant="link"
              onClick={() => setStep("phone")}
              className="text-gray-600 text-sm hover:text-gray-800"
            >
              ← Change Phone Number
            </Button>
            <Button
              variant="link"
              onClick={() => {
                setIsLoading(true);
                authClient.phoneNumber
                  .sendOtp({ phoneNumber })
                  .then(() => {
                    toast.success("OTP resent successfully");
                  })
                  .catch((error: any) => {
                    toast.error(error?.message || "Failed to resend OTP");
                  })
                  .finally(() => {
                    setIsLoading(false);
                  });
              }}
              disabled={isLoading}
              className="text-indigo-600 text-sm hover:text-indigo-800"
            >
              Resend OTP
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
