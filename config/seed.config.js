// Importing modules
import "dotenv/config";
import mongoose from "mongoose";
import Event from "../models/event.model.js";

// Seeders for the app
const sampleEvents = [
  // First
  {
    title: "Introduction to Web Development",
    description: "A beginner-friendly workshop covering HTML, CSS, and JavaScript basics.",
    date: "2025-08-10T10:00:00",
    location: "Lagos Tech Hub, 14 Bayo Kuku St, Lagos",
    capacity: 30,
    price: 0,
    organizer: "DevCircle Africa",
    organizerEmail: "hello@devcircle.africa",
  },

  // Second
  {
    title: "Startup Pitch Night",
    description: "An evening where early-stage founders pitch their ideas to investors and peers.",
    date: "2025-10-05T18:00:00",
    location: "Co-Creation Hub, Yaba, Lagos",
    capacity: 100,
    price: 500,
    organizer: "CcHub Team",
    organizerEmail: "events@cchub.africa",
  },

  // Third
  {
    title: "Design Thinking Workshop",
    description: "Learn how to solve real-world problems using the design thinking framework.",
    date: "2025-10-15T09:00:00",
    location: "Sheraton Hotel, Abuja",
    capacity: 20,
    price: 2100,
    organizer: "UX Nigeria",
    organizerEmail: "info@uxnigeria.com",
  },

  // Third
  {
    title: "Data Science for Fintech",
    description: "An intensive session on applying machine learning models to financial risk and fraud detection.",
    date: "2025-11-12T10:00:00",
    location: "Vibranium Valley, Ikeja, Lagos",
    capacity: 45,
    price: 1500,
    organizer: "Oluwatobi Adela-tech",
    organizerEmail: "community@oluwatobiadelabu.tech",
  },
  {
    title: "Cloud Infrastructure Summit",
    description: "Deep dive into AWS and Azure architecture for scaling high-traffic applications.",
    date: "2025-12-05T09:00:00",
    location: "Eko Hotels & Suites, Victoria Island, Lagos",
    capacity: 200,
    price: 5000,
    organizer: "CloudOps Nigeria",
    organizerEmail: "ops@cloudops.ng",
  },
  {
    title: "Mobile App Development Bootcamp",
    description: "Build your first cross-platform mobile app using Flutter in this hands-on weekend workshop.",
    date: "2026-01-20T08:30:00",
    location: "Leadspace, Yaba, Lagos",
    capacity: 25,
    price: 0,
    organizer: "Tech Crush Africa",
    organizerEmail: "info@techcrush.pro",
  },
  {
    title: "Cybersecurity Awareness Seminar",
    description: "Essential security practices for startups to protect user data and prevent breaches.",
    date: "2026-02-14T11:00:00",
    location: "Virtual (Zoom)",
    capacity: 500,
    price: 0,
    organizer: "SafeNet Africa",
    organizerEmail: "support@safenet.africa",
  },
  {
    title: "AI & Ethics Roundtable",
    description: "A discussion on the ethical implications of Generative AI in the African creative industry.",
    date: "2026-03-02T14:00:00",
    location: "The Nest Innovation Park, Yaba, Lagos",
    capacity: 40,
    price: 1000,
    organizer: "AI Policy Group",
    organizerEmail: "contact@aipolicy.org",
  },
  {
    title: "Product Management Mixer",
    description: "Networking event for PMs to share strategies on product-led growth and roadmap planning.",
    date: "2026-04-18T17:00:00",
    location: "Hard Rock Cafe, Victoria Island, Lagos",
    capacity: 60,
    price: 3000,
    organizer: "PM Hub",
    organizerEmail: "hello@pmhub.africa",
  },
  {
    title: "Blockchain Developers Meetup",
    description: "Exploring smart contract development on Ethereum and the future of DeFi in Nigeria.",
    date: "2026-05-10T10:00:00",
    location: "Civic Hive, Montgomery Rd, Lagos",
    capacity: 50,
    price: 0,
    organizer: "Web3 Nigeria",
    organizerEmail: "devs@web3nigeria.com",
  },

  
];

/*
  Running seed
  Personal Reminder - npm run seed. to run this file. I need to do it just once so it doesn't clear existing real data
*/ 
async function runSeed() {
  try {
    // MongoDB connection string with fallback to MongoDB localhost for development
    const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/momentis";
    await mongoose.connect(uri);
    console.log("Connected to MongoDB — starting seed...\n");

    // Clear existing events so we get a clean slate every time
    await Event.deleteMany({});
    console.log("Cleared existing events collection");

    const inserted = await Event.insertMany(sampleEvents);

    console.log(`\n Successfully seeded ${inserted.length} events:\n`);
    inserted.forEach((e) => {
      console.log(`   - [${e._id}]  ${e.title}  (${e.capacity} seats @ $${e.price})`);
    });

    console.log("\n Seed complete. You can now start the server with: npm start");
    process.exit(0);
  } catch (err) {
    console.error("\n Seed failed:", err.message);
    process.exit(1);
  }
}

// Invoking the runSeed function
runSeed();
