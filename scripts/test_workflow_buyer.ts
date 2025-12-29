/**
 * BUYER/CUSTOMER WORKFLOW TEST SCRIPT
 *
 * Tests the complete buyer journey in offline mode:
 * 1. Create customer account
 * 2. Search for listings
 * 3. View listing details
 * 4. Unlock contact (FREE)
 * 5. Save property
 * 6. Verify dashboard shows saved properties
 *
 * Run with: npx tsx scripts/test_workflow_buyer.ts
 */

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import * as jose from 'jose'

const prisma = new PrismaClient()

// Test constants
const TEST_CUSTOMER_EMAIL = `test_buyer_${Date.now()}@test.com`
const TEST_CUSTOMER_PASSWORD = 'TestBuyer123!'
const TEST_CUSTOMER_NAME = 'Test Buyer User'
const TEST_CUSTOMER_PHONE = '+911234567890'
const JWT_SECRET = process.env.JWT_SECRET || 'offline-test-secret-key'

let testCustomerId: string
let testToken: string
let testListingId: string

async function cleanup() {
  console.log('\n🧹 Cleaning up test data...')

  try {
    if (testCustomerId) {
      await prisma.savedProperty.deleteMany({
        where: { userId: testCustomerId }
      })
      await prisma.unlock.deleteMany({
        where: { userId: testCustomerId }
      })
      await prisma.user.delete({
        where: { id: testCustomerId }
      })
    }
  } catch (error) {
    console.error('Cleanup error (non-critical):', error)
  }

  await prisma.$disconnect()
}

async function step1_CreateAccount() {
  console.log('\n📝 STEP 1: Create Customer Account')
  console.log('----------------------------------------')

  try {
    // Hash password
    const passwordHash = await bcrypt.hash(TEST_CUSTOMER_PASSWORD, 10)

    // Create user
    const user = await prisma.user.create({
      data: {
        email: TEST_CUSTOMER_EMAIL,
        passwordHash,
        fullName: TEST_CUSTOMER_NAME,
        phoneE164: TEST_CUSTOMER_PHONE,
        role: 'CUSTOMER',
        isVerified: true
      }
    })

    testCustomerId = user.id

    // Generate JWT token
    const secret = new TextEncoder().encode(JWT_SECRET)
    const token = await new jose.SignJWT({ sub: user.id, role: user.role })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('7d')
      .sign(secret)

    testToken = token

    console.log('✅ Customer account created')
    console.log(`   ID: ${user.id}`)
    console.log(`   Email: ${user.email}`)
    console.log(`   Role: ${user.role}`)
    console.log(`   Token: ${token.substring(0, 20)}...`)

    return { success: true }
  } catch (error) {
    console.error('❌ FAILED:', error)
    return { success: false, error }
  }
}

