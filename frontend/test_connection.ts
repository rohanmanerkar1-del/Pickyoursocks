import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Use process.cwd() since we are running from project root
const envPath = path.resolve(process.cwd(), '.env');

if (fs.existsSync(envPath)) {
    const envConfig = dotenv.parse(fs.readFileSync(envPath));
    for (const k in envConfig) {
        process.env[k] = envConfig[k];
    }
} else {
    console.error(`❌ .env not found at ${envPath}`);
    process.exit(1);
}

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing Supabase environment variables!');
    console.log('URL:', supabaseUrl);
    console.log('KEY:', supabaseAnonKey ? 'Found' : 'Missing');
    process.exit(1);
}

console.log('Connecting to:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
    console.log('⚡ Starting connection test...');
    const startTime = Date.now();

    try {
        // Test 1: Simple health check (fetching 1 profile)
        const { data, error } = await supabase
            .from('profiles')
            .select('id, username')
            .limit(1)
            .single();

        const duration = Date.now() - startTime;

        if (error) {
            console.error('❌ Query Failed:', error.message);
            console.error('Details:', error);
        } else {
            console.log(`✅ Success! Query took ${duration}ms`);
            console.log('Sample Data:', data);
        }

    } catch (err) {
        console.error('❌ Unexpected Error:', err);
    }
}

testConnection();
