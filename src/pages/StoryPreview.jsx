import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "../services/supabase";
import { useAuth } from "../contexts/AuthContext";
import { likePost, unlikePost, bookmarkPost, unbookmarkPost } from "../services/postService";

export default function StoryPreview() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [readingProgress, setReadingProgress] = useState(null);

  useEffect(() => {
    async function fetchStory() {
      const { data, error } = await supabase
        .from("posts")
        .select("*, profiles(id, username, full_name, avatar_url, bio)")
        .eq("id", id)
        .single();

      if (!error) {
        setStory(data);
        await supabase
          .from("posts")
          .update({ view_count: (data.view_count || 0) + 1 })
          .eq("id", id);
      }

      const { count } = await supabase
        .from("likes")
        .select("*", { count: "exact", head: true })
        .eq("post_id", id);
      setLikeCount(count || 0);

      if (user) {
        const { data: likeData } = await supabase
          .from("likes")
          .select("id")
          .eq("post_id", id)
          .eq("user_id", user.id)
          .single();
        setLiked(!!likeData);

        const { data: bookmarkData } = await supabase
          .from("bookmarks")
          .select("id")
          .eq("post_id", id)
          .eq("user_id", user.id)
          .single();
        setBookmarked(!!bookmarkData);

        const { data: progressData } = await supabase
          .from("reading_progress")
          .select("chapter_id, chapters(title)")
          .eq("post_id", id)
          .eq("user_id", user.id)
          .single();
        if (progressData) setReadingProgress(progressData);
      }

      setLoading(false);
    }

    fetchStory();
  }, [id, user]);

  async function handleLike() {
    if (!user) return alert("Login to like.");
    if (liked) {
      await unlikePost(id, user.id);
      setLiked(false);
      setLikeCount((prev) => prev - 1);
    } else {
      await likePost(id, user.id);
      setLiked(true);
      setLikeCount((prev) => prev + 1);
    }
  }

  async function handleBookmark() {
    if (!user) return alert("Login to bookmark.");
    if (bookmarked) {
      await unbookmarkPost(id, user.id);
      setBookmarked(false);
    } else {
      await bookmarkPost(id, user.id);
      setBookmarked(true);
    }
  }

  if (loading) return <p className="p-10 text-gray-400">Loading...</p>;
  if (!story) return <p className="p-10 text-gray-400">Story not found.</p>;

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">

      {/* Cover Image */}
      {story.cover_image && (
        <div className="w-full h-72 rounded-2xl overflow-hidden mb-8 bg-[#fdf8f3] flex items-center justify-center">
          <img
            src={story.cover_image}
            alt={story.title}
            className="w-full h-full object-contain"
          />
        </div>
      )}

      {/* Genre + Title */}
      <p className="text-xs text-[#8b6f47] uppercase tracking-widest mb-2">{story.genre}</p>
      <h1 className="text-4xl font-bold text-[#2c1a0e] mb-3">{story.title}</h1>
      {story.subtitle && (
        <p className="text-lg text-[#7a6050] mb-6">{story.subtitle}</p>
      )}

      {/* Author */}
      <Link to={`/profile/${story.profiles?.id}`} className="flex items-center gap-3 mb-8 group">
        <div className="w-10 h-10 rounded-full bg-[#e8dfd0] overflow-hidden flex items-center justify-center text-sm font-bold text-[#8b6f47]">
          {story.profiles?.avatar_url ? (
            <img src={story.profiles.avatar_url} alt="avatar" className="w-full h-full object-cover" />
          ) : (
            story.profiles?.full_name?.charAt(0) || "?"
          )}
        </div>
        <div>
          <p className="text-sm font-medium text-[#2c1a0e] group-hover:underline">
            {story.profiles?.full_name || story.profiles?.username}
          </p>
          <p className="text-xs text-[#8b6f47]">
            {new Date(story.created_at).toLocaleDateString()}
          </p>
        </div>
      </Link>

      {/* Like + Bookmark */}
      <div className="flex items-center gap-3 mb-10">
        <button
          onClick={() => {
            const url = window.location.href;
            if (navigator.share) {
              navigator.share({
                title: story.title,
                text: story.subtitle || "Check out this story on Storiax!",
                url: url,
              });
            } else {
              navigator.clipboard.writeText(url);
              alert("Link copied to clipboard!");
            }
          }}
          className="flex items-center gap-2 px-4 py-1.5 rounded-full border text-sm font-medium transition bg-white border-gray-200 text-gray-500 hover:border-gray-400 hover:text-black"
        >
          <span>🔗</span>
          <span>Share</span>
        </button>
        <button
          onClick={handleLike}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-full border text-sm font-medium transition ${
            liked
              ? "bg-red-50 border-red-200 text-red-500"
              : "bg-white border-gray-200 text-gray-500 hover:border-red-300 hover:text-red-500"
          }`}
        >
          <span>{liked ? "❤️" : "🤍"}</span>
          <span>{likeCount} {likeCount === 1 ? "Like" : "Likes"}</span>
        </button>
        <button
          onClick={handleBookmark}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-full border text-sm font-medium transition ${
            bookmarked
              ? "bg-[#faf7f2] border-[#c4a882] text-[#8b6f47]"
              : "bg-white border-gray-200 text-gray-500 hover:border-[#c4a882] hover:text-[#8b6f47]"
          }`}
        >
          <span>🔖</span>
          <span>{bookmarked ? "Saved" : "Save"}</span>
        </button>
      </div>

      {/* Divider */}
      <div className="border-t border-[#e8dfd0] mb-10" />

      {/* About Author */}
      {story.profiles?.bio && (
        <div className="mb-10">
          <p className="text-xs text-[#8b6f47] uppercase tracking-widest mb-2">About the Author</p>
          <p className="text-sm text-[#7a6050]">{story.profiles.bio}</p>
        </div>
      )}

      {/* Start / Continue Reading Button */}
      <div className="flex justify-center">
        <Link
          to={
            readingProgress?.chapter_id
              ? `/story/${id}/chapter/${readingProgress.chapter_id}`
              : story.has_chapters
              ? `/story/${id}/chapters`
              : `/story/${id}/read`
          }
          className="bg-[#2c1a0e] text-[#faf7f2] px-10 py-3 rounded-full text-sm font-medium hover:bg-[#4a2e1a] transition"
        >
          {readingProgress?.chapter_id
            ? `Continue Reading → ${readingProgress.chapters?.title}`
            : "Start Reading →"}
        </Link>
      </div>
    </div>
  );
} 