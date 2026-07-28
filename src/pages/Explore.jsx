import { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../services/supabase";

const CATEGORIES = [
  { name: "Poetry", emoji: "🌸" },
  { name: "Short Stories", emoji: "📖" },
  { name: "Articles", emoji: "📰" },
  { name: "Personal Essays", emoji: "✍️" },
  { name: "Fiction", emoji: "🌙" },
  { name: "Quotes", emoji: "💬" },
];

const BROWN_PLACEHOLDERS = [
  "bg-[#c4a882]", "bg-[#8b6f47]", "bg-[#a08060]", "bg-[#6b4f2e]", "bg-[#d4b896]",
];

export default function Explore() {
  const [stories, setStories] = useState([]);
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [trendingLoading, setTrendingLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState({ stories: [], users: [] });
  const [searching, setSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowResults(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    async function fetchTrending() {
      const { data } = await supabase
        .from("posts")
        .select("*, profiles(username, full_name)")
        .eq("status", "published")
        .order("view_count", { ascending: false })
        .limit(5);

      if (data) {
        const withLikes = await Promise.all(
          data.map(async (post) => {
            const { count } = await supabase
              .from("likes")
              .select("*", { count: "exact", head: true })
              .eq("post_id", post.id);
            return { ...post, likeCount: count || 0 };
          })
        );
        setTrending(withLikes);
      }
      setTrendingLoading(false);
    }
    fetchTrending();
  }, []);

  useEffect(() => {
    async function fetchStories() {
      let query = supabase
        .from("posts")
        .select("*, profiles(username, full_name)")
        .eq("status", "published")
        .order("created_at", { ascending: false });

      if (activeCategory !== "All") {
        query = query.eq("genre", activeCategory);
      }

      const { data, error } = await query;
      if (!error) setStories(data);
      setLoading(false);
    }
    fetchStories();
  }, [activeCategory]);

  useEffect(() => {
    async function handleSearch() {
      if (!search.trim() || search.length < 1) {
        setSearchResults({ stories: [], users: [] });
        setShowResults(false);
        return;
      }

      setSearching(true);
      setShowResults(true);

      const [{ data: storyData }, { data: userData }] = await Promise.all([
        supabase
          .from("posts")
          .select("*, profiles(username)")
          .eq("status", "published")
          .ilike("title", `%${search}%`)
          .limit(4),
        supabase
          .from("profiles")
          .select("id, username, full_name, avatar_url")
          .or(`username.ilike.%${search}%,full_name.ilike.%${search}%`)
          .limit(4),
      ]);

      setSearchResults({
        stories: storyData || [],
        users: userData || [],
      });
      setSearching(false);
    }

    const timer = setTimeout(handleSearch, 200);
    return () => clearTimeout(timer);
  }, [search]);

  return (
    <div>
      {/* Big Browse Hero */}
      <div className="bg-[#2c1a0e] py-16 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-[#faf7f2] mb-2">Browse Stories</h1>
          <p className="text-[#c4a882] mb-8">Search for stories, poems, or writers</p>

          {/* Search Bar */}
          <div className="relative" ref={searchRef}>
            <input
              type="text"
              placeholder="Search stories or writers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-full px-6 py-4 text-sm focus:outline-none text-gray-800"
            />

            {/* Search Results Dropdown */}
            {showResults && (searchResults.stories.length > 0 || searchResults.users.length > 0) && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-[#e8dfd0] rounded-2xl shadow-xl overflow-hidden z-50 text-left">
                {searchResults.users.length > 0 && (
                  <div>
                    <p className="text-xs text-[#8b6f47] uppercase tracking-widest px-4 pt-3 pb-1">Writers</p>
                    {searchResults.users.map((u) => (
                      <Link
                        key={u.id}
                        to={`/profile/${u.id}`}
                        onClick={() => { setShowResults(false); setSearch(""); }}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-[#faf7f2] transition"
                      >
                        <div className="w-8 h-8 rounded-full bg-[#e8dfd0] overflow-hidden flex items-center justify-center text-sm font-bold text-[#8b6f47] shrink-0">
                          {u.avatar_url ? (
                            <img src={u.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                          ) : u.full_name?.charAt(0) || "?"}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[#2c1a0e]">{u.full_name}</p>
                          <p className="text-xs text-[#8b6f47]">@{u.username}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
                {searchResults.stories.length > 0 && (
                  <div className="border-t border-[#e8dfd0]">
                    <p className="text-xs text-[#8b6f47] uppercase tracking-widest px-4 pt-3 pb-1">Stories</p>
                    {searchResults.stories.map((s) => (
                      <Link
                        key={s.id}
                        to={`/story/${s.id}`}
                        onClick={() => { setShowResults(false); setSearch(""); }}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-[#faf7f2] transition"
                      >
                        <div className="w-8 h-8 rounded bg-[#fdf8f3] overflow-hidden shrink-0">
                          {s.cover_image ? (
                            <img src={s.cover_image} alt={s.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-[#c4a882] flex items-center justify-center">
                              <span className="text-white text-xs">✦</span>
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[#2c1a0e]">{s.title}</p>
                          <p className="text-xs text-[#8b6f47]">by @{s.profiles?.username}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}

            {showResults && search && searchResults.stories.length === 0 && searchResults.users.length === 0 && !searching && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-[#e8dfd0] rounded-2xl shadow-xl overflow-hidden z-50 p-4 text-center">
                <p className="text-sm text-gray-400">No results found.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Category Tiles */}
      <div className="bg-[#faf7f2] py-10 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-xl font-bold text-[#2c1a0e] mb-6">Browse by Category</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {CATEGORIES.map((cat, index) => (
              <button
                key={cat.name}
                onClick={() => {
                  setActiveCategory(cat.name);
                  setLoading(true);
                  document.getElementById("stories-section").scrollIntoView({ behavior: "smooth" });
                }}
                className={`rounded-xl p-4 text-center border transition hover:shadow-md ${
                  activeCategory === cat.name
                    ? "bg-[#2c1a0e] text-white border-[#2c1a0e]"
                    : "bg-white border-[#e8dfd0] text-[#2c1a0e] hover:border-[#2c1a0e]"
                }`}
              >
                <div className="text-2xl mb-2">{cat.emoji}</div>
                <p className="text-sm font-medium">{cat.name}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Trending */}
        <div className="mb-12">
          <h2 className="text-xl font-bold text-[#2c1a0e] mb-1">🔥 Trending</h2>
          <p className="text-sm text-[#8b6f47] mb-6">Most loved stories right now</p>
          {trendingLoading ? (
            <p className="text-gray-400 text-sm">Loading...</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {trending.map((story, index) => (
                <Link key={story.id} to={`/story/${story.id}`} className="group rounded-xl overflow-hidden border border-[#e8dfd0] bg-[#faf7f2] hover:shadow-md transition">
                  <div className="w-full h-36 bg-[#fdf8f3] overflow-hidden flex items-center justify-center">
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

        <div className="border-t border-[#e8dfd0] mb-10" />

        {/* All Stories */}
        <div id="stories-section">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-[#2c1a0e]">
              {activeCategory === "All" ? "All Stories" : activeCategory}
            </h2>
            {activeCategory !== "All" && (
              <button
                onClick={() => { setActiveCategory("All"); setLoading(true); }}
                className="text-sm text-[#8b6f47] hover:text-[#2c1a0e] transition"
              >
                Clear filter ✕
              </button>
            )}
          </div>

          {loading ? (
            <p className="text-gray-400">Loading...</p>
          ) : stories.length === 0 ? (
            <p className="text-gray-400">No stories found.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
              {stories.map((story, index) => (
                <Link to={`/story/${story.id}`} key={story.id} className="group rounded-xl overflow-hidden border border-[#e8dfd0] bg-[#faf7f2] hover:shadow-md transition">
                  <div className="w-full h-56 bg-[#fdf8f3] overflow-hidden flex items-center justify-center">
                    {story.cover_image ? (
                      <img src={story.cover_image} alt={story.title} className="w-full h-full object-contain group-hover:scale-105 transition duration-300" />
                    ) : (
                      <div className={`w-full h-full ${BROWN_PLACEHOLDERS[index % 5]} flex items-center justify-center`}>
                        <span className="text-white text-4xl opacity-30">✦</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <p className="text-xs text-[#8b6f47] uppercase tracking-widest mb-1">{story.genre}</p>
                    <h2 className="text-base font-semibold text-[#2c1a0e] mb-1 line-clamp-2 group-hover:underline">{story.title}</h2>
                    {story.subtitle && <p className="text-sm text-[#7a6050] line-clamp-2 mb-3">{story.subtitle}</p>}
                    <p className="text-xs text-[#8b6f47]">by {story.profiles?.username || "Unknown"}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}