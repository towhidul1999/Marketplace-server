const mongoose = require("mongoose");
require("dotenv").config();
const { User } = require("../models");

// Sample data
const usersData = [
  {
    fullName: "Testing Admin",
    email: "admin@gmail.com",
    phoneNumber: "01735566789",
    password: "$2a$08$cUQ3uMdbQjlyDF/dgn5mNuEt9fLJZqq8TaT9aKabrFuG5wND3/mPO",
    role: "admin",
    isEmailVerified: true,
    username: "admin",
  },
  {
    fullName: "Testing buyer",
    email: "buyer@gmail.com",
    phoneNumber: "01735566789",
    password: "$2a$08$cUQ3uMdbQjlyDF/dgn5mNuEt9fLJZqq8TaT9aKabrFuG5wND3/mPO",
    role: "buyer",
    isEmailVerified: true,
    username: "buyer",
  },
  {
    fullName: "Testing freelancer",
    email: "freelancer@gmail.com",
    phoneNumber: "01734456873",
    password: "$2a$08$cUQ3uMdbQjlyDF/dgn5mNuEt9fLJZqq8TaT9aKabrFuG5wND3/mPO",
    role: "freelancer",
    isEmailVerified: true,
    username: "freelancer",
  },
];

// Function to drop the entire database
const dropDatabase = async () => {
  try {
    await mongoose.connection.dropDatabase();
    console.log("------------> Database dropped successfully! <------------");
  } catch (err) {
    console.error("Error dropping database:", err);
  }
};

// Function to seed users
const seedUsers = async () => {
  try {
    await User.deleteMany();
    await User.insertMany(usersData);
    console.log("Users seeded successfully!");
  } catch (err) {
    console.error("Error seeding users:", err);
  }
};

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URL);

// Call seeding functions
const seedDatabase = async () => {
  try {
    await dropDatabase();
    await seedUsers();
    console.log("--------------> Database seeding completed <--------------");
  } catch (err) {
    console.error("Error seeding database:", err);
  } finally {
    mongoose.disconnect();
  }
};

// Execute seeding
seedDatabase();
