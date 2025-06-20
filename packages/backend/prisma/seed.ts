import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Helper para generar fechas aleatorias
function randomDate(start: Date, end: Date) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
}

// Helper para seleccionar elementos aleatorios de un array
function randomSelect<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count)
}

// Función para limpiar tablas de forma segura
async function safeCleanup() {
  console.log('🧹 Limpiando datos existentes de forma segura...')
  
  try {
    // Limpiar en orden inverso de dependencias para evitar errores de FK
    const tables = [
      'Activity',
      'AutomationExecution', 
      'AutomationAction',
      'Automation',
      'Payment',
      'Document', 
      'Task',
      'CalendarEvent',
      'CampaignRecipient',
      'Campaign',
      'EmailTemplate',
      'ContactNote',
      'Trip',
      'ContactCustomField',
      'Contact',
      'User',
      'SystemSetting'
    ]
    
    for (const table of tables) {
      try {
        await prisma.$executeRawUnsafe(`DELETE FROM "${table}";`)
        console.log(`✅ Limpiada tabla: ${table}`)
      } catch (error: any) {
        if (error.code === 'P2021') {
          console.log(`⚠️ Tabla ${table} no existe, continuando...`)
        } else {
          console.log(`⚠️ Error limpiando ${table}:`, error.message)
        }
      }
    }
  } catch (error) {
    console.log('⚠️ Error durante limpieza, continuando con seed...')
  }
}

