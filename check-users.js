const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
})

async function main() {
  const users = await prisma.user.findMany()
  console.log('\n📊 Users in database:', users.length)
  users.forEach(user => {
    console.log(`   - ${user.email} (${user.role})`)
  })
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
