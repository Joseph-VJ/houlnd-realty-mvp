/**
 * Test Supabase connection and query
 * 
 * Usage: npx tsx scripts/setup/test-supabase.ts
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://bkwvcwcbdetflnkhtxum.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJrd3Zjd2NiZGV0Zmxua2h0eHVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5NDUxNTMsImV4cCI6MjA4MDUyMTE1M30.TENNgHkqQUPftIagj0zTmkt3d3wYT26412qwDigc9wg'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testLogin() {
  console.log('🧪 Testing Supabase connection...\n')

  // Test 1: Try to login
  console.log('1️⃣ Testing login with customer@test.com...')
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'customer@test.com',
    password: 'Customer123!'
  })

  if (authError) {
    console.error('❌ Login failed:', authError.message)
    return
  }

  console.log('✅ Login successful!')
  console.log('   User ID:', authData.user?.id)
  console.log('   Email:', authData.user?.email)

  // Test 2: Try to fetch profile
  console.log('\n2️⃣ Testing profile fetch...')
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('id, email, role, full_name')
    .eq('id', authData.user?.id)
    .single()

  if (profileError) {
    console.error('❌ Profile fetch failed:', profileError.message)
    console.error('   Code:', profileError.code)
    console.error('   Details:', profileError.details)
    console.error('   Hint:', profileError.hint)
    return
  }

  console.log('✅ Profile fetched successfully!')
  console.log('   Profile:', profile)

  // Sign out
  await supabase.auth.signOut()
  console.log('\n🎉 All tests passed!')
}

testLogin().catch(console.error)
