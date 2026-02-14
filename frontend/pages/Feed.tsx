import React, { useEffect, useState } from 'react';
import { useAuth } from '../components/AuthContext';
import Navbar from '../components/Navbar';
import UserProfileSidebar from '../components/UserProfileSidebar';
import ErrorState from '../components/ErrorState';
import { supabase } from '../lib/supabase';
import { Filter, MessageSquare, Heart, Clock, Send, X } from 'lucide-react';

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  author: {
    username: string;
    profile_photo: string | null;
  };
}

interface FeedPost {
  id: string;
  caption: string;
  media_url: string | null;
  media_type: 'image' | 'video' | 'text';
  sport: string;
  created_at: string;
  author?: {
    username?: string;
    profile_photo?: string | null;
  };
  likes: { count: number }[];
  user_has_liked: boolean;
  comments: { count: number }[];
}

const Feed: React.FC = () => {
  const { user, isLoading: authLoading } = useAuth();

  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Comments Modal State
  const [activePostId, setActivePostId] = useState<string | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoadingComments, setIsLoadingComments] = useState(false);

  /* -------------------------
     FETCH POSTS
  ------------------------- */
  const fetchFeed = async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (!user) return;

      const { data, error } = await supabase
        .from('posts')
        .select(
          `
          id,
          caption,
          media_url,
          media_type,
          sport,
          created_at,
          author:profiles!posts_user_id_fkey (
            username,
            profile_photo
          ),
          likes:likes(count),
          comments:comments(count)
        `
        )
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Check if user has liked each post efficiently
      // We can't easily do "user_has_liked" in the main query without a custom function or complex join
      // So let's fetch all likes by this user for these posts
      const postIds = data.map(p => p.id);
      const { data: userLikes } = await supabase
        .from('likes')
        .select('post_id')
        .eq('user_id', user.id)
        .in('post_id', postIds);

      const likedPostIds = new Set(userLikes?.map(l => l.post_id));

      const formattedPosts: FeedPost[] = data.map((post: any) => ({
        ...post,
        user_has_liked: likedPostIds.has(post.id),
      }));

      setPosts(formattedPosts || []);
    } catch (err) {
      console.error('Feed fetch failed:', err);
      setError('Failed to load feed');
    } finally {
      setIsLoading(false);
    }
  };

  /* -------------------------
     LIKE FUNCTIONALITY
  ------------------------- */
  const handleLike = async (postId: string) => {
    if (!user) return;

    // Optimistic UI update
    setPosts(prev =>
      prev.map(p => {
        if (p.id === postId) {
          const isLiking = !p.user_has_liked;
          return {
            ...p,
            user_has_liked: isLiking,
            likes: [{ count: (p.likes[0]?.count || 0) + (isLiking ? 1 : -1) }]
          };
        }
        return p;
      })
    );

    try {
      const post = posts.find(p => p.id === postId);
      if (!post) return;

      if (post.user_has_liked) {
        // Unlike
        await supabase
          .from('likes')
          .delete()
          .eq('user_id', user.id)
          .eq('post_id', postId);
      } else {
        // Like
        await supabase
          .from('likes')
          .insert({ user_id: user.id, post_id: postId });
      }
    } catch (err) {
      console.error('Like failed', err);
      // Revert optimism if needed (skipping for simplicity)
    }
  };

  /* -------------------------
     COMMENT FUNCTIONALITY
  ------------------------- */
  const openComments = async (postId: string) => {
    setActivePostId(postId);
    setIsLoadingComments(true);

    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          id,
          content,
          created_at,
          user_id,
          author:profiles!comments_user_id_fkey(username, profile_photo)
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true }); // Oldest first

      // Note: We need to make sure 'comments_user_id_fkey' or similar exists. 
      // Supabase usually names them 'comments_user_id_fkey' by default if we created the table with references.
      // If it fails, we might need to verify the FK name. Since we created table 'comments' with 'user_id references profiles(id)', check defaults.
      // Usually it is 'comments_user_id_fkey'.

      if (error) throw error;
      setComments(data as unknown as Comment[]);
    } catch (err) {
      console.error('Fetch comments failed', err);
    } finally {
      setIsLoadingComments(false);
    }
  };

  const submitComment = async () => {
    if (!newComment.trim() || !user || !activePostId) return;

    const tempId = Math.random().toString();
    const commentText = newComment;
    setNewComment(''); // Clear input immediately

    // Optimistic append
    const optimisticComment: Comment = {
      id: tempId,
      content: commentText,
      created_at: new Date().toISOString(),
      user_id: user.id,
      author: {
        username: 'Me', // Placeholder until refresh or we fetch profile
        profile_photo: null
      }
    };
    setComments(prev => [...prev, optimisticComment]);

    try {
      const { data, error } = await supabase
        .from('comments')
        .insert({
          user_id: user.id,
          post_id: activePostId,
          content: commentText
        })
        .select(`
          id,
          content,
          created_at,
          user_id,
          author:profiles(username, profile_photo)
        `)
        .single();

      if (error) throw error;

      // Replace optimistic comment with real one
      setComments(prev => prev.map(c => c.id === tempId ? (data as unknown as Comment) : c));

      // Update post comment count locally
      setPosts(prev => prev.map(p => {
        if (p.id === activePostId) {
          return {
            ...p,
            comments: [{ count: (p.comments[0]?.count || 0) + 1 }]
          }
        }
        return p;
      }));

    } catch (err) {
      console.error('Post comment failed', err);
      // Remove optimistic comment
      setComments(prev => prev.filter(c => c.id !== tempId));
    }
  };

  /* -------------------------
     INIT
  ------------------------- */
  useEffect(() => {
    if (user) {
      fetchFeed();
    }
  }, [user]);

  if (!user) {
    if (authLoading) {
      return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-gray-400">Loading...</p>
          </div>
        </div>
      );
    }
    return null;
  }

  return (
    <div className="min-h-screen bg-black text-white pb-20 relative">
      <Navbar />

      <main className="pt-24 px-4 md:px-8 max-w-3xl mx-auto">
        <div className="space-y-8">

          {/* FEED */}
          <div>
            {error ? (
              <ErrorState onRetry={fetchFeed} />
            ) : isLoading ? (
              <div className="space-y-6 animate-pulse">
                <div className="h-56 bg-zinc-900/40 rounded-xl" />
                <div className="h-56 bg-zinc-900/40 rounded-xl" />
              </div>
            ) : (
              <>
                {posts.length === 0 ? (
                  <div className="py-12 text-center border border-dashed border-white/10 rounded-2xl">
                    <Filter className="mx-auto mb-2 text-gray-500" size={16} />
                    <p className="text-gray-500 text-sm">
                      No posts yet
                    </p>
                  </div>
                ) : (
                  posts.map(post => (
                    <div
                      key={post.id}
                      className="bg-zinc-900/40 border border-white/5 rounded-2xl overflow-hidden mb-6"
                    >
                      {/* HEADER */}
                      <div className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <img
                            src={post.author?.profile_photo || '/avatar.png'}
                            alt="author"
                            className="w-8 h-8 rounded-full bg-zinc-700 object-cover"
                          />
                          <div>
                            <p className="font-bold text-sm">
                              @{post.author?.username || 'unknown'}
                            </p>
                          </div>
                        </div>

                        <span className="text-[10px] text-gray-500 flex items-center gap-1">
                          <Clock size={10} />
                          {new Date(post.created_at).toLocaleDateString()}
                        </span>
                      </div>

                      {/* BODY */}
                      <div className="px-4 pb-4">
                        <p className="text-gray-300 mb-3">{post.caption}</p>

                        {post.media_url && (
                          <div className="rounded-xl overflow-hidden mb-4">
                            {post.media_type === 'image' ? (
                              <img
                                src={post.media_url}
                                className="w-full max-h-[500px] object-cover"
                              />
                            ) : (
                              <video
                                src={post.media_url}
                                controls
                                className="w-full max-h-[500px]"
                              />
                            )}
                          </div>
                        )}

                        {/* ACTIONS */}
                        <div className="flex gap-6 text-sm text-gray-400">
                          <button
                            onClick={() => handleLike(post.id)}
                            className={`flex items-center gap-2 transition-colors ${post.user_has_liked ? 'text-red-500' : 'hover:text-white'}`}
                          >
                            <Heart size={18} fill={post.user_has_liked ? "currentColor" : "none"} />
                            {post.likes[0]?.count || 0}
                          </button>
                          <button
                            onClick={() => openComments(post.id)}
                            className="flex items-center gap-2 hover:text-white transition-colors"
                          >
                            <MessageSquare size={18} />
                            {post.comments[0]?.count || 0}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </>
            )}
          </div>
        </div>
      </main>

      {/* COMMENTS SHEET / MODAL */}
      {activePostId && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center items-center bg-black/80 backdrop-blur-sm" onClick={() => setActivePostId(null)}>

          {/* Modal Content */}
          <div
            className="w-full max-w-lg bg-zinc-900 border-t sm:border border-white/10 sm:rounded-2xl h-[80vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/5">
              <h3 className="font-bold text-white">Comments</h3>
              <button onClick={() => setActivePostId(null)} className="p-2 text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {isLoadingComments ? (
                <div className="text-center py-8 text-gray-500">Loading comments...</div>
              ) : comments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No comments yet. Be the first!</div>
              ) : (
                comments.map(comment => (
                  <div key={comment.id} className="flex gap-3">
                    <img
                      src={comment.author?.profile_photo || '/avatar.png'}
                      className="w-8 h-8 rounded-full bg-zinc-800 object-cover shrink-0"
                    />
                    <div>
                      <div className="bg-zinc-800/50 px-3 py-2 rounded-2xl rounded-tl-none">
                        <p className="text-xs font-bold text-gray-300 mb-0.5">@{comment.author?.username || 'unknown'}</p>
                        <p className="text-sm text-white">{comment.content}</p>
                      </div>
                      <span className="text-[10px] text-gray-600 ml-2">
                        {new Date(comment.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-white/5 bg-zinc-900">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && submitComment()}
                  placeholder="Add a comment..."
                  className="flex-1 bg-zinc-800 border-none rounded-full px-4 py-2.5 text-sm text-white focus:ring-1 focus:ring-white/20 outline-none"
                  autoFocus
                />
                <button
                  onClick={submitComment}
                  disabled={!newComment.trim()}
                  className="p-2.5 bg-violet-600 rounded-full text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-violet-700 transition"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Feed;
