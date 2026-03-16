import Ticket from "../models/ticket.model.js";

// GET /api/tickets/:ticketCode || Checking a ticket by its code
export const getTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findOne({ ticketCode: req.params.ticketCode.toUpperCase() })
      .populate("event", "title date location organizer")
      .populate("registration", "firstName lastName email");

    if (!ticket) {
      return res.status(404).json({ success: false, message: "Ticket not found. Check the code and try again." });
    }

    return res.json({ success: true, data: ticket });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/tickets/validate/:ticketCode || validating a ticket at the gate - marks it as used so it can't be used again
export const validateTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findOne({ ticketCode: req.params.ticketCode.toUpperCase() })
      .populate("event", "title date");

    if (!ticket) {
      return res.status(404).json({ success: false, message: "Invalid ticket code. No ticket found." });
    }

    // Check if the ticket has already been used
    if (ticket.status === "used") {
      return res.status(400).json({
        success: false,
        message: `This ticket was already used on ${new Date(ticket.usedAt).toLocaleString()}. Entry denied.`,
      });
    }

    // Check if the ticket was cancelled
    if (ticket.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "This ticket has been cancelled. Entry denied.",
      });
    }

    // All good - mark as used
    ticket.status = "used";
    ticket.usedAt = new Date();
    ticket.scannedBy = req.body.scannedBy || "gate-scanner";
    await ticket.save();

    return res.json({
      success: true,
      message: `Welcome, ${ticket.attendeeName}!`,
      data: {
        attendeeName: ticket.attendeeName,
        event: ticket.event.title,
        usedAt: ticket.usedAt,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
