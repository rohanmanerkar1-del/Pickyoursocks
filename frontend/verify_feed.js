import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logFile = path.join(__dirname, 'feed_verification_result.txt');

function log(message) {
    console.log(message);
    try {
        fs.appendFileSync(logFile, message + '\n');
    } catch (e) { }
}

if (fs.existsSync(logFile)) fs.unlinkSync(logFile);

// Manual .env parsing
const envPath = path.join(__dirname, '.env');
let env = {};

try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
            env[key.trim()] = value.trim().replace(/^"|"$/g, '');
        }
    });
} catch (error) {
    log("❌ Could not read .env file: " + error.message);
    process.exit(1);
}

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    log("❌ Missing Supabase variables in .env");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function verifyFeed() {
    log("=== VERIFYING FEED (Explicit FK) ===");

    log("Fetching posts with explicit 'posts_user_id_fkey'...");

    // Try with explicit FK
    const { data, error } = await supabase
        .from('posts')
        .select(`
          id,
          caption,
          media_url,
          media_type,
          sport,
          created_at,
          author:profiles!posts_user_id_fkey (
            username,
            profile_photo
          )
        `)
        .order('created_at', { ascending: false })
        .limit(5);

    if (error) {
        log("❌ FAIL (posts_user_id_fkey): " + error.message);

        // If that failed, try the *other* one hinted: fk_posts_user
        log("   Retrying with 'fk_posts_user'...");
        const { data: data2, error: error2 } = await supabase
            .from('posts')
            .select(`
                id,
                author:profiles!fk_posts_user (username)
            `)
            .limit(1);

        if (error2) {
            log("❌ FAIL (fk_posts_user): " + error2.message);
        } else {
            log("✅ SUCCESS with 'fk_posts_user'!");
        }

    } else {
        log("✅ SUCCESS with 'posts_user_id_fkey'!");
        log("   Count: " + (data?.length || 0));
    }
}

verifyFeed().catch(err => log("❌ Script Error: " + err.message));
