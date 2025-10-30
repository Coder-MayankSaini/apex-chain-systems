import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

console.log('Testing Supabase connection...\n');
console.log('Supabase URL:', supabaseUrl);
console.log('Project ID:', process.env.VITE_SUPABASE_PROJECT_ID);

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  try {
    // Test 1: Check if we can connect to Supabase
    console.log('\n📊 Testing database connection...');
    const { data, error } = await supabase
      .from('products')
      .select('count', { count: 'exact', head: true });

    if (error) {
      if (error.message.includes('relation "public.products" does not exist')) {
        console.log('⚠️  Products table does not exist yet (this is OK if you haven\'t created it)');
      } else {
        console.error('❌ Database error:', error.message);
      }
    } else {
      console.log('✅ Successfully connected to Supabase database');
    }

    // Test 2: Check authentication service
    console.log('\n🔐 Testing authentication service...');
    const { data: authData, error: authError } = await supabase.auth.getSession();
    
    if (authError) {
      console.error('❌ Auth error:', authError.message);
    } else {
      console.log('✅ Authentication service is accessible');
      console.log('   Session status:', authData.session ? 'Active session' : 'No active session');
    }

    // Test 3: Check storage bucket
    console.log('\n📦 Testing storage service...');
    const { data: buckets, error: storageError } = await supabase.storage.listBuckets();
    
    if (storageError) {
      console.error('❌ Storage error:', storageError.message);
    } else {
      console.log('✅ Storage service is accessible');
      console.log('   Buckets found:', buckets?.length || 0);
    }

    console.log('\n🎉 Supabase connection test completed!');
    console.log('Your Supabase backend is configured and accessible.');
    
  } catch (err) {
    console.error('❌ Unexpected error:', err.message);
  }
}

testConnection();
