import resetImg from '../assets/Login-bro.svg'


function AuthLayout({ title, children }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-8 bg-[#221A14]">
      <div className="relative w-full max-w-6xl h-[640px] rounded-[2.5rem] overflow-hidden shadow-2xl flex">
        
        {/* Dark base layer (right side content sits on this) */}
        <div className="absolute inset-0 bg-[#221A14]" />

        {/* Wavy cream shape (left side) */}
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 1000 640"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d="M0,0 H480 C400,120 520,260 460,320 C400,380 520,480 450,560 C400,615 440,640 400,640 H0 Z"
            fill="#F5F0E8"
          />
        </svg>

        {/* Left content — illustration */}
        <div className="relative z-10 hidden md:flex md:w-1/2 items-center justify-center p-12">
          <img
            src={resetImg}
            alt=""
            aria-hidden="true"
            className="w-full max-w-sm select-none pointer-events-none"
          />
        </div>

        {/* Right content — form */}
        <div className="relative z-10 flex-1 flex items-center justify-center p-8 md:pl-24">
          <div className="w-full max-w-sm">
            <h1 className="text-3xl md:text-4xl font-bold text-[#F5F0E8] mb-8">
              {title}
            </h1>

            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;