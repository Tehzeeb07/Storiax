import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../services/supabase";
import { useAuth } from "../contexts/AuthContext";

export default function ChapterRead() {
  const { id, chapterId } = useParams();
  const [chapter, setChapter] = useState(null);
  const [story, setStory] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [mentionSuggestions, setMentionSuggestions] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    async function fetchData() {
      const { data: chapterData } = await supabase
        .from("chapters")
        .select("*")
        .eq("id", chapterId)
        .single();
      if (chapterData) setChapter(chapterData);

      const { data: storyData } = await supabase
        .from("posts")
        .select("*, profiles(id, username)")
        .eq("id", id)
        .single();
      if (storyData) setStory(storyData);

      const { data: chaptersData } = await supabase
        .from("chapters")
        .select("*")
        .eq("post_id", id)
        .order("order_index", { ascending: true });
      if (chaptersData) setChapters(chaptersData);

      const { data: commentsData } = await supabase
        .from("comments")
        .select("*, profiles(username, avatar_url, full_name)")
        .eq("post_id", id)
        .order("created_at", { ascending: true });
      if (commentsData) setComments(commentsData);

      if (user) {
        const { error: progressError } = await supabase
          .from("reading_progress")
          .upsert({
            user_id: user.id,
            post_id: id,
            chapter_id: chapterId,
            updated_at: new Date().toISOString(),
          }, { onConflict: "user_id,post_id" });
        if (progressError) console.error("Progress error:", progressError);
      }

      setLoading(false);
    }

    fetchData();
  }, [id, chapterId, user]);

  async function handleMentionInput(text) {
    setNewComment(text);
    const atIndex = text.lastIndexOf("@");
    if (atIndex !== -1) {
      const query = text.slice(atIndex + 1).split(" ")[0];
      if (query.length > 0) {
        const { data } = await supabase
          .from("profiles")
          .select("id, username, full_name, avatar_url")
          .ilike("username", `%${query}%`)
          .limit(5);
        if (data) setMentionSuggestions(data);
      } else {
        setMentionSuggestions([]);
      }
    } else {
      setMentionSuggestions([]);
    }
  }

  function insertMention(username) {
    const atIndex = newComment.lastIndexOf("@");
    const newText = newComment.slice(0, atIndex) + `@${username} `;
    setNewComment(newText);
    setMentionSuggestions([]);
  }

  async function handleComment() {
    if (!user) return alert("Login to comment.");
    if (!newComment.trim()) return;
    setSubmitting(true);

    const { data, error } = await supabase
      .from("comments")
      .insert({ post_id: id, user_id: user.id, comment: newComment.trim(), parent_id: null })
      .select("*, profiles(username, avatar_url, full_name)")
      .single();

    if (!error) {
      setComments((prev) => [...prev, data]);
      setNewComment("");
    }
    setSubmitting(false);
  }

  function handleShare() {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: chapter?.title, url });
    } else {
      navigator.clipboard.writeText(url);
      alert("Link copied to clipboard!");
    }
  }

  function renderCommentText(text) {
    const parts = text.split(/(@\w+)/g);
    return parts.map((part, i) =>
      part.startsWith("@") ? (
        <span key={i} className="text-[#8b6f47] font-medium">{part}</span>
      ) : (
        <span key={i}>{part}</span>
      )
    );
  }

  function renderAvatar(profile) {
    return (
      <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center text-sm font-bold text-gray-500 shrink-0">
        {profile?.avatar_url ? (
          <img src={profile.avatar_url} alt="avatar" className="w-full h-full object-cover" />
        ) : (
          profile?.full_name?.charAt(0) || "?"
        )}
      </div>
    );
  }

  if (loading) return <p className="p-10 text-gray-400">Loading...</p>;
  if (!chapter) return <p className="p-10 text-gray-400">Chapter not found.</p>;

  const currentIndex = chapters.findIndex((c) => c.id === chapterId);
  const prevChapter = chapters[currentIndex - 1];
  const nextChapter = chapters[currentIndex + 1];

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-[#8b6f47] mb-8">
        <Link to={`/story/${id}`} className="hover:underline">{story?.title}</Link>
        <span>→</span>
        <span>{chapter.title}</span>
      </div>

      <h1 className="text-3xl font-bold text-[#2c1a0e] mb-10">{chapter.title}</h1>

      {/* Content */}
      <div className="prose prose-lg max-w-none text-[#2c1a0e] mb-12 whitespace-pre-wrap">
        {chapter.content}
      </div>

      {/* Share Button */}
      <div className="flex justify-end mb-10">
        <button
          onClick={handleShare}
          className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-gray-200 text-sm text-gray-500 hover:border-gray-400 hover:text-black transition"
        >
          <span>🔗</span>
          <span>Share Chapter</span>
        </button>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between border-t border-[#e8dfd0] pt-8 mb-16">
        {prevChapter ? (
          <Link to={`/story/${id}/chapter/${prevChapter.id}`} className="text-sm text-[#8b6f47] hover:text-[#2c1a0e] transition">
            ← {prevChapter.title}
          </Link>
        ) : <div />}
        <Link to={`/story/${id}/chapters`} className="text-sm text-[#8b6f47] hover:text-[#2c1a0e] transition">
          All Chapters
        </Link>
        {nextChapter ? (
          <Link to={`/story/${id}/chapter/${nextChapter.id}`} className="text-sm text-[#8b6f47] hover:text-[#2c1a0e] transition">
            {nextChapter.title} →
          </Link>
        ) : <div />}
      </div>

      {/* Comments */}
      <div className="border-t border-[#e8dfd0] pt-10">
        <h2 className="text-xl font-bold text-[#2c1a0e] mb-6">Comments ({comments.length})</h2>

        {user ? (
          <div className="mb-8 relative">
            <textarea
              value={newComment}
              onChange={(e) => handleMentionInput(e.target.value)}
              onBlur={() => setTimeout(() => setMentionSuggestions([]), 150)}
              rows={3}
              placeholder="Write a comment... use @ to mention someone"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-black transition resize-none"
            />
            {mentionSuggestions.length > 0 && (
              <div className="absolute z-50 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden w-64 mt-1 left-0">
                {mentionSuggestions.map((u) => (
                  <button
                    key={u.id}
                    onMouseDown={(e) => { e.preventDefault(); insertMention(u.username); }}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#faf7f2] w-full text-left transition"
                  >
                    <div className="w-7 h-7 rounded-full bg-[#e8dfd0] overflow-hidden flex items-center justify-center text-xs font-bold text-[#8b6f47] shrink-0">
                      {u.avatar_url ? (
                        <img src={u.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                      ) : u.full_name?.charAt(0) || "?"}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{u.full_name}</p>
                      <p className="text-xs text-gray-400">@{u.username}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
            <button
              onClick={handleComment}
              disabled={submitting}
              className="mt-2 bg-black text-white px-5 py-2 rounded-full text-sm hover:bg-gray-800 transition disabled:opacity-50"
            >
              {submitting ? "Posting..." : "Post Comment"}
            </button>
          </div>
        ) : (
          <p className="text-sm text-gray-400 mb-8">
            <Link to="/login" className="underline hover:text-black">Login</Link> to leave a comment.
          </p>
        )}

        {comments.length === 0 ? (
          <p className="text-gray-400 text-sm">No comments yet. Be the first!</p>
        ) : (
          <div className="flex flex-col gap-6">
            {comments.map((c) => (
              <div key={c.id} className="flex gap-3">
                {renderAvatar(c.profiles)}
                <div>
                  <p className="text-sm font-medium">{c.profiles?.username || "Unknown"}</p>
                  <p className="text-sm text-gray-600 mt-0.5">{renderCommentText(c.comment)}</p>
                  <p className="text-xs text-gray-400 mt-1">{new Date(c.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}