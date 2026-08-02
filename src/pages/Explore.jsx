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
  "from-[#8B907F] to-[#4B1F24]",
  "from-[#4B1F24] to-[#5a4428]",
  "from-[#F0A868] to-[#D9713A]",
  "from-[#D9713A] to-[#A8481E]",
  "from-[#E9E4DA] to-[#8B907F"
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
      const { data: posts } = await supabase
        .from("posts")
        .select("id, author_id, profiles(username, full_name, avatar_url)")
        .eq("status", "published");

      if (!posts) return;

      const likeCounts = await Promise.all(
        posts.map(async (p) => {
          const { count } = await supabase
            .from("likes")
            .select("*", { count: "exact", head: true })
            .eq("post_id", p.id);
          return { author_id: p.author_id, profile: p.profiles, likes: count || 0 };
        })
      );

      const authorTotals = {};
      likeCounts.forEach((p) => {
        if (!p.author_id) return;
        if (!authorTotals[p.author_id]) {
          authorTotals[p.author_id] = { count: 0, profile: p.profile, authorId: p.author_id };
        }
        authorTotals[p.author_id].count += p.likes;
      });

      const ranked = Object.values(authorTotals)
        .sort((a, b) => b.count - a.count)
        .slice(0, 3);

      setTopWriters(ranked);
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
    <div
      className="min-h-screen text-[#F5F0E8] pb-20"
      style={{
        backgroundImage: "linear-gradient(180deg, rgba(20,14,10,0.55), rgba(20,14,10,0.85)), url('/lib.png')",
        backgroundSize: 'cover',
        backgroundAttachment: 'fixed',
        backgroundPosition: 'center 30%',
      }}
    >
      
          <div className="relative z-20 py-24 px-6 text-white">

        <div className="max-w-2xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-[#DCD5C8] text-xs font-medium mb-4 border border-white/10">
            <Sparkles className="w-3.5 h-3.5 text-[#8B907F]" /> Discover Community Masterpieces
          </div>
          <h1 className="text-3xl md:text-5xl font-serif font-bold tracking-wide mb-3 text-[#E9E4DA]">
            Explore Endless Stories
          </h1>
          <p className="text-[#8B907F] text-sm md:text-base mb-1 max-w-lg mx-auto">
            Search through captivating books, poems, short stories, and brilliant writers.
          </p>

          <div className="relative max-w-2xl mx-auto z-[100]" ref={searchRef}>

            {/* Background Glow */}
            <div className="absolute inset-0 bg-[#6A4A50]/20 blur-3xl rounded-full scale-110"></div>

            {/* Search Icon */}
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6A4A50] z-20" />

            {/* Search Input */}
            <input
              type="text"
              placeholder="Search stories, books, writers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="
      relative
      z-10
      w-full
      h-16
      rounded-3xl
      bg-white/75
      backdrop-blur-2xl
      border
      border-white/40
      shadow-[0_25px_80px_rgba(34,26,20,0.18)]
      pl-16
      pr-6
      text-[16px]
      font-medium
      text-[#221A14]
      placeholder:text-[#8B907F]
      transition-all
      duration-300
      hover:bg-white/90
      hover:shadow-[0_30px_90px_rgba(34,26,20,0.22)]
      focus:outline-none
      focus:ring-4
      focus:ring-[#6A4A50]/15
      focus:border-[#6A4A50]
      focus:bg-white
    "
            />

            {/* Search Results */}
            {showResults &&
              (searchResults.stories.length > 0 ||
                searchResults.users.length > 0) && (

                <div className="absolute top-full mt-5 left-0 right-0 z-50 overflow-hidden rounded-3xl border border-[#DCD5C8] bg-white/95 backdrop-blur-2xl shadow-[0_30px_80px_rgba(0,0,0,0.15)]">

                  {searchResults.users.length > 0 && (
                    <div>
                      <div className="px-6 py-3 bg-[#E9E4DA] text-xs font-bold uppercase tracking-[3px] text-[#6A4A50]">
                        Writers
                      </div>

                      {searchResults.users.map((u) => (
                        <Link
                          key={u.id}
                          to={`/profile/${u.id}`}
                          onClick={() => {
                            setShowResults(false);
                            setSearch("");
                          }}
                          className="flex items-center gap-4 px-6 py-4 hover:bg-[#FBF8F3] transition"
                        >
                          <div className="w-11 h-11 rounded-full overflow-hidden bg-[#DCD5C8] flex items-center justify-center">
                            {u.avatar_url ? (
                              <img
                                src={u.avatar_url}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <User className="w-5 h-5 text-[#6A4A50]" />
                            )}
                          </div>

                          <div>
                            <p className="font-semibold text-[#221A14]">
                              {u.full_name || u.username}
                            </p>

                            <p className="text-sm text-[#8B907F]">
                              @{u.username}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}

                  {searchResults.stories.length > 0 && (
                    <>
                      <div className="px-6 py-3 bg-[#E9E4DA] text-xs font-bold uppercase tracking-[3px] text-[#6A4A50] border-t border-[#DCD5C8]">
                        Stories
                      </div>

                      {searchResults.stories.map((s) => (
                        <Link
                          key={s.id}
                          to={`/story/${s.id}`}
                          onClick={() => {
                            setShowResults(false);
                            setSearch("");
                          }}
                          className="flex items-center gap-4 px-6 py-4 hover:bg-[#FBF8F3] transition"
                        >
                          <div className="w-12 h-16 rounded-lg overflow-hidden bg-[#E9E4DA]">
                            {s.cover_image ? (
                              <img
                                src={s.cover_image}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-[#6A4A50] to-[#221A14]" />
                            )}
                          </div>

                          <div>
                            <p className="font-semibold text-[#221A14]">
                              {s.title}
                            </p>

                            <p className="text-sm text-[#8B907F]">
                              @{s.profiles?.username}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </>
                  )}

                </div>
              )}
          </div>
        </div>
      </div>

      <div className="border-b border-white/10 py-5 px-6 sticky top-0 z-30 space-y-3">
        <div className="max-w-6xl mx-auto flex items-center gap-3 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setActiveCategory("All")}
            className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all whitespace-nowrap flex items-center gap-2 ${activeCategory === "All"
                ? "bg-[#C9A0A6] text-[#221A14] shadow-md"
                : "bg-white/10 text-[#E9E4DA] border border-white/15 hover:bg-white/20"
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
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all whitespace-nowrap flex items-center gap-2 ${activeCategory === cat.name
                  ? "bg-[#C9A0A6] text-[#221A14] shadow-md"
                  : "bg-white/10 text-[#E9E4DA] border border-white/15 hover:bg-white/20"
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
              className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${completionFilter === status
                  ? "bg-[#C9A0A6] text-[#221A14]"
                  : "bg-white/10 text-[#E9E4DA] border border-white/15 hover:bg-white/20"
                }`}
            >
              {status}
            </button>
          ))}
        </div>

        <div className="max-w-6xl mx-auto flex items-center gap-2 flex-wrap pt-1">
          <Tag className="w-3.5 h-3.5 text-[#4B1F24]" />
          {POPULAR_TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveTag(activeTag === tag ? null : tag)}
              className={`px-3 py-1.5 rounded-full text-xs transition-all ${
                activeTag === tag ? "bg-[#C9A0A6] text-[#221A14]" : "bg-white/10 text-[#DCD5C8] hover:bg-white/20"
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
              <h2 className="text-xl font-serif font-bold text-[#6A4A50]">Continue Reading</h2>
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
                  <p className="text-xs font-semibold text-[#6A4A50] mt-2 truncate">{item.posts.title}</p>
                  <p className="text-[10px] text-[#4B1F24]">{item.scroll_percent}% read</p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Top Writers This Week */}
        {topWriters.length > 0 && (
          <section className="mt-16 px-6 max-w-6xl mx-auto">
            <div className="flex items-center gap-2 mb-6">
              <span className="text-xl">🏆</span>
              <h2 className="text-2xl font-serif font-bold text-[#F5F0E8]">
                Top Writers This Week
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {topWriters.map((writer, index) => (
                <Link
                  key={writer.profile?.username || index}
                  to={`/profile/${writer.authorId}`}
                  className="relative bg-white border border-[#E8DED2] rounded-2xl p-6 text-center shadow-sm hover:shadow-lg transition"
                >
                  <div className="absolute top-3 left-3 bg-[#F4E6C8] text-[#8B5E34] text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                    {index + 1}
                  </div>

                  <div className="mx-auto w-16 h-16 rounded-full bg-[#EFE6D8] overflow-hidden flex items-center justify-center text-2xl font-bold text-[#4B1F24] mb-4">
                    {writer.profile?.avatar_url ? (
                      <img src={writer.profile.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      writer.profile?.full_name?.charAt(0) || writer.profile?.username?.charAt(0) || "?"
                    )}
                  </div>

                  <h3 className="text-base font-bold" style={{ color: '#3D1015' }}>
                    {writer.profile?.full_name || writer.profile?.username || "Unknown"}
                  </h3>

                  <p className="text-sm text-[#8B7B72] mt-1">
                    {writer.count} {writer.count === 1 ? "like" : "likes"}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {recommended.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-orange-500" />
              <h2 className="text-xl font-serif font-bold text-bg-[#6A4A50] text-white">Just For You</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {recommended.map((story) => (
                <StoryCircleCard key={story.id} story={story} bookmarkedIds={bookmarkedIds} toggleBookmark={toggleBookmark} />
              ))}
            </div>
          </div>
        )}

        {activeCategory === "All" && !search && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-[#DCD5C8] pb-3">
              <div className="p-2 rounded-lg bg-orange-100 text-orange-600">
                <Flame className="w-5 h-5 fill-amber-500 text-orange-500" />
              </div>
              <div>
                <h2 className="text-xl font-serif font-bold text-bg-[#6A4A50] text-white">Trending Right Now</h2>
                <p className="text-xs text-[#4B1F24]">Most loved and read stories by the community</p>
              </div>
            </div>

            {trendingLoading ? (
              <div className="flex gap-4 overflow-hidden">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="w-40 h-52 bg-gray-200 animate-pulse rounded-full shrink-0"></div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {trending.map((story, index) => (
                  <StoryCircleCard key={story.id} story={story} index={index} bookmarkedIds={bookmarkedIds} toggleBookmark={toggleBookmark} showLikes />
                ))}
              </div>
            )}
          </div>
        )}

        <div id="stories-section" className="space-y-6 pt-4">
          <div className="flex items-center justify-between border-b border-[#DCD5C8] pb-3">
            <div>
              <h2 className="text-xl font-serif font-bold text-bg-[#6A4A50] text-white">
                {activeCategory === "All" ? "All Stories" : `${activeCategory} Stories`}
              </h2>
              <p className="text-xs text-[#4B1F24]">Explore creations filtered by genre</p>
            </div>
            {(activeCategory !== "All" || completionFilter !== "All" || activeTag) && (
              <button
                onClick={() => { setActiveCategory("All"); setCompletionFilter("All"); setActiveTag(null); }}
                className="text-xs font-medium text-[#4B1F24] bg-white border border-[#DCD5C8] px-3.5 py-1.5 rounded-full hover:bg-[#E9E4DA] transition shadow-sm"
              >
                Clear filters ✕
              </button>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-56 bg-gray-100 animate-pulse rounded-full"></div>
              ))}
            </div>
          ) : stories.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-[#DCD5C8] space-y-3">
              <div className="text-3xl">📭</div>
              <p className="text-sm font-medium text-gray-600">No stories found with these filters yet.</p>
              <button
                onClick={() => { setActiveCategory("All"); setCompletionFilter("All"); setActiveTag(null); }}
                className="text-xs text-[#4B1F24] underline hover:text-[#6A4A50] font-semibold"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8">
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
    <div className="group">
      <Link to={`/story/${story.id}`}>

        <div className="relative aspect-[2/3] w-full overflow-hidden rounded-xl bg-[#FBF8F3] shadow-md border border-[#DCD5C8]">

          {story.cover_image ? (
            <img
              src={story.cover_image}
              alt={story.title}
              className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#6A4A50] to-[#221A14] flex items-center justify-center">
              <span className="text-white text-3xl opacity-40">
                ✦
              </span>
            </div>
          )}

          <button
            onClick={(e)=>toggleBookmark(e, story.id)}
            className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center shadow-md transition ${
              isBookmarked
              ? "bg-[#6A4A50] text-white"
              : "bg-white/90 text-[#6A4A50]"
            }`}
          >
            <Bookmark
              className="w-4 h-4"
              fill={isBookmarked ? "currentColor":"none"}
            />
          </button>

        </div>


        <h3 className="mt-3 text-sm font-bold text-[#221A14] line-clamp-1">
          {story.title}
        </h3>


        <p className="text-xs text-[#8B907F] truncate">
          by @{story.profiles?.username || "unknown"}
        </p>


        {showLikes && (
          <div className="flex gap-3 mt-2 text-xs text-[#8B907F]">

            <span className="flex items-center gap-1">
              <BookOpen className="w-3 h-3"/>
              {story.view_count || 0}
            </span>


            <span className="flex items-center gap-1 text-[#6A4A50]">
              <Heart className="w-3 h-3 fill-current"/>
              {story.likeCount || 0}
            </span>

          </div>
        )}


      </Link>


      <Link
        to={`/story/${story.id}`}
        className="mt-3 flex items-center justify-center gap-1 w-full text-xs font-medium bg-[#6A4A50] text-white py-2 rounded-lg hover:bg-[#4B1F24] transition"
      >
        Read Now
        <ArrowRight className="w-3 h-3"/>
      </Link>

    </div>
  );
}