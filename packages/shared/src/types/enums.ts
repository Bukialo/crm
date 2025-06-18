// Este archivo contiene enums y constantes compartidas
// que se pueden usar tanto en frontend como backend

// Contact Status Pipeline
export const CONTACT_STATUS_FLOW = {
  INTERESADO: {
    label: "Interesado",
    color: "blue",
    icon: "UserCheck",
    next: "PASAJERO",
  },
  PASAJERO: {
    label: "Pasajero",
    color: "amber",
    icon: "Plane",
    next: "CLIENTE",
  },
  CLIENTE: {
    label: "Cliente",
    color: "green",
    icon: "Star",
    next: null,
  },
} as const;

// Budget Range Configuration
export const BUDGET_RANGES = {
  LOW: {
    label: "Económico",
    min: 0,
    max: 1000,
    color: "gray",
  },
  MEDIUM: {
    label: "Medio",
    min: 1000,
    max: 3000,
    color: "blue",
  },
  HIGH: {
    label: "Alto",
    min: 3000,
    max: 10000,
    color: "purple",
  },
  LUXURY: {
    label: "Lujo",
    min: 10000,
    max: null,
    color: "gold",
  },
} as const;

// Travel Styles with Icons
export const TRAVEL_STYLES = {
  ADVENTURE: {
    label: "Aventura",
    icon: "Mountain",
    description: "Experiencias emocionantes y actividades al aire libre",
  },
  RELAXATION: {
    label: "Relax",
    icon: "Umbrella",
    description: "Descanso y tranquilidad en destinos paradisíacos",
  },
  CULTURAL: {
    label: "Cultural",
    icon: "Landmark",
    description: "Inmersión en historia, arte y tradiciones locales",
  },
  BUSINESS: {
    label: "Negocios",
    icon: "Briefcase",
    description: "Viajes corporativos y eventos empresariales",
  },
  LUXURY: {
    label: "Lujo",
    icon: "Gem",
    description: "Experiencias exclusivas y servicios premium",
  },
  FAMILY: {
    label: "Familiar",
    icon: "Users",
    description: "Destinos y actividades para toda la familia",
  },
  ROMANTIC: {
    label: "Romántico",
    icon: "Heart",
    description: "Escapadas románticas y lunas de miel",
  },
} as const;

// Trip Status Flow
export const TRIP_STATUS_FLOW = {
  QUOTE: {
    label: "Cotización",
    color: "yellow",
    next: "BOOKED",
  },
  BOOKED: {
    label: "Reservado",
    color: "blue",
    next: "CONFIRMED",
  },
  CONFIRMED: {
    label: "Confirmado",
    color: "green",
    next: "COMPLETED",
  },
  COMPLETED: {
    label: "Completado",
    color: "gray",
    next: null,
  },
  CANCELLED: {
    label: "Cancelado",
    color: "red",
    next: null,
  },
} as const;

// Task Priority Levels
export const TASK_PRIORITIES = {
  LOW: {
    label: "Baja",
    color: "gray",
    weight: 1,
  },
  MEDIUM: {
    label: "Media",
    color: "blue",
    weight: 2,
  },
  HIGH: {
    label: "Alta",
    color: "orange",
    weight: 3,
  },
  URGENT: {
    label: "Urgente",
    color: "red",
    weight: 4,
  },
} as const;

// Activity Types
export const ACTIVITY_TYPES = {
  email_sent: {
    label: "Email enviado",
    icon: "Mail",
    color: "blue",
  },
  call_made: {
    label: "Llamada realizada",
    icon: "Phone",
    color: "green",
  },
  meeting_held: {
    label: "Reunión realizada",
    icon: "Calendar",
    color: "purple",
  },
  quote_sent: {
    label: "Cotización enviada",
    icon: "FileText",
    color: "orange",
  },
  payment_received: {
    label: "Pago recibido",
    icon: "DollarSign",
    color: "green",
  },
  document_uploaded: {
    label: "Documento subido",
    icon: "Upload",
    color: "gray",
  },
  task_completed: {
    label: "Tarea completada",
    icon: "CheckCircle",
    color: "green",
  },
  note_added: {
    label: "Nota agregada",
    icon: "StickyNote",
    color: "yellow",
  },
} as const;

