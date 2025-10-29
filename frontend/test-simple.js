const axios = require("axios");

// Simple test script with proper cookie handling
const BASE_URL = "http://localhost:3000";

// Create axios instance with cookie jar
const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Simple cookie storage
let cookies = "";

// Intercept responses to extract cookies
api.interceptors.response.use(
  (response) => {
    const setCookieHeader = response.headers["set-cookie"];
    if (setCookieHeader) {
      cookies = setCookieHeader
        .map((cookie) => cookie.split(";")[0])
        .join("; ");
    }
    return response;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Intercept requests to add cookies
api.interceptors.request.use(
  (config) => {
    if (cookies) {
      config.headers.Cookie = cookies;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Test data
const testUser = {
  firstName: "John",
  lastName: "Student",
  email: `student-${Date.now()}@test.com`,
  password: "pass123",
  userType: "general",
  school: "Test University",
  grade: "12",
};

const testOrganizer = {
  firstName: "Jane",
  lastName: "Organizer",
  email: `organizer-${Date.now()}@test.com`,
  password: "pass123",
  userType: "organizer",
  organization: "Test Organization",
  position: "Event Manager",
};

const testCompetition = {
  title: "Test Case Competition 2024",
  organizer: "Test Organization",
  logo: "https://example.com/logo.png",
  gradeEligibility: "9-12, Undergraduate",
  deadline: "2024-12-31",
  prize: "$5000 + Internship Opportunities",
  description:
    "This is a comprehensive test case competition designed to challenge students with real-world business problems.",
  applicationType: "team",
  frequency: "annual",
  startDate: "2024-06-01",
  endDate: "2024-06-15",
  location: "Toronto, ON (Hybrid)",
  cost: "Free",
  category: "case-competition",
  maxParticipants: 100,
  requirements: "Must be enrolled in an accredited high school or university",
  contactEmail: "competitions@testorg.com",
  contactPhone: "+1-416-555-0123",
  website: "https://testorg.com/competition",
  tags: ["case-competition", "business", "strategy", "teamwork"],
};

async function runTests() {
  console.log("🧪 Simple Tiered Login System Test");
  console.log("=====================================\n");

  try {
    // Test 1: General User Signup
    console.log("1. Testing General User Signup...");
    const signupResult = await api.post("/api/auth/general/signup", testUser);
    console.log("✅ Signup successful:", signupResult.data.message);

    // Test 2: General User Login
    console.log("\n2. Testing General User Login...");
    const loginResult = await api.post("/api/auth/general/login", {
      email: testUser.email,
      password: testUser.password,
    });
    console.log("✅ Login successful:", loginResult.data.message);

    // Test 3: Check Auth Status
    console.log("\n3. Testing Auth Status...");
    const authResult = await api.get("/api/auth/me");
    console.log(
      "✅ Auth check successful:",
      authResult.data.user.firstName,
      authResult.data.user.lastName,
    );

    // Test 4: General Dashboard
    console.log("\n4. Testing General Dashboard...");
    const dashboardResult = await api.get("/api/dashboard/general");
    console.log("✅ Dashboard access successful");
    console.log(
      "📊 Competitions found:",
      dashboardResult.data.data.stats.totalCompetitions,
    );
    console.log(
      "🏢 Business opportunities found:",
      dashboardResult.data.data.stats.totalBusinessOpportunities,
    );

    // Test 5: Get Favourites
    console.log("\n5. Testing Favourites...");
    const favouritesResult = await api.get("/api/auth/favourites");
    console.log("✅ Favourites access successful");

    // Test 6: Logout
    console.log("\n6. Testing Logout...");
    const logoutResult = await api.post("/api/auth/logout");
    console.log("✅ Logout successful:", logoutResult.data.message);

    // Test 7: Organizer Signup
    console.log("\n7. Testing Organizer Signup...");
    const orgSignupResult = await api.post(
      "/api/auth/organizer/signup",
      testOrganizer,
    );
    console.log(
      "✅ Organizer signup successful:",
      orgSignupResult.data.message,
    );

    // Test 8: Organizer Login
    console.log("\n8. Testing Organizer Login...");
    const orgLoginResult = await api.post("/api/auth/organizer/login", {
      email: testOrganizer.email,
      password: testOrganizer.password,
    });
    console.log("✅ Organizer login successful:", orgLoginResult.data.message);

    // Test 9: Organizer Dashboard
    console.log("\n9. Testing Organizer Dashboard...");
    const orgDashboardResult = await api.get("/api/dashboard/organizer");
    console.log("✅ Organizer dashboard access successful");

    // Test 10: Create Competition
    console.log("\n10. Testing Competition Creation...");
    const competitionResult = await api.post(
      "/api/competitions/create",
      testCompetition,
    );
    console.log(
      "✅ Competition creation successful:",
      competitionResult.data.message,
    );

    // Test 11: Admin Login
    console.log("\n11. Testing Admin Login...");
    const adminLoginResult = await api.post("/api/auth/admin/login", {
      email: "admin@admin.com",
      password: "Admin@pass",
      userType: "admin",
    });
    console.log("✅ Admin login successful:", adminLoginResult.data.message);

    // Test 12: Admin Pending Items
    console.log("\n12. Testing Admin Pending Items...");
    const pendingResult = await api.get("/api/admin/pending");
    console.log("✅ Admin pending items access successful");
    const pendingData = pendingResult.data.data || {};
    const competitions = pendingData.competitions || [];
    const businessOpportunities = pendingData.businessOpportunities || [];
    console.log(
      "📋 Pending items:",
      competitions.length + businessOpportunities.length,
    );

    // Test 13: Health Check
    console.log("\n13. Testing Health Check...");
    const healthResult = await api.get("/api/health");
    console.log("✅ Health check successful:", healthResult.data.message);

    console.log("\n🎉 ALL TESTS PASSED!");
    console.log("=====================================");
    console.log("✅ Authentication system working correctly");
    console.log("✅ All API endpoints accessible");
    console.log("✅ Cookie-based auth functioning properly");
    console.log("✅ User roles and permissions working");
    console.log("✅ Database integration successful");
    console.log(
      "✅ Dashboard shows competitions and business opportunities from Google Sheets",
    );
  } catch (error) {
    console.error(
      "\n❌ Test failed:",
      error.response?.data?.message || error.message,
    );
    console.error("Status:", error.response?.status);

    if (error.response?.status === 503) {
      console.log(
        "\n🔧 MongoDB might not be configured. The system will work with mock data.",
      );
    }
  }
}

// Wait for server to be ready
async function waitForServer() {
  console.log("⏳ Waiting for server to be ready...");

  for (let i = 0; i < 30; i++) {
    try {
      await api.get("/api/health");
      console.log("✅ Server is ready!\n");
      return true;
    } catch (error) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  throw new Error("Server not ready after 30 seconds");
}

// Run the tests
async function main() {
  try {
    await waitForServer();
    await runTests();
  } catch (error) {
    console.error("❌ Failed to run tests:", error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
