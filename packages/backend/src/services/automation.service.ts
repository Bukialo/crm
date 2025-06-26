import { prisma } from "../lib/prisma";
import { logger } from "../utils/logger";
import {
  Automation,
  AutomationAction,
  AutomationTriggerType,
  AutomationActionType,
} from "@prisma/client";
// CORREGIDO: Remover Contact y Trip no usados
import { AppError, NotFoundError } from "../utils/errors";

export interface CreateAutomationDto {
  name: string;
  description?: string;
  triggerType: AutomationTriggerType;
  triggerConditions: Record<string, any>;
  actions: Array<{
    type: AutomationActionType;
    parameters: Record<string, any>;
    delayMinutes?: number;
    order: number;
  }>;
}

export interface AutomationFilter {
  isActive?: boolean;
  triggerType?: AutomationTriggerType;
  createdById?: string;
}

export interface AutomationWithActions extends Automation {
  actions: AutomationAction[];
  executions: Array<{
    id: string;
    status: string;
    startedAt: Date;
    completedAt?: Date;
    error?: string;
  }>;
}

export interface ExecutionResult {
  automationId: string;
  success: boolean;
  actionsExecuted: number;
  error?: string;
  duration: number;
}

export class AutomationService {
  async create(
    data: CreateAutomationDto,
    userId: string
  ): Promise<AutomationWithActions> {
    try {
      const automation = await prisma.$transaction(async (tx) => {
        // Crear la automatización
        const newAutomation = await tx.automation.create({
          data: {
            name: data.name,
            description: data.description,
            triggerType: data.triggerType,
            triggerConditions: data.triggerConditions,
            createdById: userId,
          },
        });

        // Crear las acciones
        await tx.automationAction.createMany({
          data: data.actions.map((action) => ({
            automationId: newAutomation.id,
            actionType: action.type,
            parameters: action.parameters,
            delayMinutes: action.delayMinutes || 0,
            order: action.order,
          })),
        });

        return newAutomation;
      });

      return this.findById(automation.id);
    } catch (error) {
      logger.error("Error creating automation:", error);
      throw error;
    }
  }

