import mongoose from "mongoose";
import Event from "../models/event.model.js";
import Registration from "../models/registration.model.js";
import Ticket from "../models/ticket.model.js";
import { sendConfirmationEmail } from "../utils/email.util.js";
import { generateTicketCode, generateQRCode} from "../utils/ticket.util.js";


// POST /api/registrations || Registers someone for an event
export const registerForEvent = async (req, res) => {
  try {
    const { eventId, firstName, lastName, email, phone, notes } = req.body;

    // Checking all required fields are present
    if (!eventId || !firstName || !lastName || !email) {
      return res.status(400).json({
        success: false,
        message: "Please provide: eventId, firstName, lastName, email",
      });
    }

    // Finding the event
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    // Checking if the event is full
    if (event.availableSlots <= 0) {
      return res.status(400).json({ success: false, message: "Sorry, this event is fully booked" });
    }

    // Checking if this email is already registered for this event
    const alreadyRegistered = await Registration.findOne({ event: eventId, email: email.toLowerCase() });
    if (alreadyRegistered) {
      return res.status(400).json({
        success: false,
        message: "This email is already registered for this event",
      });
    }

    // Creating the registration
    const registration = await Registration.create({
      event: eventId,
      firstName,
      lastName,
      email: email.toLowerCase(),
      phone,
      notes,
      status: "confirmed",
    });

    // Reducing available slots by 1
    event.availableSlots = event.availableSlots - 1;
    await event.save();

    // Generate a unique ticket code and QR code
    const ticketCode = generateTicketCode();
    const qrCode = await generateQRCode(ticketCode);

    // Saving the ticket
    const ticket = await Ticket.create({
      registration: registration._id,
      event: eventId,
      ticketCode,
      attendeeName: `${firstName} ${lastName}`,
      attendeeEmail: email.toLowerCase(),
      qrCode,
      status: "valid",
    });

    // Sending confirmation email (won't crash the registration if email fails)
    let emailPreview = null;
    try {
      const result = await sendConfirmationEmail({
        to: email,
        name: `${firstName} ${lastName}`,
        event,
        ticketCode,
        qrCode,
      });
      emailPreview = result.previewUrl || null;
    } catch (emailError) {
      console.log("Email failed to send (registration still worked):", emailError.message);
    }

    // Returning everything the user needs
    return res.status(201).json({
      success: true,
      message: "Registration successful! Check your email for your ticket.",
      data: {
        registration,
        ticket: {
          ticketCode: ticket.ticketCode,
          status: ticket.status,
          qrCode: ticket.qrCode,
        },
        slotsRemaining: event.availableSlots,
        // Intends to build a frontend if time permits for user to preview the content
        emailPreviewUrl: emailPreview,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/registrations/:id || Get details about a specific registration
export const getRegistration = async (req, res) => {
  try {
    const registration = await Registration.findById(req.params.id).populate("event", "title date location organizer");

    if (!registration) {
      return res.status(404).json({ success: false, message: "Registration not found" });
    }

    // Also grab the ticket for this registration
    const ticket = await Ticket.findOne({ registration: req.params.id }).select("ticketCode status usedAt");

    return res.json({ success: true, data: { registration, ticket } });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH /api/registrations/:id/cancel || Cancels a registration and gives the slot back
export const cancelRegistration = async (req, res) => {
  try {
    const registration = await Registration.findById(req.params.id);

    if (!registration) {
      return res.status(404).json({ success: false, message: "Registration not found" });
    }

    if (registration.status === "cancelled") {
      return res.status(400).json({ success: false, message: "Registration is already cancelled" });
    }

    // Mark registration as cancelled
    registration.status = "cancelled";
    await registration.save();

    // Cancel the ticket too
    await Ticket.findOneAndUpdate(
      { registration: registration._id },
      { status: "cancelled" }
    );

    // Give the slot back to the event
    await Event.findByIdAndUpdate(registration.event, { $inc: { availableSlots: 1 } });

   return res.json({ success: true, message: "Registration cancelled. Your slot has been freed up." });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};