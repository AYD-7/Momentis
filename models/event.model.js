import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    // When the event is happening
    date: {
      type: Date,
      required: true,
    },

    // Simple string like "Lagos Tech Hub, 14 Bayo Kuku St"
    location: {
      type: String,
      required: true,
    },

    // How many people can register
    capacity: {
      type: Number,
      required: true,
    },

    // Remaining spots - starts equal to capacity, goes down as people register
    availableSlots: {
      type: Number,
    },

    // Ticket price (0 = free)
    price: {
      type: Number,
      default: 0,
    },

    organizer: {
      type: String,
      required: true,
    },

    organizerEmail: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt fields automatically
  }
);

// Before saving a new event, set availableSlots to match capacity
eventSchema.pre("save", function (next) {
  if (this.isNew) {
    this.availableSlots = this.capacity;
  }
  next();
});


const Event = mongoose.model("Event", eventSchema);
export default Event;