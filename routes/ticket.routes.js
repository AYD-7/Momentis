import express from "express";
import { validateTicket, getTicket } from "../controllers/ticket.controller.js";

const router = express.Router();

router.post("/validate/:ticketCode", validateTicket); // scan a ticket at the gate
router.get("/:ticketCode", getTicket);                // look up a ticket by code

export default router;
