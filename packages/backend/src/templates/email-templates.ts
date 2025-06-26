/**
 * Email Templates Utilities
 * Funciones helper para trabajar con templates de email
 */

export interface TemplateVariable {
  name: string;
  type: "text" | "number" | "date" | "boolean";
  required?: boolean;
  defaultValue?: any;
  description?: string;
}

export interface EmailTemplateConfig {
  name: string;
  category: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
  variables: TemplateVariable[];
  isActive: boolean;
}

// Template categories
export const EMAIL_CATEGORIES = {
  WELCOME: {
    value: "welcome",
    label: "Bienvenida",
    icon: "👋",
    description: "Emails de bienvenida para nuevos clientes",
  },
  QUOTE: {
    value: "quote",
    label: "Cotización",
    icon: "💰",
    description: "Envío de cotizaciones de viajes",
  },
  FOLLOW_UP: {
    value: "follow_up",
    label: "Seguimiento",
    icon: "📞",
    description: "Emails de seguimiento a clientes",
  },
  SEASONAL: {
    value: "seasonal",
    label: "Temporada",
    icon: "🌴",
    description: "Promociones estacionales y ofertas especiales",
  },
  POST_TRIP: {
    value: "post_trip",
    label: "Post-viaje",
    icon: "✈️",
    description: "Seguimiento después del viaje",
  },
  CUSTOM: {
    value: "custom",
    label: "Personalizado",
    icon: "✏️",
    description: "Templates personalizados",
  },
} as const;

// Common email styles
export const EMAIL_STYLES = `
    <style>
      .email-container {
        font-family: 'Helvetica Neue', Arial, sans-serif;
        line-height: 1.6;
        color: #333;
        max-width: 600px;
        margin: 0 auto;
        background: #ffffff;
      }
      
      .email-header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 30px;
        text-align: center;
      }
      
      .email-header h1 {
        margin: 0;
        font-size: 28px;
        font-weight: bold;
      }
      
      .email-content {
        padding: 30px;
        background: #f9f9f9;
      }
      
      .email-content h2 {
        color: #333;
        margin-top: 0;
      }
      
      .email-button {
        display: inline-block;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 12px 30px;
        text-decoration: none;
        border-radius: 25px;
        font-weight: bold;
        margin: 10px 0;
      }
      
      .email-button:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(139, 92, 246, 0.3);
      }
      
      .email-card {
        background: white;
        padding: 25px;
        border-radius: 12px;
        margin: 25px 0;
        border-left: 4px solid #667eea;
      }
      
      .email-table {
        width: 100%;
        border-collapse: collapse;
      }
      
      .email-table td {
        padding: 8px 0;
        border-bottom: 1px solid #eee;
      }
      
      .email-footer {
        background: #333;
        color: white;
        padding: 20px;
        text-align: center;
        font-size: 14px;
      }
      
      .highlight-box {
        background: #e8f5e8;
        padding: 20px;
        border-radius: 8px;
        margin: 20px 0;
      }
      
      .warning-box {
        background: #fff3cd;
        padding: 15px;
        border-radius: 8px;
        margin: 20px 0;
        border-left: 4px solid #ffc107;
        color: #856404;
      }
      
      .price-highlight {
        font-size: 24px;
        color: #f5576c;
        font-weight: bold;
      }
    </style>
  `;

// Base HTML structure
export const EMAIL_BASE_HTML = `
  <!DOCTYPE html>
  <html lang="es">
  <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <title>{{emailTitle}}</title>
      ${EMAIL_STYLES}
  </head>
  <body style="margin: 0; padding: 0; background-color: #f4f4f4;">
      <div class="email-container">
          {{emailContent}}
      </div>
  </body>
  </html>
  `;

// Helper functions
export class EmailTemplateHelper {
  /**
   * Valida las variables de un template
   */
  static validateVariables(
    variables: Record<string, any>,
    templateVariables: TemplateVariable[]
  ): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    for (const templateVar of templateVariables) {
      const value = variables[templateVar.name];

      // Check required variables
      if (
        templateVar.required &&
        (value === undefined || value === null || value === "")
      ) {
        errors.push(`Variable requerida faltante: ${templateVar.name}`);
        continue;
      }

      // Type validation
      if (value !== undefined && value !== null) {
        switch (templateVar.type) {
          case "number":
            if (isNaN(Number(value))) {
              errors.push(`Variable ${templateVar.name} debe ser un número`);
            }
            break;
          case "date":
            if (isNaN(Date.parse(value))) {
              errors.push(
                `Variable ${templateVar.name} debe ser una fecha válida`
              );
            }
            break;
          case "boolean":
            if (
              typeof value !== "boolean" &&
              value !== "true" &&
              value !== "false"
            ) {
              errors.push(
                `Variable ${templateVar.name} debe ser verdadero o falso`
              );
            }
            break;
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Procesa las variables aplicando valores por defecto
   */
  static processVariables(
    variables: Record<string, any>,
    templateVariables: TemplateVariable[]
  ): Record<string, any> {
    const processed = { ...variables };

    for (const templateVar of templateVariables) {
      if (
        processed[templateVar.name] === undefined &&
        templateVar.defaultValue !== undefined
      ) {
        processed[templateVar.name] = templateVar.defaultValue;
      }

      // Type conversion
      if (processed[templateVar.name] !== undefined) {
        switch (templateVar.type) {
          case "number":
            processed[templateVar.name] = Number(processed[templateVar.name]);
            break;
          case "date":
            if (typeof processed[templateVar.name] === "string") {
              const date = new Date(processed[templateVar.name]);
              processed[templateVar.name] = date.toLocaleDateString("es-ES");
            }
            break;
          case "boolean":
            processed[templateVar.name] = Boolean(processed[templateVar.name]);
            break;
        }
      }
    }

    return processed;
  }

  /**
   * Reemplaza variables en el contenido del template
   */
  static replaceVariables(
    content: string,
    variables: Record<string, any>
  ): string {
    let result = content;

    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, "g");
      result = result.replace(regex, String(value || ""));
    });

    // Handle conditional blocks (Handlebars-like syntax)
    result = this.processConditionals(result, variables);

    return result;
  }

