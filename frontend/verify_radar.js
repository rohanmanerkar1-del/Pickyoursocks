import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logFile = path.join(__dirname, 'verification_result.txt');

function log(message) {
    console.log(message);
    try {
        fs.appendFileSync(logFile, message + '\n');
    } catch (e) { }
}

// Clear log file
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

async function verifyRadar() {
    log("=== VERIFYING RADAR SETUP ===");

    const testUserId = '00000000-0000-0000-0000-000000000000';

    // Test 1: New Signature (v3)
    log("Attempt 1: Testing 'get_radar_matches' (v3 signature)...");
    let { data, error } = await supabase.rpc(
        'get_radar_matches',
        {
            _current_user_id: testUserId,
            _selected_sport: 'tennis'
        }
    );

    if (!error) {
        log("✅ SUCCESS: Radar (v3) is correctly installed!");
        return;
    }

    log("   Failed: " + error.message + " (Code: " + error.code + ")");

    // Test 2: Old Signature (v1/v2)
    log("\nAttempt 2: Testing 'get_radar_matches' (v1/v2 signature)...");
    const { data: dataOld, error: errorOld } = await supabase.rpc(
        'get_radar_matches',
        {
            current_user_id: testUserId,
            selected_sport: 'tennis'
        }
    );

    if (!errorOld) {
        log("⚠️ WARNING: Radar is installed but using OLD version (v1/v2).");
        log("   It may crash with 'ambiguous column' errors.");
        log("   Please UPDATE by running the latest 'radar_setup_v2.sql'.");
        return;
    } else if (errorOld.code === '42702') { // Ambiguous column
        log("❌ DETECTED BUGGY VERSION: Function exists but has 'ambiguous column' error.");
        log("   Please UPDATE by running the latest 'radar_setup_v2.sql'.");
        return;
    }

    log("   Failed: " + errorOld.message);

    log("\n❌ CONCLUSION: Radar function NOT FOUND or BROKEN.");
    log("   Please run 'radar_setup_v2.sql' in Supabase SQL Editor.");
}

verifyRadar().catch(err => log("❌ Script Error: " + err.message));
