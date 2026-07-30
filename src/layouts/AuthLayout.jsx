function AuthLayout({ title, children }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[radial-gradient(circle_at_top,_rgba(106,74,80,0.18),_transparent_34%),linear-gradient(180deg,_#F8F4ED_0%,_#F5F0E8_100%)]">
      <div className="w-full max-w-md rounded-3xl p-8 theme-panel">
        <h1 className="text-3xl font-bold text-center text-[#221A14] mb-6">
          {title}
        </h1>

        {children}
      </div>
    </div>
  );
}

export default AuthLayout;