async function step2_SearchListings() {
  console.log('\n🔍 STEP 2: Search for LIVE Listings')
  console.log('----------------------------------------')

  try {
    const listings = await prisma.listing.findMany({
      where: {
        status: 'LIVE'
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    })

    console.log(`✅ Found ${listings.length} LIVE listings`)

    if (listings.length === 0) {
      console.error('❌ CRITICAL: No LIVE listings found! Cannot continue test.')
      console.log('   Please run: npx prisma db seed')
      return { success: false }
    }

    // Pick first listing for testing
    testListingId = listings[0].id

    console.log(`   Using listing: ${testListingId}`)
    console.log(`   Property: ${listings[0].propertyType} in ${listings[0].city}`)
    console.log(`   Price: ₹${listings[0].totalPrice.toLocaleString()}`)
    console.log(`   Price/sqft: ₹${listings[0].pricePerSqft.toLocaleString()}`)

    return { success: true }
  } catch (error) {
    console.error('❌ FAILED:', error)
    return { success: false, error }
  }
}

async function step3_ViewListingDetails() {
  console.log('\n👀 STEP 3: View Listing Details')
  console.log('----------------------------------------')

  try {
    const listing = await prisma.listing.findUnique({
      where: { id: testListingId },
      include: {
        promoter: {
          select: {
            id: true,
            fullName: true,
            phoneE164: true
          }
        }
      }
    })

    if (!listing) {
      console.error('❌ FAILED: Listing not found')
      return { success: false }
    }

    console.log('✅ Listing details retrieved')
    console.log(`   Property Type: ${listing.propertyType}`)
    console.log(`   Location: ${listing.city}, ${listing.locality}`)
    console.log(`   Price: ₹${listing.totalPrice.toLocaleString()}`)
    console.log(`   Area: ${listing.totalSqft} sqft`)
    console.log(`   Bedrooms: ${listing.bedrooms || 'N/A'}`)
    console.log(`   Bathrooms: ${listing.bathrooms || 'N/A'}`)
    console.log(`   Status: ${listing.status}`)
    console.log(`   Promoter: ${listing.promoter.fullName}`)
    console.log(`   Promoter Phone (masked): +91******${listing.promoter.phoneE164?.slice(-2) || '00'}`)

    return { success: true }
  } catch (error) {
    console.error('❌ FAILED:', error)
    return { success: false, error }
  }
}

async function step4_UnlockContact() {
  console.log('\n🔓 STEP 4: Unlock Contact (FREE)')
  console.log('----------------------------------------')

  try {
    // Check if already unlocked
    const existing = await prisma.unlock.findFirst({
      where: {
        userId: testCustomerId,
        listingId: testListingId
      }
    })

    if (existing) {
      console.log('⚠️  Contact already unlocked')
      return { success: true, alreadyUnlocked: true }
    }

    // Create unlock record (FREE)
    const unlock = await prisma.unlock.create({
      data: {
        userId: testCustomerId,
        listingId: testListingId,
        paymentProvider: 'FREE_OFFLINE',
        paymentRef: `free_${Date.now()}`
      }
    })

    // Get full contact
    const listing = await prisma.listing.findUnique({
      where: { id: testListingId },
      include: {
        promoter: {
          select: {
            phoneE164: true,
            fullName: true
          }
        }
      }
    })

    console.log('✅ Contact unlocked successfully (FREE)')
    console.log(`   Unlock ID: ${unlock.id}`)
    console.log(`   Full Phone: ${listing?.promoter.phoneE164}`)
    console.log(`   Promoter: ${listing?.promoter.fullName}`)
    console.log(`   Payment: FREE (₹0)`)

    return { success: true, alreadyUnlocked: false }
  } catch (error) {
    console.error('❌ FAILED:', error)
    return { success: false, error }
  }
}

async function step5_SaveProperty() {
  console.log('\n❤️  STEP 5: Save Property')
  console.log('----------------------------------------')

  try {
    // Check if already saved
    const existing = await prisma.savedProperty.findFirst({
      where: {
        userId: testCustomerId,
        listingId: testListingId
      }
    })

    if (existing) {
      console.log('⚠️  Property already saved')
      return { success: true, alreadySaved: true }
    }

    // Create saved property
    const saved = await prisma.savedProperty.create({
      data: {
        userId: testCustomerId,
        listingId: testListingId
      }
    })

    console.log('✅ Property saved successfully')
    console.log(`   Saved ID: ${saved.id}`)

    return { success: true, alreadySaved: false }
  } catch (error) {
    console.error('❌ FAILED:', error)
    return { success: false, error }
  }
}

async function step6_VerifyDashboard() {
  console.log('\n📊 STEP 6: Verify Dashboard Data')
  console.log('----------------------------------------')

  try {
    // Get saved properties count
    const savedCount = await prisma.savedProperty.count({
      where: { userId: testCustomerId }
    })

    // Get unlocked contacts count
    const unlockedCount = await prisma.unlock.count({
      where: { userId: testCustomerId }
    })

    // Get saved properties with details
    const savedProperties = await prisma.savedProperty.findMany({
      where: { userId: testCustomerId },
      include: {
        listing: {
          select: {
            id: true,
            propertyType: true,
            city: true,
            totalPrice: true
          }
        }
      }
    })

    console.log('✅ Dashboard data verified')
    console.log(`   Saved Properties: ${savedCount}`)
    console.log(`   Unlocked Contacts: ${unlockedCount}`)

    if (savedCount > 0) {
      console.log('\n   Saved Properties List:')
      savedProperties.forEach((sp: any) => {
        console.log(`   - ${sp.listing.propertyType} in ${sp.listing.city} (₹${sp.listing.totalPrice.toLocaleString()})`)
      })
    }

    // Verify expected counts
    if (savedCount < 1) {
      console.error('❌ FAILED: Expected at least 1 saved property')
      return { success: false }
    }

    if (unlockedCount < 1) {
      console.error('❌ FAILED: Expected at least 1 unlocked contact')
      return { success: false }
    }

    return { success: true }
  } catch (error) {
    console.error('❌ FAILED:', error)
    return { success: false, error }
  }
}

async function runBuyerWorkflowTest() {
  console.log('\n' + '='.repeat(60))
  console.log('🧪 BUYER WORKFLOW TEST - Houlnd Realty Offline MVP')
  console.log('='.repeat(60))

  const results = []

  try {
    // Step 1: Create Account
    const step1 = await step1_CreateAccount()
    results.push({ step: 1, name: 'Create Account', ...step1 })
    if (!step1.success) {
      console.log('\n❌ Test failed at Step 1')
      return
    }

    // Step 2: Search Listings
    const step2 = await step2_SearchListings()
    results.push({ step: 2, name: 'Search Listings', ...step2 })
    if (!step2.success) {
      console.log('\n❌ Test failed at Step 2')
      return
    }

    // Step 3: View Listing Details
    const step3 = await step3_ViewListingDetails()
    results.push({ step: 3, name: 'View Listing Details', ...step3 })
    if (!step3.success) {
      console.log('\n❌ Test failed at Step 3')
      return
    }

    // Step 4: Unlock Contact
    const step4 = await step4_UnlockContact()
    results.push({ step: 4, name: 'Unlock Contact (FREE)', ...step4 })
    if (!step4.success) {
      console.log('\n❌ Test failed at Step 4')
      return
    }

    // Step 5: Save Property
    const step5 = await step5_SaveProperty()
    results.push({ step: 5, name: 'Save Property', ...step5 })
    if (!step5.success) {
      console.log('\n❌ Test failed at Step 5')
      return
    }

    // Step 6: Verify Dashboard
    const step6 = await step6_VerifyDashboard()
    results.push({ step: 6, name: 'Verify Dashboard', ...step6 })
    if (!step6.success) {
      console.log('\n❌ Test failed at Step 6')
      return
    }

    // All steps passed
    console.log('\n' + '='.repeat(60))
    console.log('✓ WORKFLOW PASSED: BUYER')
    console.log('='.repeat(60))
    console.log('\nAll steps completed successfully:')
    results.forEach(r => {
      console.log(`  ✓ Step ${r.step}: ${r.name}`)
    })
    console.log('\n🎉 Buyer workflow is fully functional!')

  } catch (error) {
    console.error('\n❌ WORKFLOW FAILED: Unexpected error')
    console.error(error)
  } finally {
    await cleanup()
  }
}

// Run the test
runBuyerWorkflowTest()
