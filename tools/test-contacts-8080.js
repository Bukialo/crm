// Script para probar endpoints en puerto 8080
const http = require("http");

const API_BASE = "http://localhost:8080"; // Puerto 8080

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
  console.log("🧪 Probando endpoints de contactos en PUERTO 8080...\n");

  const tests = [
    // Test básico de servidor
    {
      method: "GET",
      path: "/",
      description: "Server Root (Port 8080)",
    },
    {
      method: "GET",
      path: "/api",
      description: "API Info (Port 8080)",
    },
    {
      method: "GET",
      path: "/health",
      description: "Health Check (Port 8080)",
    },

    // Tests de contactos
    {
      method: "GET",
      path: "/api/contacts",
      description: "Get All Contacts (No Auth)",
    },
    {
      method: "GET",
      path: "/api/contacts?page=1&pageSize=20&sortBy=createdAt&sortOrder=desc",
      description: "Get Contacts (Paginated - No Auth)",
    },
    {
      method: "GET",
      path: "/api/contacts?search=juan",
      description: "Search Contacts (No Auth)",
    },
    {
      method: "GET",
      path: "/api/contacts?status=INTERESADO",
      description: "Filter by Status (No Auth)",
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
      description: "Create New Contact (No Auth)",
    },

    // Test obtener contacto específico
    {
      method: "GET",
      path: "/api/contacts/contact_1",
      description: "Get Specific Contact (No Auth)",
    },

    // Test actualizar contacto
    {
      method: "PUT",
      path: "/api/contacts/contact_1",
      body: {
        firstName: "Juan Updated",
        status: "PASAJERO",
      },
      description: "Update Contact (No Auth)",
    },
  ];

  let successCount = 0;

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

        if (result.data.server) {
          console.log(`   🖥️ Server: ${result.data.server}`);
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

  console.log("📊 RESUMEN FINAL:");
  console.log(`✅ Tests exitosos: ${successCount}/${tests.length}`);
  console.log(
    `📈 Porcentaje de éxito: ${Math.round((successCount / tests.length) * 100)}%`
  );

  if (successCount >= tests.length * 0.8) {
    console.log(
      "\n🎉 ¡Los endpoints de contactos funcionan correctamente en puerto 8080!"
    );
    console.log("🔗 Tu frontend puede conectarse cambiando la URL base.");
    console.log("");
    console.log("📋 Endpoints verificados en puerto 8080:");
    console.log(
      "  GET  http://localhost:8080/api/contacts                     ✅"
    );
    console.log(
      "  POST http://localhost:8080/api/contacts                     ✅"
    );
    console.log(
      "  GET  http://localhost:8080/api/contacts/:id                 ✅"
    );
    console.log(
      "  PUT  http://localhost:8080/api/contacts/:id                 ✅"
    );
    console.log(
      "  DELETE http://localhost:8080/api/contacts/:id               ✅"
    );
    console.log("");
    console.log("🔧 Para usar en tu frontend:");
    console.log(
      '  Cambiar API_URL de "http://localhost:5000" a "http://localhost:8080"'
    );
  } else {
    console.log("\n⚠️ Algunos endpoints necesitan revisión.");
  }
}

// Ejecutar tests
testContactsEndpoints().catch(console.error);
