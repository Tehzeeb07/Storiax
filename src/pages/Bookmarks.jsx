import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../services/supabase";
import { useAuth } from "../contexts/AuthContext";

const PLACEHOLDERS = [
  "bg-[#4B5A3A]",
  "bg-[#6A4A50]",
  "bg-[#4B1F24]",
  "bg-[#4A2E1F]",
  "bg-[#8B907F]",
];

export default function Bookmarks() {
  const { user } = useAuth();
  const [stories, setStories] = useState([]);
  const [progress, setProgress] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBookmarks() {
      const { data, error } = await supabase
        .from("bookmarks")
        .select("post_id, posts(*, profiles(username, full_name))")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (!error) {
        const posts = data.map((b) => b.posts);
        setStories(posts);

        const { data: progressData } = await supabase
          .from("reading_progress")
          .select("post_id, chapter_id, chapters(title)")
          .eq("user_id", user.id)
          .in("post_id", posts.map((p) => p.id));

        if (progressData) {
          const progressMap = {};
          progressData.forEach((p) => {
            progressMap[p.post_id] = p;
          });
          setProgress(progressMap);
        }
      }
      setLoading(false);
    }

    fetchBookmarks();
  }, [user]);

  function getStoryLink(story) {
    if (story.has_chapters && progress[story.id]?.chapter_id) {
      return `/story/${story.id}/chapter/${progress[story.id].chapter_id}`;
    }
    return `/story/${story.id}`;
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold text-[#221A14] mb-2">Bookmarks</h1>
      <p className="text-[#6A4A50] mb-8">Stories you've saved for later.</p>

      {loading ? (
        <p className="text-[#8B907F]">Loading...</p>
      ) : stories.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-4xl mb-4">🔖</p>
          <p className="text-[#8B907F]">No bookmarks yet. Start saving stories you love!</p>
          <Link
            to="/explore"
            className="inline-block mt-4 bg-[#4B1F24] text-white px-6 py-2 rounded-full text-sm hover:bg-[#381015] transition shadow-sm"
          >
            Explore Stories
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {stories.map((story, index) => (
            <Link
              to={getStoryLink(story)}
              key={story.id}
              className="group rounded-xl overflow-hidden border border-[#D6CABB] bg-[#FBF8F3] hover:shadow-md transition"
            >
              <div className="w-full h-56 bg-[#F5F0E8] overflow-hidden flex items-center justify-center">
                {story.cover_image ? (
                  <img
                    src={story.cover_image}
                    alt={story.title}
                    className="w-full h-full object-contain group-hover:scale-105 transition duration-300"
                  />
                ) : (
                  <div className={`w-full h-full ${PLACEHOLDERS[index % PLACEHOLDERS.length]} flex items-center justify-center`}>
                    <span className="text-white text-4xl opacity-30">✦</span>
                  </div>
                )}
              </div>
              <div className="p-4">
                <p className="text-xs text-[#6A4A50] uppercase tracking-widest mb-1">{story.genre}</p>
                <h2 className="text-base font-semibold text-[#221A14] mb-1 line-clamp-2 group-hover:underline">
                  {story.title}
                </h2>
                {story.subtitle && (
                  <p className="text-sm text-[#4A2E1F] line-clamp-2 mb-2">{story.subtitle}</p>
                )}
                <p className="text-xs text-[#8B907F] mb-2">
                  by {story.profiles?.username || "Unknown"} · {new Date(story.created_at).toLocaleDateString()}
                </p>
                {progress[story.id]?.chapter_id && (
                  <p className="text-xs text-[#4B1F24] font-medium">
                    📖 Continue: {progress[story.id]?.chapters?.title}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
