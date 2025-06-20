// Servidor ultra simple para testing de todas las rutas
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 5000;

// Middlewares básicos
app.use(
  cors({
    origin: true, // Permitir cualquier origen
    credentials: true,
  })
);

app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  console.log(`📝 ${new Date().toISOString()} - ${req.method} ${req.path}`);
  console.log(`🔍 Query:`, req.query);
  if (req.method !== "GET") {
    console.log(`📦 Body:`, req.body);
  }
  next();
});

// Datos de contactos en memoria
let contacts = [
  {
    id: "contact_1",
    firstName: "Juan",
    lastName: "Pérez",
    email: "juan.perez@email.com",
    phone: "+541234567890",
    status: "INTERESADO",
    source: "WEBSITE",
    createdAt: "2024-05-01T10:00:00Z",
    updatedAt: "2024-06-01T15:30:00Z",
  },
  {
    id: "contact_2",
    firstName: "Laura",
    lastName: "Rodríguez",
    email: "laura.rodriguez@email.com",
    phone: "+541234567891",
    status: "PASAJERO",
    source: "SOCIAL_MEDIA",
    createdAt: "2024-05-15T14:00:00Z",
    updatedAt: "2024-06-10T09:15:00Z",
  },
  {
    id: "contact_3",
    firstName: "Miguel",
    lastName: "Fernández",
    email: "miguel.fernandez@email.com",
    phone: "+541234567892",
    status: "CLIENTE",
    source: "REFERRAL",
    createdAt: "2024-04-01T08:00:00Z",
    updatedAt: "2024-06-05T11:45:00Z",
  },
];

// ============================================
// ENDPOINTS PRINCIPALES
// ============================================

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    name: "Bukialo CRM API - Test Server",
    version: "1.0.0-test",
    status: "running",
    timestamp: new Date().toISOString(),
    endpoints: {
      contacts: "/api/contacts",
      ai: "/api/ai",
      dashboard: "/api/dashboard",
    },
  });
});

// API info
app.get("/api", (req, res) => {
  res.json({
    name: "Bukialo CRM API",
    version: "1.0.0-test",
    status: "all systems operational",
    availableEndpoints: [
      "GET /api/contacts",
      "POST /api/contacts",
      "GET /api/contacts/:id",
      "PUT /api/contacts/:id",
      "DELETE /api/contacts/:id",
      "GET /api/ai/test",
      "POST /api/ai/query",
      "GET /api/dashboard",
    ],
    timestamp: new Date().toISOString(),
  });
});

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    contacts: contacts.length,
  });
});

// ============================================
// CONTACTS ENDPOINTS
// ============================================

