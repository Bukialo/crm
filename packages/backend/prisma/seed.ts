import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

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

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...')

  // Limpiar datos existentes
  await prisma.activity.deleteMany()
  await prisma.automationExecution.deleteMany()
  await prisma.automationAction.deleteMany()
  await prisma.automation.deleteMany()
  await prisma.payment.deleteMany()
  await prisma.document.deleteMany()
  await prisma.task.deleteMany()
  await prisma.calendarEvent.deleteMany()
  await prisma.campaignRecipient.deleteMany()
  await prisma.campaign.deleteMany()
  await prisma.emailTemplate.deleteMany()
  await prisma.contactNote.deleteMany()
  await prisma.trip.deleteMany()
  await prisma.contactCustomField.deleteMany()
  await prisma.contact.deleteMany()
  await prisma.user.deleteMany()
  await prisma.systemSetting.deleteMany()

  // 1. Crear usuarios
  console.log('👤 Creando usuarios...')
  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'admin@bukialo.com',
        firebaseUid: 'firebase_admin_123',
        firstName: 'Admin',
        lastName: 'Bukialo',
        role: 'ADMIN',
        phone: '+1234567890',
        isActive: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'maria.garcia@bukialo.com',
        firebaseUid: 'firebase_maria_123',
        firstName: 'María',
        lastName: 'García',
        role: 'MANAGER',
        phone: '+1234567891',
        isActive: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'carlos.lopez@bukialo.com',
        firebaseUid: 'firebase_carlos_123',
        firstName: 'Carlos',
        lastName: 'López',
        role: 'AGENT',
        phone: '+1234567892',
        isActive: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'ana.martinez@bukialo.com',
        firebaseUid: 'firebase_ana_123',
        firstName: 'Ana',
        lastName: 'Martínez',
        role: 'AGENT',
        phone: '+1234567893',
        isActive: true,
      },
    }),
  ])

  const [admin, manager, agent1, agent2] = users

  // 2. Crear contactos con diferentes estados
  console.log('📋 Creando contactos...')
  const destinations = ['París', 'Roma', 'Nueva York', 'Tokio', 'Barcelona', 'Londres', 'Dubai', 'Cancún', 'Buenos Aires', 'Sydney']
  const contactsData = [
    // Interesados
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
    // Pasajeros
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
    // Clientes
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

  // 3. Crear notas para los contactos
  console.log('📝 Creando notas de contactos...')
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

  // 5. Crear templates de email
  console.log('📧 Creando templates de email...')
  const templates = await Promise.all([
    prisma.emailTemplate.create({
      data: {
        name: 'Bienvenida',
        category: 'WELCOME',
        subject: 'Bienvenido a Bukialo - Tu próxima aventura te espera',
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
    }),
    prisma.emailTemplate.create({
      data: {
        name: 'Cotización de Viaje',
        category: 'QUOTE',
        subject: 'Tu cotización para {{destination}} está lista',
        htmlContent: `
          <h1>Hola {{firstName}},</h1>
          <p>Tu cotización para viajar a {{destination}} está lista.</p>
          <p>Precio total: ${{price}}</p>
        `,
        variables: {
          fields: [
            { name: 'firstName', type: 'text' },
            { name: 'destination', type: 'text' },
            { name: 'price', type: 'number' },
          ],
        },
        createdById: admin.id,
      },
    }),
  ])

  // 6. Crear campañas
  console.log('📣 Creando campañas...')
  const campaign = await prisma.campaign.create({
    data: {
      name: 'Promoción Verano 2025',
      type: 'EMAIL',
      status: 'DRAFT',
      subject: 'Ofertas especiales de verano - Hasta 30% de descuento',
      content: 'Descubre nuestras increíbles ofertas para el verano 2025...',
      templateId: templates[0].id,
      targetCriteria: {
        status: ['INTERESADO', 'CLIENTE'],
        budgetRange: ['MEDIUM', 'HIGH', 'LUXURY'],
      },
      scheduledDate: new Date(2025, 5, 1),
      createdById: manager.id,
    },
  })

  // 7. Crear automatizaciones
  console.log('🤖 Creando automatizaciones...')
  const automation = await prisma.automation.create({
    data: {
      name: 'Bienvenida a nuevos contactos',
      description: 'Envía email de bienvenida cuando se crea un nuevo contacto',
      isActive: true,
      triggerType: 'CONTACT_CREATED',
      triggerConditions: {
        status: 'INTERESADO',
      },
      createdById: admin.id,
      actions: {
        create: [
          {
            actionType: 'SEND_EMAIL',
            parameters: {
              templateId: templates[0].id,
            },
            delayMinutes: 0,
            order: 1,
          },
          {
            actionType: 'CREATE_TASK',
            parameters: {
              title: 'Llamar a nuevo contacto',
              priority: 'HIGH',
            },
            delayMinutes: 1440, // 24 horas
            order: 2,
          },
        ],
      },
    },
  })

  // 8. Crear eventos de calendario
  console.log('📅 Creando eventos de calendario...')
  for (const trip of trips.slice(0, 3)) {
    await prisma.calendarEvent.create({
      data: {
        title: `Salida de viaje - ${trip.destination}`,
        type: 'TRIP_DEPARTURE',
        startDate: trip.departureDate,
        endDate: trip.departureDate,
        contactId: trip.contactId,
        tripId: trip.id,
        assignedToId: contacts.find(c => c.id === trip.contactId)?.assignedAgentId || agent1.id,
        reminderMinutes: [1440, 60], // 24h y 1h antes
      },
    })
  }

  // 9. Crear tareas
  console.log('📋 Creando tareas...')
  for (const contact of contacts.slice(0, 4)) {
    await prisma.task.create({
      data: {
        title: `Seguimiento a ${contact.firstName} ${contact.lastName}`,
        description: 'Realizar llamada de seguimiento para cerrar venta',
        status: 'PENDING',
        priority: contact.status === 'PASAJERO' ? 'HIGH' : 'MEDIUM',
        assignedToId: contact.assignedAgentId!,
        contactId: contact.id,
        dueDate: randomDate(new Date(), new Date(2025, 1, 1)),
      },      
    })
  }

  // 10. Crear actividades de ejemplo
  console.log('📊 Creando actividades...')
  const activityTypes = [
    { type: 'email_sent', description: 'Email enviado' },
    { type: 'call_made', description: 'Llamada realizada' },
    { type: 'meeting_held', description: 'Reunión realizada' },
    { type: 'quote_sent', description: 'Cotización enviada' },
  ]

  for (const contact of contacts) {
    const randomActivity = activityTypes[Math.floor(Math.random() * activityTypes.length)]
    await prisma.activity.create({
      data: {
        type: randomActivity.type,
        description: `${randomActivity.description} - ${contact.firstName} ${contact.lastName}`,
        userId: contact.assignedAgentId!,
        contactId: contact.id,
        metadata: {
          duration: Math.floor(Math.random() * 60) + 5,
          outcome: 'successful',
        },
      },
    })
  }

  // 11. Crear configuraciones del sistema
  console.log('⚙️ Creando configuraciones del sistema...')
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

  await prisma.systemSetting.create({
    data: {
      key: 'working_hours',
      value: {
        monday: { start: '09:00', end: '18:00' },
        tuesday: { start: '09:00', end: '18:00' },
        wednesday: { start: '09:00', end: '18:00' },
        thursday: { start: '09:00', end: '18:00' },
        friday: { start: '09:00', end: '18:00' },
        saturday: { start: '10:00', end: '14:00' },
        sunday: { closed: true },
      },
      description: 'Horario de atención',
      updatedById: admin.id,
    },
  })

  console.log('✅ Seed completado exitosamente!')
  console.log(`
    Resumen:
    - ${users.length} usuarios creados
    - ${contacts.length} contactos creados
    - ${trips.length} viajes creados
    - ${templates.length} templates de email creados
    - 1 campaña creada
    - 1 automatización creada
    - Eventos, tareas y actividades creadas
  `)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('Error en seed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })