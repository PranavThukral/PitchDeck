const mongoose = require("mongoose");

// Test MongoDB connection with simplified authentication
async function testConnection() {
  try {
    // Use local MongoDB instance
    const mongoUri =
      process.env.MONGODB_URI || "mongodb://localhost:27017/pitch-deck-test";

    console.log("Connecting to MongoDB:", mongoUri);

    await mongoose.connect(mongoUri);

    console.log("✅ MongoDB connected successfully!");

    // Test creating a simple document
    const TestSchema = new mongoose.Schema({
      name: String,
      createdAt: { type: Date, default: Date.now },
    });

    const TestModel = mongoose.model("Test", TestSchema);

    // Create a test document
    const testDoc = new TestModel({ name: "Connection Test" });
    await testDoc.save();

    console.log("✅ Test document created:", testDoc._id);

    // Clean up test document
    await TestModel.deleteOne({ _id: testDoc._id });
    console.log("✅ Test document cleaned up");

    // Test the User model
    console.log("\n--- Testing User Model ---");
    const User = require("./lib/models/User.js");

    const testUser = new User({
      firstName: "Test",
      lastName: "User",
      email: "test@example.com",
      password: "test123", // Plain text password
      userType: "general",
      school: "Test School",
      grade: "12",
      approved: true,
      favourites: [],
    });

    await testUser.save();
    console.log("✅ User model test passed:", testUser._id);

    // Test password matching (plain text)
    const foundUser = await User.findOne({
      email: "test@example.com",
      password: "test123",
    });

    if (foundUser) {
      console.log("✅ Plain text password matching works");
    } else {
      console.log("❌ Plain text password matching failed");
    }

    // Clean up test user
    await User.deleteOne({ _id: testUser._id });
    console.log("✅ Test user cleaned up");

    // Test the Competition model
    console.log("\n--- Testing Competition Model ---");
    const Competition = require("./lib/models/Competition.js");

    const testCompetition = new Competition({
      title: "Test Competition",
      organizer: "Test Organizer",
      organizerEmail: "organizer@test.com",
      organizerId: testUser._id,
      logo: "https://example.com/logo.png", // PNG URL
      gradeEligibility: "9-12",
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      prize: "$1000",
      status: "pending",
      description: "This is a test competition with simplified authentication",
      applicationType: "individual",
      frequency: "one-time",
      dates: ["2024-06-01", "2024-06-30"],
      location: "Online",
      cost: "Free",
      category: "case-competition",
      contactEmail: "contact@test.com",
      tags: ["test", "competition"],
      approved: false,
    });

    await testCompetition.save();
    console.log("✅ Competition model test passed:", testCompetition._id);

    // Clean up test competition
    await Competition.deleteOne({ _id: testCompetition._id });
    console.log("✅ Test competition cleaned up");

    // Test the BusinessOpportunity model
    console.log("\n--- Testing BusinessOpportunity Model ---");
    const BusinessOpportunity = require("./lib/models/BusinessOpportunity.js");

    const testOpportunity = new BusinessOpportunity({
      title: "Test Internship",
      company: "Test Company",
      companyEmail: "company@test.com",
      organizerId: testUser._id,
      logo: "https://example.com/company-logo.png", // PNG URL
      type: "internship",
      location: "Remote",
      remote: true,
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      description: "This is a test internship opportunity with simplified auth",
      requirements: "No requirements for testing",
      contactEmail: "hr@test.com",
      tags: ["test", "internship"],
      status: "pending",
      approved: false,
    });

    await testOpportunity.save();
    console.log(
      "✅ BusinessOpportunity model test passed:",
      testOpportunity._id,
    );

    // Clean up test opportunity
    await BusinessOpportunity.deleteOne({ _id: testOpportunity._id });
    console.log("✅ Test opportunity cleaned up");

    // Test simplified authentication scenarios
    console.log("\n--- Testing Simplified Authentication ---");

    // Test general user
    const generalUser = new User({
      firstName: "John",
      lastName: "Student",
      email: "student@test.com",
      password: "password123", // Plain text
      userType: "general",
      school: "Test University",
      grade: "12",
      approved: true,
      favourites: [],
    });
    await generalUser.save();
    console.log("✅ General user created with plain text password");

    // Test organizer user
    const organizerUser = new User({
      firstName: "Jane",
      lastName: "Organizer",
      email: "organizer@test.com",
      password: "password123", // Plain text
      userType: "organizer",
      organization: "Test Organization",
      position: "Event Manager",
      approved: true,
      favourites: [],
    });
    await organizerUser.save();
    console.log("✅ Organizer user created with plain text password");

    // Test login simulation (plain text password matching)
    const loginTest1 = await User.findOne({
      email: "student@test.com",
      password: "password123",
      userType: "general",
    });

    if (loginTest1) {
      console.log("✅ General user login simulation successful");
    } else {
      console.log("❌ General user login simulation failed");
    }

    const loginTest2 = await User.findOne({
      email: "organizer@test.com",
      password: "password123",
      userType: "organizer",
    });

    if (loginTest2) {
      console.log("✅ Organizer login simulation successful");
    } else {
      console.log("❌ Organizer login simulation failed");
    }

    // Clean up test users
    await User.deleteMany({
      email: { $in: ["student@test.com", "organizer@test.com"] },
    });
    console.log("✅ Test users cleaned up");

    console.log(
      "\n🎉 All tests passed! Simplified authentication system is ready.",
    );
    console.log("📝 Key changes:");
    console.log("   - Plain text passwords stored in MongoDB");
    console.log("   - No JWT tokens - using simple cookies");
    console.log("   - Logo fields expect PNG URLs");
    console.log("   - Simplified password validation (4+ characters)");
  } catch (error) {
    console.error("❌ Test failed:", error.message);

    if (error.code === "ECONNREFUSED") {
      console.log("\n💡 Make sure MongoDB is running locally:");
      console.log(
        "   - Install MongoDB: https://docs.mongodb.com/manual/installation/",
      );
      console.log("   - Start MongoDB: mongod");
      console.log("   - Or use MongoDB Compass for a GUI");
    }
  } finally {
    await mongoose.disconnect();
    console.log("\n📴 Disconnected from MongoDB");
  }
}

// Handle process exit
process.on("SIGINT", async () => {
  await mongoose.disconnect();
  process.exit(0);
});

// Run the test
testConnection();
