import { useNavigate } from "react-router-dom";
import { createDraft, publishStory, updateStory } from "../../services/postService";
import { supabase } from "../../services/supabase";

function EditorActions({ story, postId, postType, hasChapters, chapters }) {
  const navigate = useNavigate();

  async function saveChapters(postId) {
    if (!hasChapters || !chapters) return;

    await supabase.from("chapters").delete().eq("post_id", postId);

    const chapterRows = chapters.map((c, i) => ({
      post_id: postId,
      title: c.title,
      content: c.content,
      order_index: i,
    }));

    await supabase.from("chapters").insert(chapterRows);
  }

  const handleSaveDraft = async () => {
    try {
      if (postId) {
        await updateStory(postId, story, "draft", postType, hasChapters);
        await saveChapters(postId);
      } else {
        const data = await createDraft(story, postType, hasChapters);
        if (hasChapters && data?.[0]?.id) await saveChapters(data[0].id);
      }
      alert("Draft saved!");
      navigate("/dashboard");
    } catch (error) {
      alert(error.message);
    }
  };

  const handlePublish = async () => {
    try {
      if (postId) {
        await updateStory(postId, story, "published", postType, hasChapters);
        await saveChapters(postId);
      } else {
        const data = await publishStory(story, postType, hasChapters);
        if (hasChapters && data?.[0]?.id) await saveChapters(data[0].id);
      }
      alert("Story published!");
      navigate("/dashboard");
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="flex justify-end gap-4 mt-8">
      <button
        onClick={handleSaveDraft}
        className="px-6 py-3 rounded-lg bg-slate-200 hover:bg-slate-300"
      >
        Save Draft
      </button>
      <button
        onClick={handlePublish}
        className="px-6 py-3 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
      >
        Publish
      </button>
    </div>
  );
}

export default EditorActions;