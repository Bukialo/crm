import { z } from "zod";

// Enums para tipos de triggers y acciones
const AutomationTriggerType = z.enum([
  "CONTACT_CREATED",
  "TRIP_QUOTE_REQUESTED",
  "PAYMENT_OVERDUE",
  "TRIP_COMPLETED",
  "NO_ACTIVITY_30_DAYS",
  "SEASONAL_OPPORTUNITY",
  "BIRTHDAY",
  "CUSTOM",
]);

const AutomationActionType = z.enum([
  "SEND_EMAIL",
  "CREATE_TASK",
  "SCHEDULE_CALL",
  "ADD_TAG",
  "UPDATE_STATUS",
  "GENERATE_QUOTE",
  "ASSIGN_AGENT",
  "SEND_WHATSAPP",
]);

const TaskPriority = z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]);
const ContactStatus = z.enum(["INTERESADO", "PASAJERO", "CLIENTE"]);

// Schema para una acción de automatización
const automationActionSchema = z.object({
  type: AutomationActionType,
  parameters: z.record(z.any()),
  delayMinutes: z.number().min(0).optional().default(0),
  order: z.number().int().min(1),
});

// Schema base de automatización
const automationBaseSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  description: z.string().max(1000).optional(),
  triggerType: AutomationTriggerType,
  triggerConditions: z.record(z.any()),
  actions: z
    .array(automationActionSchema)
    .min(1, "At least one action is required")
    .max(10),
});

// Schema para crear automatización
export const createAutomationSchema = z.object({
  body: automationBaseSchema,
});

// Schema para actualizar automatización
export const updateAutomationSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid automation ID"),
  }),
  body: automationBaseSchema.partial(),
});

// Schema para obtener automatización por ID
export const getAutomationSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid automation ID"),
  }),
});

// Schema para listar automatizaciones
export const listAutomationsSchema = z.object({
  query: z.object({
    isActive: z.enum(["true", "false"]).optional(),
    triggerType: AutomationTriggerType.optional(),
    page: z.coerce.number().int().positive().optional().default(1),
    pageSize: z.coerce
      .number()
      .int()
      .positive()
      .max(100)
      .optional()
      .default(20),
  }),
});

// Schema para ejecutar automatización
export const executeAutomationSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid automation ID"),
  }),
  body: z.object({
    triggerData: z.record(z.any()),
  }),
});

// Schemas específicos para parámetros de acciones
export const sendEmailActionSchema = z.object({
  templateId: z.string().uuid("Invalid template ID"),
  variables: z.record(z.any()).optional(),
  to: z.array(z.string().email()).optional(), // Si no se especifica, se usa el email del contacto
});

export const createTaskActionSchema = z.object({
  title: z.string().min(1, "Task title is required"),
  description: z.string().optional(),
  priority: TaskPriority.optional().default("MEDIUM"),
  assignedToId: z.string().uuid("Invalid user ID"),
  dueDate: z.coerce.date().optional(),
});

export const addTagActionSchema = z.object({
  tags: z.array(z.string().min(1)).min(1, "At least one tag is required"),
});

export const updateStatusActionSchema = z.object({
  status: ContactStatus,
  reason: z.string().optional(),
});

export const assignAgentActionSchema = z.object({
  agentId: z.string().uuid("Invalid agent ID"),
});

export const scheduleCallActionSchema = z.object({
  title: z.string().min(1, "Call title is required"),
  scheduledDate: z.coerce.date(),
  duration: z.number().int().min(5).max(480).optional().default(30), // 5 min a 8 horas
  description: z.string().optional(),
});

// Schema para validar condiciones de triggers específicos
export const contactCreatedTriggerSchema = z.object({
  status: ContactStatus.optional(),
  source: z
    .enum([
      "WEBSITE",
      "REFERRAL",
      "SOCIAL_MEDIA",
      "ADVERTISING",
      "DIRECT",
      "PARTNER",
      "OTHER",
    ])
    .optional(),
  budgetRange: z.enum(["LOW", "MEDIUM", "HIGH", "LUXURY"]).optional(),
  tags: z.array(z.string()).optional(),
});

export const noActivityTriggerSchema = z.object({
  days: z.number().int().min(1).max(365),
  status: ContactStatus.optional(),
  excludeTags: z.array(z.string()).optional(),
});

export const paymentOverdueTriggerSchema = z.object({
  daysOverdue: z.number().int().min(1).max(365),
  minAmount: z.number().min(0).optional(),
  maxAmount: z.number().min(0).optional(),
});

export const tripCompletedTriggerSchema = z.object({
  destination: z.string().optional(),
  minRating: z.number().min(1).max(5).optional(),
  daysAfterReturn: z.number().int().min(0).max(30).optional().default(1),
});

export const birthdayTriggerSchema = z.object({
  daysBefore: z.number().int().min(0).max(30).optional().default(0),
  status: ContactStatus.optional(),
  includeInactive: z.boolean().optional().default(false),
});

// Función helper para validar parámetros de acciones según su tipo
export const validateActionParameters = (
  actionType: string,
  parameters: any
) => {
  switch (actionType) {
    case "SEND_EMAIL":
      return sendEmailActionSchema.parse(parameters);
    case "CREATE_TASK":
      return createTaskActionSchema.parse(parameters);
    case "ADD_TAG":
      return addTagActionSchema.parse(parameters);
    case "UPDATE_STATUS":
      return updateStatusActionSchema.parse(parameters);
    case "ASSIGN_AGENT":
      return assignAgentActionSchema.parse(parameters);
    case "SCHEDULE_CALL":
      return scheduleCallActionSchema.parse(parameters);
    default:
      throw new Error(`Unknown action type: ${actionType}`);
  }
};

// Función helper para validar condiciones de triggers según su tipo
export const validateTriggerConditions = (
  triggerType: string,
  conditions: any
) => {
  switch (triggerType) {
    case "CONTACT_CREATED":
      return contactCreatedTriggerSchema.parse(conditions);
    case "NO_ACTIVITY_30_DAYS":
      return noActivityTriggerSchema.parse(conditions);
    case "PAYMENT_OVERDUE":
      return paymentOverdueTriggerSchema.parse(conditions);
    case "TRIP_COMPLETED":
      return tripCompletedTriggerSchema.parse(conditions);
    case "BIRTHDAY":
      return birthdayTriggerSchema.parse(conditions);
    default:
      // Para triggers personalizados, permitir cualquier estructura
      return z.record(z.any()).parse(conditions);
  }
};
