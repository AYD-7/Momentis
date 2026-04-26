import 'dotenv/config';
import express from 'express';
import morgan from 'morgan';
import message from './data/message.js';
import summary from './data/summaryInfo.js';
import health from './data/health.js';
import adminRoutes from './routes/admin.routes.js';
import eventRoutes from './routes/event.routes.js';
import registrationRoutes from './routes/registration.routes.js';
import ticketRoutes from './routes/ticket.routes.js'
import connectDB from './config/db.config.js';
import cors from 'cors'



// Initializing the "app" with the express object
const app = express();

// Core Middleware
app.use(express.json()); // parser
app.use(morgan(process.env.NODE_ENV === "production" ? 'combined' : 'dev')); // logger
app.use(cors({origin: "https://momentis.netlify.app/"}))

// Database connection
connectDB();


// Routes
app.get('/', (req, res) => res.status(200).send(message)); // root
app.get("/health", (req, res) => res.json(health)); // health check
app.get("/summary", (req, res) => res.json(summary)); // summary
app.use("/api/events", eventRoutes); // event routes
app.use("/api/registrations", registrationRoutes); // registration routes
app.use("/api/tickets", ticketRoutes); // ticket routes
app.use("/api/admin", adminRoutes); // admin routes

// 404 handler - if no route matched
app.use((req, res) => {
  res.status(404).json(
    { success: false, 
      message: `Route ${req.method} ${req.path} not found`,
    }
  )
}); 


const PORT = process.env.PORT || 5000; // Port  


// Running the server
app.listen(PORT, () => {
  console.log(`Server is listening at port ${PORT}`);
});