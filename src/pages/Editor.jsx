import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createDraft, publishStory, updateStory } from "../services/postService";
import { supabase } from "../services/supabase";
import writingImg from '../assets/Writing_a_letter-bro.svg';

const GENRES = ["Thriller", "Romance", "Fantasy", "Poetry", "Horror", "Mystery", "Fiction"];

export default function Editor() {
  const navigate = useNavigate();
  const contentRef = useRef(null);

  const [postType, setPostType] = useState("story");
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [genre, setGenre] = useState(GENRES[0]);
  const [coverImage, setCoverImage] = useState(null);
  const [hasChapters, setHasChapters] = useState(false);
  const [chapterTitle, setChapterTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [ageRating, setAgeRating] = useState("Everyone");
  const [previewMode, setPreviewMode] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState("");
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [saving, setSaving] = useState(false);

  function format(command) {
    document.execCommand(command, false, null);
    contentRef.current?.focus();
  }

  function handleContentInput() {
    const html = contentRef.current.innerHTML;
    const text = contentRef.current.innerText || "";
    setContent(html);
    setWordCount(text.trim() ? text.trim().split(/\s+/).length : 0);
    setCharCount(text.length);
  }

  function handleTagKeyDown(e) {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim().replace(/^#/, "")]);
      }
      setTagInput("");
    }
  }

  function removeTag(tag) {
    setTags(tags.filter((t) => t !== tag));
  }

  const buildStoryPayload = useCallback(
    () => ({
      title,
      subtitle,
      genre,
      content,
      coverImage,
      tags,
      ageRating,
      chapterTitle,
    }),
    [title, subtitle, genre, content, coverImage, tags, ageRating, chapterTitle]
  );

  useEffect(() => {
    const interval = setInterval(async () => {
      if (!title.trim() && !content.trim()) return;
      try {
        await createDraft(buildStoryPayload(), postType, hasChapters);
        setAutoSaveStatus(
          `Draft saved at ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
        );
      } catch {
        setAutoSaveStatus("Auto-save failed - check your connection");
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [buildStoryPayload, postType, hasChapters, title, content]);

  async function handleSaveDraft() {
    setSaving(true);
    try {
      await createDraft(buildStoryPayload(), postType, hasChapters);
      setAutoSaveStatus(
        `Draft saved at ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
      );
    } finally {
      setSaving(false);
    }
  }

  async function handlePublish() {
    setSaving(true);
    try {
      await publishStory(buildStoryPayload(), postType, hasChapters);
      navigate("/dashboard");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="min-h-screen px-6 py-12 relative overflow-hidden"
      style={{
        backgroundImage: "linear-gradient(180deg, rgba(20,14,10,0.55), rgba(20,14,10,0.85)), url('/write.png')",
        backgroundSize: 'cover',
        backgroundAttachment: 'fixed',
        backgroundPosition: 'center',
      }}
    >
      <img
        src={writingImg}
        alt=""
        aria-hidden="true"
        className="pointer-events-none select-none absolute top-[5%] right-[2%] w-[520px] max-w-[45vw] z-0"
      />
      <div className="max-w-4xl mx-auto relative z-10">
        <div className="theme-panel rounded-[2rem] p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-[#D6CABB] mb-3">Editor</p>
              <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#F5F0E8] mb-2">Write</h1>
              {autoSaveStatus && <p className="text-sm text-[#D6CABB]">{autoSaveStatus}</p>}
            </div>
            <button onClick={() => setPreviewMode(!previewMode)} className="btn-outline !text-[#F5F0E8] !border-[#D6CABB]">
              {previewMode ? "Back to Editor" : "Preview"}
            </button>
          </div>

          <div className="flex flex-wrap gap-3 mb-8">
            {["story", "poem"].map((type) => (
              <button
                key={type}
                onClick={() => setPostType(type)}
                className={`px-5 py-2 rounded-full border text-sm font-medium capitalize transition ${
                  postType === type
                    ? "bg-[#4B1F24] border-[#4B1F24] text-white"
                    : "bg-transparent border-[#D6CABB] text-[#F5F0E8] hover:bg-white/10"
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {!previewMode ? (
            <div className="space-y-5">
              <Field label="Title">
                <input className="input-field !bg-[#F5F0E8]/10 !text-[#F5F0E8] !border-[#D6CABB]/30 placeholder:!text-[#D6CABB]" placeholder="Enter your story title..." value={title} onChange={(e) => setTitle(e.target.value)} />
              </Field>
              <Field label="Subtitle">
                <input className="input-field !bg-[#F5F0E8]/10 !text-[#F5F0E8] !border-[#D6CABB]/30 placeholder:!text-[#D6CABB]" placeholder="Add a short description..." value={subtitle} onChange={(e) => setSubtitle(e.target.value)} />
              </Field>
              <Field label="Genre">
                <select className="input-field !bg-[#F5F0E8]/10 !text-[#F5F0E8] !border-[#D6CABB]/30" value={genre} onChange={(e) => setGenre(e.target.value)}>
                  {GENRES.map((g) => <option key={g} value={g}>{g}</option>)}
                </select>
              </Field>
              <Field label="Audience">
                <div className="flex flex-wrap gap-2">
                  {["Everyone", "Mature (18+)"].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => setAgeRating(rating)}
                      className={`px-4 py-2 rounded-full border text-sm transition ${
                        ageRating === rating
                          ? "bg-[#E9E4DA] border-[#E9E4DA] text-[#221A14]"
                          : "bg-transparent border-[#D6CABB] text-[#F5F0E8] hover:bg-white/10"
                      }`}
                    >
                      {rating}
                    </button>
                  ))}
                </div>
              </Field>

              <Field label="Tags & Keywords">
                <div className="flex flex-wrap gap-2 items-center rounded-2xl border border-[#D6CABB]/30 bg-[#F5F0E8]/8 px-3 py-2">
                  {tags.map((tag) => (
                    <span key={tag} className="inline-flex items-center gap-2 rounded-full bg-[#E9E4DA] px-3 py-1 text-xs text-[#4A2E1F]">
                      #{tag}
                      <button type="button" onClick={() => removeTag(tag)} className="font-bold text-[#4B1F24]">×</button>
                    </span>
                  ))}
                  <input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                    placeholder="Type a tag and press Enter"
                    className="flex-1 min-w-[180px] bg-transparent outline-none text-sm text-[#F5F0E8] placeholder:text-[#D6CABB]"
                  />
                </div>
              </Field>

              <Field label="Cover Image">
                <div className="mb-1">
                  <input type="file" accept="image/*" id="cover-upload" className="hidden" onChange={(e) => setCoverImage(e.target.files[0])} />
                  <label htmlFor="cover-upload" className="inline-flex cursor-pointer rounded-full border border-[#D6CABB] px-4 py-2 text-sm text-[#F5F0E8] hover:bg-white/10 transition">
                    {coverImage ? coverImage.name : "Upload Cover Image"}
                  </label>
                </div>
              </Field>

              <label className="flex items-center gap-3 text-sm text-[#F5F0E8]">
                <input type="checkbox" checked={hasChapters} onChange={(e) => setHasChapters(e.target.checked)} />
                Divide into chapters
              </label>

              {hasChapters && (
                <Field label="Chapter Title">
                  <input className="input-field !bg-[#F5F0E8]/10 !text-[#F5F0E8] !border-[#D6CABB]/30 placeholder:!text-[#D6CABB]" placeholder="Enter your chapter title..." value={chapterTitle} onChange={(e) => setChapterTitle(e.target.value)} />
                </Field>
              )}

              <Field label="Content">
                <div className="overflow-hidden rounded-2xl border border-[#D6CABB]/30">
                  <div className="flex flex-wrap gap-2 border-b border-[#D6CABB]/20 bg-[#221A14]/40 p-3">
                    <ToolbarButton onClick={() => format("bold")} label="B" bold />
                    <ToolbarButton onClick={() => format("italic")} label="I" italic />
                    <ToolbarButton onClick={() => format("underline")} label="U" underline />
                    <ToolbarButton onClick={() => format("insertUnorderedList")} label="• List" />
                    <ToolbarButton onClick={() => format("justifyLeft")} label="Left" />
                    <ToolbarButton onClick={() => format("justifyCenter")} label="Center" />
                    <ToolbarButton onClick={() => format("justifyRight")} label="Right" />
                  </div>
                  <div
                    ref={contentRef}
                    contentEditable
                    onInput={handleContentInput}
                    suppressContentEditableWarning
                    className="min-h-[260px] bg-[#221A14]/45 p-4 text-[#F5F0E8] outline-none"
                    data-placeholder="Start writing..."
                  />
                </div>
                <p className="mt-2 text-xs text-[#D6CABB]">
                  {wordCount} words · {charCount} characters
                </p>
              </Field>
            </div>
          ) : (
            <div className="rounded-[1.75rem] border border-[#D6CABB]/25 bg-[#221A14]/45 p-6 mb-8">
              {coverImage && (
                <img
                  src={URL.createObjectURL(coverImage)}
                  alt="cover"
                  className="mb-5 w-full max-h-[320px] rounded-2xl object-cover"
                />
              )}
              <p className="text-xs uppercase tracking-[0.25em] text-[#D6CABB]">
                {genre} · {ageRating}
              </p>
              <h2 className="mt-2 text-3xl font-serif text-[#F5F0E8]">{title || "Untitled Story"}</h2>
              {subtitle && <p className="mt-2 text-[#D6CABB] italic">{subtitle}</p>}
              <div className="mt-4 flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-[#E9E4DA] px-3 py-1 text-xs text-[#4A2E1F]">
                    #{tag}
                  </span>
                ))}
              </div>
              <div className="prose prose-invert max-w-none mt-6" dangerouslySetInnerHTML={{ __html: content || "<p>Nothing written yet...</p>" }} />
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2">
            <button onClick={() => setPreviewMode(!previewMode)} className="btn-outline !text-[#F5F0E8] !border-[#D6CABB] w-full sm:w-auto">
              {previewMode ? "Back to Editor" : "Preview"}
            </button>
            <div className="flex gap-3">
              <button
                onClick={handleSaveDraft}
                disabled={saving}
                className="rounded-full border border-[#D6CABB] px-5 py-3 text-sm font-medium text-[#F5F0E8] hover:bg-white/10 transition disabled:opacity-60"
              >
                Save Draft
              </button>
              <button
                onClick={handlePublish}
                disabled={saving}
                className="rounded-full bg-[#4B1F24] px-5 py-3 text-sm font-medium text-white hover:bg-[#381015] transition shadow-sm disabled:opacity-60"
              >
                Publish
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-[#F5F0E8]">{label}</label>
      {children}
    </div>
  );
}

function ToolbarButton({ onClick, label, bold, italic, underline }) {
  return (
    <button
      onClick={onClick}
      type="button"
      className="rounded-md border border-[#D6CABB]/30 bg-white/5 px-3 py-1.5 text-sm text-[#F5F0E8] hover:bg-white/10 transition"
      style={{
        fontWeight: bold ? 700 : 500,
        fontStyle: italic ? "italic" : "normal",
        textDecoration: underline ? "underline" : "none",
      }}
    >
      {label}
    </button>
  );
}
