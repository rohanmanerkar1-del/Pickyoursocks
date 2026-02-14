import { supabase } from './supabase';

/* =======================
   Fetch Profile (SAFE)
======================= */

export const fetchProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.warn('fetchProfile error:', error.message);
    return null;
  }

  return data;
};

/* =======================
   Update Profile (SAFE)
======================= */

export const updateProfile = async (
  userId: string,
  updates: Record<string, any>
) => {
  const { error } = await supabase
    .from('profiles')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);

  if (error) {
    console.error('updateProfile error:', error.message);
    throw error;
  }
};
