import { PrismaClient } from "@prisma/client";

// Prevenir múltiples instancias de Prisma Client en desarrollo
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// Middleware para soft delete (opcional)
// prisma.$use(async (params, next) => {
//   if (params.model === 'Contact') {
//     if (params.action === 'delete') {
//       params.action = 'update'
//       params.args['data'] = { deletedAt: new Date() }
//     }
//     if (params.action === 'deleteMany') {
//       params.action = 'updateMany'
//       if (params.args.data != undefined) {
//         params.args.data['deletedAt'] = new Date()
//       } else {
//         params.args['data'] = { deletedAt: new Date() }
//       }
//     }
//   }
//   return next(params)
// })

// Tipos de utilidad para Prisma
export type { Prisma } from "@prisma/client";
