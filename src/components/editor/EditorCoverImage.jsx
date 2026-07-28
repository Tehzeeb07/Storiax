import { useState } from "react";

function EditorCoverImage({ onChange }) {
  const [preview, setPreview] = useState(null);

  function handleChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    onChange(e);
  }

  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Cover Image
      </label>

      {preview && (
        <img
          src={preview}
          alt="Cover preview"
          className="w-full h-48 object-cover rounded-lg mb-3"
        />
      )}

      <label className="cursor-pointer inline-block bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm px-4 py-2 rounded-full transition">
        {preview ? "Change Image" : "Upload Cover Image"}
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleChange}
        />
      </label>
    </div>
  );
}

export default EditorCoverImage;