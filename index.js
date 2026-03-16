import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import morgan from 'morgan';
import message from './data/message.js';
import summary from './data/summaryInfo.js';
import adminRoutes from './routes/admin.routes.js';
import eventRoutes from './routes/event.routes.js';
import registrationRoutes from './routes/registration.routes.js';
import ticketRoutes from './routes/ticket.routes.js'
import connectDB from './config/db.config.js';



// Initializing the "app" with the express object
const app = express();

// Core Middleware
app.use(express.json()); // parser
app.use(morgan(process.env.NODE_ENV === "production" ? 'combined' : 'dev')); // logger

// Database connection
connectDB();


// Routes
app.use("/api/events",        eventRoutes);
app.use("/api/registrations", registrationRoutes);
app.use("/api/tickets",       ticketRoutes);
app.use("/api/admin",         adminRoutes);


// Root
app.get('/', (req, res) => {
  res.status(200).send(message);
})

// Health Check
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "Momentis",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

// Summary
app.get("/summary", (req, res) => {
  res.json(summary);
});

// 404 handler - if no route matched
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.path} not found` });
});

// 
const PORT = process.env.PORT || 5000; // Port  


// Running the server
app.listen(PORT, () => {
  console.log(`Server is listening at port ${PORT}`);
});