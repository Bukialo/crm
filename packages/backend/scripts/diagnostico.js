#!/usr/bin/env node

/**
 * Script de diagnóstico completo para Bukialo CRM
 * Valida autenticación, rutas, base de datos y funcionalidades
 */

const axios = require('axios');
require('dotenv').config();

const API_BASE = process.env.API_URL || 'http://localhost:5000/api';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// Colores para la consola
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️ ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ️ ${message}`, 'blue');
}

function logHeader(message) {
  log(`\n${colors.bold}=== ${message} ===${colors.reset}`, 'blue');
}

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

class BukialoDiagnostic {
  constructor() {
    this.token = null;
    this.userId = null;
    this.testContactId = null;
    this.results = {
      total: 0,
      passed: 0,
      failed: 0,
      warnings: 0,
    };
  }

  async runDiagnostic() {
    logHeader('Iniciando Diagnóstico Completo de Bukialo CRM');
    
    try {
      await this.testServerConnection();
      await this.testPublicEndpoints();
      await this.testAuthentication();
      
      if (this.token) {
        await this.testProtectedEndpoints();
        await this.testContactsManagement();
        await this.testAIFunctionality();
        await this.testTripsManagement();
        await this.testSettingsManagement();
      }
      
      await this.testCORS();
      
      this.showSummary();
    } catch (error) {
      logError(`Error en gestión de viajes: ${error.message}`);
      this.fail();
    }
  }

  async testSettingsManagement() {
    logHeader('Gestión de Configuración');
    
    if (!this.token) {
      logWarning('Saltando pruebas de configuración - no hay autenticación');
      return;
    }

    const headers = { Authorization: `Bearer ${this.token}` };

    try {
      // Probar obtener configuraciones
      const settingsResponse = await axios.get(`${API_BASE}/settings`, { headers });
      if (settingsResponse.status === 200) {
        logSuccess('Obtener configuraciones: OK');
        this.pass();
      } else {
        logError('Error obteniendo configuraciones');
        this.fail();
      }

      // Probar configuraciones por defecto
      const defaultsResponse = await axios.get(`${API_BASE}/settings/defaults/all`, { headers });
      if (defaultsResponse.status === 200) {
        logSuccess('Configuraciones por defecto: OK');
        this.pass();
      } else {
        logError('Error obteniendo configuraciones por defecto');
        this.fail();
      }

    } catch (error) {
      logError(`Error en gestión de configuración: ${error.message}`);
      this.fail();
    }
  }

  async testCORS() {
    logHeader('Configuración CORS');
    
    try {
      // Simular request desde frontend
      const corsHeaders = {
        'Origin': FRONTEND_URL,
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type, Authorization',
      };

      const response = await axios.options(`${API_BASE}/auth`, { headers: corsHeaders });
      
      if (response.status === 200) {
        logSuccess('CORS configurado correctamente');
        this.pass();
      } else {
        logWarning('CORS puede tener problemas');
        this.warning();
      }
    } catch (error) {
      logWarning(`CORS: ${error.message}`);
      this.warning();
    }
  }

  async cleanup() {
    logHeader('Limpieza de Datos de Prueba');
    
    if (!this.token || !this.testContactId) {
      logInfo('No hay datos de prueba para limpiar');
      return;
    }

    const headers = { Authorization: `Bearer ${this.token}` };

    try {
      // Eliminar contacto de prueba
      await axios.delete(`${API_BASE}/contacts/${this.testContactId}`, { headers });
      logSuccess('Datos de prueba eliminados');
    } catch (error) {
      logWarning(`No se pudieron eliminar los datos de prueba: ${error.message}`);
    }
  }

  pass() {
    this.results.total++;
    this.results.passed++;
  }

  fail() {
    this.results.total++;
    this.results.failed++;
  }

  warning() {
    this.results.total++;
    this.results.warnings++;
  }

  showSummary() {
    logHeader('Resumen del Diagnóstico');
    
    const { total, passed, failed, warnings } = this.results;
    const passRate = total > 0 ? ((passed / total) * 100).toFixed(1) : 0;

    log(`\nTotal de pruebas: ${total}`, 'blue');
    log(`✅ Exitosas: ${passed}`, 'green');
    log(`❌ Fallidas: ${failed}`, 'red');
    log(`⚠️ Advertencias: ${warnings}`, 'yellow');
    log(`📊 Tasa de éxito: ${passRate}%\n`, 'bold');

    if (failed === 0) {
      logSuccess('🎉 Todos los sistemas funcionando correctamente!');
    } else if (failed <= 2) {
      logWarning('⚠️ Sistema funcionando con algunos problemas menores');
    } else {
      logError('❌ Sistema tiene problemas significativos que requieren atención');
    }

    // Recomendaciones específicas
    this.showRecommendations();
  }

  showRecommendations() {
    logHeader('Recomendaciones');

    if (this.results.failed > 0) {
      logInfo('Para solucionar los problemas encontrados:');
      
      if (!this.token) {
        log('🔧 Configurar Firebase Authentication correctamente', 'yellow');
        log('   - Verificar FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL', 'yellow');
        log('   - Asegurar que las credenciales de Firebase sean válidas', 'yellow');
      }

      log('🔧 Verificar que el servidor esté ejecutándose en el puerto correcto', 'yellow');
      log('🔧 Comprobar que la base de datos PostgreSQL esté activa', 'yellow');
      log('🔧 Ejecutar migraciones de base de datos si es necesario:', 'yellow');
      log('   npm run db:migrate', 'yellow');
      log('🔧 Verificar variables de entorno en el archivo .env', 'yellow');
    }

    if (this.results.warnings > 0) {
      log('\n📝 Configuraciones recomendadas:', 'blue');
      log('   - Configurar Gemini AI API key para funcionalidad completa de IA', 'blue');
      log('   - Configurar SMTP para envío de emails', 'blue');
      log('   - Revisar configuración de CORS para producción', 'blue');
    }

    logInfo('\n🚀 Para ejecutar el diagnóstico nuevamente:');
    logInfo('   node packages/backend/scripts/diagnostic.js');
  }
}

// Ejecutar diagnóstico
async function main() {
  const diagnostic = new BukialoDiagnostic();
  
  try {
    await diagnostic.runDiagnostic();
    await diagnostic.cleanup();
  } catch (error) {
    logError(`Error crítico: ${error.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { BukialoDiagnostic }; {
      logError(`Error crítico en diagnóstico: ${error.message}`);
    }
  }

  async testServerConnection() {
    logHeader('Conexión al Servidor');
    
    try {
      const response = await axios.get(`${API_BASE.replace('/api', '')}/health`, {
        timeout: 5000,
      });
      
      if (response.status === 200) {
        logSuccess('Servidor respondiendo correctamente');
        logInfo(`Uptime: ${response.data.uptime?.toFixed(2)}s`);
        logInfo(`Environment: ${response.data.environment}`);
        this.pass();
      } else {
        logError('Servidor no responde correctamente');
        this.fail();
      }
    } catch (error) {
      logError(`Error de conexión: ${error.message}`);
      this.fail();
      throw error;
    }
  }

  async testPublicEndpoints() {
    logHeader('Endpoints Públicos');
    
    const publicEndpoints = [
      { path: '', name: 'API Info' },
      { path: '/ai', name: 'AI Service Info' },
      { path: '/ai/status', name: 'AI Status' },
    ];

    for (const endpoint of publicEndpoints) {
      try {
        const response = await axios.get(`${API_BASE}${endpoint.path}`);
        if (response.status === 200) {
          logSuccess(`${endpoint.name}: OK`);
          this.pass();
        } else {
          logError(`${endpoint.name}: Error ${response.status}`);
          this.fail();
        }
      } catch (error) {
        logError(`${endpoint.name}: ${error.message}`);
        this.fail();
      }
    }
  }

  async testAuthentication() {
    logHeader('Sistema de Autenticación');
    
    // Simular datos de prueba (en un entorno real vendrían de Firebase)
    const testUser = {
      email: 'test@bukialo.com',
      firstName: 'Test',
      lastName: 'User',
      firebaseUid: `test-uid-${Date.now()}`,
      role: 'AGENT',
    };

    try {
      // Test registro/login
      const authResponse = await axios.post(`${API_BASE}/auth/login-or-register`, testUser);
      
      if (authResponse.status === 200 && authResponse.data.success) {
        logSuccess('Autenticación funcionando');
        this.userId = authResponse.data.data.id;
        
        // En un entorno real, aquí obtendríamos el token de Firebase
        // Por ahora simulamos tener un token válido
        logWarning('Usando autenticación simulada para pruebas');
        this.pass();
      } else {
        logError('Fallo en autenticación');
        this.fail();
      }
    } catch (error) {
      logError(`Error de autenticación: ${error.message}`);
      if (error.response?.data?.message?.includes('Firebase')) {
        logWarning('Error relacionado con Firebase - configurar credenciales');
      }
      this.fail();
    }
  }

  async testProtectedEndpoints() {
    logHeader('Endpoints Protegidos (Requieren Autenticación)');
    
    if (!this.token) {
      logWarning('Saltando pruebas protegidas - no hay token de autenticación');
      return;
    }

    const protectedEndpoints = [
      { path: '/dashboard', name: 'Dashboard' },
      { path: '/contacts', name: 'Contacts List' },
      { path: '/trips', name: 'Trips List' },
      { path: '/settings', name: 'Settings' },
      { path: '/ai/insights', name: 'AI Insights' },
    ];

    const headers = { Authorization: `Bearer ${this.token}` };

    for (const endpoint of protectedEndpoints) {
      try {
        const response = await axios.get(`${API_BASE}${endpoint.path}`, { headers });
        if (response.status === 200) {
          logSuccess(`${endpoint.name}: OK`);
          this.pass();
        } else {
          logError(`${endpoint.name}: Error ${response.status}`);
          this.fail();
        }
      } catch (error) {
        if (error.response?.status === 401) {
          logError(`${endpoint.name}: No autorizado (revisar autenticación)`);
        } else {
          logError(`${endpoint.name}: ${error.message}`);
        }
        this.fail();
      }
    }
  }

  async testContactsManagement() {
    logHeader('Gestión de Contactos');
    
    if (!this.token) {
      logWarning('Saltando pruebas de contactos - no hay autenticación');
      return;
    }

    const headers = { Authorization: `Bearer ${this.token}` };

    try {
      // Crear contacto de prueba
      const newContact = {
        firstName: 'Test',
        lastName: 'Contact',
        email: `test-${Date.now()}@example.com`,
        status: 'INTERESADO',
        source: 'WEBSITE',
      };

      const createResponse = await axios.post(`${API_BASE}/contacts`, newContact, { headers });
      
      if (createResponse.status === 201) {
        logSuccess('Creación de contacto: OK');
        this.testContactId = createResponse.data.data.id;
        this.pass();

        // Probar obtener contacto por ID
        try {
          const getResponse = await axios.get(`${API_BASE}/contacts/${this.testContactId}`, { headers });
          if (getResponse.status === 200) {
            logSuccess('Obtener contacto por ID: OK');
            this.pass();
          } else {
            logError('Error obteniendo contacto por ID');
            this.fail();
          }
        } catch (error) {
          logError(`Error obteniendo contacto: ${error.message}`);
          this.fail();
        }

        // Probar actualización
        try {
          const updateData = { firstName: 'Updated Test' };
          const updateResponse = await axios.put(`${API_BASE}/contacts/${this.testContactId}`, updateData, { headers });
          if (updateResponse.status === 200) {
            logSuccess('Actualización de contacto: OK');
            this.pass();
          } else {
            logError('Error actualizando contacto');
            this.fail();
          }
        } catch (error) {
          logError(`Error actualizando contacto: ${error.message}`);
          this.fail();
        }

      } else {
        logError('Error creando contacto');
        this.fail();
      }
    } catch (error) {
      logError(`Error en gestión de contactos: ${error.message}`);
      this.fail();
    }
  }

  async testAIFunctionality() {
    logHeader('Funcionalidad de IA');
    
    if (!this.token) {
      logWarning('Saltando pruebas de IA - no hay autenticación');
      return;
    }

    const headers = { Authorization: `Bearer ${this.token}` };

    try {
      // Probar consulta de IA
      const aiQuery = {
        query: '¿Cuántos contactos tengo?',
        context: { currentPage: 'dashboard' },
      };

      const aiResponse = await axios.post(`${API_BASE}/ai/query`, aiQuery, { headers });
      
      if (aiResponse.status === 200 && aiResponse.data.success) {
        logSuccess('Consulta de IA: OK');
        this.pass();
      } else {
        logError('Error en consulta de IA');
        this.fail();
      }

      // Probar insights
      const insightsResponse = await axios.get(`${API_BASE}/ai/insights`, { headers });
      if (insightsResponse.status === 200) {
        logSuccess('AI Insights: OK');
        this.pass();
      } else {
        logError('Error obteniendo insights');
        this.fail();
      }

    } catch (error) {
      if (error.response?.status === 401) {
        logError('IA requiere autenticación válida');
      } else {
        logError(`Error en funcionalidad de IA: ${error.message}`);
      }
      this.fail();
    }
  }

  async testTripsManagement() {
    logHeader('Gestión de Viajes');
    
    if (!this.token || !this.testContactId) {
      logWarning('Saltando pruebas de viajes - falta autenticación o contacto de prueba');
      return;
    }

    const headers = { Authorization: `Bearer ${this.token}` };

    try {
      // Obtener lista de viajes
      const tripsResponse = await axios.get(`${API_BASE}/trips`, { headers });
      if (tripsResponse.status === 200) {
        logSuccess('Lista de viajes: OK');
        this.pass();
      } else {
        logError('Error obteniendo lista de viajes');
        this.fail();
      }

      // Probar estadísticas de viajes
      const statsResponse = await axios.get(`${API_BASE}/trips/stats`, { headers });
      if (statsResponse.status === 200) {
        logSuccess('Estadísticas de viajes: OK');
        this.pass();
      } else {
        logError('Error obteniendo estadísticas de viajes');
        this.fail();
      }

    } catch (error)