  async findAll(
    filters: AutomationFilter = {}
  ): Promise<AutomationWithActions[]> {
    const where: any = {};

    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    if (filters.triggerType) {
      where.triggerType = filters.triggerType;
    }

    if (filters.createdById) {
      where.createdById = filters.createdById;
    }

    const automations = await prisma.automation.findMany({
      where,
      include: {
        actions: {
          orderBy: { order: "asc" },
        },
        executions: {
          orderBy: { startedAt: "desc" },
          take: 5,
          select: {
            id: true,
            status: true,
            startedAt: true,
            completedAt: true,
            error: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return automations as AutomationWithActions[];
  }

  async findById(id: string): Promise<AutomationWithActions> {
    const automation = await prisma.automation.findUnique({
      where: { id },
      include: {
        actions: {
          orderBy: { order: "asc" },
        },
        executions: {
          orderBy: { startedAt: "desc" },
          take: 10,
          select: {
            id: true,
            status: true,
            startedAt: true,
            completedAt: true,
            error: true,
          },
        },
      },
    });

    if (!automation) {
      throw new NotFoundError("Automation");
    }

    return automation as AutomationWithActions;
  }

  async update(
    id: string,
    data: Partial<CreateAutomationDto>
  ): Promise<AutomationWithActions> {
    const existingAutomation = await prisma.automation.findUnique({
      where: { id },
    });

    if (!existingAutomation) {
      throw new NotFoundError("Automation");
    }

    const automation = await prisma.$transaction(async (tx) => {
      // Actualizar la automatización
      const updatedAutomation = await tx.automation.update({
        where: { id },
        data: {
          name: data.name,
          description: data.description,
          triggerType: data.triggerType,
          triggerConditions: data.triggerConditions,
        },
      });

      // Si se actualizaron las acciones, reemplazarlas
      if (data.actions) {
        // Eliminar acciones existentes
        await tx.automationAction.deleteMany({
          where: { automationId: id },
        });

        // Crear nuevas acciones
        await tx.automationAction.createMany({
          data: data.actions.map((action) => ({
            automationId: id,
            actionType: action.type,
            parameters: action.parameters,
            delayMinutes: action.delayMinutes || 0,
            order: action.order,
          })),
        });
      }

      return updatedAutomation;
    });

    logger.info(`Automation updated: ${id}`);
    return this.findById(automation.id);
  }

  async delete(id: string): Promise<void> {
    const automation = await prisma.automation.findUnique({
      where: { id },
    });

    if (!automation) {
      throw new NotFoundError("Automation");
    }

    await prisma.automation.delete({
      where: { id },
    });

    logger.info(`Automation deleted: ${id}`);
  }

  async toggleActive(id: string): Promise<AutomationWithActions> {
    const automation = await prisma.automation.findUnique({
      where: { id },
    });

    if (!automation) {
      throw new NotFoundError("Automation");
    }

    const updatedAutomation = await prisma.automation.update({
      where: { id },
      data: { isActive: !automation.isActive },
    });

    logger.info(
      `Automation toggled: ${id} - Active: ${updatedAutomation.isActive}`
    );
    return this.findById(updatedAutomation.id);
  }

  // CORREGIDO: Ejecutar automatización - parámetro triggerData renombrado
  async executeAutomation(
    automationId: string,
    _triggerData: Record<string, any>
  ): Promise<ExecutionResult> {
    const startTime = Date.now();
    let executionId: string | null = null;

    try {
      const automation = await this.findById(automationId);

      if (!automation.isActive) {
        throw new AppError("Automation is not active", 400);
      }

      // Crear registro de ejecución
      const execution = await prisma.automationExecution.create({
        data: {
          automationId,
          triggeredBy: _triggerData,
          status: "running",
        },
      });
      executionId = execution.id;

      let actionsExecuted = 0;
      const actionsLog: any[] = [];

      // Ejecutar acciones en orden
      for (const action of automation.actions) {
        try {
          // Aplicar delay si es necesario
          if (action.delayMinutes > 0) {
            await this.scheduleDelayedAction(action, _triggerData);
            continue;
          }

          const result = await this.executeAction(action, _triggerData);
          actionsExecuted++;
          actionsLog.push({
            actionId: action.id,
            type: action.actionType,
            status: "completed",
            result,
            executedAt: new Date(),
          });

          logger.info(
            `Action executed: ${action.actionType} for automation ${automationId}`
          );
        } catch (error) {
          logger.error(`Error executing action ${action.actionType}:`, error);
          actionsLog.push({
            actionId: action.id,
            type: action.actionType,
            status: "failed",
            error: error instanceof Error ? error.message : "Unknown error",
            executedAt: new Date(),
          });
        }
      }

      // Actualizar registro de ejecución
      await prisma.automationExecution.update({
        where: { id: executionId },
        data: {
          status: "completed",
          completedAt: new Date(),
          actionsExecuted: actionsLog,
        },
      });

      const duration = Date.now() - startTime;

      logger.info(
        `Automation executed successfully: ${automationId} in ${duration}ms`
      );

      return {
        automationId,
        success: true,
        actionsExecuted,
        duration,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      // Actualizar registro de ejecución con error
      if (executionId) {
        await prisma.automationExecution.update({
          where: { id: executionId },
          data: {
            status: "failed",
            completedAt: new Date(),
            error: errorMessage,
          },
        });
      }

      logger.error(`Automation execution failed: ${automationId}`, error);

      return {
        automationId,
        success: false,
        actionsExecuted: 0,
        error: errorMessage,
        duration,
      };
    }
  }

  // Ejecutar una acción específica
  private async executeAction(
    action: AutomationAction,
    triggerData: Record<string, any>
  ): Promise<any> {
    switch (action.actionType) {
      case "SEND_EMAIL":
        return this.executeSendEmailAction(action.parameters, triggerData);

      case "CREATE_TASK":
        return this.executeCreateTaskAction(action.parameters, triggerData);

      case "ADD_TAG":
        return this.executeAddTagAction(action.parameters, triggerData);

      case "UPDATE_STATUS":
        return this.executeUpdateStatusAction(action.parameters, triggerData);

      case "ASSIGN_AGENT":
        return this.executeAssignAgentAction(action.parameters, triggerData);

      default:
        throw new AppError(`Unknown action type: ${action.actionType}`, 400);
    }
  }

  // Implementación de acciones específicas
  private async executeSendEmailAction(parameters: any, triggerData: any) {
    // CORREGIDO: Remover variables 'to' y 'variables' no usadas
    const { templateId } = parameters;
    const contactId = triggerData.contactId;

    if (!contactId) {
      throw new AppError("Contact ID required for email action", 400);
    }

    const contact = await prisma.contact.findUnique({
      where: { id: contactId },
    });

    if (!contact) {
      throw new AppError("Contact not found", 404);
    }

    // Aquí se integraría con el servicio de email real
    // Por ahora simulamos el envío
    logger.info(`Email sent to ${contact.email} using template ${templateId}`);

    return {
      recipient: contact.email,
      templateId,
      sentAt: new Date(),
    };
  }

  private async executeCreateTaskAction(parameters: any, triggerData: any) {
    const { title, description, priority, assignedToId, dueDate } = parameters;
    const contactId = triggerData.contactId;

    const task = await prisma.task.create({
      data: {
        title,
        description,
        priority: priority || "MEDIUM",
        assignedToId,
        contactId,
        dueDate: dueDate ? new Date(dueDate) : undefined,
      },
    });

    return { taskId: task.id };
  }

  private async executeAddTagAction(parameters: any, triggerData: any) {
    const { tags } = parameters;
    const contactId = triggerData.contactId;

    if (!contactId) {
      throw new AppError("Contact ID required for tag action", 400);
    }

    const contact = await prisma.contact.findUnique({
      where: { id: contactId },
    });

    if (!contact) {
      throw new AppError("Contact not found", 404);
    }

    const updatedTags = [...new Set([...contact.tags, ...tags])];

    await prisma.contact.update({
      where: { id: contactId },
      data: { tags: updatedTags },
    });

    return { addedTags: tags };
  }

  private async executeUpdateStatusAction(parameters: any, triggerData: any) {
    const { status } = parameters;
    const contactId = triggerData.contactId;

    if (!contactId) {
      throw new AppError("Contact ID required for status action", 400);
    }

    await prisma.contact.update({
      where: { id: contactId },
      data: { status },
    });

    return { newStatus: status };
  }

  private async executeAssignAgentAction(parameters: any, triggerData: any) {
    const { agentId } = parameters;
    const contactId = triggerData.contactId;

    if (!contactId) {
      throw new AppError("Contact ID required for assign action", 400);
    }

    await prisma.contact.update({
      where: { id: contactId },
      data: { assignedAgentId: agentId },
    });

    return { assignedAgentId: agentId };
  }

  // Programar acción con delay
  private async scheduleDelayedAction(
    action: AutomationAction,
    _triggerData: any
  ) {
    // En una implementación real, esto se manejaría con un job queue como Bull
    // Por ahora, lo logueamos para indicar que se programaría
    logger.info(
      `Action scheduled for ${action.delayMinutes} minutes: ${action.actionType}`
    );

    return {
      scheduled: true,
      executeAt: new Date(Date.now() + action.delayMinutes * 60 * 1000),
    };
  }

  // Obtener estadísticas de automatizaciones
  async getStats(userId?: string): Promise<any> {
    const where = userId ? { createdById: userId } : {};

    const [totalAutomations, activeAutomations, executions, recentExecutions] =
      await Promise.all([
        prisma.automation.count({ where }),
        prisma.automation.count({ where: { ...where, isActive: true } }),
        prisma.automationExecution.count({
          where: {
            automation: where.createdById
              ? { createdById: where.createdById }
              : undefined,
          },
        }),
        prisma.automationExecution.findMany({
          where: {
            automation: where.createdById
              ? { createdById: where.createdById }
              : undefined,
            startedAt: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Últimos 7 días
            },
          },
          include: {
            automation: {
              select: { name: true },
            },
          },
          orderBy: { startedAt: "desc" },
          take: 10,
        }),
      ]);

    const successfulExecutions = recentExecutions.filter(
      (exec) => exec.status === "completed"
    ).length;

    const successRate =
      recentExecutions.length > 0
        ? (successfulExecutions / recentExecutions.length) * 100
        : 0;

    return {
      totalAutomations,
      activeAutomations,
      totalExecutions: executions,
      recentExecutions: recentExecutions.length,
      successRate: Number(successRate.toFixed(1)),
      recentActivity: recentExecutions.map((exec) => ({
        id: exec.id,
        automationName: exec.automation.name,
        status: exec.status,
        startedAt: exec.startedAt,
        completedAt: exec.completedAt,
        error: exec.error,
      })),
    };
  }
}
