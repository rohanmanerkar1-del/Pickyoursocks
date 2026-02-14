import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Manual .env parsing
const envContent = fs.readFileSync('.env', 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
        env[key.trim()] = value.trim().replace(/^"|"$/g, '');
    }
});

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error("❌ Missing Supabase variables in .env");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkPosts() {
    console.log("Checking 'posts' table...");
    try {
        const { data, error } = await supabase
            .from('posts')
            .select(`
                *
            `)
            .limit(5);

        if (error) {
            console.error("❌ posts fetch error:", error);
            console.error("Error details:", JSON.stringify(error, null, 2));
        } else {
            console.log("✅ posts fetch success:", data?.length, "items found");
            if (data?.length > 0) {
                console.log("Columns found:", Object.keys(data[0]).join(", "));
                console.log("First item sample:", JSON.stringify(data[0], null, 2).substring(0, 500));
            }
        }
    } catch (err) {
        console.error("❌ CRASH during fetch:", err);
    }
}

checkPosts();
