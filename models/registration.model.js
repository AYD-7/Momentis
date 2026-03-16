import mongoose from "mongoose";

const registrationSchema = new mongoose.Schema(
  {
    // Which event (id) this registration is for
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },

    // The person registering
    firstName: { type: String, required: true, trim: true },
    lastName:  { type: String, required: true, trim: true },
    email:     { type: String, required: true, lowercase: true, trim: true },
    phone:     { type: String, trim: true },

    // Any notes the attendee wants to leave (e.g. I am fine arts student)
    notes: { type: String },

    // confirmed = active, cancelled = they pulled out
    status: {
      type: String,
      enum: ["confirmed", "cancelled"],
      default: "confirmed",
    },
  },
  {
    timestamps: true,
  }
);


const Registration = mongoose.model("Registration", registrationSchema);
export default Registration;
