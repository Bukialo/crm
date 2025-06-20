// Script para verificar todos los endpoints AI
const http = require("http");

const API_BASE = "http://localhost:5000/api";

async function testEndpoint(method, path, body = null) {
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
            headers: res.headers,
          });
        } catch (e) {
          resolve({
            method,
            path,
            status: res.statusCode,
            success: false,
            error: "Invalid JSON response",
            rawData: data.substring(0, 200),
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

async function verifyAllEndpoints() {
  console.log("🔍 Verificando todos los endpoints AI de Bukialo CRM...\n");

  const tests = [
    // Endpoints básicos
    { method: "GET", path: "/ai", description: "AI Service Info" },
    { method: "GET", path: "/ai/test", description: "AI Test Endpoint" },
    { method: "GET", path: "/ai/status", description: "AI Status" },

    // Endpoints de datos
    { method: "GET", path: "/ai/insights", description: "AI Insights" },
    { method: "GET", path: "/ai/suggestions", description: "AI Suggestions" },
    { method: "GET", path: "/ai/chat-history", description: "Chat History" },
    {
      method: "GET",
      path: "/ai/chat-history?limit=10",
      description: "Chat History with limit",
    },

    // Endpoint de query
    {
      method: "POST",
      path: "/ai/query",
      body: {
        query: "¿Cómo funciona el sistema?",
        context: { testMode: true },
      },
      description: "AI Query Test",
    },

    // Más queries de prueba
    {
      method: "POST",
      path: "/ai/query",
      body: {
        query: "Muéstrame los contactos",
        context: { currentPage: "contacts" },
      },
      description: "AI Query - Contactos",
    },

    {
      method: "POST",
      path: "/ai/query",
      body: {
        query: "¿Cuáles son las estadísticas de ventas?",
        context: { currentPage: "dashboard" },
      },
      description: "AI Query - Estadísticas",
    },
  ];

  let successCount = 0;
  let totalCount = tests.length;

  for (const test of tests) {
    const result = await testEndpoint(test.method, test.path, test.body);

    const statusIcon = result.success ? "✅" : "❌";
    const statusText = result.status;

    console.log(`${statusIcon} ${test.method} ${test.path}`);
    console.log(`   Description: ${test.description}`);
    console.log(`   Status: ${statusText}`);

    if (result.success) {
      successCount++;
      if (result.data) {
        if (result.data.message)
          console.log(`   Response: ${result.data.message}`);
        if (result.data.data && Array.isArray(result.data.data)) {
          console.log(`   Data items: ${result.data.data.length}`);
        }
        if (result.data.data && result.data.data.message) {
          console.log(
            `   AI Response: ${result.data.data.message.content?.substring(0, 100)}...`
          );
        }
      }
    } else {
      console.log(`   Error: ${result.error || "Unknown error"}`);
      if (result.rawData) {
        console.log(`   Raw response: ${result.rawData}`);
      }
    }
    console.log("");
  }

  console.log("📊 RESUMEN:");
  console.log(`✅ Exitosos: ${successCount}/${totalCount}`);
  console.log(`❌ Fallidos: ${totalCount - successCount}/${totalCount}`);
  console.log(
    `📈 Porcentaje de éxito: ${Math.round((successCount / totalCount) * 100)}%`
  );

  if (successCount === totalCount) {
    console.log("\n🎉 ¡Todos los endpoints AI funcionan correctamente!");
    console.log("🔗 Tu frontend debería poder conectarse sin problemas.");
  } else {
    console.log("\n⚠️ Algunos endpoints necesitan revisión.");
    console.log(
      "💡 Verifica que el servidor esté corriendo y que las rutas estén configuradas."
    );
  }

  console.log("\n📋 Endpoints disponibles para tu frontend:");
  console.log("  GET  /api/ai/insights              - Obtener insights");
  console.log("  GET  /api/ai/suggestions           - Obtener sugerencias");
  console.log("  GET  /api/ai/chat-history          - Historial de chat");
  console.log("  POST /api/ai/query                 - Enviar consulta AI");
  console.log("  GET  /api/ai/test                  - Test de conectividad");
  console.log("  GET  /api/ai/status                - Estado del servicio");

  console.log("\n🔧 Para usar en tu frontend:");
  console.log(
    '  const response = await fetch("http://localhost:5000/api/ai/insights");'
  );
  console.log("  const insights = await response.json();");
}

// Función para probar un endpoint específico
async function testSpecificEndpoint() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    await verifyAllEndpoints();
    return;
  }

  const [method = "GET", path = "/ai"] = args;
  console.log(`🧪 Probando endpoint específico: ${method} ${path}\n`);

  const result = await testEndpoint(method, path);
  console.log("📊 Resultado:", JSON.stringify(result, null, 2));
}

// Ejecutar
if (require.main === module) {
  testSpecificEndpoint().catch(console.error);
}

module.exports = { testEndpoint, verifyAllEndpoints };
