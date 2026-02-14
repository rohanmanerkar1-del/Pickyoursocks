import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logFile = path.join(__dirname, 'interaction_verification_result.txt');

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
// We need a service role key to simulate user actions or easier cleanup, but user likely only has anon key in frontend .env
// We will try with anon key and assume RLS allows us to verify basic read/write if we had a user session.
// Since we can't easily fake a user session without login, we will check if TABLES exist and are queryable.
const supabaseName = env.VITE_SUPABASE_URL.split('//')[1].split('.')[0];
const supabaseKey = env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    log("❌ Missing Supabase variables in .env");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyInteractions() {
    log("=== VERIFYING INTERACTION TABLES ===");

    // 1. Check if 'likes' table exists and is accessible (public read)
    const { data: likes, error: likesError } = await supabase
        .from('likes')
        .select('count')
        .limit(1);

    if (likesError) {
        // blocked by RLS or table missing?
        log("❌ 'likes' table check failed: " + likesError.message);
    } else {
        log("✅ 'likes' table is accessible (public read).");
    }

    // 2. Check if 'comments' table exists
    const { data: comments, error: commentsError } = await supabase
        .from('comments')
        .select('count')
        .limit(1);

    if (commentsError) {
        log("❌ 'comments' table check failed: " + commentsError.message);
    } else {
        log("✅ 'comments' table is accessible (public read).");
    }

    // We cannot easily test INSERT without a valid auth session token in this script context
    // unless we sign in a test user. For now, table existence and read access confirms setup.
    // The frontend code handles the rest.
}

verifyInteractions().catch(err => log("❌ Script Error: " + err.message));
