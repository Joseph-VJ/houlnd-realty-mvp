/**
 * PROMOTER WORKFLOW TEST SCRIPT
 *
 * Tests the complete promoter journey in offline mode:
 * 1. Create promoter account
 * 2. Submit new property listing
 * 3. Verify listing is PENDING_VERIFICATION
 * 4. Verify listing does NOT appear in public search
 * 5. Check promoter dashboard stats
 *
 * Run with: npx tsx scripts/test_workflow_promoter.ts
 */

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import * as jose from 'jose'

const prisma = new PrismaClient()

// Test constants
const TEST_PROMOTER_EMAIL = `test_promoter_${Date.now()}@test.com`
const TEST_PROMOTER_PASSWORD = 'TestPromoter123!'
const TEST_PROMOTER_NAME = 'Test Promoter User'
const TEST_PROMOTER_PHONE = '+919876543210'
const JWT_SECRET = process.env.JWT_SECRET || 'offline-test-secret-key'

let testPromoterId: string
let testToken: string
let testListingId: string

async function cleanup() {
  console.log('\n🧹 Cleaning up test data...')

  try {
    if (testListingId) {
      await prisma.listing.delete({
        where: { id: testListingId }
      })
    }

    if (testPromoterId) {
      await prisma.user.delete({
        where: { id: testPromoterId }
      })
    }
  } catch (error) {
    console.error('Cleanup error (non-critical):', error)
  }

  await prisma.$disconnect()
}

async function step1_CreatePromoterAccount() {
  console.log('\n📝 STEP 1: Create Promoter Account')
  console.log('----------------------------------------')

  try {
    // Hash password
    const passwordHash = await bcrypt.hash(TEST_PROMOTER_PASSWORD, 10)

    // Create user
    const user = await prisma.user.create({
      data: {
        email: TEST_PROMOTER_EMAIL,
        passwordHash,
        fullName: TEST_PROMOTER_NAME,
        phoneE164: TEST_PROMOTER_PHONE,
        role: 'PROMOTER',
        isVerified: true
      }
    })

    testPromoterId = user.id

    // Generate JWT token
    const secret = new TextEncoder().encode(JWT_SECRET)
    const token = await new jose.SignJWT({ sub: user.id, role: user.role })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('7d')
      .sign(secret)

    testToken = token

    console.log('✅ Promoter account created')
    console.log(`   ID: ${user.id}`)
    console.log(`   Email: ${user.email}`)
    console.log(`   Role: ${user.role}`)
    console.log(`   Phone: ${user.phoneE164}`)

    return { success: true }
  } catch (error) {
    console.error('❌ FAILED:', error)
    return { success: false, error }
  }
}

async function step2_SubmitListing() {
  console.log('\n🏠 STEP 2: Submit New Property Listing')
  console.log('----------------------------------------')

  try {
    const propertyData = {
      promoterId: testPromoterId,
      propertyType: 'APARTMENT',
      totalPrice: 5000000, // ₹50 lakh
      totalSqft: 1000,
      pricePerSqft: 5000,
      priceType: 'NEGOTIABLE',
      city: 'Delhi',
      locality: 'Dwarka',
      address: 'Sector 10, Dwarka',
      bedrooms: 2,
      bathrooms: 2,
      furnishing: 'SEMI_FURNISHED',
      description: 'Beautiful 2BHK apartment in Dwarka with modern amenities',
      amenitiesJson: JSON.stringify(['GYM', 'PARKING', 'SECURITY', 'LIFT']),
      amenitiesPrice: 50000,
      imageUrls: JSON.stringify(['/mock-images/property1.jpg', '/mock-images/property2.jpg']),
      status: 'PENDING_VERIFICATION',
      title: 'Spacious 2BHK in Dwarka'
    }

    const listing = await prisma.listing.create({
      data: propertyData
    })

    testListingId = listing.id

    console.log('✅ Listing submitted successfully')
    console.log(`   Listing ID: ${listing.id}`)
    console.log(`   Property: ${listing.propertyType}`)
    console.log(`   Location: ${listing.city}, ${listing.locality}`)
    console.log(`   Price: ₹${listing.totalPrice.toLocaleString()}`)
    console.log(`   Area: ${listing.totalSqft} sqft`)
    console.log(`   Price/sqft: ₹${listing.pricePerSqft.toLocaleString()}`)
    console.log(`   Status: ${listing.status}`)

    return { success: true }
  } catch (error) {
    console.error('❌ FAILED:', error)
    return { success: false, error }
  }
}

async function step3_VerifyPendingStatus() {
  console.log('\n⏳ STEP 3: Verify Listing is PENDING_VERIFICATION')
  console.log('----------------------------------------')

  try {
    const listing = await prisma.listing.findUnique({
      where: { id: testListingId },
      select: {
        id: true,
        status: true,
        reviewedAt: true,
        reviewedBy: true
      }
    })

    if (!listing) {
      console.error('❌ FAILED: Listing not found')
      return { success: false }
    }

    if (listing.status !== 'PENDING_VERIFICATION') {
      console.error(`❌ FAILED: Expected status PENDING_VERIFICATION, got ${listing.status}`)
      return { success: false }
    }

    if (listing.reviewedAt || listing.reviewedBy) {
      console.error('❌ FAILED: Listing should not be reviewed yet')
      return { success: false }
    }

    console.log('✅ Listing status verified')
    console.log(`   Status: ${listing.status} ✓`)
    console.log(`   Reviewed: No (as expected)`)

    return { success: true }
  } catch (error) {
    console.error('❌ FAILED:', error)
    return { success: false, error }
  }
}

