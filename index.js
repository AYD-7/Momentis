import express from 'express';
import 'dotenv/config';
import mongoose from 'mongoose';

// Initializing the "app" with the express object
const app = express();

const PORT = process.env.PORT || 5000 // Port  

// Database connection
mongoose.connect(process.env.MONGODB_URL).then(()=> console.log("MongoDB connected successfully!")).catch((error)=> {
    console.error("Error:", error)
})

// Getting database's name
mongoose.connection.once("open", ()=> {
    console.log("Database connected to:", mongoose.connection.name)
})

// Running the server
app.listen(PORT, () => {
    console.log(`Server is listening at port ${PORT}`);
})