import { createFileRoute, useNavigate } from "@tanstack/react-router";
import OTPLoginForm from "@/components/otp-login-form";
import SignInForm from "@/components/sign-in-form";
import SignUpForm from "@/components/sign-up-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type AuthModeParams = {
  mode?: AuthMode;
};

const allowedModes = ["signin", "signup", "otp"] as const;
type AuthMode = (typeof allowedModes)[number];

function _parseAuthMode(mode: unknown): AuthMode {
  if (typeof mode === "string" && allowedModes.includes(mode as AuthMode)) {
    return mode as AuthMode;
  }
  return "signin";
}

export const Route = createFileRoute("/_auth/login")({
  component: RouteComponent,
  validateSearch: (search): AuthModeParams => {
    return {
      mode: _parseAuthMode(search.mode),
    };
  },
});

function RouteComponent() {
  const { mode, ...rest } = Route.useSearch();
  const parsedMode = _parseAuthMode(mode);
  const navigate = useNavigate();

  function switchMode(mode: AuthMode) {
    navigate({
      to: "/login",
      search: { ...rest, mode },
    });
  }

  return (
    <div className="mx-auto mt-10 w-full max-w-md p-6">
      <h1 className="mb-6 text-center font-bold text-3xl">Welcome</h1>

      <Tabs
        value={parsedMode === "otp" ? "otp" : "email"}
        onValueChange={(value) => switchMode(_parseAuthMode(value))}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="otp">Phone (OTP)</TabsTrigger>
        </TabsList>

        <TabsContent value="email" className="space-y-4">
          {mode === "signin" ? (
            <SignInForm onSwitchToSignUp={() => switchMode("signup")} />
          ) : (
            <SignUpForm onSwitchToSignIn={() => switchMode("signin")} />
          )}
        </TabsContent>

        <TabsContent value="otp">
          <OTPLoginForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}
