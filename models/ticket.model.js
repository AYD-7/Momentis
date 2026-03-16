import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema(
  {
    // Link back to the registration and event
    registration: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Registration",
      required: true,
    },

    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },

    // Unique code the attendee uses to get in e.g. "AB12-CD34-EF56"
    ticketCode: {
      type: String,
      required: true,
      unique: true,
    },

    // The attendee's name stored directly here for quick access at the gate
    attendeeName:  { type: String, required: true },
    attendeeEmail: { type: String, required: true },

    // QR code image stored as a base64 string - embedded in the email
    qrCode: { type: String },

    // valid = unused, used = already scanned, cancelled = registration was cancelled
    status: {
      type: String,
      enum: ["valid", "used", "cancelled"],
      default: "valid",
    },

    // Filled in when the ticket gets scanned at the gate
    usedAt: { type: Date },
    scannedBy: { type: String },
  },
  {
    timestamps: true,
  }
);

const Ticket = mongoose.model("Ticket", ticketSchema);
export default Ticket;
