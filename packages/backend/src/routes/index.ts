import { Router } from "express";
import contactRoutes from "./contact.routes";
import aiRoutes from "./ai.routes";
import emailRoutes from "./email.routes";
import calendarRoutes from "./calendar.routes";
import automationRoutes from "./automation.routes";
import dashboardRoutes from "./dashboard.routes";
import campaignRoutes from "./campaign.routes";
import tripRoutes from "./trip.routes";
import authRoutes from "./auth.routes"; // ← Nueva ruta de autenticación

const router = Router();

// API info endpoint
router.get("/", (req, res) => {
  res.json({
    name: "Bukialo CRM API",
    version: "1.0.0",
    description: "API for travel agency CRM with AI integration",
    status: "online",
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: "/api/auth", // ← Nueva ruta
      dashboard: "/api/dashboard",
      contacts: "/api/contacts",
      trips: "/api/trips",
      campaigns: "/api/campaigns",
      users: "/api/users",
      ai: "/api/ai",
      emails: "/api/emails",
      calendar: "/api/calendar",
      automations: "/api/automations",
    },
  });
});

// Mount routes
router.use("/auth", authRoutes); // ← Nueva ruta de autenticación
router.use("/dashboard", dashboardRoutes);
router.use("/contacts", contactRoutes);
router.use("/trips", tripRoutes);
router.use("/ai", aiRoutes);
router.use("/emails", emailRoutes);
router.use("/calendar", calendarRoutes);
router.use("/automations", automationRoutes);
router.use("/campaigns", campaignRoutes);
// router.use('/users', userRoutes)      // Para implementar en el futuro

export default router;
