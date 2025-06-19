import { Router } from "express";
import contactRoutes from "./contact.routes";
import aiRoutes from "./ai.routes";
import emailRoutes from "./email.routes";
import calendarRoutes from "./calendar.routes";
import automationRoutes from "./automation.routes";
import dashboardRoutes from "./dashboard.routes";
// Import other routes as they are created
// import tripRoutes from './trip.routes'
import campaignRoutes from './campaign.routes'
// import userRoutes from './user.routes'
// import authRoutes from './auth.routes'

const router = Router();

// API info endpoint
router.get("/", (req, res) => {
  res.json({
    name: "Bukialo CRM API",
    version: "1.0.0",
    description: "API for travel agency CRM with AI integration",
    endpoints: {
      contacts: "/api/contacts",
      trips: "/api/trips",
      campaigns: "/api/campaigns",
      users: "/api/users",
      auth: "/api/auth",
      dashboard: "/api/dashboard",
      ai: "/api/ai",
      emails: "/api/emails",
      calendar: "/api/calendar",
      automations: "/api/automations",
    },
  });
});

// Mount routes
router.use("/contacts", contactRoutes);
router.use("/ai", aiRoutes);
router.use("/emails", emailRoutes);
router.use("/calendar", calendarRoutes);
router.use("/automations", automationRoutes);
// router.use('/trips', tripRoutes)
router.use('/campaigns', campaignRoutes)
// router.use('/users', userRoutes)
// router.use('/auth', authRoutes)
router.use('/dashboard', dashboardRoutes)

export default router;
