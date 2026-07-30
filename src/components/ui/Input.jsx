function Input({ label, error, ...props }) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-[#4A2E1F] mb-2">
        {label}
      </label>

      <input
        className={`w-full rounded-lg border px-4 py-3 focus:outline-none focus:ring-2 bg-[#FBF8F3] text-[#221A14] placeholder:text-[#8B907F] ${
          error
            ? "border-[#4B1F24] focus:ring-[#4B1F24]/25"
            : "border-[#D6CABB] focus:ring-[#6A4A50]/25"
        }`}
        {...props}
      />

      {error && (
        <p className="mt-1 text-sm text-[#4B1F24]">
          {error}
        </p>
      )}
    </div>
  );
}

export default Input;
