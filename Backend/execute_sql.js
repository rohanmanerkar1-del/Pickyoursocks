const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
// ideally use SERVICE_ROLE key for migrations, but ANON might work if policies allow 
// OR simpler: just print the SQL and ask user to run it? 
// No, I have execute_sql tool capabilities usually via mcp, but let's try direct connection if possible.
// Wait, I don't have direct SQL access tool. I have to use the backend or Supabase dashboard.
// I will assume the user has a way to run SQL or I'll try to run it via the existing backend connection if available.
// Actually, looking at previous steps, I don't see a "run_sql" tool.
// I will use a simple node script that connects using the `supabase-js` client 
// BUT standard `supabase-js` cannot run raw SQL unless there is an RPC function for it.
// Let's check if there is an `exec_sql` RPC function.

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    const sql = fs.readFileSync(path.join(__dirname, 'migrations', 'create_friendships.sql'), 'utf8');

    // Try to use a likely RPC function if it exists, or just log it.
    // Since I effectively cannot run DDL (CREATE TABLE) via standard client without Service Role or RPC...
    // I will try to use the `rpc` method if a generic sql exec function exists.
    // If not, I'll have to ask the user to run it or use a workaround.

    console.log("SQL TO RUN:");
    console.log(sql);

    // Attempting to run via RPC 'exec_sql' or similar if previously set up
    const { data, error } = await supabase.rpc('exec_sql', { query: sql });

    if (error) {
        console.error("RPC Error (expected if exec_sql doesn't exist):", error);
        console.log("\nIMPORTANT: Please run the SQL in 'backend/migrations/create_friendships.sql' manually in your Supabase Dashboard SQL Editor.");
    } else {
        console.log("Migration successful:", data);
    }
}

run();
