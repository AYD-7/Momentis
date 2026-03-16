import express from "express";
import {
  getAllEvents,
  createEvent,
  updateEvent,
  getOneEvent,
} from "../controllers/event.controller.js";
import { adminAuth } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", getAllEvents);            // anyone can browse events
router.get("/:id", getOneEvent);          // anyone can view an event
router.post("/", adminAuth, createEvent); // only admin can create
router.patch("/:id", adminAuth, updateEvent); // only admin can update


export default router;
