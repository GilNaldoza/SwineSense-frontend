import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "@/api/auth";

import {
  Field,
  FieldContent,
  FieldSet,
  FieldGroup,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

const SignInForm: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
  } | null>(null);

  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError(null);

    const newErrors: { email?: string; password?: string } = {};
    if (!email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      newErrors.email = "Email is invalid";
    if (!password.trim()) newErrors.password = "Password is required";

    setErrors(Object.keys(newErrors).length ? newErrors : null);
    if (Object.keys(newErrors).length) return;

    try {
      setLoading(true);
      const data = await login(email, password);

      const { accessToken, refreshToken, admin } = data || {};
      if (accessToken) localStorage.setItem("accessToken", accessToken);
      if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
      if (admin) localStorage.setItem("user", JSON.stringify(admin));

      navigate("/dashboard");
    } catch (err: unknown) {
      let message = "Login failed";
      if (typeof err === "object" && err !== null && "message" in err) {
        message = (err as Error).message;
      }
      setServerError(message);
    } finally {
      setLoading(false);
    }
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setErrors((prev) => (prev ? { ...prev, email: undefined } : null));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setErrors((prev) => (prev ? { ...prev, password: undefined } : null));
  };

  const legendClass =
    "absolute -top-3 left-4 bg-gray-50 px-2 text-primary font-semibold text-sm rounded";

  const wrapperClass =
    "relative border border-gray-300 rounded-md px-4 pt-4 pb-2";

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-xl mx-auto space-y-6">
      <FieldSet>
        <FieldGroup>
          {/* EMAIL */}
          <Field data-invalid={!!errors?.email}>
            <div className="relative">
              {errors?.email && (
                <div className="absolute -top-2 left-4 z-10 bg-red-500 text-white text-xs px-3 py-1.5 rounded shadow-lg">
                  <div className="absolute -bottom-1 left-4 w-2 h-2 bg-red-500 transform rotate-45"></div>
                  {errors.email}
                </div>
              )}

              <div
                className={cn(wrapperClass, errors?.email && "border-red-500")}
              >
                <span className={legendClass}>Email</span>

                <FieldContent>
                  <Input
                    type="email"
                    aria-label="Email"
                    name="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={handleEmailChange}
                    aria-invalid={!!errors?.email}
                    className="border-0 shadow-none p-2 focus:ring-0 focus-visible:ring-0"
                  />
                </FieldContent>
              </div>
            </div>
          </Field>

          {/* PASSWORD */}
          <Field data-invalid={!!errors?.password}>
            <div className="relative">
              {errors?.password && (
                <div className="absolute -top-2 left-4 z-10 bg-red-500 text-white text-xs px-3 py-1.5 rounded shadow-lg">
                  <div className="absolute -bottom-1 left-4 w-2 h-2 bg-red-500 transform rotate-45"></div>
                  {errors.password}
                </div>
              )}

              <div
                className={cn(
                  wrapperClass,
                  errors?.password && "border-red-500",
                )}
              >
                <span className={legendClass}>Password</span>

                <FieldContent>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="Text Here"
                      value={password}
                      onChange={handlePasswordChange}
                      aria-invalid={!!errors?.password}
                      className="border-0 shadow-none p-2 pr-10 focus:ring-0 focus-visible:ring-0"
                    />

                    {/* Show/Hide Button */}
                    <Button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 hover:bg-transparent focus:bg-transparent active:bg-transparent"
                      variant="ghost"
                      size="icon"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </Button>
                  </div>
                </FieldContent>
              </div>
            </div>
          </Field>

          {/* LOGIN BUTTON */}
          {serverError && (
            <div className="text-center text-sm text-red-600">
              {serverError}
            </div>
          )}

          <Button
            type="submit"
            className="w-full rounded-full h-12 text-white"
            variant="default"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </Button>
        </FieldGroup>
      </FieldSet>
    </form>
  );
};

export default SignInForm;
