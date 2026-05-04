import LogoWhite from "@/assets/SwineSense_TextLogo_White.svg"
import Intersect2 from "@/assets/intersect2.svg"
import Circle from "@/assets/circle.svg"

export default function Welcome() {
  return (
    <div className="relative flex flex-1 items-center justify-center bg-gradient-primary overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0">
        <img
          src={Circle}
          alt=""
          className="absolute left-0 top-0 w-auto h-auto max-w-none"
        />
        <img
          src={Intersect2}
          alt=""
          className="absolute top-60 left-98 -translate-x-1/2 w-auto h-auto max-w-none"
        />
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center text-white px-8 bottom-12">
        <h2 className="text-2xl font-light mb-8 tracking-wide">
          WELCOME TO
        </h2>
        
        {/* Logo */}
        <img
          src={LogoWhite}
          alt="SwineSense"
          className="w-full max-w-xxl h-auto"
        />
      </div>

      {/* Footer */}
      <div className="absolute bottom-6 left-0 right-0 text-center text-white/40 text-sm px-4">
        © 2025 SwineSense | All Rights Reserved
      </div>
    </div>
  )
}
