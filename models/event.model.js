import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        unique: [true, "Your event's title has already being taken. You can add like a date or other suffix to the event e.g. Momentis2026"],
    },
    date: {
        type: Date,
        required: true,
    },
    location: {
        type: String,
        required: true,
    },
    capacity: {
        type: Number,
        required: true,       
    },
});

const Event = mongoose.model('Event', eventSchema);

export default Event;