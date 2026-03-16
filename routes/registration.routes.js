import express from "express";
import {
  registerForEvent,
  getRegistration,
  cancelRegistration,
} from "../controllers/registration.controller.js";

const router = express.Router();

router.post("/", registerForEvent);              // register for an event
router.get("/:id", getRegistration);             // view a registration
router.patch("/:id/cancel", cancelRegistration); // cancel a registration

export default router;
