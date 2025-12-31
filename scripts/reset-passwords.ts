/**
 * Reset passwords for test users in Supabase Auth
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function resetPasswords() {
  console.log('🔑 Resetting passwords for test users...\n')

  const users = [
    { id: 'e326b15f-325a-4cdc-95aa-7efd4419da88', email: 'customer@test.com', password: 'Customer123!' },
    { id: '43e5ed4e-4bee-49ad-ac2b-d9a8ecb5acf1', email: 'promoter@test.com', password: 'Promoter123!' },
    { id: 'db584d79-d5de-4163-9f02-53ee5a981a18', email: 'admin@test.com', password: 'Admin123!' },
  ]

  for (const user of users) {
    console.log(`📝 Updating password for: ${user.email}`)
    
    const { error } = await supabase.auth.admin.updateUserById(user.id, {
      password: user.password,
      email_confirm: true
    })

    if (error) {
      console.error(`❌ Error: ${error.message}`)
    } else {
      console.log(`✅ Password updated!`)
    }
  }

  console.log('\n🎉 Done! Test with these credentials:')
  console.log('   Customer: customer@test.com / Customer123!')
  console.log('   Promoter: promoter@test.com / Promoter123!')
  console.log('   Admin: admin@test.com / Admin123!')
}

resetPasswords()