// Función helper para crear usuarios con manejo de timezone
async function createUserSafely(userData: any) {
  try {
    return await prisma.user.create({
      data: {
        ...userData,
        timezone: userData.timezone || 'UTC',
      },
    })
  } catch (error: any) {
    if (error.message?.includes('timezone') || error.code === 'P2012') {
      console.log('⚠️ Campo timezone no encontrado, creando usuario sin él')
      const { timezone, ...userDataWithoutTimezone } = userData
      return await prisma.user.create({
        data: userDataWithoutTimezone,
      })
    }
    throw error
  }
}

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...')

  // Limpieza segura
  await safeCleanup()

  // 1. Crear usuarios
  console.log('👤 Creando usuarios...')
  
  const users = await Promise.all([
    createUserSafely({
      email: 'admin@bukialo.com',
      firebaseUid: 'firebase_admin_123',
      firstName: 'Admin',
      lastName: 'Bukialo',
      role: 'ADMIN',
      phone: '+1234567890',
      isActive: true,
      timezone: 'UTC',
    }),
    createUserSafely({
      email: 'maria.garcia@bukialo.com',
      firebaseUid: 'firebase_maria_123',
      firstName: 'María',
      lastName: 'García',
      role: 'MANAGER',
      phone: '+1234567891',
      isActive: true,
      timezone: 'America/Argentina/Buenos_Aires',
    }),
    createUserSafely({
      email: 'carlos.lopez@bukialo.com',
      firebaseUid: 'firebase_carlos_123',
      firstName: 'Carlos',
      lastName: 'López',
      role: 'AGENT',
      phone: '+1234567892',
      isActive: true,
      timezone: 'America/Argentina/Buenos_Aires',
    }),
    createUserSafely({
      email: 'ana.martinez@bukialo.com',
      firebaseUid: 'firebase_ana_123',
      firstName: 'Ana',
      lastName: 'Martínez',
      role: 'AGENT',
      phone: '+1234567893',
      isActive: true,
      timezone: 'America/Argentina/Buenos_Aires',
    }),
  ])

  const [admin, manager, agent1, agent2] = users
  console.log(`✅ Creados ${users.length} usuarios`)

  // 2. Crear contactos
  console.log('📋 Creando contactos...')
  const destinations = ['París', 'Roma', 'Nueva York', 'Tokio', 'Barcelona', 'Londres', 'Dubai', 'Cancún', 'Buenos Aires', 'Sydney']
  
  const contactsData = [
    {
      firstName: 'Juan',
      lastName: 'Pérez', 
      email: 'juan.perez@email.com',
      phone: '+541234567890',
      status: 'INTERESADO' as const,
      source: 'WEBSITE' as const,
      budgetRange: 'MEDIUM' as const,
      assignedAgentId: agent1.id,
    },
    {
      firstName: 'Laura',
      lastName: 'Rodríguez',
      email: 'laura.rodriguez@email.com', 
      phone: '+541234567891',
      status: 'INTERESADO' as const,
      source: 'SOCIAL_MEDIA' as const,
      budgetRange: 'HIGH' as const,
      assignedAgentId: agent2.id,
    },
    {
      firstName: 'Miguel',
      lastName: 'Fernández',
      email: 'miguel.fernandez@email.com',
      phone: '+541234567892',
      status: 'PASAJERO' as const,
      source: 'REFERRAL' as const,
      budgetRange: 'LUXURY' as const,
      assignedAgentId: agent1.id,
    },
    {
      firstName: 'Sofia',
      lastName: 'González',
      email: 'sofia.gonzalez@email.com',
      phone: '+541234567893', 
      status: 'PASAJERO' as const,
      source: 'ADVERTISING' as const,
      budgetRange: 'MEDIUM' as const,
      assignedAgentId: agent2.id,
    },
    {
      firstName: 'Roberto',
      lastName: 'Silva',
      email: 'roberto.silva@email.com',
      phone: '+541234567894',
      status: 'CLIENTE' as const,
      source: 'DIRECT' as const,
      budgetRange: 'HIGH' as const,
      assignedAgentId: agent1.id,
    },
    {
      firstName: 'Patricia',
      lastName: 'Morales',
      email: 'patricia.morales@email.com',
      phone: '+541234567895',
      status: 'CLIENTE' as const,
      source: 'WEBSITE' as const,
      budgetRange: 'LUXURY' as const,
      assignedAgentId: agent2.id,
    },
  ]

  const contacts = await Promise.all(
    contactsData.map(async (data) => {
      return prisma.contact.create({
        data: {
          ...data,
          preferredDestinations: randomSelect(destinations, 3),
          travelStyle: randomSelect(['ADVENTURE', 'RELAXATION', 'CULTURAL', 'LUXURY', 'FAMILY'], 2),
          preferredSeasons: randomSelect(['Primavera', 'Verano', 'Otoño', 'Invierno'], 2),
          tags: randomSelect(['VIP', 'Frecuente', 'Corporativo', 'Familiar', 'Luna de Miel'], 2),
          lastContact: randomDate(new Date(2024, 0, 1), new Date()),
          nextFollowUp: randomDate(new Date(), new Date(2025, 11, 31)),
          createdById: admin.id,
        },
      })
    })
  )
  console.log(`✅ Creados ${contacts.length} contactos`)

  // 3. Crear notas para contactos
  console.log('📝 Creando notas...')
  for (const contact of contacts) {
    await prisma.contactNote.create({
      data: {
        contactId: contact.id,
        content: `Cliente interesado en viajes a ${contact.preferredDestinations[0]}. Prefiere viajar en ${contact.preferredSeasons[0]}.`,
        createdById: contact.assignedAgentId!,
      },
    })
  }

  // 4. Crear viajes
  console.log('✈️ Creando viajes...')
  const trips = []
  for (let i = 2; i < 6; i++) {
    const contact = contacts[i]
    const trip = await prisma.trip.create({
      data: {
        contactId: contact.id,
        destination: contact.preferredDestinations[0] || 'París',
        departureDate: randomDate(new Date(2025, 0, 1), new Date(2025, 6, 1)),
        returnDate: randomDate(new Date(2025, 6, 2), new Date(2025, 11, 31)),
        travelers: Math.floor(Math.random() * 4) + 1,
        status: ['QUOTE', 'BOOKED', 'CONFIRMED'][Math.floor(Math.random() * 3)] as any,
        estimatedBudget: Math.floor(Math.random() * 5000) + 2000,
        finalPrice: Math.floor(Math.random() * 5000) + 2000,
        commission: Math.floor(Math.random() * 500) + 200,
        includesFlight: true,
        includesHotel: true,
        includesTransfer: Math.random() > 0.5,
        includesTours: Math.random() > 0.5,
        includesInsurance: Math.random() > 0.7,
      },
    })
    trips.push(trip)
  }
  console.log(`✅ Creados ${trips.length} viajes`)

  // 5. Crear template de email
  console.log('📧 Creando template de email...')
  const template = await prisma.emailTemplate.create({
    data: {
      name: 'Bienvenida',
      category: 'WELCOME',
      subject: 'Bienvenido a Bukialo - {{firstName}}',
      htmlContent: `
        <h1>¡Hola {{firstName}}!</h1>
        <p>Bienvenido a Bukialo, tu agencia de viajes de confianza.</p>
        <p>Estamos emocionados de ayudarte a planificar tu próxima aventura.</p>
      `,
      variables: {
        fields: [
          { name: 'firstName', type: 'text' },
          { name: 'agentName', type: 'text' },
        ],
      },
      createdById: admin.id,
    },
  })

  // 6. Crear configuración del sistema
  console.log('⚙️ Creando configuración del sistema...')
  await prisma.systemSetting.create({
    data: {
      key: 'email_signature',
      value: {
        text: 'Saludos cordiales,\nEquipo Bukialo CRM',
        includeAgentInfo: true,
      },
      description: 'Firma de email predeterminada',
      updatedById: admin.id,
    },
  })

  console.log('✅ Seed completado exitosamente!')
  console.log(`
    📊 Resumen:
    - ${users.length} usuarios creados
    - ${contacts.length} contactos creados  
    - ${trips.length} viajes creados
    - 1 template de email creado
    - Configuraciones del sistema creadas
  `)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Error en seed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })