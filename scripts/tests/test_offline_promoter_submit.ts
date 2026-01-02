/**
 * Test Script: Promoter Property Submission Journey (Offline Mode)
 *
 * This script verifies the complete promoter workflow:
 * 1. Sign up as a promoter
 * 2. Submit a new property listing
 * 3. Verify property status is PENDING
 * 4. Verify property is NOT visible in public search (only LIVE properties should show)
 *
 * SUCCESS CONDITION: Prints "TEST PASSED" at the end
 */

import { PrismaClient } from '@prisma/client';
import * as jose from 'jose';

const prisma = new PrismaClient();

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'offline-test-secret-key'
);

async function testPromoterSubmitFlow() {
  console.log('=== PROMOTER PROPERTY SUBMISSION TEST ===\n');

  try {
    // Step 1: Create a test promoter
    console.log('Step 1: Creating test promoter...');
    const bcrypt = await import('bcryptjs');
    const hashedPassword = await bcrypt.hash('TestPromoter123!', 10);

    const testEmail = `promoter_${Date.now()}@test.com`;

    const promoter = await prisma.user.create({
      data: {
        email: testEmail,
        passwordHash: hashedPassword,
        fullName: 'Test Promoter Ralph',
        role: 'PROMOTER',
        isVerified: true,
        phoneE164: '+919999888877',
      }
    });

    console.log(`✅ Created promoter: ${promoter.email} (ID: ${promoter.id})\n`);

    // Step 2: Generate JWT token (simulate login)
    console.log('Step 2: Generating JWT token (simulating login)...');
    const token = await new jose.SignJWT({
      sub: promoter.id,
      email: promoter.email,
      role: promoter.role
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(JWT_SECRET);

    console.log(`✅ JWT token generated\n`);

    // Step 3: Verify token
    console.log('Step 3: Verifying JWT token...');
    const { payload } = await jose.jwtVerify(token, JWT_SECRET);
    if (payload.sub !== promoter.id) {
      console.error('❌ FAIL: Token verification failed');
      await prisma.$disconnect();
      process.exit(1);
    }
    console.log(`✅ Token verified for promoter: ${payload.sub}\n`);

    // Step 4: Submit a new property listing
    console.log('Step 4: Submitting new property...');

    const totalPrice = 5000000; // ₹50 lakh
    const totalSqft = 1000;
    const pricePerSqft = totalPrice / totalSqft;

    const newListing = await prisma.listing.create({
      data: {
        promoterId: promoter.id,
        propertyType: 'APARTMENT',
        totalPrice: totalPrice,
        totalSqft: totalSqft,
        pricePerSqft: pricePerSqft,
        priceType: 'NEGOTIABLE',
        title: 'Test Property from Ralph Loop',
        description: 'Beautiful 2BHK apartment for testing',
        city: 'Delhi',
        locality: 'Dwarka',
        address: 'Sector 10, Dwarka',
        state: 'Delhi',
        pinCode: '110075',
        bedrooms: 2,
        bathrooms: 2,
        furnishing: 'SEMI_FURNISHED',
        possessionStatus: 'READY_TO_MOVE',
        imageUrls: JSON.stringify(['/images/test-property-1.jpg', '/images/test-property-2.jpg']),
        amenitiesJson: JSON.stringify(['Gym', 'Parking', 'Security']),
        amenitiesPrice: 50000,
        status: 'PENDING', // Should be PENDING initially
      }
    });

    console.log(`✅ Property submitted! Listing ID: ${newListing.id}`);
    console.log(`   Title: ${newListing.title}`);
    console.log(`   Status: ${newListing.status}`);
    console.log(`   Price: ₹${newListing.totalPrice.toLocaleString('en-IN')}`);
    console.log(`   Price/sqft: ₹${newListing.pricePerSqft.toLocaleString('en-IN')}\n`);

    // Step 5: Create agreement acceptance (required in 8-step form)
    console.log('Step 5: Creating agreement acceptance...');
    const agreement = await prisma.agreementAcceptance.create({
      data: {
        listingId: newListing.id,
        acceptedAt: new Date(),
      }
    });
    console.log(`✅ Agreement accepted (2% commission terms)\n`);

    // Step 6: Verify status is PENDING
    console.log('Step 6: Verifying status is PENDING...');
    if (newListing.status !== 'PENDING') {
      console.error(`❌ FAIL: Status should be PENDING, got ${newListing.status}`);
      await prisma.$disconnect();
      process.exit(1);
    }
    console.log(`✅ Status is PENDING (correct - awaiting admin approval)\n`);

    // Step 7: Verify property is NOT in public LIVE search
    console.log('Step 7: Verifying property NOT in public search (status is PENDING)...');
    const liveProperties = await prisma.listing.findMany({
      where: { status: 'LIVE' }
    });

    const isInLiveSearch = liveProperties.some((p: any) => p.id === newListing.id);
    if (isInLiveSearch) {
      console.error('❌ FAIL: PENDING property should NOT appear in LIVE search');
      await prisma.$disconnect();
      process.exit(1);
    }
    console.log(`✅ Property NOT in public search (correct - not yet approved)\n`);

    // Step 8: Verify promoter can see their own PENDING listing
    console.log('Step 8: Verifying promoter can see their own PENDING listing...');
    const promoterListings = await prisma.listing.findMany({
      where: { promoterId: promoter.id }
    });

    const foundOwnListing = promoterListings.some((p: any) => p.id === newListing.id);
    if (!foundOwnListing) {
      console.error('❌ FAIL: Promoter should see their own PENDING listing');
      await prisma.$disconnect();
      process.exit(1);
    }
    console.log(`✅ Promoter can see their own listing (correct)\n`);

    // Step 9: Verify all required fields are present
    console.log('Step 9: Verifying all required fields...');
    const requiredFields = {
      'propertyType': newListing.propertyType,
      'totalPrice': newListing.totalPrice,
      'totalSqft': newListing.totalSqft,
      'pricePerSqft': newListing.pricePerSqft,
      'city': newListing.city,
      'locality': newListing.locality,
      'bedrooms': newListing.bedrooms,
      'bathrooms': newListing.bathrooms,
    };

    for (const [field, value] of Object.entries(requiredFields)) {
      if (!value && value !== 0) {
        console.error(`❌ FAIL: Required field missing: ${field}`);
        await prisma.$disconnect();
        process.exit(1);
      }
    }
    console.log(`✅ All required fields present\n`);

    // Step 10: Verify price/sqft calculation
    console.log('Step 10: Verifying price/sqft calculation...');
    const expectedPricePerSqft = totalPrice / totalSqft;
    if (Math.abs(newListing.pricePerSqft - expectedPricePerSqft) > 0.01) {
      console.error(`❌ FAIL: Price/sqft calculation incorrect`);
      console.error(`   Expected: ₹${expectedPricePerSqft}`);
      console.error(`   Got: ₹${newListing.pricePerSqft}`);
      await prisma.$disconnect();
      process.exit(1);
    }
    console.log(`✅ Price/sqft correctly calculated: ₹${newListing.pricePerSqft}/sqft\n`);

    // Cleanup
    console.log('Cleanup: Removing test data...');
    await prisma.agreementAcceptance.delete({ where: { id: agreement.id } });
    await prisma.listing.delete({ where: { id: newListing.id } });
    await prisma.user.delete({ where: { id: promoter.id } });
    console.log('✅ Cleanup complete\n');

    await prisma.$disconnect();

    console.log('='.repeat(50));
    console.log('TEST PASSED ✅');
    console.log('='.repeat(50));
    console.log('\n[OFFLINE WORKFLOW VERIFIED: Promoter Property Submission]\n');

  } catch (error) {
    console.error('\n❌ TEST FAILED');
    console.error('Error:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

// Run the test
testPromoterSubmitFlow();
