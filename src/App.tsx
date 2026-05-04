import './App.css'
import { Link } from 'react-router-dom'
import Logo from "@/assets/SwineSense_TextLogo_Pink.svg"
import { Button } from './components/ui/button'
import RotatingMessages from '@/components/common/RotatingMessages'

function App() {
  return (
    <div className="flex h-screen w-full bg-linear-to-br from-pink-100 via-pink-50 to-white">
      {/* Decorative shapes */}
      <div className="absolute top-10 left-10 w-64 h-64 bg-pink-200/30 rounded-full blur-3xl"></div>
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-pink-300/20 rounded-full blur-3xl"></div>
      <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-100/40 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>

      <div className="relative z-10 w-full flex items-center justify-center">
        <div className="w-full max-w-2xl px-6">
          {/* Logo Section */}
          <div className="mb-12 text-center">
            <img src={Logo} alt="SwineSense" className="h-20 w-auto mx-auto mb-8" />
          </div>

          {/* Main Content Card */}
          <div className="bg-white rounded-3xl shadow-2xl p-12">
            <div className="text-center mb-8">
              <h1 className="text-5xl font-bold bg-linear-to-r from-pink-500 to-pink-600 bg-clip-text text-transparent mb-2">
                Welcome to SwineSense
              </h1>
              <p className="text-lg text-gray-600">
                Smart swine farm management system
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-2 gap-4 mb-10 py-8 border-y border-gray-200">
              <div className="text-center">
                <div className="text-3xl mb-2">📊</div>
                <p className="text-sm font-medium text-gray-700">Real-time Monitoring</p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">📱</div>
                <p className="text-sm font-medium text-gray-700">Easy Management</p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">📈</div>
                <p className="text-sm font-medium text-gray-700">Analytics</p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">🔒</div>
                <p className="text-sm font-medium text-gray-700">Secure Data</p>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="px-8 py-3 rounded-xl bg-linear-to-r from-pink-500 to-pink-600 text-white font-semibold hover:shadow-lg transition-all" asChild>
                <Link to="/sign-in">Sign In</Link>
              </Button>
              <Button className="px-8 py-3 rounded-xl border-2 border-pink-500 text-pink-600 font-semibold hover:bg-pink-50 transition-all" variant="outline" asChild>
                <Link to="/sign-up">Create Account</Link>
              </Button>
            </div>

            <RotatingMessages className="mt-8" />
          </div>

          {/* Footer */}
          <div className="mt-8 text-center text-gray-600 text-sm">
            <p>© 2025 SwineSense. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
