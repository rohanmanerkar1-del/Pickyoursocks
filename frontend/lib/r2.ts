const API = import.meta.env.VITE_BACKEND_URL;

if (!API) {
  console.warn('VITE_BACKEND_URL is not defined');
}

/* =======================
   Upload Profile Photo
======================= */
export const uploadProfilePhoto = async (file: File, userId: string) => {
  const fd = new FormData();
  fd.append('file', file);
  fd.append('userId', userId);

  const res = await fetch(`${API}/api/upload/profile-photo`, {
    method: 'POST',
    body: fd,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Profile photo upload failed: ${text}`);
  }

  const data = await res.json();

  if (!data?.url) {
    throw new Error('No URL returned from profile photo upload');
  }

  return data.url as string;
};

/* =======================
   Upload Post Media
======================= */
export const uploadPostMedia = async (file: File, userId: string) => {
  const fd = new FormData();
  fd.append('file', file);
  fd.append('userId', userId);

  const res = await fetch(`${API}/api/upload/post-media`, {
    method: 'POST',
    body: fd,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Post media upload failed: ${text}`);
  }

  const data = await res.json();

  if (!data?.url) {
    throw new Error('No URL returned from post media upload');
  }

  return data.url as string;
};
