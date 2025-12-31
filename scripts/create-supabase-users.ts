/**
 * Create test users in Supabase Auth + Database
 * This creates users in both auth.users and public.users tables
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables!')
  console.error('Required:')
  console.error('  - NEXT_PUBLIC_SUPABASE_URL')
  console.error('  - SUPABASE_SERVICE_ROLE_KEY (from Supabase Dashboard → Settings → API)')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function createUser(email: string, password: string, fullName: string, role: 'CUSTOMER' | 'PROMOTER' | 'ADMIN', phone: string) {
  console.log(`\n📝 Creating user: ${email}`)
  
  try {
    // Step 1: Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-verify email
      user_metadata: {
        full_name: fullName
      }
    })

    if (authError) {
      console.error(`❌ Auth error:`, authError.message)
      return
    }

    if (!authData.user) {
      console.error(`❌ No user created`)
      return
    }

    console.log(`✅ Created in auth.users: ${authData.user.id}`)

    // Step 2: Create/Update user in public.users table
    const { error: profileError } = await supabase
      .from('users')
      .upsert({
        id: authData.user.id,
        email,
        full_name: fullName,
        phone_e164: phone,
        role,
        is_verified: true,
        created_at: new Date().toISOString()
      })

    if (profileError) {
      console.error(`❌ Profile error:`, profileError.message)
      return
    }

    console.log(`✅ Created in public.users`)
    console.log(`   Email: ${email}`)
    console.log(`   Password: ${password}`)
    console.log(`   Role: ${role}`)
  } catch (error) {
    console.error(`❌ Error:`, error)
  }
}

async function main() {
  console.log('🌱 Creating test users in Supabase...\n')

  // Create test users
  await createUser(
    'customer@test.com',
    'Customer123!',
    'Test Customer',
    'CUSTOMER',
    '+919876543211'
  )

  await createUser(
    'promoter@test.com',
    'Promoter123!',
    'Test Promoter',
    'PROMOTER',
    '+919876543210'
  )

  await createUser(
    'admin@test.com',
    'Admin123!',
    'Test Admin',
    'ADMIN',
    '+919876543212'
  )

  console.log('\n🎉 All users created successfully!')
  console.log('\n📝 Test Credentials:')
  console.log('   Customer: customer@test.com / Customer123!')
  console.log('   Promoter: promoter@test.com / Promoter123!')
  console.log('   Admin: admin@test.com / Admin123!')
}

main()
