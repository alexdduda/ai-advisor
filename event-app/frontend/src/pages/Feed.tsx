import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { apiGet, apiPost } from "../lib/api";
import { supabase } from "../lib/supabase";

type Post = {
  id: string;
  image_url: string | null;
  caption: string;
  created_at: string;
  profiles: { full_name: string | null; avatar_url: string | null } | null;
};

export default function Feed() {
  const { session } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [caption, setCaption] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [posting, setPosting] = useState(false);

  function load() {
    apiGet("/api/feed").then(setPosts).catch(() => {});
  }

  useEffect(load, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!caption.trim() && !file) return;
    setPosting(true);
    try {
      let image_url: string | undefined;
      if (file) {
        const path = `${crypto.randomUUID()}-${file.name}`;
        const { error } = await supabase.storage.from("feed-photos").upload(path, file);
        if (error) throw error;
        image_url = supabase.storage.from("feed-photos").getPublicUrl(path).data.publicUrl;
      }
      await apiPost("/api/feed", { caption, image_url });
      setCaption("");
      setFile(null);
      load();
    } finally {
      setPosting(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-6 pt-16">
      <h1 className="font-display text-3xl font-bold">Feed</h1>

      {session && (
        <form onSubmit={submit} className="mt-6 space-y-2 rounded-2xl card p-4">
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="What's happening?"
            rows={2}
            className="w-full resize-none rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm outline-none focus:border-white"
          />
          <div className="flex items-center justify-between">
            <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="text-xs text-white/50" />
            <button
              disabled={posting}
              className="rounded-lg bg-white px-4 py-1.5 text-sm font-semibold text-ink disabled:opacity-50"
            >
              Post
            </button>
          </div>
        </form>
      )}

      <div className="mt-6 space-y-4">
        {posts.map((post) => (
          <div key={post.id} className="rounded-2xl card p-4">
            <p className="text-sm font-medium">{post.profiles?.full_name ?? "Someone"}</p>
            {post.image_url && <img src={post.image_url} className="mt-2 rounded-xl" alt="" />}
            {post.caption && <p className="mt-2 text-sm text-white/80">{post.caption}</p>}
          </div>
        ))}
        {posts.length === 0 && <p className="text-white/50">No posts yet. Be the first.</p>}
      </div>
    </div>
  );
}
