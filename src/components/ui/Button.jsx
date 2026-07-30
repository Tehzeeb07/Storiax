function Button({ children, type = "button", className = "", ...props }) {
  return (
    <button
      type={type}
      className={`w-full bg-[#4B1F24] hover:bg-[#381015] text-white font-medium py-3 rounded-lg transition shadow-sm ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;