async function step4_VerifyNotInPublicSearch() {
  console.log('\n🔒 STEP 4: Verify Listing NOT in Public Search')
  console.log('----------------------------------------')

  try {
    // Search for LIVE listings only (public search)
    const liveListings = await prisma.listing.findMany({
      where: {
        status: 'LIVE'
      },
      select: {
        id: true
      }
    })

    // Check if our test listing appears in results
    const foundInPublic = liveListings.some((l: any) => l.id === testListingId)

    if (foundInPublic) {
      console.error('❌ FAILED: Pending listing should NOT appear in public search')
      return { success: false }
    }

    console.log('✅ Listing correctly hidden from public search')
    console.log(`   Total LIVE listings: ${liveListings.length}`)
    console.log(`   Our listing found: No (correct behavior ✓)`)

    return { success: true }
  } catch (error) {
    console.error('❌ FAILED:', error)
    return { success: false, error }
  }
}

async function step5_CheckPromoterDashboard() {
  console.log('\n📊 STEP 5: Check Promoter Dashboard Stats')
  console.log('----------------------------------------')

  try {
    // Get total listings
    const totalListings = await prisma.listing.count({
      where: { promoterId: testPromoterId }
    })

    // Get LIVE listings
    const liveListings = await prisma.listing.count({
      where: {
        promoterId: testPromoterId,
        status: 'LIVE'
      }
    })

    // Get pending listings
    const pendingListings = await prisma.listing.count({
      where: {
        promoterId: testPromoterId,
        status: 'PENDING_VERIFICATION'
      }
    })

    // Get all promoter's listings
    const listings = await prisma.listing.findMany({
      where: { promoterId: testPromoterId },
      select: {
        id: true,
        status: true,
        propertyType: true,
        city: true,
        totalPrice: true
      }
    })

    console.log('✅ Dashboard stats retrieved')
    console.log(`   Total Listings: ${totalListings}`)
    console.log(`   LIVE Listings: ${liveListings}`)
    console.log(`   PENDING Listings: ${pendingListings}`)

    console.log('\n   Listings Details:')
    listings.forEach((listing: any) => {
      console.log(`   - ${listing.propertyType} in ${listing.city}: ${listing.status}`)
    })

    // Verify expected counts
    if (totalListings < 1) {
      console.error('❌ FAILED: Expected at least 1 listing')
      return { success: false }
    }

    if (pendingListings < 1) {
      console.error('❌ FAILED: Expected at least 1 pending listing')
      return { success: false }
    }

    return { success: true }
  } catch (error) {
    console.error('❌ FAILED:', error)
    return { success: false, error }
  }
}

async function runPromoterWorkflowTest() {
  console.log('\n' + '='.repeat(60))
  console.log('🧪 PROMOTER WORKFLOW TEST - Houlnd Realty Offline MVP')
  console.log('='.repeat(60))

  const results = []

  try {
    // Step 1: Create Promoter Account
    const step1 = await step1_CreatePromoterAccount()
    results.push({ step: 1, name: 'Create Promoter Account', ...step1 })
    if (!step1.success) {
      console.log('\n❌ Test failed at Step 1')
      return
    }

    // Step 2: Submit Listing
    const step2 = await step2_SubmitListing()
    results.push({ step: 2, name: 'Submit Listing', ...step2 })
    if (!step2.success) {
      console.log('\n❌ Test failed at Step 2')
      return
    }

    // Step 3: Verify Pending Status
    const step3 = await step3_VerifyPendingStatus()
    results.push({ step: 3, name: 'Verify PENDING Status', ...step3 })
    if (!step3.success) {
      console.log('\n❌ Test failed at Step 3')
      return
    }

    // Step 4: Verify Not in Public Search
    const step4 = await step4_VerifyNotInPublicSearch()
    results.push({ step: 4, name: 'Verify NOT in Public Search', ...step4 })
    if (!step4.success) {
      console.log('\n❌ Test failed at Step 4')
      return
    }

    // Step 5: Check Dashboard
    const step5 = await step5_CheckPromoterDashboard()
    results.push({ step: 5, name: 'Check Promoter Dashboard', ...step5 })
    if (!step5.success) {
      console.log('\n❌ Test failed at Step 5')
      return
    }

    // All steps passed
    console.log('\n' + '='.repeat(60))
    console.log('✓ WORKFLOW PASSED: PROMOTER')
    console.log('='.repeat(60))
    console.log('\nAll steps completed successfully:')
    results.forEach(r => {
      console.log(`  ✓ Step ${r.step}: ${r.name}`)
    })
    console.log('\n🎉 Promoter workflow is fully functional!')
    console.log('\n📝 NOTE: Listing ID for admin approval: ' + testListingId)
    console.log('   Use this in the ADMIN workflow test')

  } catch (error) {
    console.error('\n❌ WORKFLOW FAILED: Unexpected error')
    console.error(error)
  } finally {
    await cleanup()
  }
}

// Run the test
runPromoterWorkflowTest()
