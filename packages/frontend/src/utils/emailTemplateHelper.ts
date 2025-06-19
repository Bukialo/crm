/**
 * Frontend Email Template Helper
 * Utilidades para trabajar con templates de email en el frontend
 */

export interface TemplateVariable {
  name: string;
  type: "text" | "number" | "date" | "boolean";
  required?: boolean;
  defaultValue?: any;
  description?: string;
}

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
      if (value !== undefined && value !== null && value !== "") {
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
   * Procesa las variables aplicando valores por defecto y conversiones de tipo
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
      if (
        processed[templateVar.name] !== undefined &&
        processed[templateVar.name] !== ""
      ) {
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
            if (typeof processed[templateVar.name] === "string") {
              processed[templateVar.name] =
                processed[templateVar.name] === "true";
            } else {
              processed[templateVar.name] = Boolean(
                processed[templateVar.name]
              );
            }
            break;
        }
      }
    }

    return processed;
  }

  /**
   * Convierte HTML a texto plano
   */
  static htmlToText(html: string): string {
    // Create a temporary div to parse HTML
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;

    // Remove script and style elements
    const scripts = tempDiv.querySelectorAll("script, style");
    scripts.forEach((el) => el.remove());

    // Get text content and clean it up
    return (
      tempDiv.textContent ||
      tempDiv.innerText ||
      ""
        .replace(/\s+/g, " ") // Replace multiple spaces with single space
        .trim()
    );
  }

  /**
   * Formatea variables para mostrar en UI
   */
  static formatVariableForDisplay(
    value: any,
    type: TemplateVariable["type"]
  ): string {
    if (value === undefined || value === null) return "";

    switch (type) {
      case "date":
        if (value instanceof Date) {
          return value.toLocaleDateString("es-ES");
        }
        if (typeof value === "string") {
          const date = new Date(value);
          return isNaN(date.getTime())
            ? value
            : date.toLocaleDateString("es-ES");
        }
        return String(value);

      case "boolean":
        return value ? "Sí" : "No";

      case "number":
        return typeof value === "number"
          ? value.toLocaleString("es-ES")
          : String(value);

      default:
        return String(value);
    }
  }

  /**
   * Genera variables de ejemplo para un template
   */
  static generateSampleVariables(
    templateVariables: TemplateVariable[]
  ): Record<string, any> {
    const samples: Record<string, any> = {};

    const sampleData = {
      firstName: "Juan",
      lastName: "Pérez",
      email: "juan.perez@email.com",
      destination: "París",
      price: 1500,
      departureDate: new Date().toISOString().split("T")[0],
      returnDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      travelers: 2,
      agentName: "María García",
      agentPhone: "+1 (555) 123-4567",
      agentEmail: "maria.garcia@bukialo.com",
      companyName: "Bukialo",
      websiteUrl: "https://bukialo.com",
    };

    for (const variable of templateVariables) {
      if (variable.defaultValue !== undefined) {
        samples[variable.name] = variable.defaultValue;
      } else if (sampleData[variable.name as keyof typeof sampleData]) {
        samples[variable.name] =
          sampleData[variable.name as keyof typeof sampleData];
      } else {
        // Generate sample based on type
        switch (variable.type) {
          case "text":
            samples[variable.name] = `Ejemplo ${variable.name}`;
            break;
          case "number":
            samples[variable.name] = 123;
            break;
          case "date":
            samples[variable.name] = new Date().toISOString().split("T")[0];
            break;
          case "boolean":
            samples[variable.name] = true;
            break;
        }
      }
    }

    return samples;
  }

  /**
   * Extrae todas las variables utilizadas en un template HTML
   */
  static extractVariablesFromHtml(html: string): string[] {
    const regex = /\{\{(\w+)\}\}/g;
    const variables: string[] = [];
    let match;

    while ((match = regex.exec(html)) !== null) {
      if (!variables.includes(match[1])) {
        variables.push(match[1]);
      }
    }

    return variables;
  }

  /**
   * Valida que un template tenga la estructura HTML básica
   */
  static validateTemplateStructure(html: string): {
    isValid: boolean;
    issues: string[];
  } {
    const issues: string[] = [];

    // Check for basic HTML structure
    if (
      !html.toLowerCase().includes("<html") &&
      !html.toLowerCase().includes("<body")
    ) {
      issues.push("El template debería incluir estructura HTML básica");
    }

    // Check for potentially dangerous content
    const dangerousPatterns = [
      "javascript:",
      "<script",
      "onclick=",
      "onload=",
      "onerror=",
    ];

    for (const pattern of dangerousPatterns) {
      if (html.toLowerCase().includes(pattern)) {
        issues.push(
          `Contenido potencialmente peligroso encontrado: ${pattern}`
        );
      }
    }

    // Check for unclosed variables
    const openBraces = (html.match(/\{\{/g) || []).length;
    const closeBraces = (html.match(/\}\}/g) || []).length;

    if (openBraces !== closeBraces) {
      issues.push("Variables con llaves no balanceadas {{}}");
    }

    return {
      isValid: issues.length === 0,
      issues,
    };
  }

  /**
   * Limpia y sanitiza HTML para templates
   */
  static sanitizeHtml(html: string): string {
    // Remove potentially dangerous elements
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/javascript:/gi, "")
      .replace(/on\w+\s*=/gi, "");
  }

  /**
   * Genera CSS inline para mejor compatibilidad con clientes de email
   */
  static inlineStyles(html: string): string {
    // Esta es una implementación básica
    // En un entorno real, podrías usar una librería como 'juice' para esto

    const styleMap: Record<string, string> = {
      ".email-button":
        "display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: bold;",
      ".email-card":
        "background: white; padding: 25px; border-radius: 12px; margin: 25px 0; border-left: 4px solid #667eea;",
      ".email-container":
        "font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto;",
    };

    let result = html;

    Object.entries(styleMap).forEach(([className, styles]) => {
      const classRegex = new RegExp(
        `class=["']([^"']*\\s)?${className.slice(1)}(\\s[^"']*)?["']`,
        "gi"
      );
      result = result.replace(classRegex, (match, before = "", after = "") => {
        const existingClass = before + className.slice(1) + after;
        return `class="${existingClass.trim()}" style="${styles}"`;
      });
    });

    return result;
  }

  /**
   * Obtiene el color asociado a una categoría de template
   */
  static getCategoryColor(category: string): string {
    const colors: Record<string, string> = {
      welcome: "#4F46E5", // Indigo
      quote: "#059669", // Emerald
      follow_up: "#DC2626", // Red
      seasonal: "#D97706", // Amber
      post_trip: "#7C3AED", // Violet
      custom: "#6B7280", // Gray
    };

    return colors[category] || colors.custom;
  }

  /**
   * Obtiene el icono asociado a una categoría de template
   */
  static getCategoryIcon(category: string): string {
    const icons: Record<string, string> = {
      welcome: "👋",
      quote: "💰",
      follow_up: "📞",
      seasonal: "🌴",
      post_trip: "✈️",
      custom: "✏️",
    };

    return icons[category] || icons.custom;
  }
}