  /**
   * Procesa bloques condicionales en el template
   */
  private static processConditionals(
    content: string,
    variables: Record<string, any>
  ): string {
    let result = content;

    // Process {{#if variable}} ... {{/if}} blocks
    const ifRegex = /{{#if\s+(\w+)}}([\s\S]*?){{\/if}}/g;
    // CORREGIDO: Remover parámetro 'match' no usado
    result = result.replace(ifRegex, (_, varName, block) => {
      return variables[varName] ? block : "";
    });

    // Process {{#unless variable}} ... {{/unless}} blocks
    const unlessRegex = /{{#unless\s+(\w+)}}([\s\S]*?){{\/unless}}/g;
    // CORREGIDO: Remover parámetro 'match' no usado
    result = result.replace(unlessRegex, (_, varName, block) => {
      return !variables[varName] ? block : "";
    });

    return result;
  }

  /**
   * Extrae variables utilizadas en un template
   */
  static extractVariables(content: string): string[] {
    const regex = /{{(\w+)}}/g;
    const variables: string[] = [];
    let match;

    while ((match = regex.exec(content)) !== null) {
      // CORREGIDO: Verificar que match[1] existe antes de usarlo
      if (match[1] && !variables.includes(match[1])) {
        variables.push(match[1]);
      }
    }

    return variables;
  }

  /**
   * Genera un template básico con las variables especificadas
   */
  static generateBasicTemplate(
    title: string,
    variables: TemplateVariable[]
  ): EmailTemplateConfig {
    const varList = variables.map((v) => `{{${v.name}}}`).join(", ");

    const htmlContent = EMAIL_BASE_HTML.replace(
      "{{emailContent}}",
      `
        <div class="email-header">
          <h1>${title}</h1>
        </div>
        <div class="email-content">
          <h2>Hola {{firstName}},</h2>
          <p>Este es un template básico con las siguientes variables:</p>
          <div class="email-card">
            <p>${varList}</p>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="{{actionUrl}}" class="email-button">Botón de Acción</a>
          </div>
          <p>Saludos cordiales,<br><strong>El equipo de Bukialo</strong></p>
        </div>
        <div class="email-footer">
          <p>© 2025 Bukialo CRM. Todos los derechos reservados.</p>
        </div>
      `
    );

    return {
      name: title,
      category: "custom",
      subject: `${title} - {{firstName}}`,
      htmlContent,
      variables: [
        {
          name: "firstName",
          type: "text",
          required: true,
          description: "Nombre del destinatario",
        },
        {
          name: "actionUrl",
          type: "text",
          required: false,
          description: "URL del botón de acción",
        },
        ...variables,
      ],
      isActive: true,
    };
  }

  /**
   * Convierte HTML a texto plano para la versión text del email
   */
  static htmlToText(html: string): string {
    return html
      .replace(/<[^>]*>/g, "") // Remove HTML tags
      .replace(/&nbsp;/g, " ") // Replace &nbsp; with spaces
      .replace(/&amp;/g, "&") // Replace &amp; with &
      .replace(/&lt;/g, "<") // Replace &lt; with <
      .replace(/&gt;/g, ">") // Replace &gt; with >
      .replace(/&quot;/g, '"') // Replace &quot; with "
      .replace(/&#39;/g, "'") // Replace &#39; with '
      .replace(/\s+/g, " ") // Replace multiple spaces with single space
      .trim();
  }

  /**
   * Valida que el HTML del template sea seguro
   */
  static validateHtmlSecurity(html: string): {
    isSecure: boolean;
    issues: string[];
  } {
    const issues: string[] = [];

    // Check for potentially dangerous tags
    const dangerousTags = ["script", "object", "embed", "iframe", "form"];
    for (const tag of dangerousTags) {
      if (html.toLowerCase().includes(`<${tag}`)) {
        issues.push(`Etiqueta potencialmente peligrosa encontrada: ${tag}`);
      }
    }

    // Check for javascript: URLs
    if (html.toLowerCase().includes("javascript:")) {
      issues.push("URLs con javascript: encontradas");
    }

    // Check for external scripts
    if (
      html.toLowerCase().includes("src=") &&
      html.toLowerCase().includes("http")
    ) {
      issues.push("Referencias a recursos externos encontradas");
    }

    return {
      isSecure: issues.length === 0,
      issues,
    };
  }
}
