import { Router } from "express";
import {
  getAllEventsAdmin,
  getEventRegistrations,
} from "../controllers/admin.controller.js";
import { adminAuth } from "../middlewares/auth.middleware.js";

const router = Router();

// Apply admin auth to all routes in this file
router.use(adminAuth);

// All these routes require the x-admin-key header

router.get("/events", getAllEventsAdmin);                              // all events + stats
router.get("/events/:eventId/registrations", getEventRegistrations); // registrants for one event

export default router;
