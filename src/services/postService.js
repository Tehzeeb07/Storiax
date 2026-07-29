import { supabase } from "./supabase";

async function uploadCoverImage(file) {
  if (!file) return null;

  const fileExt = file.name.split(".").pop();
  const { data: { user } } = await supabase.auth.getUser();
  const filePath = `${user.id}/${Date.now()}.${fileExt}`;

  const { error } = await supabase.storage
    .from("covers")
    .upload(filePath, file, { upsert: true });

  if (error) throw error;

  const { data } = supabase.storage
    .from("covers")
    .getPublicUrl(filePath);

  return data.publicUrl;
}

export async function createDraft(story, postType = "story", hasChapters = false) {
  const { data: { user } } = await supabase.auth.getUser();
  const coverUrl = await uploadCoverImage(story.coverImage);

  const { data, error } = await supabase
    .from("posts")
    .insert({
      author_id: user.id,
      title: story.title,
      subtitle: story.subtitle,
      genre: story.genre,
      content: story.content,
      cover_image: coverUrl,
      status: "draft",
      post_type: postType,
      has_chapters: hasChapters,
    })
    .select();

  if (error) throw error;
  return data;
}

export async function publishStory(story, postType = "story", hasChapters = false) {
  const { data: { user } } = await supabase.auth.getUser();
  const coverUrl = await uploadCoverImage(story.coverImage);

  const { data, error } = await supabase
    .from("posts")
    .insert({
      author_id: user.id,
      title: story.title,
      subtitle: story.subtitle,
      genre: story.genre,
      content: story.content,
      cover_image: coverUrl,
      status: "published",
      post_type: postType,
      has_chapters: hasChapters,
    })
    .select();

  if (error) throw error;
  return data;
}

export async function updateStory(id, story, status, postType = "story", hasChapters = false) {
  const coverUrl = story.coverImage
    ? await uploadCoverImage(story.coverImage)
    : story.existingCoverImage || null;

  const { data, error } = await supabase
    .from("posts")
    .update({
      title: story.title,
      subtitle: story.subtitle,
      genre: story.genre,
      content: story.content,
      cover_image: coverUrl,
      status: status,
      post_type: postType,
      has_chapters: hasChapters,
    })
    .eq("id", id)
    .select();

  if (error) throw error;
  return data;
}

export async function likePost(postId, userId) {
  const { error } = await supabase
    .from("likes")
    .insert({ post_id: postId, user_id: userId });
  if (error) throw error;
}

export async function unlikePost(postId, userId) {
  const { error } = await supabase
    .from("likes")
    .delete()
    .eq("post_id", postId)
    .eq("user_id", userId);
  if (error) throw error;
}

export async function bookmarkPost(postId, userId) {
  const { error } = await supabase
    .from("bookmarks")
    .insert({ post_id: postId, user_id: userId });
  if (error) throw error;
}

export async function unbookmarkPost(postId, userId) {
  const { error } = await supabase
    .from("bookmarks")
    .delete()
    .eq("post_id", postId)
    .eq("user_id", userId);
  if (error) throw error;
}
export async function getPublishedStories() {
  const { data, error } = await supabase
    .from("posts")
    .select("id, title, subtitle, cover_image, genre, author_id, created_at, profiles(full_name, username)")
    .eq("status", "published")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return { data, error: null };
}