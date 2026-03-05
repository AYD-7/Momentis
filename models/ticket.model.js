// Importing modules
import mongoose from 'mongoose';

const ticketSchema = new mongoose.Schema(
  {
    event: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Event',
    },
    attendeeEmail: {
      type: String,
      trim: true,
    },
    ticketCode: {
      type: String,
      unique: true,
    },
    isUsed: {
      type: Boolean,
      default: false,
    },
    registeredAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);