function EditorTitle({ value, onChange, postType }) {
  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-slate-700 mb-2">
        Title
      </label>
      <input
        type="text"
        placeholder={postType === "poem" ? "Enter your poem title..." : "Enter your story title..."}
        value={value}
        onChange={onChange}
        className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
    </div>
  );
}

export default EditorTitle;