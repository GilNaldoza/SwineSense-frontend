import './App.css'
import RotatingMessages from './components/common/RotatingMessages'
import { Link } from 'react-router-dom'
import Welcome from './components/dashboard/welcome'
import Logo from "@/assets/logo.svg"
import { Button } from './components/ui/button'

// RotatingMessages component extracted to `src/components/RotatingMessages.tsx`


function App() {
  return (
      <div className="flex h-screen w-full">
        
        <div className="hidden lg:flex lg:flex-1">
          <Welcome />
        </div>
        <div className="flex w-full lg:w-[45%] items-center justify-center bg-gray-60 px-0">
          <div className="w-full max-w-xl p-6 mx-auto text-center">
            <div className="mb-8">
              <h1 className="text-8xl font-extrabold text-gradient">Hello!</h1>
              <h2 className="text-2xl font-light text-gray-400">Welcome</h2>
            </div>
            
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full items-center justify-center">
                  <Button className="px-5 py-2 rounded-md  text-white min-w-40 mx-auto sm:mx-0" asChild aria-label="Sign in">
                  <Link to="/sign-in">Sign In</Link>
                </Button>
              </div>
                <RotatingMessages className="mt-3" />
              </div>
            </div>
          </div>
          <div className="absolute bottom-10 left-0 right-0 flex justify-center lg:hidden">
            <img
              src={Logo}
              alt="LENS Logo"
              className="w-30 h-auto"
            />
          </div>
        </div>

    )
}
//done
export default App
