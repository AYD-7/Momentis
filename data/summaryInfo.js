// API summary
const summaryInfo = {
    message: "Momentis is running",
    routes: {
      "GET  /api/events":                              "List all events",
      "GET  /api/events/:id":                         "Get one event",
      "POST /api/events  [admin]":                    "Create an event",
      "POST /api/registrations":                      "Register for an event",
      "GET  /api/registrations/:id":                  "View a registration",
      "PATCH /api/registrations/:id/cancel":          "Cancel a registration",
      "GET  /api/tickets/:ticketCode":                "Look up a ticket",
      "POST /api/tickets/validate/:ticketCode":       "Validate a ticket at the gate",
      "GET  /api/admin/events  [admin]":              "All events with stats",
      "GET  /api/admin/events/:id/registrations [admin]": "Registrations for an event",
    },
};

export default summaryInfo;