import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { createAdmin } from "@/api/admins"
import { toast } from "sonner"
import Logo from "@/assets/SwineSense_TextLogo_White.svg"
import { Field, FieldContent, FieldSet, FieldGroup } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const SignUp = () => {
  const navigate = useNavigate()
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  const validate = () => {
    const nextErrors: Record<string, string> = {}
    if (!fullName.trim()) nextErrors.fullName = "Full name is required"
    if (!email.trim()) nextErrors.email = "Email is required"
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) nextErrors.email = "Email is invalid"
    if (!password) nextErrors.password = "Password is required"
    if (!confirmPassword) nextErrors.confirmPassword = "Confirm password is required"
    if (password && confirmPassword && password !== confirmPassword) {
      nextErrors.confirmPassword = "Passwords do not match"
    }
    return nextErrors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const nextErrors = validate()
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return

    try {
      setLoading(true)
      const normalizedEmail = email.trim().toLowerCase()
      await createAdmin({
        username: normalizedEmail,
        email: normalizedEmail,
        fullName: fullName.trim(),
        password,
      })
      toast.success("Admin account created successfully")
      navigate("/sign-in")
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err)
      toast.error("Signup failed: " + message)
    } finally {
      setLoading(false)
    }
  }

  const legendClass =
    "absolute -top-3 left-4 bg-white px-2 text-primary font-semibold text-sm rounded"

  const wrapperClass =
    "relative border border-gray-300 rounded-md px-4 pt-4 pb-2 bg-white"

  return (
    <div className="flex h-screen w-full bg-linear-to-br from-pink-400 via-pink-300 to-pink-200">
      <div className="relative z-10 w-full flex items-center justify-center">
        <div className="w-full max-w-md px-6 py-12">
          <div className="mb-12 text-center">
            <img src={Logo} alt="SwineSense" className="h-16 w-auto mx-auto mb-8" />
            <h1 className="text-4xl font-bold text-white mb-2">Create Admin Account</h1>
            <p className="text-white/80">Enter your details to secure access</p>
          </div>

          <div className="bg-white rounded-3xl shadow-2xl p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <FieldSet>
                <FieldGroup>
                  <Field data-invalid={!!errors.fullName}>
                    <div className="relative">
                      <div className={cn(wrapperClass, errors.fullName && "border-red-500")}>
                        <span className={legendClass}>Full Name</span>
                        <FieldContent>
                          <Input
                            aria-label="Full Name"
                            name="fullName"
                            placeholder="Jane Doe"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="border-0 shadow-none p-2 focus:ring-0 focus-visible:ring-0"
                          />
                        </FieldContent>
                      </div>
                      {errors.fullName && <p className="mt-2 text-sm text-red-600">{errors.fullName}</p>}
                    </div>
                  </Field>

                  <Field data-invalid={!!errors.email}>
                    <div className="relative">
                      <div className={cn(wrapperClass, errors.email && "border-red-500")}>
                        <span className={legendClass}>Email</span>
                        <FieldContent>
                          <Input
                            type="email"
                            aria-label="Email"
                            name="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="border-0 shadow-none p-2 focus:ring-0 focus-visible:ring-0"
                          />
                        </FieldContent>
                      </div>
                      {errors.email && <p className="mt-2 text-sm text-red-600">{errors.email}</p>}
                    </div>
                  </Field>

                  <Field data-invalid={!!errors.password}>
                    <div className="relative">
                      <div className={cn(wrapperClass, errors.password && "border-red-500")}>
                        <span className={legendClass}>Password</span>
                        <FieldContent>
                          <Input
                            type="password"
                            aria-label="Password"
                            name="password"
                            placeholder="Enter password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="border-0 shadow-none p-2 focus:ring-0 focus-visible:ring-0"
                          />
                        </FieldContent>
                      </div>
                      {errors.password && <p className="mt-2 text-sm text-red-600">{errors.password}</p>}
                    </div>
                  </Field>

                  <Field data-invalid={!!errors.confirmPassword}>
                    <div className="relative">
                      <div className={cn(wrapperClass, errors.confirmPassword && "border-red-500")}>
                        <span className={legendClass}>Confirm Password</span>
                        <FieldContent>
                          <Input
                            type="password"
                            aria-label="Confirm Password"
                            name="confirmPassword"
                            placeholder="Confirm password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="border-0 shadow-none p-2 focus:ring-0 focus-visible:ring-0"
                          />
                        </FieldContent>
                      </div>
                      {errors.confirmPassword && <p className="mt-2 text-sm text-red-600">{errors.confirmPassword}</p>}
                    </div>
                  </Field>
                </FieldGroup>
              </FieldSet>

              <Button
                type="submit"
                className="w-full rounded-full h-12 text-white"
                variant="default"
                disabled={loading}
              >
                {loading ? "Creating account..." : "Create Account"}
              </Button>
            </form>
          </div>

          <div className="mt-8 text-center text-white/70 text-sm">
            <p>Already have an admin account? <button type="button" onClick={() => navigate('/sign-in')} className="font-semibold underline">Sign in</button></p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SignUp