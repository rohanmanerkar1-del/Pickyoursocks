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

async function testRadar() {
    console.log("=== TESTING UPDATED RADAR ===\n");

    // 1. Test profile join with explicit foreign key
    console.log("1. Testing explicit foreign key join...");
    const { data: joinTest, error: joinError } = await supabase
        .from('match_requests')
        .select(`
            *,
            challenger:profiles!match_requests_user_id_fkey (
                id,
                name,
                profile_photo,
                elo
            )
        `)
        .limit(1);

    if (joinError) {
        console.error("❌ Join error:", joinError.message);
    } else {
        console.log("✅ Explicit foreign key join works!");
        if (joinTest?.length > 0) {
            console.log("   Sample data:", {
                id: joinTest[0].id,
                sport: joinTest[0].sport,
                status: joinTest[0].status,
                challenger_name: joinTest[0].challenger?.name
            });
        }
    }

    // 2. Test INSERT
    console.log("\n2. Testing INSERT...");
    const testUserId = '00000000-0000-0000-0000-000000000000';
    const testOpponentId = '00000000-0000-0000-0000-000000000001';

    const { data: insertData, error: insertError } = await supabase
        .from('match_requests')
        .insert({
            user_id: testUserId,
            opponent_id: testOpponentId,
            sport: 'tennis',
            status: 'pending'
        })
        .select();

    if (insertError) {
        console.error("❌ INSERT error:", insertError.message);
        console.error("   Code:", insertError.code);
        console.error("   Details:", insertError.details);
    } else {
        console.log("✅ INSERT works!");
        // Clean up
        if (insertData?.[0]?.id) {
            await supabase.from('match_requests').delete().eq('id', insertData[0].id);
            console.log("   Test record cleaned up");
        }
    }

    // 3. Test RPC
    console.log("\n3. Testing get_radar_matches RPC...");
    const { data: rpcData, error: rpcError } = await supabase.rpc(
        'get_radar_matches',
        {
            current_user_id: testUserId,
            selected_sport: 'tennis'
        }
    );

    if (rpcError) {
        console.error("❌ RPC error:", rpcError.message);
        console.error("   Details:", rpcError.details);
        console.error("   Hint:", rpcError.hint);
    } else {
        console.log("✅ RPC works!");
        console.log("   Returned", rpcData?.length || 0, "matches");
    }

    console.log("\n=== TEST COMPLETE ===");
    console.log("\nNext steps:");
    console.log("1. Run radar_setup.sql in Supabase SQL Editor");
    console.log("2. Test creating a challenge from one account");
    console.log("3. Verify it appears on another account");
}

testRadar();
