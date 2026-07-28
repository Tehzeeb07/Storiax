import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../services/supabase";
import { useAuth } from "../contexts/AuthContext";

const BROWN_PLACEHOLDERS = [
  "bg-[#c4a882]", "bg-[#8b6f47]", "bg-[#a08060]", "bg-[#6b4f2e]", "bg-[#d4b896]",
];

export default function Home() {
  const { user } = useAuth();
  const [trending, setTrending] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const { data: allPosts } = await supabase
        .from("posts")
        .select("*, profiles(username, full_name)")
        .eq("status", "published")
        .order("view_count", { ascending: false })
        .limit(20);

      if (allPosts) {
        const withLikes = await Promise.all(
          allPosts.map(async (post) => {
            const { count } = await supabase
              .from("likes")
              .select("*", { count: "exact", head: true })
              .eq("post_id", post.id);
            return { ...post, likeCount: count || 0 };
          })
        );
        setTrending(withLikes.slice(0, 5));
        setFeatured(withLikes.slice(5, 11));
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  return (
    <div>
      {/* Hero */}
      <div className="relative bg-[#1a0f07] text-white overflow-hidden">
        <div className="absolute inset-0 opacity-20"
          style={{backgroundImage: "radial-gradient(circle at 20% 50%, #8b6f47 0%, transparent 50%), radial-gradient(circle at 80% 20%, #c4a882 0%, transparent 40%)"}}
        />
        <div className="relative max-w-5xl mx-auto px-6 py-28 text-center">
          <p className="text-[#c4a882] text-sm uppercase tracking-widest mb-4">Welcome to Storiax</p>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Where Every Story<br />
            <span className="text-[#c4a882]">Finds Its Reader</span>
          </h1>
          <p className="text-gray-300 text-lg mb-10 max-w-xl mx-auto">
            Discover poems, short stories, essays and ideas from writers around the world. Share your voice with the world.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link to="/explore" className="bg-[#c4a882] text-[#1a0f07] px-8 py-3 rounded-full font-medium hover:bg-[#d4b896] transition">
              Start Exploring
            </Link>
            {!user && (
              <Link to="/register" className="border border-[#c4a882] text-[#c4a882] px-8 py-3 rounded-full font-medium hover:bg-[#c4a882] hover:text-[#1a0f07] transition">
                Join for Free
              </Link>
            )}
            {user && (
              <Link to="/editor" className="border border-[#c4a882] text-[#c4a882] px-8 py-3 rounded-full font-medium hover:bg-[#c4a882] hover:text-[#1a0f07] transition">
                Start Writing
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Trending */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-[#2c1a0e]">🔥 Trending</h2>
            <p className="text-sm text-[#8b6f47]">Most read stories right now</p>
          </div>
          <Link to="/explore" className="text-sm text-[#8b6f47] hover:text-[#2c1a0e] transition">View all →</Link>
        </div>

        {loading ? (
          <p className="text-gray-400">Loading...</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {trending.map((story, index) => (
              <Link key={story.id} to={`/story/${story.id}`} className="group rounded-xl overflow-hidden border border-[#e8dfd0] bg-[#faf7f2] hover:shadow-md transition">
                <div className="w-full h-44 bg-[#fdf8f3] overflow-hidden flex items-center justify-center">
                  {story.cover_image ? (
                    <img src={story.cover_image} alt={story.title} className="w-full h-full object-contain group-hover:scale-105 transition duration-300" />
                  ) : (
                    <div className={`w-full h-full ${BROWN_PLACEHOLDERS[index % 5]} flex items-center justify-center`}>
                      <span className="text-white text-3xl opacity-30">✦</span>
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <p className="text-xs text-[#8b6f47] uppercase tracking-widest mb-1">{story.genre}</p>
                  <h3 className="text-sm font-semibold text-[#2c1a0e] line-clamp-2 group-hover:underline mb-1">{story.title}</h3>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-[#8b6f47]">by {story.profiles?.username || "Unknown"}</p>
                    <p className="text-xs text-red-400">❤️ {story.likeCount}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Featured */}
      {featured.length > 0 && (
        <div className="bg-[#faf7f2] py-16">
          <div className="max-w-6xl mx-auto px-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-[#2c1a0e]">✦ Featured Stories</h2>
                <p className="text-sm text-[#8b6f47]">Hand-picked reads for you</p>
              </div>
              <Link to="/explore" className="text-sm text-[#8b6f47] hover:text-[#2c1a0e] transition">Browse all →</Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
              {featured.map((story, index) => (
                <Link key={story.id} to={`/story/${story.id}`} className="group rounded-xl overflow-hidden border border-[#e8dfd0] bg-white hover:shadow-md transition">
                  <div className="w-full h-40 bg-[#fdf8f3] overflow-hidden flex items-center justify-center">
                    {story.cover_image ? (
                      <img src={story.cover_image} alt={story.title} className="w-full h-full object-contain group-hover:scale-105 transition duration-300" />
                    ) : (
                      <div className={`w-full h-full ${BROWN_PLACEHOLDERS[index % 5]} flex items-center justify-center`}>
                        <span className="text-white text-3xl opacity-30">✦</span>
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-xs text-[#8b6f47] uppercase tracking-widest mb-1">{story.genre}</p>
                    <h3 className="text-sm font-semibold text-[#2c1a0e] line-clamp-2 group-hover:underline">{story.title}</h3>
                    <p className="text-xs text-[#8b6f47] mt-1">by {story.profiles?.username || "Unknown"}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CTA */}
      {!user && (
        <div className="bg-[#2c1a0e] text-white py-20 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to share your story?</h2>
          <p className="text-[#c4a882] mb-8">Join thousands of writers and readers on Storiax.</p>
          <Link to="/register" className="bg-[#c4a882] text-[#1a0f07] px-8 py-3 rounded-full font-medium hover:bg-[#d4b896] transition">
            Create Free Account
          </Link>
        </div>
      )}
    </div>
  );
}