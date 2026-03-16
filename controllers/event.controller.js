import Event from "../models/event.model.js";



// GET /api/events || Getting all events 
export const getAllEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1 }); // sorted by soonest first

    return res.json({ success: true, count: events.length, data: events });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Getting one event by its ID || GET /api/events/:id
export const getOneEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    return res.json({ success: true, data: event });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Creating a new event (admin only) || POST /api/events
export const createEvent = async (req, res) => {
  try {
    // Ddestructuring
    const { title, description, date, location, capacity, price, organizer, organizerEmail } = req.body;

    // Basic check - make sure all required fields are there
    if (!title || !description || !date || !location || !capacity || !organizer || !organizerEmail) {
      return res.status(400).json({
        success: false,
        message: "Please provide: title, description, date, location, capacity, organizer, organizerEmail",
      });
    }

    const event = await Event.create(req.body);

    return res.status(201).json({ success: true, message: "Event created", data: event });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};


// Updating an event (admin only) || PATCH /api/events/:id
export const updateEvent = async (req, res) => {
  try {
    // Finding the event to update
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });

    // Gracefully handling error if event does not exist
    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    return res.json({ success: true, message: "Event updated", data: event });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

