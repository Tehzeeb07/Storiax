function EditorSubtitle({ value, onChange }) {
  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-slate-700 mb-2">
        Subtitle
      </label>

      <input
        type="text"
        placeholder="Add a short description..."
        value={value}
        onChange={onChange}
        className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
    </div>
  );
}

export default EditorSubtitle;