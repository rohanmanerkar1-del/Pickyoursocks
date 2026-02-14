import { X } from 'lucide-react';
import { useState } from 'react';
import { uploadPostMedia } from '../lib/r2';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { SPORTS } from '../constants';

const CreatePostModal = ({ onClose }: { onClose: () => void }) => {
  const { user } = useAuth();

  if (!user) return null;

  const [caption, setCaption] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const [sport, setSport] = useState<string>('');
  const [customSport, setCustomSport] = useState('');

  const finalSport =
    sport === 'other'
      ? customSport.trim().toLowerCase()
      : sport;

const handlePost = async () => {
  if (!finalSport) {
    alert('Please select or enter a sport');
    return;
  }

  if (loading) return;

  setLoading(true);

  let cancelled = false;

  // ⏱ HARD TIMEOUT (prevents infinite hang)
  const timeout = setTimeout(() => {
    cancelled = true;
    setLoading(false);
    alert('Post timed out. Please try again.');
  }, 15000); // 15 seconds max

  try {
    let media_url: string | null = null;
    let media_type: 'text' | 'image' | 'video' = 'text';

    // 1️⃣ Upload media
    if (file) {
      media_url = await uploadPostMedia(file, user.id);
      media_type = file.type.startsWith('video') ? 'video' : 'image';
    }

    if (cancelled) return;

    // 2️⃣ Insert post (FORCE RESPONSE)
    const { data, error } = await supabase
      .from('posts')
      .insert({
        user_id: user.id,
        caption,
        sport: finalSport,
        media_url,
        media_type,
      })
      .select()
      .single();

    if (cancelled) return;
    if (error) throw error;

    console.log('Post created:', data);

    // 3️⃣ RESET STATE FIRST
    setLoading(false);
    clearTimeout(timeout);

    // 4️⃣ THEN CLOSE MODAL
    onClose();

  } catch (err) {
    console.error('Post failed:', err);
    clearTimeout(timeout);
    setLoading(false);
    alert('Failed to create post');
  }
};



  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center">
      <div className="bg-zinc-900 w-full max-w-md rounded-2xl p-6 relative">

        {/* CLOSE */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <X />
        </button>

        <h2 className="text-lg font-bold mb-4">Create Post</h2>

        {/* CAPTION */}
        <textarea
          value={caption}
          onChange={e => setCaption(e.target.value)}
          placeholder="What’s on your mind?"
          className="w-full bg-zinc-800 p-3 rounded-lg mb-3 text-sm"
          rows={3}
        />

        {/* SPORT */}
        <select
          value={sport}
          onChange={e => setSport(e.target.value)}
          className="w-full bg-zinc-800 p-2 rounded-lg mb-3 text-sm"
        >
          <option value="" disabled>
            Select sport
          </option>

          {user.sports?.map(sid => {
            const s = SPORTS.find(x => x.id === sid);
            return (
              <option key={sid} value={sid}>
                {s?.name ?? sid}
              </option>
            );
          })}

          <option value="other">Other</option>
        </select>

        {sport === 'other' && (
          <input
            type="text"
            placeholder="Enter sport name"
            value={customSport}
            onChange={e => setCustomSport(e.target.value)}
            className="w-full bg-zinc-800 p-2 rounded-lg mb-3 text-sm"
          />
        )}

        {/* MEDIA */}
        <input
          type="file"
          accept="image/*,video/*"
          onChange={e => setFile(e.target.files?.[0] || null)}
          className="mb-4 text-sm"
        />

        {/* SUBMIT */}
        <button
          onClick={handlePost}
          disabled={loading}
          className="w-full bg-blue-600 py-2 rounded-lg font-bold disabled:opacity-50"
        >
          {loading ? 'Posting…' : 'Post'}
        </button>
      </div>
    </div>
  );
};

export default CreatePostModal;
