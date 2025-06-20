// Script para diagnosticar el servidor
// Ejecutar: node debug-server.js

const http = require("http");

async function testEndpoint(path) {
  return new Promise((resolve) => {
    const options = {
      hostname: "localhost",
      port: 5000,
      path: path,
      method: "GET",
    };

    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        resolve({
          path,
          status: res.statusCode,
          headers: res.headers,
          data: data.substring(0, 200) + (data.length > 200 ? "..." : ""),
        });
      });
    });

    req.on("error", (err) => {
      resolve({
        path,
        status: "ERROR",
        error: err.message,
      });
    });

    req.setTimeout(5000, () => {
      req.destroy();
      resolve({
        path,
        status: "TIMEOUT",
      });
    });

    req.end();
  });
}

async function diagnose() {
  console.log("🔍 Diagnosticando servidor Bukialo CRM...\n");

  const endpoints = [
    "/",
    "/api",
    "/api/health",
    "/api/ai",
    "/api/ai/test",
    "/api/contacts",
    "/api/dashboard",
  ];

  for (const endpoint of endpoints) {
    const result = await testEndpoint(endpoint);

    let statusIcon = "❌";
    if (result.status === 200) statusIcon = "✅";
    else if (result.status === 401) statusIcon = "🔐";
    else if (result.status === 404) statusIcon = "❌";

    console.log(`${statusIcon} ${endpoint} - Status: ${result.status}`);

    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }

    if (result.data && result.status === 200) {
      try {
        const parsed = JSON.parse(result.data);
        if (parsed.name) console.log(`   API: ${parsed.name}`);
        if (parsed.endpoints)
          console.log(
            `   Endpoints: ${Object.keys(parsed.endpoints).length} rutas`
          );
      } catch (e) {
        console.log(`   Response: ${result.data}`);
      }
    }
    console.log("");
  }

  console.log("📋 Resumen:");
  console.log("- Si ves ❌ en /api/ai, las rutas AI no están montadas");
  console.log("- Si ves ERROR en /, el servidor no está corriendo");
  console.log("- Si ves 🔐, necesitas autenticación");
  console.log("- Si ves ✅, el endpoint funciona correctamente");
}

diagnose().catch(console.error);
