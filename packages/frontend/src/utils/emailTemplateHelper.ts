// src/utils/emailTemplateHelper.ts
import { Contact } from "../types/contact.types";

export interface TemplateVariable {
  key: string;
  label: string;
  type: "text" | "number" | "date" | "email" | "phone";
  required: boolean;
  defaultValue?: string;
}

export interface ProcessedTemplate {
  subject: string;
  htmlContent: string;
  textContent: string;
  variables: Record<string, any>;
}

export class EmailTemplateHelper {
  // Variables disponibles para contactos
  static getContactVariables(): TemplateVariable[] {
    return [
      { key: "firstName", label: "Nombre", type: "text", required: true },
      { key: "lastName", label: "Apellido", type: "text", required: true },
      {
        key: "fullName",
        label: "Nombre completo",
        type: "text",
        required: true,
      },
      { key: "email", label: "Email", type: "email", required: true },
      { key: "phone", label: "Teléfono", type: "phone", required: false },
      { key: "status", label: "Estado", type: "text", required: true },
      {
        key: "createdAt",
        label: "Fecha de registro",
        type: "date",
        required: true,
      },
    ];
  }

  // Variables disponibles para viajes
  static getTripVariables(): TemplateVariable[] {
    return [
      { key: "destination", label: "Destino", type: "text", required: false },
      {
        key: "departureDate",
        label: "Fecha de salida",
        type: "date",
        required: false,
      },
      {
        key: "returnDate",
        label: "Fecha de regreso",
        type: "date",
        required: false,
      },
      {
        key: "travelers",
        label: "Número de viajeros",
        type: "number",
        required: false,
      },
      {
        key: "totalPrice",
        label: "Precio total",
        type: "number",
        required: false,
      },
      {
        key: "duration",
        label: "Duración (días)",
        type: "number",
        required: false,
      },
    ];
  }

  // Variables disponibles para ofertas/promociones
  static getPromotionVariables(): TemplateVariable[] {
    return [
      { key: "season", label: "Temporada", type: "text", required: false },
      {
        key: "discount",
        label: "Descuento (%)",
        type: "number",
        required: false,
      },
      {
        key: "validUntil",
        label: "Válido hasta",
        type: "date",
        required: false,
      },
      {
        key: "promoCode",
        label: "Código promocional",
        type: "text",
        required: false,
      },
      {
        key: "destination1",
        label: "Destino 1",
        type: "text",
        required: false,
      },
      {
        key: "discount1",
        label: "Descuento destino 1",
        type: "number",
        required: false,
      },
      {
        key: "destination2",
        label: "Destino 2",
        type: "text",
        required: false,
      },
      {
        key: "discount2",
        label: "Descuento destino 2",
        type: "number",
        required: false,
      },
      {
        key: "destination3",
        label: "Destino 3",
        type: "text",
        required: false,
      },
      {
        key: "discount3",
        label: "Descuento destino 3",
        type: "number",
        required: false,
      },
    ];
  }

  // Variables de la empresa/agencia
  static getCompanyVariables(): TemplateVariable[] {
    return [
      {
        key: "companyName",
        label: "Nombre de la empresa",
        type: "text",
        required: false,
        defaultValue: "Bukialo Travel",
      },
      {
        key: "companyPhone",
        label: "Teléfono de la empresa",
        type: "phone",
        required: false,
        defaultValue: "(123) 456-7890",
      },
      {
        key: "companyEmail",
        label: "Email de la empresa",
        type: "email",
        required: false,
        defaultValue: "info@bukialo.com",
      },
      {
        key: "companyAddress",
        label: "Dirección de la empresa",
        type: "text",
        required: false,
        defaultValue: "Av. Principal 123, Ciudad",
      },
      {
        key: "websiteUrl",
        label: "URL del sitio web",
        type: "text",
        required: false,
        defaultValue: "https://bukialo.com",
      },
      {
        key: "unsubscribeUrl",
        label: "URL para darse de baja",
        type: "text",
        required: false,
        defaultValue: "#",
      },
    ];
  }

  // Obtener todas las variables disponibles
  static getAllVariables(): TemplateVariable[] {
    return [
      ...this.getContactVariables(),
      ...this.getTripVariables(),
      ...this.getPromotionVariables(),
      ...this.getCompanyVariables(),
    ];
  }

  // Procesar template con datos del contacto
  static processTemplate(
    template: string,
    contact: Contact,
    additionalData?: Record<string, any>
  ): string {
    let result = template;

    // Preparar variables del contacto
    const contactVariables = {
      firstName: contact.firstName,
      lastName: contact.lastName,
      fullName: `${contact.firstName} ${contact.lastName}`,
      email: contact.email,
      phone: contact.phone || "",
      status: contact.status,
      createdAt: contact.createdAt
        ? new Date(contact.createdAt).toLocaleDateString()
        : "",
    };

    // Variables de la empresa (valores por defecto)
    const companyVariables = {
      companyName: "Bukialo Travel",
      companyPhone: "(123) 456-7890",
      companyEmail: "info@bukialo.com",
      companyAddress: "Av. Principal 123, Ciudad",
      websiteUrl: "https://bukialo.com",
      unsubscribeUrl: "#",
    };

    // Combinar todas las variables
    const allVariables = {
      ...contactVariables,
      ...companyVariables,
      ...additionalData,
    };

    // Reemplazar variables en formato {{variable}}
    Object.entries(allVariables).forEach(([key, value]) => {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, "g");
      result = result.replace(regex, String(value || ""));
    });

