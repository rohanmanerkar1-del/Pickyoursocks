import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: './frontend/.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkPosts() {
    console.log("Checking 'posts' table...");
    const { data, error } = await supabase
        .from('posts')
        .select(`
            *,
            profiles (
                username,
                profile_photo
            )
        `)
        .limit(5);

    if (error) {
        console.error("❌ posts fetch error:", error);
    } else {
        console.log("✅ posts fetch success:", data?.length, "items found");
        console.log("First item:", JSON.stringify(data?.[0], null, 2));
    }
}

checkPosts();
