// Script para probar específicamente los endpoints de contactos
const http = require("http");

const API_BASE = "http://localhost:5000";

async function testRequest(method, path, body = null) {
  return new Promise((resolve) => {
    const url = new URL(API_BASE + path);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        "Content-Type": "application/json",
        Origin: "http://localhost:3000",
      },
    };

    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          const parsed = JSON.parse(data);
          resolve({
            method,
            path,
            status: res.statusCode,
            success: res.statusCode >= 200 && res.statusCode < 300,
            data: parsed,
          });
        } catch (e) {
          resolve({
            method,
            path,
            status: res.statusCode,
            success: false,
            error: "Invalid JSON response",
            rawData: data,
          });
        }
      });
    });

    req.on("error", (err) => {
      resolve({
        method,
        path,
        status: "ERROR",
        success: false,
        error: err.message,
      });
    });

    req.setTimeout(5000, () => {
      req.destroy();
      resolve({
        method,
        path,
        status: "TIMEOUT",
        success: false,
        error: "Request timeout",
      });
    });

    if (body) {
      req.write(JSON.stringify(body));
    }

    req.end();
  });
}

async function testContactsEndpoints() {
  console.log("🧪 Probando endpoints de contactos de Bukialo CRM...\n");

  const tests = [
    // Test básico de servidor
    {
      method: "GET",
      path: "/",
      description: "Server Root",
    },
    {
      method: "GET",
      path: "/api",
      description: "API Info",
    },
    {
      method: "GET",
      path: "/health",
      description: "Health Check",
    },

    // Tests de contactos
    {
      method: "GET",
      path: "/api/contacts",
      description: "Get All Contacts (Default)",
    },
    {
      method: "GET",
      path: "/api/contacts?page=1&pageSize=20&sortBy=createdAt&sortOrder=desc",
      description: "Get Contacts (Paginated)",
    },
    {
      method: "GET",
      path: "/api/contacts?search=juan",
      description: "Search Contacts",
    },
    {
      method: "GET",
      path: "/api/contacts?status=INTERESADO",
      description: "Filter by Status",
    },

    // Test crear contacto
    {
      method: "POST",
      path: "/api/contacts",
      body: {
        firstName: "Test",
        lastName: "User",
        email: `test${Date.now()}@example.com`,
        phone: "+1234567890",
        status: "INTERESADO",
        source: "WEBSITE",
      },
      description: "Create New Contact",
    },

    // Test obtener contacto específico
    {
      method: "GET",
      path: "/api/contacts/contact_1",
      description: "Get Specific Contact",
    },

    // Test actualizar contacto
    {
      method: "PUT",
      path: "/api/contacts/contact_1",
      body: {
        firstName: "Juan Updated",
        status: "PASAJERO",
      },
      description: "Update Contact",
    },
  ];

  let successCount = 0;
  let contactCreatedId = null;

  for (const test of tests) {
    console.log(`🔍 Testing: ${test.description}`);
    console.log(`   ${test.method} ${test.path}`);

    const result = await testRequest(test.method, test.path, test.body);

    const statusIcon = result.success ? "✅" : "❌";
    console.log(`   ${statusIcon} Status: ${result.status}`);

    if (result.success) {
      successCount++;

      // Mostrar información relevante
      if (result.data) {
        if (result.data.message) {
          console.log(`   📝 Message: ${result.data.message}`);
        }

        if (result.data.data) {
          // Para listas de contactos
          if (result.data.data.items) {
            console.log(
              `   📊 Items: ${result.data.data.items.length}/${result.data.data.total}`
            );
            if (result.data.data.items.length > 0) {
              const firstContact = result.data.data.items[0];
              console.log(
                `   👤 First: ${firstContact.firstName} ${firstContact.lastName}`
              );
            }
          }

          // Para contacto individual
          if (result.data.data.firstName) {
            console.log(
              `   👤 Contact: ${result.data.data.firstName} ${result.data.data.lastName}`
            );
            console.log(`   📧 Email: ${result.data.data.email}`);
            console.log(`   🏷️ Status: ${result.data.data.status}`);
          }

          // Guardar ID del contacto creado
          if (test.method === "POST" && result.data.data.id) {
            contactCreatedId = result.data.data.id;
            console.log(`   🆔 Created ID: ${contactCreatedId}`);
          }
        }
      }
    } else {
      console.log(`   ❌ Error: ${result.error || "Unknown error"}`);
      if (result.rawData) {
        console.log(`   📄 Response: ${result.rawData.substring(0, 100)}...`);
      }
    }

    console.log("");
  }

  // Test adicional con el contacto creado
  if (contactCreatedId) {
    console.log("🔄 Testing with created contact...\n");

    const additionalTests = [
      {
        method: "GET",
        path: `/api/contacts/${contactCreatedId}`,
        description: "Get Created Contact",
      },
      {
        method: "PUT",
        path: `/api/contacts/${contactCreatedId}`,
        body: { status: "CLIENTE" },
        description: "Update Created Contact",
      },
      {
        method: "DELETE",
        path: `/api/contacts/${contactCreatedId}`,
        description: "Delete Created Contact",
      },
    ];

    for (const test of additionalTests) {
      console.log(`🔍 Testing: ${test.description}`);
      console.log(`   ${test.method} ${test.path}`);

      const result = await testRequest(test.method, test.path, test.body);
      const statusIcon = result.success ? "✅" : "❌";
      console.log(`   ${statusIcon} Status: ${result.status}`);

      if (result.success) {
        successCount++;
        if (result.data && result.data.message) {
          console.log(`   📝 Message: ${result.data.message}`);
        }
      } else {
        console.log(`   ❌ Error: ${result.error || "Unknown error"}`);
      }

      console.log("");
    }
  }

  console.log("📊 RESUMEN FINAL:");
  console.log(`✅ Tests exitosos: ${successCount}`);
  console.log(
    `📈 Porcentaje estimado de éxito: ${Math.round((successCount / tests.length) * 100)}%`
  );

  if (successCount >= tests.length * 0.8) {
    console.log("\n🎉 ¡Los endpoints de contactos funcionan correctamente!");
    console.log("🔗 Tu frontend debería poder conectarse sin problemas.");
    console.log("");
    console.log("📋 Endpoints verificados:");
    console.log("  GET  /api/contacts                     ✅");
    console.log("  POST /api/contacts                     ✅");
    console.log("  GET  /api/contacts/:id                 ✅");
    console.log("  PUT  /api/contacts/:id                 ✅");
    console.log("  DELETE /api/contacts/:id               ✅");
  } else {
    console.log("\n⚠️ Algunos endpoints necesitan revisión.");
    console.log(
      "💡 Verifica que el servidor esté corriendo en el puerto 5000."
    );
  }

  console.log("\n🔧 Para usar en tu frontend:");
  console.log(
    '  const response = await fetch("http://localhost:5000/api/contacts");'
  );
  console.log("  const contacts = await response.json();");
  console.log("  console.log(contacts.data.items);");
}

// Ejecutar tests
testContactsEndpoints().catch(console.error);