    // Limpiar variables no reemplazadas (opcional)
    result = result.replace(/{{[^}]+}}/g, "");

    return result;
  }

  // Extraer variables utilizadas en un template
  static extractVariables(template: string): string[] {
    const regex = /{{(\s*\w+\s*)}}/g;
    const matches: string[] = [];
    let match;

    while ((match = regex.exec(template)) !== null) {
      const variable = match[1].trim();
      if (!matches.includes(variable)) {
        matches.push(variable);
      }
    }

    return matches;
  }

  // Validar que todas las variables requeridas estén presentes
  static validateTemplate(
    template: string,
    availableData: Record<string, any>
  ): { isValid: boolean; missingVariables: string[] } {
    const usedVariables = this.extractVariables(template);
    const missingVariables = usedVariables.filter(
      (variable) => !(variable in availableData) || !availableData[variable]
    );

    return {
      isValid: missingVariables.length === 0,
      missingVariables,
    };
  }

  // Generar vista previa del template
  static generatePreview(
    template: string,
    sampleData?: Record<string, any>
  ): string {
    const defaultSampleData = {
      firstName: "María",
      lastName: "García",
      fullName: "María García",
      email: "maria@example.com",
      phone: "+54 11 1234-5678",
      status: "INTERESADO",
      createdAt: new Date().toLocaleDateString(),
      destination: "París, Francia",
      departureDate: "15/07/2025",
      returnDate: "22/07/2025",
      travelers: "2",
      totalPrice: "2,500",
      duration: "7",
      season: "Verano",
      discount: "25",
      validUntil: "30/06/2025",
      promoCode: "VERANO25",
      companyName: "Bukialo Travel",
      companyPhone: "(123) 456-7890",
      companyEmail: "info@bukialo.com",
      companyAddress: "Av. Principal 123, Ciudad",
      websiteUrl: "https://bukialo.com",
      unsubscribeUrl: "#",
    };

    const mergedData = { ...defaultSampleData, ...sampleData };

    return this.processTemplateWithData(template, mergedData);
  }

  // Procesar template con datos arbitrarios
  private static processTemplateWithData(
    template: string,
    data: Record<string, any>
  ): string {
    let result = template;

    Object.entries(data).forEach(([key, value]) => {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, "g");
      result = result.replace(regex, String(value || ""));
    });

    return result;
  }

  // Formatear datos según el tipo
  static formatValue(value: any, type: string): string {
    if (value === null || value === undefined) return "";

    switch (type) {
      case "date":
        return value instanceof Date
          ? value.toLocaleDateString()
          : String(value);
      case "number":
        return typeof value === "number"
          ? value.toLocaleString()
          : String(value);
      case "email":
      case "phone":
      case "text":
      default:
        return String(value);
    }
  }

  // Limpiar HTML para vista previa de texto plano
  static stripHtml(html: string): string {
    return html
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .trim();
  }

  // Añadir estilos CSS responsivos al HTML
  static addResponsiveStyles(htmlContent: string): string {
    let result = htmlContent;

    // Regex para encontrar clases de Tailwind y convertirlas a CSS inline
    const classRegex = /class\s*=\s*["']([^"']+)["']/g;

    result = result.replace(classRegex, (_match, classes = "") => {
      // Mapa básico de clases Tailwind a CSS inline
      const classMap: Record<string, string> = {
        "text-center": "text-align: center;",
        "text-left": "text-align: left;",
        "text-right": "text-align: right;",
        "font-bold": "font-weight: bold;",
        "font-medium": "font-weight: 500;",
        "text-white": "color: white;",
        "text-gray-600": "color: #6b7280;",
        "text-gray-900": "color: #111827;",
        "bg-white": "background-color: white;",
        "bg-gray-100": "background-color: #f3f4f6;",
        "p-4": "padding: 1rem;",
        "p-6": "padding: 1.5rem;",
        "mb-4": "margin-bottom: 1rem;",
        "mt-4": "margin-top: 1rem;",
        rounded: "border-radius: 0.25rem;",
        "rounded-lg": "border-radius: 0.5rem;",
      };

      const inlineStyles = classes
        .split(" ")
        .map((cls) => classMap[cls] || "")
        .filter(Boolean)
        .join(" ");

      return inlineStyles ? `style="${inlineStyles}"` : "";
    });

    return result;
  }

  // Validar formato de email HTML
  static validateEmailHtml(html: string): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Verificar estructura básica
    if (!html.includes("<html") && !html.includes("<div")) {
      errors.push("El template debe contener estructura HTML válida");
    }

    // Verificar que no use JavaScript
    if (html.includes("<script") || html.includes("javascript:")) {
      errors.push("El template no puede contener JavaScript");
    }

    // Verificar que use estilos inline (recomendado para emails)
    if (html.includes("<style") && !html.includes("style=")) {
      errors.push(
        "Se recomienda usar estilos inline en lugar de CSS en <style>"
      );
    }

    // Verificar anchura máxima recomendada
    if (!html.includes("max-width") && !html.includes("width")) {
      errors.push(
        "Se recomienda especificar un ancho máximo para compatibilidad"
      );
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