// Date Ranges for Filters
export const DATE_RANGES = {
  TODAY: {
    label: "Hoy",
    getValue: () => {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      const end = new Date();
      end.setHours(23, 59, 59, 999);
      return { start, end };
    },
  },
  YESTERDAY: {
    label: "Ayer",
    getValue: () => {
      const start = new Date();
      start.setDate(start.getDate() - 1);
      start.setHours(0, 0, 0, 0);
      const end = new Date();
      end.setDate(end.getDate() - 1);
      end.setHours(23, 59, 59, 999);
      return { start, end };
    },
  },
  LAST_7_DAYS: {
    label: "Últimos 7 días",
    getValue: () => {
      const start = new Date();
      start.setDate(start.getDate() - 7);
      start.setHours(0, 0, 0, 0);
      const end = new Date();
      end.setHours(23, 59, 59, 999);
      return { start, end };
    },
  },
  LAST_30_DAYS: {
    label: "Últimos 30 días",
    getValue: () => {
      const start = new Date();
      start.setDate(start.getDate() - 30);
      start.setHours(0, 0, 0, 0);
      const end = new Date();
      end.setHours(23, 59, 59, 999);
      return { start, end };
    },
  },
  THIS_MONTH: {
    label: "Este mes",
    getValue: () => {
      const start = new Date();
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      const end = new Date();
      end.setMonth(end.getMonth() + 1);
      end.setDate(0);
      end.setHours(23, 59, 59, 999);
      return { start, end };
    },
  },
  LAST_MONTH: {
    label: "Mes pasado",
    getValue: () => {
      const start = new Date();
      start.setMonth(start.getMonth() - 1);
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      const end = new Date();
      end.setDate(0);
      end.setHours(23, 59, 59, 999);
      return { start, end };
    },
  },
  THIS_YEAR: {
    label: "Este año",
    getValue: () => {
      const start = new Date();
      start.setMonth(0);
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      const end = new Date();
      end.setFullYear(end.getFullYear() + 1);
      end.setMonth(0);
      end.setDate(0);
      end.setHours(23, 59, 59, 999);
      return { start, end };
    },
  },
  CUSTOM: {
    label: "Personalizado",
    getValue: () => null,
  },
} as const;

// Permission Levels
export const PERMISSIONS = {
  // Contacts
  CONTACT_VIEW: "contact:view",
  CONTACT_CREATE: "contact:create",
  CONTACT_EDIT: "contact:edit",
  CONTACT_DELETE: "contact:delete",
  CONTACT_EXPORT: "contact:export",

  // Trips
  TRIP_VIEW: "trip:view",
  TRIP_CREATE: "trip:create",
  TRIP_EDIT: "trip:edit",
  TRIP_DELETE: "trip:delete",

  // Campaigns
  CAMPAIGN_VIEW: "campaign:view",
  CAMPAIGN_CREATE: "campaign:create",
  CAMPAIGN_EDIT: "campaign:edit",
  CAMPAIGN_DELETE: "campaign:delete",
  CAMPAIGN_SEND: "campaign:send",

  // Reports
  REPORT_VIEW: "report:view",
  REPORT_EXPORT: "report:export",

  // Settings
  SETTINGS_VIEW: "settings:view",
  SETTINGS_EDIT: "settings:edit",

  // Users
  USER_VIEW: "user:view",
  USER_CREATE: "user:create",
  USER_EDIT: "user:edit",
  USER_DELETE: "user:delete",
} as const;

// Role Permissions Mapping
export const ROLE_PERMISSIONS = {
  ADMIN: Object.values(PERMISSIONS),
  MANAGER: [
    PERMISSIONS.CONTACT_VIEW,
    PERMISSIONS.CONTACT_CREATE,
    PERMISSIONS.CONTACT_EDIT,
    PERMISSIONS.CONTACT_EXPORT,
    PERMISSIONS.TRIP_VIEW,
    PERMISSIONS.TRIP_CREATE,
    PERMISSIONS.TRIP_EDIT,
    PERMISSIONS.CAMPAIGN_VIEW,
    PERMISSIONS.CAMPAIGN_CREATE,
    PERMISSIONS.CAMPAIGN_EDIT,
    PERMISSIONS.CAMPAIGN_SEND,
    PERMISSIONS.REPORT_VIEW,
    PERMISSIONS.REPORT_EXPORT,
    PERMISSIONS.USER_VIEW,
  ],
  AGENT: [
    PERMISSIONS.CONTACT_VIEW,
    PERMISSIONS.CONTACT_CREATE,
    PERMISSIONS.CONTACT_EDIT,
    PERMISSIONS.TRIP_VIEW,
    PERMISSIONS.TRIP_CREATE,
    PERMISSIONS.TRIP_EDIT,
    PERMISSIONS.CAMPAIGN_VIEW,
    PERMISSIONS.REPORT_VIEW,
  ],
  VIEWER: [
    PERMISSIONS.CONTACT_VIEW,
    PERMISSIONS.TRIP_VIEW,
    PERMISSIONS.CAMPAIGN_VIEW,
    PERMISSIONS.REPORT_VIEW,
  ],
} as const;
