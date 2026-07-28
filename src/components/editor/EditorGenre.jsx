function EditorGenre({ value, onChange }) {
  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-slate-700 mb-2">
        Genre
      </label>

      <select
        value={value}
        onChange={onChange}
        className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        <option>Romance</option>
        <option>Fantasy</option>
        <option>Horror</option>
        <option>Mystery</option>
        <option>Thriller</option>
        <option>Science Fiction</option>
        <option>Adventure</option>
        <option>Historical Fiction</option>
        <option>Drama</option>
        <option>Poetry</option>
        <option>Fan Fiction</option>
        <option>Short Story</option>
      </select>
    </div>
  );
}

export default EditorGenre;