import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../services/supabase";
import { useAuth } from "../contexts/AuthContext";
import { likePost, unlikePost, bookmarkPost, unbookmarkPost } from "../services/postService";

function MentionLink({ username }) {
  const [userId, setUserId] = useState(null);
  useEffect(() => {
    async function fetchUser() {
      const { data } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", username)
        .single();
      if (data) setUserId(data.id);
    }
    fetchUser();
  }, [username]);
  if (!userId) return <span className="text-[#6A4A50] font-medium">@{username}</span>;
  return (
    <Link to={`/profile/${userId}`} className="text-[#6A4A50] font-medium hover:underline">
      @{username}
    </Link>
  );
}

export default function StoryDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [commentLikes, setCommentLikes] = useState({});
  const [commentLikeCounts, setCommentLikeCounts] = useState({});
  const [mentionSuggestions, setMentionSuggestions] = useState([]);
  const [replyMentionSuggestions, setReplyMentionSuggestions] = useState([]);

  useEffect(() => {
    async function fetchAll() {
      const { data, error } = await supabase
        .from("posts")
        .select("*, profiles(id, username, full_name)")
        .eq("id", id)
        .single();
      if (!error) setStory(data);

      const { count } = await supabase
        .from("likes")
        .select("*", { count: "exact", head: true })
        .eq("post_id", id);
      setLikeCount(count || 0);

      if (user) {
        const { data: likeData } = await supabase
          .from("likes").select("id").eq("post_id", id).eq("user_id", user.id).single();
        setLiked(!!likeData);

        const { data: bookmarkData } = await supabase
          .from("bookmarks").select("id").eq("post_id", id).eq("user_id", user.id).single();
        setBookmarked(!!bookmarkData);
      }

      const { data: commentsData } = await supabase
        .from("comments")
        .select("*, profiles(username, avatar_url, full_name)")
        .eq("post_id", id)
        .order("created_at", { ascending: true });

      if (commentsData) {
        setComments(commentsData);
        const counts = {};
        const userLiked = {};
        await Promise.all(
          commentsData.map(async (c) => {
            const { count } = await supabase
              .from("comment_likes").select("*", { count: "exact", head: true }).eq("comment_id", c.id);
            counts[c.id] = count || 0;
            if (user) {
              const { data: cl } = await supabase
                .from("comment_likes").select("id").eq("comment_id", c.id).eq("user_id", user.id).single();
              userLiked[c.id] = !!cl;
            }
          })
        );
        setCommentLikeCounts(counts);
        setCommentLikes(userLiked);
      }
      setLoading(false);
    }
    fetchAll();
  }, [id, user]);

  async function fetchMentions(text, setter) {
    const atIndex = text.lastIndexOf("@");
    if (atIndex !== -1) {
      const query = text.slice(atIndex + 1).split(" ")[0];
      if (query.length > 0) {
        const { data } = await supabase
          .from("profiles")
          .select("id, username, full_name, avatar_url")
          .ilike("username", `%${query}%`)
          .limit(5);
        if (data) setter(data);
      } else {
        setter([]);
      }
    } else {
      setter([]);
    }
  }

  function insertMention(username, currentText, setter, clearSuggestions) {
    const atIndex = currentText.lastIndexOf("@");
    setter(currentText.slice(0, atIndex) + `@${username} `);
    clearSuggestions([]);
  }

  function renderMentionDropdown(suggestions, currentText, setter, clearSuggestions) {
    if (suggestions.length === 0) return null;
    return (
      <div className="absolute z-50 bg-white border border-[#DCD5C8] rounded-2xl shadow-lg overflow-hidden w-64 mt-1 left-0">
        {suggestions.map((u) => (
          <button
            key={u.id}
            onMouseDown={(e) => {
              e.preventDefault();
              insertMention(u.username, currentText, setter, clearSuggestions);
            }}
            className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#FBF8F3] w-full text-left transition"
          >
            <div className="w-7 h-7 rounded-full bg-[#E9E4DA] overflow-hidden flex items-center justify-center text-xs font-bold text-[#6A4A50] shrink-0">
              {u.avatar_url ? (
                <img src={u.avatar_url} alt="avatar" className="w-full h-full object-cover" />
              ) : u.full_name?.charAt(0) || "?"}
            </div>
            <div>
              <p className="text-sm font-medium text-[#221A14]">{u.full_name}</p>
              <p className="text-xs text-[#8B907F]">@{u.username}</p>
            </div>
          </button>
        ))}
      </div>
    );
  }

  function renderCommentText(text) {
    return text.split(/(@\w+)/g).map((part, i) =>
      part.startsWith("@") ? (
        <MentionLink key={i} username={part.slice(1)} />
      ) : <span key={i}>{part}</span>
    );
  }

  async function handleLike() {
    if (!user) return alert("Login to like stories.");
    if (liked) { await unlikePost(id, user.id); setLiked(false); setLikeCount((p) => p - 1); }
    else { await likePost(id, user.id); setLiked(true); setLikeCount((p) => p + 1); }
  }

  async function handleBookmark() {
    if (!user) return alert("Login to bookmark stories.");
    if (bookmarked) { await unbookmarkPost(id, user.id); setBookmarked(false); }
    else { await bookmarkPost(id, user.id); setBookmarked(true); }
  }

  async function handleComment() {
    if (!user) return alert("Login to comment.");
    if (!newComment.trim()) return;
    setSubmitting(true);
    const { data, error } = await supabase
      .from("comments")
      .insert({ post_id: id, user_id: user.id, comment: newComment.trim(), parent_id: null })
      .select("*, profiles(username, avatar_url, full_name)").single();
    if (!error) {
      setComments((prev) => [...prev, data]);
      setCommentLikeCounts((prev) => ({ ...prev, [data.id]: 0 }));
      setCommentLikes((prev) => ({ ...prev, [data.id]: false }));
      setNewComment("");
    }
    setSubmitting(false);
  }

  async function handleReply(parentId) {
    if (!user) return alert("Login to reply.");
    if (!replyText.trim()) return;
    setSubmitting(true);
    const { data, error } = await supabase
      .from("comments")
      .insert({ post_id: id, user_id: user.id, comment: replyText.trim(), parent_id: parentId })
      .select("*, profiles(username, avatar_url, full_name)").single();
    if (!error) {
      setComments((prev) => [...prev, data]);
      setCommentLikeCounts((prev) => ({ ...prev, [data.id]: 0 }));
      setCommentLikes((prev) => ({ ...prev, [data.id]: false }));
      setReplyText("");
      setReplyingTo(null);
    }
    setSubmitting(false);
  }

  async function handleCommentLike(commentId) {
    if (!user) return alert("Login to like comments.");
    const alreadyLiked = commentLikes[commentId];
    if (alreadyLiked) {
      await supabase.from("comment_likes").delete().eq("comment_id", commentId).eq("user_id", user.id);
      setCommentLikes((prev) => ({ ...prev, [commentId]: false }));
      setCommentLikeCounts((prev) => ({ ...prev, [commentId]: (prev[commentId] || 1) - 1 }));
    } else {
      await supabase.from("comment_likes").insert({ comment_id: commentId, user_id: user.id });
      setCommentLikes((prev) => ({ ...prev, [commentId]: true }));
      setCommentLikeCounts((prev) => ({ ...prev, [commentId]: (prev[commentId] || 0) + 1 }));
    }
  }

  function renderAvatar(profile) {
    return (
      <div className="w-8 h-8 rounded-full bg-[#E9E4DA] overflow-hidden flex items-center justify-center text-sm font-bold text-[#6A4A50] shrink-0">
        {profile?.avatar_url ? (
          <img src={profile.avatar_url} alt="avatar" className="w-full h-full object-cover" />
        ) : profile?.full_name?.charAt(0) || "?"}
      </div>
    );
  }

  function renderCommentLikeButton(commentId) {
    const isLiked = commentLikes[commentId];
    const count = commentLikeCounts[commentId] || 0;
    return (
      <button
        onClick={() => handleCommentLike(commentId)}
        className={`flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-medium transition ${
          isLiked ? "bg-[#F3E7E5] border-[#6A4A50]/30 text-[#4B1F24]" : "bg-white border-[#DCD5C8] text-[#8B907F] hover:border-[#6A4A50] hover:text-[#4B1F24]"
        }`}
      >
        <span>{isLiked ? "❤️" : "🤍"}</span>
        <span>{count}</span>
      </button>
    );
  }

  const topLevelComments = comments.filter((c) => !c.parent_id);
  const getReplies = (parentId) => comments.filter((c) => c.parent_id === parentId);

  if (loading) return <p className="p-10 text-[#8B907F]">Loading...</p>;
  if (!story) return <p className="p-10 text-[#8B907F]">Story not found.</p>;

  return (
    <div className="max-w-2xl mx-auto px-6 py-12 bg-transparent min-h-screen">
      <p className="text-sm text-[#6A4A50] uppercase tracking-widest mb-2">{story.genre}</p>
      <h1 className="text-4xl font-serif font-bold text-[#221A14] mb-3">{story.title}</h1>
      {story.subtitle && <p className="text-xl text-[#8B907F] mb-6">{story.subtitle}</p>}

      <div className="flex items-center justify-between border-b border-[#DCD5C8] pb-6 mb-10">
        <div className="flex items-center gap-2 text-sm text-[#8B907F]">
          <Link to={`/profile/${story.profiles?.id}`} className="hover:underline hover:text-[#4B1F24] transition">
            {story.profiles?.username || "Unknown"}
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleLike} className={`flex items-center gap-2 px-4 py-1.5 rounded-full border text-sm font-medium transition ${liked ? "bg-[#F3E7E5] border-[#6A4A50]/30 text-[#4B1F24]" : "bg-white border-[#DCD5C8] text-[#8B907F] hover:border-[#6A4A50] hover:text-[#4B1F24]"}`}>
            <span>{liked ? "❤️" : "🤍"}</span>
            <span>{likeCount} {likeCount === 1 ? "Like" : "Likes"}</span>
          </button>
          <button onClick={handleBookmark} className={`flex items-center gap-2 px-4 py-1.5 rounded-full border text-sm font-medium transition ${bookmarked ? "bg-[#E9E4DA] border-[#6A4A50] text-[#221A14]" : "bg-white border-[#DCD5C8] text-[#8B907F] hover:border-[#6A4A50] hover:text-[#221A14]"}`}>
            <span>🔖</span>
            <span>{bookmarked ? "Saved" : "Save"}</span>
          </button>
        </div>
      </div>

      <div className="prose prose-lg max-w-none mb-16 text-[#221A14]" dangerouslySetInnerHTML={{ __html: story.content }} />

      <div className="border-t border-[#DCD5C8] pt-10">
        <h2 className="text-xl font-serif font-bold text-[#4B1F24] mb-6">Comments ({comments.length})</h2>

        {user ? (
          <div className="mb-8 relative">
            <textarea
              value={newComment}
              onChange={(e) => { setNewComment(e.target.value); fetchMentions(e.target.value, setMentionSuggestions); }}
              onBlur={() => setTimeout(() => setMentionSuggestions([]), 150)}
              rows={3}
              placeholder="Write a comment... use @ to mention someone"
              className="w-full border border-[#DCD5C8] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#6A4A50] transition resize-none bg-white text-[#221A14]"
            />
            {renderMentionDropdown(mentionSuggestions, newComment, setNewComment, setMentionSuggestions)}
            <button onClick={handleComment} disabled={submitting} className="mt-2 bg-[#6A4A50] text-white px-5 py-2 rounded-full text-sm hover:bg-[#4B1F24] transition disabled:opacity-50">
              {submitting ? "Posting..." : "Post Comment"}
            </button>
          </div>
        ) : (
          <p className="text-sm text-[#8B907F] mb-8">
            <Link to="/login" className="underline hover:text-[#4B1F24]">Login</Link> to leave a comment.
          </p>
        )}

        {topLevelComments.length === 0 ? (
          <p className="text-[#8B907F] text-sm">No comments yet. Be the first!</p>
        ) : (
          <div className="flex flex-col gap-6">
            {topLevelComments.map((c) => (
              <div key={c.id}>
                <div className="flex gap-3">
                  {renderAvatar(c.profiles)}
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[#221A14]">{c.profiles?.username || "Unknown"}</p>
                    <p className="text-sm text-[#4B1F24] mt-0.5">{renderCommentText(c.comment)}</p>
                    <div className="flex items-center gap-3 mt-2">
                      {renderCommentLikeButton(c.id)}
                      {user && (
                        <button onClick={() => setReplyingTo(replyingTo === c.id ? null : c.id)} className="text-xs text-[#8B907F] hover:text-[#4B1F24] transition">
                          Reply
                        </button>
                      )}
                    </div>

                    {replyingTo === c.id && (
                      <div className="mt-3 relative">
                        <textarea
                          value={replyText}
                          onChange={(e) => { setReplyText(e.target.value); fetchMentions(e.target.value, setReplyMentionSuggestions); }}
                          onBlur={() => setTimeout(() => setReplyMentionSuggestions([]), 150)}
                          rows={2}
                          placeholder="Write a reply... use @ to mention"
                          className="w-full border border-[#DCD5C8] rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#6A4A50] transition resize-none bg-white text-[#221A14]"
                        />
                        {renderMentionDropdown(replyMentionSuggestions, replyText, setReplyText, setReplyMentionSuggestions)}
                        <div className="flex gap-2 mt-1">
                          <button onClick={() => handleReply(c.id)} disabled={submitting} className="bg-[#6A4A50] text-white px-4 py-1.5 rounded-full text-xs hover:bg-[#4B1F24] transition disabled:opacity-50">
                            {submitting ? "Posting..." : "Reply"}
                          </button>
                          <button onClick={() => setReplyingTo(null)} className="text-xs text-[#8B907F] hover:text-[#4B1F24] transition">
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}

                    {getReplies(c.id).length > 0 && (
                      <div className="mt-4 flex flex-col gap-4 border-l-2 border-[#E9E4DA] pl-4">
                        {getReplies(c.id).map((reply) => (
                          <div key={reply.id} className="flex gap-3">
                            {renderAvatar(reply.profiles)}
                            <div className="flex-1">
                              <p className="text-sm font-medium text-[#221A14]">{reply.profiles?.username || "Unknown"}</p>
                              <p className="text-sm text-[#4B1F24] mt-0.5">{renderCommentText(reply.comment)}</p>
                              <div className="flex items-center gap-3 mt-2">
                                {renderCommentLikeButton(reply.id)}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
