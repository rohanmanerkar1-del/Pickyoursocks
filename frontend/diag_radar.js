import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

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

async function checkDatabase() {
    console.log("=== RADAR DIAGNOSTICS ===\n");

    // 1. Check match_requests table structure
    console.log("1. Checking match_requests table...");
    const { data: matchRequests, error: mrError } = await supabase
        .from('match_requests')
        .select('*')
        .limit(1);

    if (mrError) {
        console.error("❌ match_requests error:", mrError.message);
    } else {
        console.log("✅ match_requests accessible");
        if (matchRequests?.length > 0) {
            console.log("   Columns:", Object.keys(matchRequests[0]).join(", "));
        }
    }

    // 2. Test RPC function
    console.log("\n2. Testing get_radar_matches RPC...");
    const { data: rpcData, error: rpcError } = await supabase.rpc(
        'get_radar_matches',
        {
            current_user_id: '00000000-0000-0000-0000-000000000000',
            selected_sport: 'tennis'
        }
    );

    if (rpcError) {
        console.error("❌ RPC error:", rpcError.message);
        console.error("   Details:", rpcError.details);
        console.error("   Hint:", rpcError.hint);
    } else {
        console.log("✅ RPC function exists and works");
        console.log("   Returned:", rpcData?.length || 0, "results");
    }

    // 3. Test INSERT permission
    console.log("\n3. Testing INSERT permission...");
    const testInsert = await supabase
        .from('match_requests')
        .insert({
            user_id: '00000000-0000-0000-0000-000000000000',
            opponent_id: '00000000-0000-0000-0000-000000000001',
            sport: 'tennis',
            status: 'pending'
        })
        .select();

    if (testInsert.error) {
        console.error("❌ INSERT error:", testInsert.error.message);
        console.error("   Code:", testInsert.error.code);
    } else {
        console.log("✅ INSERT works");
        // Clean up
        await supabase.from('match_requests').delete().eq('id', testInsert.data[0].id);
    }

    // 4. Test profile join
    console.log("\n4. Testing profile join...");
    const { data: joinTest, error: joinError } = await supabase
        .from('match_requests')
        .select(`
            *,
            profiles!user_id (
                id,
                name,
                profile_photo
            )
        `)
        .limit(1);

    if (joinError) {
        console.error("❌ Join error:", joinError.message);
    } else {
        console.log("✅ Profile join works");
    }

    console.log("\n=== DIAGNOSTICS COMPLETE ===");
}

checkDatabase();
