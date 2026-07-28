import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../services/supabase";
import { useAuth } from "../contexts/AuthContext";

const BROWN_PLACEHOLDERS = [
  "bg-[#c4a882]",
  "bg-[#8b6f47]",
  "bg-[#a08060]",
  "bg-[#6b4f2e]",
  "bg-[#d4b896]",
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

        // fetch reading progress for all bookmarked posts
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
      <h1 className="text-3xl font-bold text-[#2c1a0e] mb-2">Bookmarks</h1>
      <p className="text-[#8b6f47] mb-8">Stories you've saved for later.</p>

      {loading ? (
        <p className="text-gray-400">Loading...</p>
      ) : stories.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-4xl mb-4">🔖</p>
          <p className="text-[#8b6f47]">No bookmarks yet. Start saving stories you love!</p>
          <Link
            to="/explore"
            className="inline-block mt-4 bg-[#2c1a0e] text-[#faf7f2] px-6 py-2 rounded-full text-sm hover:bg-[#4a2e1a] transition"
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
              className="group rounded-xl overflow-hidden border border-[#e8dfd0] bg-[#faf7f2] hover:shadow-md transition"
            >
              <div className="w-full h-56 bg-[#fdf8f3] overflow-hidden flex items-center justify-center">
                {story.cover_image ? (
                  <img
                    src={story.cover_image}
                    alt={story.title}
                    className="w-full h-full object-contain group-hover:scale-105 transition duration-300"
                  />
                ) : (
                  <div className={`w-full h-full ${BROWN_PLACEHOLDERS[index % BROWN_PLACEHOLDERS.length]} flex items-center justify-center`}>
                    <span className="text-white text-4xl opacity-30">✦</span>
                  </div>
                )}
              </div>
              <div className="p-4">
                <p className="text-xs text-[#8b6f47] uppercase tracking-widest mb-1">{story.genre}</p>
                <h2 className="text-base font-semibold text-[#2c1a0e] mb-1 line-clamp-2 group-hover:underline">
                  {story.title}
                </h2>
                {story.subtitle && (
                  <p className="text-sm text-[#7a6050] line-clamp-2 mb-2">{story.subtitle}</p>
                )}
                <p className="text-xs text-[#8b6f47] mb-2">
                  by {story.profiles?.username || "Unknown"} · {new Date(story.created_at).toLocaleDateString()}
                </p>
                {progress[story.id]?.chapter_id && (
                  <p className="text-xs text-[#2c1a0e] font-medium">
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