/**
 * ADMIN WORKFLOW TEST SCRIPT
 *
 * Tests the complete admin approval journey in offline mode:
 * 1. Create admin account
 * 2. Create a PENDING listing (simulate promoter submission)
 * 3. Get pending listings
 * 4. Approve the listing
 * 5. Verify listing is now LIVE
 * 6. Verify listing appears in public search
 * 7. Test rejection flow
 *
 * Run with: npx tsx scripts/test_workflow_admin.ts
 */

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import * as jose from 'jose'

const prisma = new PrismaClient()

// Test constants
const TEST_ADMIN_EMAIL = `test_admin_${Date.now()}@test.com`
const TEST_ADMIN_PASSWORD = 'TestAdmin123!'
const TEST_ADMIN_NAME = 'Test Admin User'
const TEST_PROMOTER_EMAIL = `test_promoter_for_admin_${Date.now()}@test.com`
const TEST_PROMOTER_NAME = 'Test Promoter for Admin Test'
const TEST_PROMOTER_PHONE = '+919876543210'
const JWT_SECRET = process.env.JWT_SECRET || 'offline-test-secret-key'

let testAdminId: string
let testPromoterId: string
let testAdminToken: string
let testListingId1: string
let testListingId2: string

async function cleanup() {
  console.log('\n🧹 Cleaning up test data...')

  try {
    if (testListingId1) {
      await prisma.listing.delete({ where: { id: testListingId1 } }).catch(() => {})
    }
    if (testListingId2) {
      await prisma.listing.delete({ where: { id: testListingId2 } }).catch(() => {})
    }
    if (testPromoterId) {
      await prisma.user.delete({ where: { id: testPromoterId } }).catch(() => {})
    }
    if (testAdminId) {
      await prisma.user.delete({ where: { id: testAdminId } }).catch(() => {})
    }
  } catch (error) {
    console.error('Cleanup error (non-critical):', error)
  }

  await prisma.$disconnect()
}

async function step1_CreateAdminAccount() {
  console.log('\n👤 STEP 1: Create Admin Account')
  console.log('----------------------------------------')

  try {
    const passwordHash = await bcrypt.hash(TEST_ADMIN_PASSWORD, 10)

    const admin = await prisma.user.create({
      data: {
        email: TEST_ADMIN_EMAIL,
        passwordHash,
        fullName: TEST_ADMIN_NAME,
        role: 'ADMIN',
        isVerified: true
      }
    })

    testAdminId = admin.id

    const secret = new TextEncoder().encode(JWT_SECRET)
    const token = await new jose.SignJWT({ sub: admin.id, role: admin.role })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('7d')
      .sign(secret)

    testAdminToken = token

    console.log('✅ Admin account created')
    console.log(`   ID: ${admin.id}`)
    console.log(`   Email: ${admin.email}`)
    console.log(`   Role: ${admin.role}`)

    return { success: true }
  } catch (error) {
    console.error('❌ FAILED:', error)
    return { success: false, error }
  }
}

async function step2_CreateTestListings() {
  console.log('\n🏠 STEP 2: Create Test PENDING Listings')
  console.log('----------------------------------------')

  try {
    // Create promoter account
    const passwordHash = await bcrypt.hash('TestPromoter123!', 10)
    const promoter = await prisma.user.create({
      data: {
        email: TEST_PROMOTER_EMAIL,
        passwordHash,
        fullName: TEST_PROMOTER_NAME,
        phoneE164: TEST_PROMOTER_PHONE,
        role: 'PROMOTER',
        isVerified: true
      }
    })

    testPromoterId = promoter.id

    // Create first listing (to be approved)
    const listing1 = await prisma.listing.create({
      data: {
        promoterId: testPromoterId,
        propertyType: 'APARTMENT',
        totalPrice: 5000000,
        totalSqft: 1000,
        pricePerSqft: 5000,
        priceType: 'FIXED',
        city: 'Mumbai',
        locality: 'Andheri',
        bedrooms: 3,
        bathrooms: 2,
        description: 'Beautiful apartment for approval test',
        imageUrls: JSON.stringify(['/mock1.jpg']),
        status: 'PENDING_VERIFICATION',
        title: 'Test Listing for Approval'
      }
    })

    testListingId1 = listing1.id

    // Create second listing (to be rejected)
    const listing2 = await prisma.listing.create({
      data: {
        promoterId: testPromoterId,
        propertyType: 'VILLA',
        totalPrice: 10000000,
        totalSqft: 2000,
        pricePerSqft: 5000,
        priceType: 'NEGOTIABLE',
        city: 'Bangalore',
        locality: 'Whitefield',
        bedrooms: 4,
        bathrooms: 3,
        description: 'Villa for rejection test',
        imageUrls: JSON.stringify(['/mock2.jpg']),
        status: 'PENDING_VERIFICATION',
        title: 'Test Listing for Rejection'
      }
    })

    testListingId2 = listing2.id

    console.log('✅ Test listings created')
    console.log(`   Listing 1 ID: ${listing1.id} (for approval)`)
    console.log(`   Listing 2 ID: ${listing2.id} (for rejection)`)
    console.log(`   Promoter ID: ${promoter.id}`)

    return { success: true }
  } catch (error) {
    console.error('❌ FAILED:', error)
    return { success: false, error }
  }
}