// GET /api/contacts - Listar contactos
app.get("/api/contacts", (req, res) => {
  try {
    const {
      page = 1,
      pageSize = 20,
      sortBy = "createdAt",
      sortOrder = "desc",
      search,
      status,
      source,
    } = req.query;

    console.log(`📋 Getting contacts - Page: ${page}, Size: ${pageSize}`);

    let filtered = [...contacts];

    // Aplicar filtros
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (contact) =>
          contact.firstName.toLowerCase().includes(searchLower) ||
          contact.lastName.toLowerCase().includes(searchLower) ||
          contact.email.toLowerCase().includes(searchLower)
      );
    }

    if (status) {
      filtered = filtered.filter((contact) => contact.status === status);
    }

    if (source) {
      filtered = filtered.filter((contact) => contact.source === source);
    }

    // Ordenar
    filtered.sort((a, b) => {
      const aVal = a[sortBy] || "";
      const bVal = b[sortBy] || "";

      if (sortOrder === "asc") {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    // Paginar
    const pageNum = parseInt(page);
    const size = parseInt(pageSize);
    const startIndex = (pageNum - 1) * size;
    const endIndex = startIndex + size;
    const paginatedContacts = filtered.slice(startIndex, endIndex);

    const response = {
      success: true,
      data: {
        items: paginatedContacts,
        total: filtered.length,
        page: pageNum,
        pageSize: size,
        totalPages: Math.ceil(filtered.length / size),
      },
      message: `Found ${filtered.length} contacts`,
    };

    console.log(`✅ Returning ${paginatedContacts.length} contacts`);
    res.json(response);
  } catch (error) {
    console.error("❌ Error in GET /api/contacts:", error);
    res.status(500).json({
      success: false,
      error: "Error getting contacts",
      message: error.message,
    });
  }
});

// POST /api/contacts - Crear contacto
app.post("/api/contacts", (req, res) => {
  try {
    const contactData = req.body;

    console.log(`👤 Creating contact:`, contactData);

    // Validación básica
    if (!contactData.firstName || !contactData.lastName || !contactData.email) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields",
        message: "firstName, lastName, and email are required",
      });
    }

    // Verificar email único
    const existingContact = contacts.find((c) => c.email === contactData.email);
    if (existingContact) {
      return res.status(409).json({
        success: false,
        error: "Email already exists",
        message: `Contact with email ${contactData.email} already exists`,
      });
    }

    // Crear nuevo contacto
    const newContact = {
      id: `contact_${Date.now()}`,
      firstName: contactData.firstName,
      lastName: contactData.lastName,
      email: contactData.email,
      phone: contactData.phone || null,
      status: contactData.status || "INTERESADO",
      source: contactData.source || "WEBSITE",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    contacts.push(newContact);

    console.log(`✅ Contact created: ${newContact.id}`);

    res.status(201).json({
      success: true,
      data: newContact,
      message: "Contact created successfully",
    });
  } catch (error) {
    console.error("❌ Error in POST /api/contacts:", error);
    res.status(500).json({
      success: false,
      error: "Error creating contact",
      message: error.message,
    });
  }
});

// GET /api/contacts/:id - Obtener contacto por ID
app.get("/api/contacts/:id", (req, res) => {
  try {
    const { id } = req.params;

    console.log(`🔍 Getting contact: ${id}`);

    const contact = contacts.find((c) => c.id === id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        error: "Contact not found",
        message: `Contact with ID ${id} not found`,
      });
    }

    res.json({
      success: true,
      data: contact,
    });
  } catch (error) {
    console.error("❌ Error in GET /api/contacts/:id:", error);
    res.status(500).json({
      success: false,
      error: "Error getting contact",
      message: error.message,
    });
  }
});

// PUT /api/contacts/:id - Actualizar contacto
app.put("/api/contacts/:id", (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    console.log(`✏️ Updating contact: ${id}`);

    const contactIndex = contacts.findIndex((c) => c.id === id);

    if (contactIndex === -1) {
      return res.status(404).json({
        success: false,
        error: "Contact not found",
        message: `Contact with ID ${id} not found`,
      });
    }

    // Actualizar contacto
    contacts[contactIndex] = {
      ...contacts[contactIndex],
      ...updateData,
      id, // Mantener ID original
      updatedAt: new Date().toISOString(),
    };

    console.log(`✅ Contact updated: ${id}`);

    res.json({
      success: true,
      data: contacts[contactIndex],
      message: "Contact updated successfully",
    });
  } catch (error) {
    console.error("❌ Error in PUT /api/contacts/:id:", error);
    res.status(500).json({
      success: false,
      error: "Error updating contact",
      message: error.message,
    });
  }
});

// DELETE /api/contacts/:id - Eliminar contacto
app.delete("/api/contacts/:id", (req, res) => {
  try {
    const { id } = req.params;

    console.log(`🗑️ Deleting contact: ${id}`);

    const contactIndex = contacts.findIndex((c) => c.id === id);

    if (contactIndex === -1) {
      return res.status(404).json({
        success: false,
        error: "Contact not found",
        message: `Contact with ID ${id} not found`,
      });
    }

    const deletedContact = contacts.splice(contactIndex, 1)[0];

    console.log(`✅ Contact deleted: ${id}`);

    res.json({
      success: true,
      message: "Contact deleted successfully",
      data: { id: deletedContact.id },
    });
  } catch (error) {
    console.error("❌ Error in DELETE /api/contacts/:id:", error);
    res.status(500).json({
      success: false,
      error: "Error deleting contact",
      message: error.message,
    });
  }
});

