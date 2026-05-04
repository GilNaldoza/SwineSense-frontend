import React from "react"
import SignInForm from "@/features/signIn/signInForm"
import Logo from "@/assets/SwineSense_TextLogo_White.svg"

const SignIn: React.FC = () => {
  return (
    <div className="flex h-screen w-full bg-linear-to-br from-pink-400 via-pink-300 to-pink-200">
      {/* Decorative shapes - left */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 left-32 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
      
      {/* Decorative shapes - right */}
      <div className="absolute top-1/3 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>

      <div className="relative z-10 w-full flex items-center justify-center">
        <div className="w-full max-w-md px-6">
          {/* Logo */}
          <div className="mb-12 text-center">
            <img src={Logo} alt="SwineSense" className="h-16 w-auto mx-auto mb-8" />
            <h1 className="text-4xl font-bold text-white mb-2">Welcome Back!</h1>
            <p className="text-white/80">Sign in to your SwineSense account</p>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-3xl shadow-2xl p-8">
            <SignInForm />
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-white/70 text-sm">
              © 2025 SwineSense. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
export default SignIn