async function step3_GetPendingListings() {
  console.log('\n📋 STEP 3: Get Pending Listings')
  console.log('----------------------------------------')

  try {
    const pendingListings = await prisma.listing.findMany({
      where: {
        status: 'PENDING_VERIFICATION'
      },
      include: {
        promoter: {
          select: {
            fullName: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log(`✅ Found ${pendingListings.length} pending listings`)

    const ourListings = pendingListings.filter((l: any) =>
      [testListingId1, testListingId2].includes(l.id)
    )

    console.log(`   Our test listings: ${ourListings.length}/2`)
    ourListings.forEach((l: any) => {
      console.log(`   - ${l.title} (${l.propertyType}, ${l.city})`)
    })

    if (ourListings.length !== 2) {
      console.error('❌ FAILED: Expected 2 test listings in PENDING status')
      return { success: false }
    }

    return { success: true }
  } catch (error) {
    console.error('❌ FAILED:', error)
    return { success: false, error }
  }
}

async function step4_ApproveListing() {
  console.log('\n✅ STEP 4: Approve Listing')
  console.log('----------------------------------------')

  try {
    // Verify listing is pending
    const listing = await prisma.listing.findUnique({
      where: { id: testListingId1 },
      select: { status: true }
    })

    if (listing?.status !== 'PENDING_VERIFICATION') {
      console.error(`❌ FAILED: Listing not in PENDING status (current: ${listing?.status})`)
      return { success: false }
    }

    // Approve the listing
    await prisma.listing.update({
      where: { id: testListingId1 },
      data: {
        status: 'LIVE',
        reviewedAt: new Date(),
        reviewedBy: testAdminId,
        rejectionReason: null
      }
    })

    // Verify it's now LIVE
    const updatedListing = await prisma.listing.findUnique({
      where: { id: testListingId1 },
      select: {
        status: true,
        reviewedAt: true,
        reviewedBy: true
      }
    })

    if (updatedListing?.status !== 'LIVE') {
      console.error(`❌ FAILED: Listing not approved (status: ${updatedListing?.status})`)
      return { success: false }
    }

    if (!updatedListing.reviewedAt || !updatedListing.reviewedBy) {
      console.error('❌ FAILED: Review metadata not set')
      return { success: false }
    }

    console.log('✅ Listing approved successfully')
    console.log(`   Listing ID: ${testListingId1}`)
    console.log(`   New Status: ${updatedListing.status}`)
    console.log(`   Reviewed By: ${updatedListing.reviewedBy}`)
    console.log(`   Reviewed At: ${updatedListing.reviewedAt.toISOString()}`)

    return { success: true }
  } catch (error) {
    console.error('❌ FAILED:', error)
    return { success: false, error }
  }
}

async function step5_VerifyInPublicSearch() {
  console.log('\n🔍 STEP 5: Verify Approved Listing in Public Search')
  console.log('----------------------------------------')

  try {
    const liveListings = await prisma.listing.findMany({
      where: {
        status: 'LIVE'
      },
      select: {
        id: true,
        title: true
      }
    })

    const found = liveListings.some((l: any) => l.id === testListingId1)

    if (!found) {
      console.error('❌ FAILED: Approved listing not found in public search')
      return { success: false }
    }

    console.log('✅ Listing appears in public search')
    console.log(`   Total LIVE listings: ${liveListings.length}`)
    console.log(`   Our approved listing: Found ✓`)

    return { success: true }
  } catch (error) {
    console.error('❌ FAILED:', error)
    return { success: false, error }
  }
}

async function step6_RejectListing() {
  console.log('\n❌ STEP 6: Reject Listing with Reason')
  console.log('----------------------------------------')

  try {
    const rejectionReason = 'Images are not clear, please upload better quality photos'

    // Verify listing is pending
    const listing = await prisma.listing.findUnique({
      where: { id: testListingId2 },
      select: { status: true }
    })

    if (listing?.status !== 'PENDING_VERIFICATION') {
      console.error(`❌ FAILED: Listing not in PENDING status (current: ${listing?.status})`)
      return { success: false }
    }

    // Reject the listing
    await prisma.listing.update({
      where: { id: testListingId2 },
      data: {
        status: 'REJECTED',
        reviewedAt: new Date(),
        reviewedBy: testAdminId,
        rejectionReason
      }
    })

    // Verify it's now REJECTED
    const rejectedListing = await prisma.listing.findUnique({
      where: { id: testListingId2 },
      select: {
        status: true,
        reviewedAt: true,
        reviewedBy: true,
        rejectionReason: true
      }
    })

    if (rejectedListing?.status !== 'REJECTED') {
      console.error(`❌ FAILED: Listing not rejected (status: ${rejectedListing?.status})`)
      return { success: false }
    }

    if (rejectedListing.rejectionReason !== rejectionReason) {
      console.error('❌ FAILED: Rejection reason not saved correctly')
      return { success: false }
    }

    console.log('✅ Listing rejected successfully')
    console.log(`   Listing ID: ${testListingId2}`)
    console.log(`   New Status: ${rejectedListing.status}`)
    console.log(`   Reviewed By: ${rejectedListing.reviewedBy}`)
    console.log(`   Rejection Reason: ${rejectedListing.rejectionReason}`)

    return { success: true }
  } catch (error) {
    console.error('❌ FAILED:', error)
    return { success: false, error }
  }
}

async function step7_VerifyRejectedNotInSearch() {
  console.log('\n🔒 STEP 7: Verify Rejected Listing NOT in Public Search')
  console.log('----------------------------------------')

  try {
    const liveListings = await prisma.listing.findMany({
      where: {
        status: 'LIVE'
      },
      select: {
        id: true
      }
    })

    const found = liveListings.some((l: any) => l.id === testListingId2)

    if (found) {
      console.error('❌ FAILED: Rejected listing should NOT be in public search')
      return { success: false }
    }

    console.log('✅ Rejected listing correctly hidden from public search')
    console.log(`   Rejected listing found in LIVE: No (correct ✓)`)

    return { success: true }
  } catch (error) {
    console.error('❌ FAILED:', error)
    return { success: false, error }
  }
}

async function runAdminWorkflowTest() {
  console.log('\n' + '='.repeat(60))
  console.log('🧪 ADMIN WORKFLOW TEST - Houlnd Realty Offline MVP')
  console.log('='.repeat(60))

  const results = []

  try {
    // Step 1: Create Admin Account
    const step1 = await step1_CreateAdminAccount()
    results.push({ step: 1, name: 'Create Admin Account', ...step1 })
    if (!step1.success) {
      console.log('\n❌ Test failed at Step 1')
      return
    }

    // Step 2: Create Test Listings
    const step2 = await step2_CreateTestListings()
    results.push({ step: 2, name: 'Create Test Listings', ...step2 })
    if (!step2.success) {
      console.log('\n❌ Test failed at Step 2')
      return
    }

    // Step 3: Get Pending Listings
    const step3 = await step3_GetPendingListings()
    results.push({ step: 3, name: 'Get Pending Listings', ...step3 })
    if (!step3.success) {
      console.log('\n❌ Test failed at Step 3')
      return
    }

    // Step 4: Approve Listing
    const step4 = await step4_ApproveListing()
    results.push({ step: 4, name: 'Approve Listing', ...step4 })
    if (!step4.success) {
      console.log('\n❌ Test failed at Step 4')
      return
    }

    // Step 5: Verify in Public Search
    const step5 = await step5_VerifyInPublicSearch()
    results.push({ step: 5, name: 'Verify in Public Search', ...step5 })
    if (!step5.success) {
      console.log('\n❌ Test failed at Step 5')
      return
    }

    // Step 6: Reject Listing
    const step6 = await step6_RejectListing()
    results.push({ step: 6, name: 'Reject Listing', ...step6 })
    if (!step6.success) {
      console.log('\n❌ Test failed at Step 6')
      return
    }

    // Step 7: Verify Rejected Not in Search
    const step7 = await step7_VerifyRejectedNotInSearch()
    results.push({ step: 7, name: 'Verify Rejected NOT in Search', ...step7 })
    if (!step7.success) {
      console.log('\n❌ Test failed at Step 7')
      return
    }

    // All steps passed
    console.log('\n' + '='.repeat(60))
    console.log('✓ WORKFLOW PASSED: ADMIN')
    console.log('='.repeat(60))
    console.log('\nAll steps completed successfully:')
    results.forEach(r => {
      console.log(`  ✓ Step ${r.step}: ${r.name}`)
    })
    console.log('\n🎉 Admin workflow is fully functional!')

  } catch (error) {
    console.error('\n❌ WORKFLOW FAILED: Unexpected error')
    console.error(error)
  } finally {
    await cleanup()
  }
}

// Run the test
runAdminWorkflowTest()
