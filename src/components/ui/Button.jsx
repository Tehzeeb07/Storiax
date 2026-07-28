function Button({ children, type = "button", className = "", ...props }) {
  return (
    <button
      type={type}
      className={`w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-lg transition ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;