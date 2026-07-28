import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../services/supabase";

export default function StoryChapters() {
  const { id } = useParams();
  const [story, setStory] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const { data: storyData } = await supabase
        .from("posts")
        .select("*, profiles(id, username, full_name, avatar_url)")
        .eq("id", id)
        .single();

      if (storyData) setStory(storyData);

      const { data: chaptersData } = await supabase
        .from("chapters")
        .select("*")
        .eq("post_id", id)
        .order("order_index", { ascending: true });

      if (chaptersData) setChapters(chaptersData);
      setLoading(false);
    }

    fetchData();
  }, [id]);

  if (loading) return <p className="p-10 text-gray-400">Loading...</p>;
  if (!story) return <p className="p-10 text-gray-400">Story not found.</p>;

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      {/* Story Header */}
      <div className="flex items-center gap-4 mb-10 border-b border-[#e8dfd0] pb-8">
        {story.cover_image && (
          <img
            src={story.cover_image}
            alt={story.title}
            className="w-20 h-24 object-contain rounded-lg bg-[#fdf8f3]"
          />
        )}
        <div>
          <p className="text-xs text-[#8b6f47] uppercase tracking-widest mb-1">{story.genre}</p>
          <h1 className="text-2xl font-bold text-[#2c1a0e] mb-1">{story.title}</h1>
          <Link
            to={`/profile/${story.profiles?.id}`}
            className="text-sm text-[#8b6f47] hover:underline"
          >
            by {story.profiles?.username || "Unknown"}
          </Link>
        </div>
      </div>

      {/* Chapters List */}
      <h2 className="text-lg font-bold text-[#2c1a0e] mb-4">
        {chapters.length} {chapters.length === 1 ? "Chapter" : "Chapters"}
      </h2>

      {chapters.length === 0 ? (
        <p className="text-gray-400">No chapters found.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {chapters.map((chapter, index) => (
            <Link
              key={chapter.id}
              to={`/story/${id}/chapter/${chapter.id}`}
              className="flex items-center gap-4 p-4 rounded-xl border border-[#e8dfd0] bg-[#faf7f2] hover:bg-[#f0e6d8] transition group"
            >
              <div className="w-8 h-8 rounded-full bg-[#2c1a0e] text-[#faf7f2] flex items-center justify-center text-sm font-bold shrink-0">
                {index + 1}
              </div>
              <p className="text-sm font-medium text-[#2c1a0e] group-hover:underline">
                {chapter.title}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}