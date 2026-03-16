// Importing modules
import Event from "../models/event.model.js";
import Registration from "../models/registration.model.js";
import Ticket from "../models/ticket.model.js";



// Getting the full list of people registered for an event || GET /api/admin/events/:eventId/registrations
export const getEventRegistrations = async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    // Get all registrations for this event
    const registrations = await Registration.find({ event: req.params.eventId }).sort({ createdAt: -1 });

    // Count how many people have checked in (ticket was scanned)
    const checkedIn = await Ticket.countDocuments({ event: req.params.eventId, status: "used" });

    // Server response
    res.json({
      success: true,
      data: {
        event: {
          title: event.title,
          date: event.date,
          capacity: event.capacity,
          availableSlots: event.availableSlots,
          spotsUsed: event.capacity - event.availableSlots,
        },
        summary: {
          totalRegistrations: registrations.length,
          confirmed: registrations.filter((r) => r.status === "confirmed").length,
          cancelled: registrations.filter((r) => r.status === "cancelled").length,
          checkedIn,
        },
        registrations,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Getting all events with registration counts || GET /api/admin/events
export const getAllEventsAdmin = async (req, res) => {
  try {
    // Getting all events in ascending order(soonest first)
    const events = await Event.find({}).sort({ date: 1 });

    const eventsWithCounts = await Promise.all(
      events.map(async (event) => {
        const registrationCount = await Registration.countDocuments({
          event: event._id,
          status: "confirmed",
        });
        const checkedIn = await Ticket.countDocuments({ event: event._id, status: "used" });

        return {
          ...event.toObject(),
          registrationCount,
          checkedIn,
        };
      })
    );

    return res.status(200).json({ success: true, data: eventsWithCounts });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

