import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create test promoter
  const promoterPassword = await bcrypt.hash('Promoter123!', 10)
  const promoter = await prisma.user.upsert({
    where: { email: 'promoter@test.com' },
    update: {},
    create: {
      email: 'promoter@test.com',
      fullName: 'Test Promoter',
      passwordHash: promoterPassword,
      role: 'PROMOTER',
      isVerified: true,
      phoneE164: '+919876543210'
    }
  })

  console.log('✅ Created promoter:', promoter.email)

  // Create test customer
  const customerPassword = await bcrypt.hash('Customer123!', 10)
  const customer = await prisma.user.upsert({
    where: { email: 'customer@test.com' },
    update: {},
    create: {
      email: 'customer@test.com',
      fullName: 'Test Customer',
      passwordHash: customerPassword,
      role: 'CUSTOMER',
      isVerified: true,
      phoneE164: '+919876543211'
    }
  })

  console.log('✅ Created customer:', customer.email)

  // Create test admin
  const adminPassword = await bcrypt.hash('Admin123!', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@test.com' },
    update: {},
    create: {
      email: 'admin@test.com',
      fullName: 'Test Admin',
      passwordHash: adminPassword,
      role: 'ADMIN',
      isVerified: true,
      phoneE164: '+919876543212'
    }
  })

  console.log('✅ Created admin:', admin.email)

  // Create sample properties
  const properties = [
    {
      title: '2BHK Luxury Apartment in Bandra',
      propertyType: 'APARTMENT',
      city: 'Mumbai',
      locality: 'Bandra West',
      totalPrice: 7500000,
      totalSqft: 900,
      pricePerSqft: 8333,
      bedrooms: 2,
      bathrooms: 2,
      description: 'Beautiful 2BHK apartment with sea view, modern amenities, and prime location in Bandra West. Perfect for families looking for luxury living.',
      status: 'LIVE',
      priceType: 'NEGOTIABLE',
      amenitiesJson: '["Gym", "Swimming Pool", "Security", "Parking", "Garden"]',
      imageUrls: '["https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800"]',
      furnishing: 'SEMI_FURNISHED',
      possessionStatus: 'READY_TO_MOVE',
      ageYears: 2,
      parkingCount: 1
    },
    {
      title: '3BHK Villa in Whitefield',
      propertyType: 'VILLA',
      city: 'Bangalore',
      locality: 'Whitefield',
      totalPrice: 12000000,
      totalSqft: 1800,
      pricePerSqft: 6667,
      bedrooms: 3,
      bathrooms: 3,
      description: 'Spacious villa with private garden, modern kitchen, and excellent connectivity to IT parks. Ideal for tech professionals.',
      status: 'LIVE',
      priceType: 'FIXED',
      amenitiesJson: '["Garden", "Parking", "Security", "Clubhouse", "Power Backup"]',
      imageUrls: '["https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800"]',
      furnishing: 'UNFURNISHED',
      possessionStatus: 'READY_TO_MOVE',
      ageYears: 1,
      parkingCount: 2
    },
    {
      title: '1BHK Compact Flat in Koregaon Park',
      propertyType: 'APARTMENT',
      city: 'Pune',
      locality: 'Koregaon Park',
      totalPrice: 4500000,
      totalSqft: 650,
      pricePerSqft: 6923,
      bedrooms: 1,
      bathrooms: 1,
      description: 'Perfect for young professionals, near IT parks and entertainment hubs. Compact yet efficient design.',
      status: 'LIVE',
      priceType: 'NEGOTIABLE',
      amenitiesJson: '["Gym", "Lift", "Security", "Power Backup"]',
      imageUrls: '["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800"]',
      furnishing: 'FULLY_FURNISHED',
      possessionStatus: 'READY_TO_MOVE',
      ageYears: 5,
      parkingCount: 1
    },
    {
      title: '4BHK Luxury Penthouse in South Delhi',
      propertyType: 'PENTHOUSE',
      city: 'Delhi',
      locality: 'Greater Kailash',
      totalPrice: 25000000,
      totalSqft: 2500,
      pricePerSqft: 10000,
      bedrooms: 4,
      bathrooms: 4,
      description: 'Ultra-luxury penthouse with terrace garden, premium fittings, and stunning views of South Delhi skyline.',
      status: 'LIVE',
      priceType: 'FIXED',
      amenitiesJson: '["Gym", "Swimming Pool", "Spa", "Valet Parking", "Concierge", "Home Theater"]',
      imageUrls: '["https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800"]',
      furnishing: 'FULLY_FURNISHED',
      possessionStatus: 'READY_TO_MOVE',
      ageYears: 0,
      parkingCount: 3
    },
    {
      title: 'Residential Plot in Gachibowli',
      propertyType: 'PLOT',
      city: 'Hyderabad',
      locality: 'Gachibowli',
      totalPrice: 9000000,
      totalSqft: 2000,
      pricePerSqft: 4500,
      bedrooms: null,
      bathrooms: null,
      description: 'Prime residential plot near IT corridor, ready for construction. Excellent investment opportunity.',
      status: 'LIVE',
      priceType: 'NEGOTIABLE',
      amenitiesJson: '["Gated Community", "Water Supply", "Electricity", "Street Lights"]',
      imageUrls: '["https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800"]',
      furnishing: null,
      possessionStatus: 'READY_TO_MOVE',
      ageYears: null,
      parkingCount: null
    },
    {
      title: '3BHK Sea-Facing Apartment in Marine Drive',
      propertyType: 'APARTMENT',
      city: 'Mumbai',
      locality: 'Marine Drive',
      totalPrice: 18000000,
      totalSqft: 1500,
      pricePerSqft: 12000,
      bedrooms: 3,
      bathrooms: 2,
      description: 'Iconic location with breathtaking sea views, heritage building charm with modern amenities.',
      status: 'LIVE',
      priceType: 'FIXED',
      amenitiesJson: '["Sea View", "Heritage Building", "Security", "Power Backup"]',
      imageUrls: '["https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800"]',
      furnishing: 'SEMI_FURNISHED',
      possessionStatus: 'READY_TO_MOVE',
      ageYears: 15,
      parkingCount: 1
    },
    {
      title: '2BHK Modern Flat in Indiranagar',
      propertyType: 'APARTMENT',
      city: 'Bangalore',
      locality: 'Indiranagar',
      totalPrice: 8500000,
      totalSqft: 1100,
      pricePerSqft: 7727,
      bedrooms: 2,
      bathrooms: 2,
      description: 'Contemporary design, near metro, in vibrant neighborhood with cafes and shopping.',
      status: 'LIVE',
      priceType: 'NEGOTIABLE',
      amenitiesJson: '["Gym", "Clubhouse", "Parking", "Swimming Pool"]',
      imageUrls: '["https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800"]',
      furnishing: 'SEMI_FURNISHED',
      possessionStatus: 'READY_TO_MOVE',
      ageYears: 3,
      parkingCount: 1
    },
    {
      title: '5BHK Farmhouse in Lonavala',
      propertyType: 'VILLA',
      city: 'Pune',
      locality: 'Lonavala',
      totalPrice: 15000000,
      totalSqft: 3000,
      pricePerSqft: 5000,
      bedrooms: 5,
      bathrooms: 5,
      description: 'Serene farmhouse with large garden, perfect weekend getaway. Surrounded by nature.',
      status: 'LIVE',
      priceType: 'NEGOTIABLE',
      amenitiesJson: '["Private Pool", "Garden", "Fireplace", "BBQ Area", "Fruit Trees"]',
      imageUrls: '["https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800"]',
      furnishing: 'FULLY_FURNISHED',
      possessionStatus: 'READY_TO_MOVE',
      ageYears: 4,
      parkingCount: 4
    },
    {
      title: '2BHK Budget Apartment in Viman Nagar',
      propertyType: 'APARTMENT',
      city: 'Pune',
      locality: 'Viman Nagar',
      totalPrice: 5500000,
      totalSqft: 850,
      pricePerSqft: 6471,
      bedrooms: 2,
      bathrooms: 2,
      description: 'Affordable housing near airport, good for first-time buyers. Well connected to IT hubs.',
      status: 'LIVE',
      priceType: 'FIXED',
      amenitiesJson: '["Parking", "Lift", "Security", "Water Supply"]',
      imageUrls: '["https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=800"]',
      furnishing: 'UNFURNISHED',
      possessionStatus: 'READY_TO_MOVE',
      ageYears: 6,
      parkingCount: 1
    },
    {
      title: '3BHK Duplex in Cyber City',
      propertyType: 'APARTMENT',
      city: 'Hyderabad',
      locality: 'Cyber City',
      totalPrice: 11000000,
      totalSqft: 1600,
      pricePerSqft: 6875,
      bedrooms: 3,
      bathrooms: 3,
      description: 'Modern duplex with private terrace, in prime IT hub location. Great for working professionals.',
      status: 'LIVE',
      priceType: 'NEGOTIABLE',
      amenitiesJson: '["Gym", "Swimming Pool", "Clubhouse", "Parking", "Security"]',
      imageUrls: '["https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800"]',
      furnishing: 'SEMI_FURNISHED',
      possessionStatus: 'UNDER_CONSTRUCTION',
      ageYears: null,
      parkingCount: 2
    },
    {
      title: '1BHK Studio Apartment in Andheri',
      propertyType: 'APARTMENT',
      city: 'Mumbai',
      locality: 'Andheri East',
      totalPrice: 5000000,
      totalSqft: 550,
      pricePerSqft: 9091,
      bedrooms: 1,
      bathrooms: 1,
      description: 'Compact studio perfect for singles or couples. Close to metro and airport.',
      status: 'LIVE',
      priceType: 'FIXED',
      amenitiesJson: '["Gym", "Security", "Parking", "Lift"]',
      imageUrls: '["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800"]',
      furnishing: 'FULLY_FURNISHED',
      possessionStatus: 'READY_TO_MOVE',
      ageYears: 2,
      parkingCount: 1
    },
    {
      title: '4BHK Independent House in JP Nagar',
      propertyType: 'VILLA',
      city: 'Bangalore',
      locality: 'JP Nagar',
      totalPrice: 16000000,
      totalSqft: 2200,
      pricePerSqft: 7273,
      bedrooms: 4,
      bathrooms: 4,
      description: 'Independent house with spacious rooms, terrace, and garden. Family-friendly locality.',
      status: 'LIVE',
      priceType: 'NEGOTIABLE',
      amenitiesJson: '["Garden", "Terrace", "Parking", "Security", "Rainwater Harvesting"]',
      imageUrls: '["https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=800"]',
      furnishing: 'SEMI_FURNISHED',
      possessionStatus: 'READY_TO_MOVE',
      ageYears: 7,
      parkingCount: 2
    },
    {
      title: '2BHK Apartment in Noida Extension',
      propertyType: 'APARTMENT',
      city: 'Delhi',
      locality: 'Noida Extension',
      totalPrice: 3500000,
      totalSqft: 950,
      pricePerSqft: 3684,
      bedrooms: 2,
      bathrooms: 2,
      description: 'Affordable housing in developing area with good connectivity. Ideal for first-time buyers.',
      status: 'LIVE',
      priceType: 'FIXED',
      amenitiesJson: '["Lift", "Parking", "Security", "Power Backup"]',
      imageUrls: '["https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800"]',
      furnishing: 'UNFURNISHED',
      possessionStatus: 'UNDER_CONSTRUCTION',
      ageYears: null,
      parkingCount: 1
    },
    {
      title: '3BHK Premium Flat in Banjara Hills',
      propertyType: 'APARTMENT',
      city: 'Hyderabad',
      locality: 'Banjara Hills',
      totalPrice: 14000000,
      totalSqft: 1700,
      pricePerSqft: 8235,
      bedrooms: 3,
      bathrooms: 3,
      description: 'Premium apartment in upscale neighborhood with excellent amenities and connectivity.',
      status: 'LIVE',
      priceType: 'FIXED',
      amenitiesJson: '["Swimming Pool", "Gym", "Clubhouse", "Security", "Landscaped Gardens"]',
      imageUrls: '["https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800"]',
      furnishing: 'SEMI_FURNISHED',
      possessionStatus: 'READY_TO_MOVE',
      ageYears: 1,
      parkingCount: 2
    },
    {
      title: '2BHK Apartment in Kharadi',
      propertyType: 'APARTMENT',
      city: 'Pune',
      locality: 'Kharadi',
      totalPrice: 6500000,
      totalSqft: 1000,
      pricePerSqft: 6500,
      bedrooms: 2,
      bathrooms: 2,
      description: 'Modern apartment in IT hub, close to tech parks and shopping malls.',
      status: 'LIVE',
      priceType: 'NEGOTIABLE',
      amenitiesJson: '["Gym", "Swimming Pool", "Security", "Parking", "Kids Play Area"]',
      imageUrls: '["https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800"]',
      furnishing: 'SEMI_FURNISHED',
      possessionStatus: 'READY_TO_MOVE',
      ageYears: 2,
      parkingCount: 1
    }
  ]

  let createdCount = 0
  for (const property of properties) {
    await prisma.listing.create({
      data: {
        ...property,
        promoterId: promoter.id
      }
    })
    createdCount++
  }

  console.log(`✅ Created ${createdCount} sample properties`)
  console.log('')
  console.log('🎉 Seeding completed successfully!')
  console.log('')
  console.log('📝 Test Credentials:')
  console.log('   Promoter: promoter@test.com / Promoter123!')
  console.log('   Customer: customer@test.com / Customer123!')
  console.log('   Admin:    admin@test.com / Admin123!')
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
