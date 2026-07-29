import { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../services/supabase";
import {
  Search, Flame, BookOpen, Heart, Compass, Sparkles, User, ArrowRight,
  Bookmark, Trophy, Clock, Tag
} from "lucide-react";

const CATEGORIES = [
  { name: "Poetry", emoji: "🌸" },
  { name: "Short Stories", emoji: "📖" },
  { name: "Articles", emoji: "📰" },
  { name: "Personal Essays", emoji: "✍️" },
  { name: "Fiction", emoji: "🌙" },
  { name: "Quotes", emoji: "💬" },
];

const POPULAR_TAGS = [
  "heartbreak", "magic", "melancholy", "college-romance", "found-family",
  "slow-burn", "revenge", "coming-of-age", "mystery"
];

const BROWN_PLACEHOLDERS = [
  "from-[#F5B98C] to-[#C94A26]",
  "from-[#C94A26] to-[#5a4428]",
  "from-[#F0A868] to-[#D9713A]",
  "from-[#D9713A] to-[#A8481E]",
  "from-[#FBE7D6] to-[#F5B98C]"
];

export default function Explore() {
  const [stories, setStories] = useState([]);
  const [trending, setTrending] = useState([]);
  const [topWriters, setTopWriters] = useState([]);
  const [continueReading, setContinueReading] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [bookmarkedIds, setBookmarkedIds] = useState(new Set());
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [trendingLoading, setTrendingLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [completionFilter, setCompletionFilter] = useState("All");
  const [activeTag, setActiveTag] = useState(null);
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
    async function fetchUserAndBookmarks() {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
      if (user) {
        const { data } = await supabase
          .from("bookmarks")
          .select("post_id")
          .eq("user_id", user.id);
        if (data) setBookmarkedIds(new Set(data.map((b) => b.post_id)));

        const { data: progress } = await supabase
          .from("reading_progress")
          .select("scroll_percent, updated_at, posts(id, title, cover_image, genre)")
          .eq("user_id", user.id)
          .lt("scroll_percent", 95)
          .order("updated_at", { ascending: false })
          .limit(6);
        if (progress) setContinueReading(progress);
      }
    }
    fetchUserAndBookmarks();
  }, []);

  useEffect(() => {
    async function fetchTopWriters() {
      const { data } = await supabase
        .from("posts")
        .select("author_id, profiles(username, full_name, avatar_url)")
        .eq("status", "published");

      if (data) {
        const counts = {};
        data.forEach((p) => {
          if (!p.author_id) return;
          if (!counts[p.author_id]) counts[p.author_id] = { count: 0, profile: p.profiles };
          counts[p.author_id].count += 1;
        });
        const ranked = Object.values(counts).sort((a, b) => b.count - a.count).slice(0, 5);
        setTopWriters(ranked);
      }
    }
    fetchTopWriters();
  }, []);

  useEffect(() => {
    async function fetchTrending() {
      const { data } = await supabase
        .from("posts")
        .select("*, profiles(username, full_name, avatar_url)")
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
      setLoading(true);
      let query = supabase
        .from("posts")
        .select("*, profiles(username, full_name, avatar_url)")
        .eq("status", "published")
        .order("created_at", { ascending: false });

      if (activeCategory !== "All") query = query.eq("genre", activeCategory);
      if (completionFilter !== "All") query = query.eq("is_completed", completionFilter === "Completed");
      if (activeTag) query = query.contains("tags", [activeTag]);

      const { data, error } = await query;
      if (!error) setStories(data || []);
      setLoading(false);
    }
    fetchStories();
  }, [activeCategory, completionFilter, activeTag]);

  useEffect(() => {
    async function fetchRecommended() {
      if (!currentUser || bookmarkedIds.size === 0) {
        setRecommended([]);
        return;
      }
      const { data: bookmarkedPosts } = await supabase
        .from("posts")
        .select("genre")
        .in("id", Array.from(bookmarkedIds));

      const favoriteGenres = [...new Set((bookmarkedPosts || []).map((p) => p.genre))];
      if (favoriteGenres.length === 0) return;

      const { data } = await supabase
        .from("posts")
        .select("*, profiles(username, full_name)")
        .eq("status", "published")
        .in("genre", favoriteGenres)
        .not("id", "in", `(${Array.from(bookmarkedIds).join(",") || "00000000-0000-0000-0000-000000000000"})`)
        .limit(6);

      if (data) setRecommended(data);
    }
    fetchRecommended();
  }, [currentUser, bookmarkedIds]);

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

      setSearchResults({ stories: storyData || [], users: userData || [] });
      setSearching(false);
    }
    const timer = setTimeout(handleSearch, 200);
    return () => clearTimeout(timer);
  }, [search]);

  async function toggleBookmark(e, postId) {
    e.preventDefault();
    e.stopPropagation();
    if (!currentUser) {
      navigate("/login");
      return;
    }
    const isBookmarked = bookmarkedIds.has(postId);
    const next = new Set(bookmarkedIds);

    if (isBookmarked) {
      next.delete(postId);
      setBookmarkedIds(next);
      await supabase.from("bookmarks").delete().eq("post_id", postId).eq("user_id", currentUser.id);
    } else {
      next.add(postId);
      setBookmarkedIds(next);
      await supabase.from("bookmarks").insert({ post_id: postId, user_id: currentUser.id });
    }
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#2C221E] pb-20">
      <div className="relative bg-gradient-to-br from-[#E85C33] via-[#C94A26] to-[#7A3010] py-16 px-6 text-white overflow-hidden shadow-lg">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#F5B98C_1px,transparent_1px)] [background-size:16px_16px]"></div>

        <div className="max-w-3xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-[#F0DFCB] text-xs font-medium mb-4 border border-white/10">
            <Sparkles className="w-3.5 h-3.5 text-[#F5B98C]" /> Discover Community Masterpieces
          </div>
          <h1 className="text-3xl md:text-5xl font-serif font-bold tracking-wide mb-3 text-[#FBE7D6]">
            Explore Endless Stories
          </h1>
          <p className="text-[#F5B98C] text-sm md:text-base mb-8 max-w-lg mx-auto">
            Search through captivating books, poems, short stories, and brilliant writers.
          </p>

          <div className="relative max-w-xl mx-auto" ref={searchRef}>
            <div className="relative flex items-center">
              <Search className="absolute left-5 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search stories, books, or writers..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-full pl-12 pr-6 py-4 text-sm bg-white/95 backdrop-blur-md text-gray-800 placeholder-gray-400 shadow-2xl focus:outline-none focus:ring-2 focus:ring-[#F5B98C] transition-all"
              />
            </div>

            {showResults && (searchResults.stories.length > 0 || searchResults.users.length > 0) && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-[#F0DFCB] rounded-2xl shadow-2xl overflow-hidden z-50 text-left">
                {searchResults.users.length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-[#C94A26] uppercase tracking-widest px-4 pt-3 pb-1 bg-[#FBE7D6]/50">Writers</p>
                    {searchResults.users.map((u) => (
                      <Link
                        key={u.id}
                        to={`/profile/${u.id}`}
                        onClick={() => { setShowResults(false); setSearch(""); }}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-[#FBE7D6] transition border-b border-gray-100 last:border-none"
                      >
                        <div className="w-9 h-9 rounded-full bg-[#F0DFCB] overflow-hidden flex items-center justify-center text-sm font-bold text-[#C94A26] shrink-0 shadow-inner">
                          {u.avatar_url ? (
                            <img src={u.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                          ) : (
                            u.full_name?.charAt(0) || <User className="w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[#E85C33]">{u.full_name || u.username}</p>
                          <p className="text-xs text-[#C94A26]">@{u.username}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
                {searchResults.stories.length > 0 && (
                  <div className={searchResults.users.length > 0 ? "border-t border-[#F0DFCB]" : ""}>
                    <p className="text-xs font-bold text-[#C94A26] uppercase tracking-widest px-4 pt-3 pb-1 bg-[#FBE7D6]/50">Stories</p>
                    {searchResults.stories.map((s) => (
                      <Link
                        key={s.id}
                        to={`/story/${s.id}`}
                        onClick={() => { setShowResults(false); setSearch(""); }}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-[#FBE7D6] transition border-b border-gray-100 last:border-none"
                      >
                        <div className="w-10 h-12 rounded-lg bg-[#FFFDF9] overflow-hidden shrink-0 shadow-sm border border-gray-200">
                          {s.cover_image ? (
                            <img src={s.cover_image} alt={s.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-[#F5B98C] to-[#C94A26] flex items-center justify-center">
                              <span className="text-white text-xs">✦</span>
                            </div>
                          )}
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-sm font-semibold text-[#E85C33] truncate">{s.title}</p>
                          <p className="text-xs text-[#C94A26]">by @{s.profiles?.username || "unknown"}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-[#FBE7D6] border-b border-[#F0DFCB] py-6 px-6 sticky top-0 z-30 backdrop-blur-md bg-opacity-90 space-y-3">
        <div className="max-w-6xl mx-auto flex items-center gap-3 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setActiveCategory("All")}
            className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all whitespace-nowrap shadow-sm flex items-center gap-2 ${
              activeCategory === "All"
                ? "bg-[#E85C33] text-white shadow-md scale-105"
                : "bg-white text-[#7A7488] border border-[#F0DFCB] hover:bg-[#FBE7D6]"
            }`}
          >
            <Compass className="w-4 h-4" /> All Stories
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.name}
              onClick={() => {
                setActiveCategory(cat.name);
                document.getElementById("stories-section")?.scrollIntoView({ behavior: "smooth" });
              }}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all whitespace-nowrap shadow-sm flex items-center gap-2 ${
                activeCategory === cat.name
                  ? "bg-[#E85C33] text-white shadow-md scale-105"
                  : "bg-white text-[#7A7488] border border-[#F0DFCB] hover:bg-[#FBE7D6]"
              }`}
            >
              <span>{cat.emoji}</span> {cat.name}
            </button>
          ))}
        </div>

        <div className="max-w-6xl mx-auto flex items-center gap-2">
          {["All", "Ongoing", "Completed"].map((status) => (
            <button
              key={status}
              onClick={() => setCompletionFilter(status)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                completionFilter === status
                  ? "bg-orange-600 text-white"
                  : "bg-white text-[#C94A26] border border-[#F0DFCB] hover:bg-[#FBE7D6]"
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        <div className="max-w-6xl mx-auto flex items-center gap-2 flex-wrap pt-1">
          <Tag className="w-3.5 h-3.5 text-[#C94A26]" />
          {POPULAR_TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveTag(activeTag === tag ? null : tag)}
              className={`px-3 py-1 rounded-full text-xs transition-all ${
                activeTag === tag ? "bg-[#E85C33] text-white" : "bg-[#FBE7D6] text-[#C94A26] hover:bg-[#F0DFCB]"
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10 space-y-14">

        {currentUser && continueReading.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-600" />
              <h2 className="text-xl font-serif font-bold text-[#E85C33]">Continue Reading</h2>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {continueReading.map((item) => (
                <Link key={item.posts.id} to={`/story/${item.posts.id}`} className="w-40 shrink-0 group">
                  <div className="relative w-full h-52 rounded-2xl overflow-hidden bg-[#FFFDF9] shadow-sm">
                    <img
                      src={item.posts.cover_image || "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=300"}
                      alt={item.posts.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition"
                    />
                    <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/20">
                      <div className="h-full bg-orange-500" style={{ width: `${item.scroll_percent}%` }} />
                    </div>
                  </div>
                  <p className="text-xs font-semibold text-[#E85C33] mt-2 truncate">{item.posts.title}</p>
                  <p className="text-[10px] text-[#C94A26]">{item.scroll_percent}% read</p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {topWriters.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-orange-500" />
              <h2 className="text-xl font-serif font-bold text-[#E85C33]">Top Writers This Week</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {topWriters.map((w, i) => (
                <div key={i} className="bg-white rounded-2xl border border-[#F0DFCB] p-4 text-center shadow-sm relative">
                  <span className="absolute top-2 left-2 text-[10px] font-bold text-orange-600 bg-orange-100 rounded-full w-5 h-5 flex items-center justify-center">
                    {i + 1}
                  </span>
                  <div className="w-14 h-14 mx-auto rounded-full bg-[#F0DFCB] overflow-hidden flex items-center justify-center text-lg font-bold text-[#C94A26] mb-2">
                    {w.profile?.avatar_url ? (
                      <img src={w.profile.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      w.profile?.full_name?.charAt(0) || "?"
                    )}
                  </div>
                  <p className="text-xs font-semibold text-[#E85C33] truncate">{w.profile?.full_name || w.profile?.username}</p>
                  <p className="text-[10px] text-[#C94A26]">{w.count} stories</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {recommended.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-orange-500" />
              <h2 className="text-xl font-serif font-bold text-[#E85C33]">Just For You</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {recommended.map((story) => (
                <StoryCircleCard key={story.id} story={story} bookmarkedIds={bookmarkedIds} toggleBookmark={toggleBookmark} />
              ))}
            </div>
          </div>
        )}

        {activeCategory === "All" && !search && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-[#F0DFCB] pb-3">
              <div className="p-2 rounded-lg bg-orange-100 text-orange-600">
                <Flame className="w-5 h-5 fill-amber-500 text-orange-500" />
              </div>
              <div>
                <h2 className="text-xl font-serif font-bold text-[#E85C33]">Trending Right Now</h2>
                <p className="text-xs text-[#C94A26]">Most loved and read stories by the community</p>
              </div>
            </div>

            {trendingLoading ? (
              <div className="flex gap-4 overflow-hidden">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="w-40 h-52 bg-gray-200 animate-pulse rounded-full shrink-0"></div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
                {trending.map((story, index) => (
                  <StoryCircleCard key={story.id} story={story} index={index} bookmarkedIds={bookmarkedIds} toggleBookmark={toggleBookmark} showLikes />
                ))}
              </div>
            )}
          </div>
        )}

        <div id="stories-section" className="space-y-6 pt-4">
          <div className="flex items-center justify-between border-b border-[#F0DFCB] pb-3">
            <div>
              <h2 className="text-xl font-serif font-bold text-[#E85C33]">
                {activeCategory === "All" ? "All Stories" : `${activeCategory} Stories`}
              </h2>
              <p className="text-xs text-[#C94A26]">Explore creations filtered by genre</p>
            </div>
            {(activeCategory !== "All" || completionFilter !== "All" || activeTag) && (
              <button
                onClick={() => { setActiveCategory("All"); setCompletionFilter("All"); setActiveTag(null); }}
                className="text-xs font-medium text-[#C94A26] bg-white border border-[#F0DFCB] px-3.5 py-1.5 rounded-full hover:bg-[#FBE7D6] transition shadow-sm"
              >
                Clear filters ✕
              </button>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-56 bg-gray-100 animate-pulse rounded-full"></div>
              ))}
            </div>
          ) : stories.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-[#F0DFCB] space-y-3">
              <div className="text-3xl">📭</div>
              <p className="text-sm font-medium text-gray-600">No stories found with these filters yet.</p>
              <button
                onClick={() => { setActiveCategory("All"); setCompletionFilter("All"); setActiveTag(null); }}
                className="text-xs text-[#C94A26] underline hover:text-[#E85C33] font-semibold"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-8">
              {stories.map((story, index) => (
                <StoryCircleCard key={story.id} story={story} index={index} bookmarkedIds={bookmarkedIds} toggleBookmark={toggleBookmark} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StoryCircleCard({ story, index = 0, bookmarkedIds, toggleBookmark, showLikes }) {
  const isBookmarked = bookmarkedIds.has(story.id);

  return (
    <Link to={`/story/${story.id}`} className="group flex flex-col items-center text-center">
      <div className="relative w-32 h-32 sm:w-36 sm:h-36 rounded-full overflow-hidden bg-[#FFFDF9] shadow-md border-4 border-white ring-1 ring-[#F0DFCB] mb-3">
        {story.cover_image ? (
          <img
            src={story.cover_image}
            alt={story.title}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${BROWN_PLACEHOLDERS[index % 5]} flex items-center justify-center`}>
            <span className="text-white text-2xl opacity-40">✦</span>
          </div>
        )}

        <button
          onClick={(e) => toggleBookmark(e, story.id)}
          className={`absolute top-1.5 right-1.5 w-7 h-7 rounded-full flex items-center justify-center shadow-md transition ${
            isBookmarked ? "bg-orange-500 text-white" : "bg-white/90 text-[#C94A26] hover:bg-white"
          }`}
          title={isBookmarked ? "Remove from reading list" : "Save for later"}
        >
          <Bookmark className="w-3.5 h-3.5" fill={isBookmarked ? "currentColor" : "none"} />
        </button>
      </div>

      <h3 className="text-sm font-serif font-bold text-[#E85C33] line-clamp-1 group-hover:text-orange-700 transition max-w-[140px]">
        {story.title}
      </h3>
      <p className="text-[11px] text-[#C94A26] truncate max-w-[140px]">
        by @{story.profiles?.username || "unknown"}
      </p>

      {showLikes && (
        <div className="flex items-center gap-3 text-[11px] text-gray-500 mt-1">
          <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" /> {story.view_count || 0}</span>
          <span className="flex items-center gap-1 text-rose-600 font-medium">
            <Heart className="w-3 h-3 fill-rose-600" /> {story.likeCount || 0}
          </span>
        </div>
      )}

      <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-white bg-orange-600 px-4 py-1.5 rounded-full group-hover:bg-orange-700 transition">
        Read Now <ArrowRight className="w-3 h-3" />
      </span>
    </Link>
  );
}
