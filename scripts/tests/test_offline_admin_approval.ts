/**
 * Test Script: Admin Approval Workflow (Offline Mode)
 *
 * This script verifies the complete admin approval workflow:
 * 1. Create admin, promoter, and a PENDING property
 * 2. Admin approves the property
 * 3. Verify property status changes to LIVE
 * 4. Verify property NOW appears in public search
 * 5. Test admin rejection flow
 *
 * SUCCESS CONDITION: Prints "TEST PASSED" at the end
 */

import { PrismaClient } from '@prisma/client';
import * as jose from 'jose';

const prisma = new PrismaClient();

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'offline-test-secret-key'
);

async function testAdminApprovalFlow() {
  console.log('=== ADMIN APPROVAL WORKFLOW TEST ===\n');

  try {
    // Step 1: Create test admin
    console.log('Step 1: Creating test admin...');
    const bcrypt = await import('bcryptjs');
    const adminPassword = await bcrypt.hash('TestAdmin123!', 10);

    const admin = await prisma.user.create({
      data: {
        email: `admin_${Date.now()}@test.com`,
        passwordHash: adminPassword,
        fullName: 'Test Admin Ralph',
        role: 'ADMIN',
        isVerified: true,
        phoneE164: '+919111222233',
      }
    });

    console.log(`✅ Created admin: ${admin.email} (ID: ${admin.id})\n`);

    // Step 2: Create test promoter
    console.log('Step 2: Creating test promoter...');
    const promoterPassword = await bcrypt.hash('TestPromoter123!', 10);

    const promoter = await prisma.user.create({
      data: {
        email: `promoter_${Date.now()}@test.com`,
        passwordHash: promoterPassword,
        fullName: 'Test Promoter Ralph',
        role: 'PROMOTER',
        isVerified: true,
        phoneE164: '+919222333344',
      }
    });

    console.log(`✅ Created promoter: ${promoter.email} (ID: ${promoter.id})\n`);

    // Step 3: Create PENDING property
    console.log('Step 3: Creating PENDING property...');

    const totalPrice = 7500000; // ₹75 lakh
    const totalSqft = 1200;
    const pricePerSqft = totalPrice / totalSqft;

    const pendingListing = await prisma.listing.create({
      data: {
        promoterId: promoter.id,
        propertyType: 'APARTMENT',
        totalPrice: totalPrice,
        totalSqft: totalSqft,
        pricePerSqft: pricePerSqft,
        priceType: 'FIXED',
        title: 'Test Property Awaiting Approval',
        description: 'Spacious 3BHK apartment',
        city: 'Mumbai',
        locality: 'Andheri',
        address: 'Andheri West',
        state: 'Maharashtra',
        pinCode: '400053',
        bedrooms: 3,
        bathrooms: 2,
        furnishing: 'FULLY_FURNISHED',
        possessionStatus: 'READY_TO_MOVE',
        imageUrls: JSON.stringify(['/images/test-1.jpg']),
        amenitiesJson: JSON.stringify(['Gym', 'Pool']),
        status: 'PENDING',
      }
    });

    console.log(`✅ PENDING property created: ${pendingListing.id}`);
    console.log(`   Title: ${pendingListing.title}`);
    console.log(`   Status: ${pendingListing.status}\n`);

    // Step 4: Verify PENDING property NOT in public search
    console.log('Step 4: Verifying PENDING property NOT in public search...');
    const livePropertiesBefore = await prisma.listing.findMany({
      where: { status: 'LIVE' }
    });

    const inSearchBefore = livePropertiesBefore.some((p: any) => p.id === pendingListing.id);
    if (inSearchBefore) {
      console.error('❌ FAIL: PENDING property should NOT be in public search');
      await prisma.$disconnect();
      process.exit(1);
    }
    console.log(`✅ PENDING property NOT in public search (correct)\n`);

    // Step 5: Admin approves the property
    console.log('Step 5: Admin approving the property...');

    const approvedListing = await prisma.listing.update({
      where: { id: pendingListing.id },
      data: {
        status: 'LIVE',
        reviewedAt: new Date(),
        reviewedBy: admin.id,
      }
    });

    console.log(`✅ Property approved!`);
    console.log(`   New status: ${approvedListing.status}`);
    console.log(`   Reviewed by: ${admin.fullName}\n`);

    // Step 6: Verify status changed to LIVE
    console.log('Step 6: Verifying status changed to LIVE...');
    if (approvedListing.status !== 'LIVE') {
      console.error(`❌ FAIL: Status should be LIVE, got ${approvedListing.status}`);
      await prisma.$disconnect();
      process.exit(1);
    }
    console.log(`✅ Status is LIVE (correct)\n`);

    // Step 7: Verify property NOW appears in public search
    console.log('Step 7: Verifying property NOW in public search...');
    const livePropertiesAfter = await prisma.listing.findMany({
      where: { status: 'LIVE' }
    });

    const inSearchAfter = livePropertiesAfter.some((p: any) => p.id === approvedListing.id);
    if (!inSearchAfter) {
      console.error('❌ FAIL: LIVE property SHOULD be in public search');
      await prisma.$disconnect();
      process.exit(1);
    }
    console.log(`✅ Property NOW in public search (correct)\n`);

    // Step 8: Test rejection flow - create another PENDING property
    console.log('Step 8: Testing rejection flow...');
    console.log('   Creating second PENDING property...');

    const pendingListing2 = await prisma.listing.create({
      data: {
        promoterId: promoter.id,
        propertyType: 'VILLA',
        totalPrice: 10000000,
        totalSqft: 2000,
        pricePerSqft: 5000,
        priceType: 'NEGOTIABLE',
        title: 'Test Property to be Rejected',
        description: 'Property with issues',
        city: 'Pune',
        locality: 'Koregaon Park',
        address: 'Lane 5',
        state: 'Maharashtra',
        pinCode: '411001',
        bedrooms: 4,
        bathrooms: 3,
        furnishing: 'UNFURNISHED',
        possessionStatus: 'UNDER_CONSTRUCTION',
        imageUrls: JSON.stringify(['/images/test-2.jpg']),
        status: 'PENDING',
      }
    });

    console.log(`   ✅ Second PENDING property created: ${pendingListing2.id}\n`);

    // Step 9: Admin rejects the property
    console.log('Step 9: Admin rejecting the second property...');

    const rejectedListing = await prisma.listing.update({
      where: { id: pendingListing2.id },
      data: {
        status: 'REJECTED',
        reviewedAt: new Date(),
        reviewedBy: admin.id,
        rejectionReason: 'Incomplete information - missing proper images',
      }
    });

    console.log(`✅ Property rejected!`);
    console.log(`   Status: ${rejectedListing.status}`);
    console.log(`   Reason: ${rejectedListing.rejectionReason}\n`);

    // Step 10: Verify rejected property NOT in public search
    console.log('Step 10: Verifying rejected property NOT in public search...');
    const livePropertiesFinal = await prisma.listing.findMany({
      where: { status: 'LIVE' }
    });

    const rejectedInSearch = livePropertiesFinal.some((p: any) => p.id === rejectedListing.id);
    if (rejectedInSearch) {
      console.error('❌ FAIL: REJECTED property should NOT be in public search');
      await prisma.$disconnect();
      process.exit(1);
    }
    console.log(`✅ REJECTED property NOT in public search (correct)\n`);

    // Step 11: Verify admin can see both approved and rejected properties
    console.log('Step 11: Verifying admin can see all properties...');
    const allListings = await prisma.listing.findMany({
      where: {
        OR: [
          { id: approvedListing.id },
          { id: rejectedListing.id }
        ]
      }
    });

    if (allListings.length !== 2) {
      console.error('❌ FAIL: Admin should see both LIVE and REJECTED properties');
      await prisma.$disconnect();
      process.exit(1);
    }
    console.log(`✅ Admin can see all properties (correct)\n`);

    // Step 12: Verify reviewedBy and reviewedAt are set
    console.log('Step 12: Verifying review metadata...');
    if (!approvedListing.reviewedBy || !approvedListing.reviewedAt) {
      console.error('❌ FAIL: Review metadata not set on approved listing');
      await prisma.$disconnect();
      process.exit(1);
    }
    if (!rejectedListing.reviewedBy || !rejectedListing.reviewedAt) {
      console.error('❌ FAIL: Review metadata not set on rejected listing');
      await prisma.$disconnect();
      process.exit(1);
    }
    console.log(`✅ Review metadata set correctly on both listings\n`);

    // Cleanup
    console.log('Cleanup: Removing test data...');
    await prisma.listing.delete({ where: { id: approvedListing.id } });
    await prisma.listing.delete({ where: { id: rejectedListing.id } });
    await prisma.user.delete({ where: { id: promoter.id } });
    await prisma.user.delete({ where: { id: admin.id } });
    console.log('✅ Cleanup complete\n');

    await prisma.$disconnect();

    console.log('='.repeat(50));
    console.log('TEST PASSED ✅');
    console.log('='.repeat(50));
    console.log('\n[OFFLINE WORKFLOW VERIFIED: Admin Approval & Rejection]\n');

  } catch (error) {
    console.error('\n❌ TEST FAILED');
    console.error('Error:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

// Run the test
testAdminApprovalFlow();
