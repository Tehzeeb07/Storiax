import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../services/supabase";

import EditorTitle from "../components/editor/EditorTitle";
import EditorSubtitle from "../components/editor/EditorSubtitle";
import EditorGenre from "../components/editor/EditorGenre";
import EditorCoverImage from "../components/editor/EditorCoverImage";
import EditorContent from "../components/editor/EditorContent";
import EditorActions from "../components/editor/EditorActions";

function Editor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(!!id);
  const [postType, setPostType] = useState("story");
  const [hasChapters, setHasChapters] = useState(false);
  const [chapters, setChapters] = useState([{ title: "Chapter 1", content: "" }]);
  const [story, setStory] = useState({
    title: "",
    subtitle: "",
    genre: "Thriller",
    content: "",
    coverImage: null,
  });

  useEffect(() => {
    if (!id) return;

    async function fetchPost() {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("id", id)
        .single();

      if (!error) {
        setPostType(data.post_type || "story");
        setHasChapters(data.has_chapters || false);
        setStory({
          title: data.title,
          subtitle: data.subtitle,
          genre: data.genre,
          content: data.content,
          coverImage: null,
          existingCoverImage: data.cover_image,
        });

        if (data.has_chapters) {
          const { data: chaptersData } = await supabase
            .from("chapters")
            .select("*")
            .eq("post_id", id)
            .order("order_index", { ascending: true });
          if (chaptersData && chaptersData.length > 0) {
            setChapters(chaptersData.map((c) => ({ title: c.title, content: c.content })));
          }
        }
      }
      setLoading(false);
    }

    fetchPost();
  }, [id]);

  function addChapter() {
    setChapters([...chapters, { title: `Chapter ${chapters.length + 1}`, content: "" }]);
  }

  function removeChapter(index) {
    if (chapters.length === 1) return;
    setChapters(chapters.filter((_, i) => i !== index));
  }

  function updateChapter(index, field, value) {
    const updated = [...chapters];
    updated[index][field] = value;
    setChapters(updated);
  }

  if (loading) return <p className="p-10 text-gray-400">Loading...</p>;

  return (
    <div className="max-w-4xl mx-auto py-10 px-6">
      <h1 className="text-4xl font-bold mb-8">
        {id ? "✏️ Edit" : "✍️ Write"}
      </h1>

      {/* Post Type Selector */}
      {!id && (
        <div className="flex gap-3 mb-8">
          <button
            onClick={() => setPostType("story")}
            className={`px-5 py-2 rounded-full text-sm font-medium border transition ${
              postType === "story"
                ? "bg-black text-white border-black"
                : "bg-white text-gray-600 border-gray-300 hover:border-black"
            }`}
          >
            Story
          </button>
          <button
            onClick={() => setPostType("poem")}
            className={`px-5 py-2 rounded-full text-sm font-medium border transition ${
              postType === "poem"
                ? "bg-black text-white border-black"
                : "bg-white text-gray-600 border-gray-300 hover:border-black"
            }`}
          >
            Poem
          </button>
        </div>
      )}

      <EditorTitle
        value={story.title}
        onChange={(e) => setStory({ ...story, title: e.target.value })}
        postType={postType}
      />
      <EditorSubtitle
        value={story.subtitle}
        onChange={(e) => setStory({ ...story, subtitle: e.target.value })}
      />
      <EditorGenre
        value={story.genre}
        onChange={(e) => setStory({ ...story, genre: e.target.value })}
      />
      <EditorCoverImage
        onChange={(e) => setStory({ ...story, coverImage: e.target.files[0] })}
      />

      {/* Story with or without chapters */}
      {postType === "story" && (
        <div className="mb-6">
          <label className="flex items-center gap-2 text-sm text-gray-600 mb-4 cursor-pointer">
            <input
              type="checkbox"
              checked={hasChapters}
              onChange={(e) => setHasChapters(e.target.checked)}
              className="w-4 h-4"
            />
            Divide into chapters
          </label>

          {hasChapters ? (
            <div className="flex flex-col gap-8">
              {chapters.map((chapter, index) => (
                <div key={index} className="border border-gray-200 rounded-xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <input
                      type="text"
                      value={chapter.title}
                      onChange={(e) => updateChapter(index, "title", e.target.value)}
                      className="text-lg font-semibold border-b border-gray-200 focus:outline-none focus:border-black w-full mr-4 pb-1"
                    />
                    {chapters.length > 1 && (
                      <button
                        onClick={() => removeChapter(index)}
                        className="text-red-400 hover:text-red-600 text-sm shrink-0"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <textarea
                    value={chapter.content}
                    onChange={(e) => updateChapter(index, "content", e.target.value)}
                    rows={10}
                    placeholder="Write this chapter..."
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-black transition resize-none"
                  />
                </div>
              ))}
              <button
                onClick={addChapter}
                className="text-sm text-gray-500 hover:text-black border border-dashed border-gray-300 rounded-xl py-3 transition"
              >
                + Add Chapter
              </button>
            </div>
          ) : (
              <EditorContent
                value={story.content}
                onChange={(e) => setStory({ ...story, content: e.target.value })}
                postType={postType}
              />
          )}
        </div>
      )}

      {/* Poem - single content box */}
      {postType === "poem" && (
        <EditorTitle
          value={story.title}
          onChange={(e) => setStory({ ...story, title: e.target.value })}
          postType={postType}
        />
      )}

      <EditorActions
        story={story}
        postId={id}
        postType={postType}
        hasChapters={hasChapters}
        chapters={chapters}
      />
    </div>
  );
}

export default Editor;