// ============================================
// AI ENDPOINTS
// ============================================

app.get("/api/ai/test", (req, res) => {
  res.json({
    success: true,
    message: "AI service is working",
    timestamp: new Date().toISOString(),
  });
});

app.post("/api/ai/query", (req, res) => {
  const { query } = req.body;

  if (!query) {
    return res.status(400).json({
      success: false,
      error: "Query is required",
    });
  }

  res.json({
    success: true,
    data: {
      message: {
        id: `msg_${Date.now()}`,
        role: "assistant",
        content: `Recibí tu consulta: "${query}". El sistema está funcionando correctamente.`,
        timestamp: new Date().toISOString(),
        metadata: { type: "text" },
      },
      suggestions: [
        "¿Cuántos contactos tengo?",
        "Muestra estadísticas",
        "¿Cómo van las ventas?",
      ],
    },
  });
});

// ============================================
// DASHBOARD ENDPOINTS
// ============================================

app.get("/api/dashboard", (req, res) => {
  res.json({
    success: true,
    data: {
      totalContacts: contacts.length,
      activeTrips: 5,
      revenue: { thisMonth: 25000, lastMonth: 20000, growth: 25 },
      contactsByStatus: {
        interesados: contacts.filter((c) => c.status === "INTERESADO").length,
        pasajeros: contacts.filter((c) => c.status === "PASAJERO").length,
        clientes: contacts.filter((c) => c.status === "CLIENTE").length,
      },
    },
    message: "Dashboard data",
  });
});

// ============================================
// ERROR HANDLERS
// ============================================

// 404 handler
app.use((req, res) => {
  console.log(`❌ 404 - Route not found: ${req.method} ${req.path}`);
  res.status(404).json({
    success: false,
    error: "Route not found",
    path: req.path,
    method: req.method,
    availableRoutes: [
      "GET /api/contacts",
      "POST /api/contacts",
      "GET /api/contacts/:id",
      "PUT /api/contacts/:id",
      "DELETE /api/contacts/:id",
      "GET /api/ai/test",
      "POST /api/ai/query",
      "GET /api/dashboard",
    ],
  });
});

// Error handler
app.use((error, req, res, next) => {
  console.error(`❌ Error in ${req.method} ${req.path}:`, error);
  res.status(500).json({
    success: false,
    error: "Internal server error",
    message: error.message,
  });
});

// ============================================
// START SERVER
// ============================================

app.listen(PORT, () => {
  console.log(`🚀 Bukialo CRM Test Server running on port ${PORT}`);
  console.log(`📍 API URL: http://localhost:${PORT}/api`);
  console.log(`👥 Contacts: http://localhost:${PORT}/api/contacts`);
  console.log(`🤖 AI: http://localhost:${PORT}/api/ai/test`);
  console.log(`📊 Dashboard: http://localhost:${PORT}/api/dashboard`);
  console.log("");
  console.log("📋 Available endpoints:");
  console.log("  GET    /api/contacts");
  console.log("  POST   /api/contacts");
  console.log("  GET    /api/contacts/:id");
  console.log("  PUT    /api/contacts/:id");
  console.log("  DELETE /api/contacts/:id");
  console.log("  GET    /api/ai/test");
  console.log("  POST   /api/ai/query");
  console.log("  GET    /api/dashboard");
  console.log("");
  console.log(`✅ Server ready! Contact count: ${contacts.length}`);
});

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\\n🛑 Shutting down server...");
  process.exit(0);
});
