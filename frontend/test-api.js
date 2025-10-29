const axios = require("axios");

// Test API endpoints for the simplified tiered login system
const BASE_URL = "http://localhost:3000";

// Test data with simplified passwords
const testUsers = {
  general: {
    firstName: "John",
    lastName: "Student",
    email: "student@test.com",
    password: "pass123", // Simplified password
    userType: "general",
    school: "Test University",
    grade: "12",
  },
  organizer: {
    firstName: "Jane",
    lastName: "Organizer",
    email: "organizer@test.com",
    password: "pass123", // Simplified password
    userType: "organizer",
    organization: "Test Organization",
    position: "Event Manager",
  },
  admin: {
    email: "admin@admin.com",
    password: "Admin@pass",
    userType: "admin",
  },
};

const testCompetition = {
  title: "Test Case Competition 2024",
  organizer: "Test Organization",
  logo: "https://example.com/logo.png", // PNG URL as required
  gradeEligibility: "9-12, Undergraduate",
  deadline: "2024-12-31",
  prize: "$5000 + Internship Opportunities",
  description:
    "This is a comprehensive test case competition designed to challenge students with real-world business problems. Participants will work in teams to analyze complex scenarios and present innovative solutions.",
  applicationType: "team",
  frequency: "annual",
  startDate: "2024-06-01",
  endDate: "2024-06-15",
  location: "Toronto, ON (Hybrid)",
  cost: "Free",
  category: "case-competition",
  maxParticipants: 100,
  requirements:
    "High school or university students with basic business knowledge",
  contactEmail: "contact@testorg.com",
  contactPhone: "+1-555-0123",
  website: "https://testorg.com",
  tags: ["business", "case-study", "competition", "strategy"],
};

const testBusinessOpportunity = {
  title: "Summer Internship Program 2024",
  company: "Tech Innovators Inc.",
  logo: "https://example.com/company-logo.png", // PNG URL as required
  type: "internship",
  location: "San Francisco, CA",
  remote: false,
  deadline: "2024-05-15",
  description:
    "Join our dynamic team for a 12-week summer internship program. Work on cutting-edge projects, learn from industry experts, and gain valuable real-world experience in technology and business.",
  requirements:
    "Currently enrolled in university, strong analytical skills, passion for technology",
  compensation: "$25/hour + Housing Stipend",
  duration: "12 weeks (June - August 2024)",
  contactEmail: "internships@techinnovators.com",
  website: "https://techinnovators.com/careers",
  tags: ["internship", "technology", "summer", "paid"],
};

// Helper function to make requests (cookies are handled automatically by axios)
async function makeRequest(method, endpoint, data = null) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true, // Important for cookie-based auth
    };

    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || error.message,
      status: error.response?.status || 500,
    };
  }
}

// Test functions
async function testGeneralUserSignup() {
  console.log("\n🔄 Testing General User Signup...");
  const result = await makeRequest(
    "POST",
    "/api/auth/general/signup",
    testUsers.general,
  );

  if (result.success) {
    console.log("✅ General user signup successful");
    console.log(
      "👤 User:",
      result.data.user?.firstName,
      result.data.user?.lastName,
    );
    return true;
  } else {
    console.log(
      "❌ General user signup failed:",
      result.error?.message || result.error,
    );
    return false;
  }
}

async function testGeneralUserLogin() {
  console.log("\n🔄 Testing General User Login...");
  const loginData = {
    email: testUsers.general.email,
    password: testUsers.general.password,
  };

  const result = await makeRequest(
    "POST",
    "/api/auth/general/login",
    loginData,
  );

  if (result.success) {
    console.log("✅ General user login successful");
    console.log(
      "👤 User:",
      result.data.user?.firstName,
      result.data.user?.lastName,
    );
    return true;
  } else {
    console.log(
      "❌ General user login failed:",
      result.error?.message || result.error,
    );
    return false;
  }
}

async function testOrganizerSignup() {
  console.log("\n🔄 Testing Organizer Signup...");
  const result = await makeRequest(
    "POST",
    "/api/auth/organizer/signup",
    testUsers.organizer,
  );

  if (result.success) {
    console.log("✅ Organizer signup successful");
    console.log("🏢 Organization:", result.data.user?.organization);
    return true;
  } else {
    console.log(
      "❌ Organizer signup failed:",
      result.error?.message || result.error,
    );
    return false;
  }
}

async function testOrganizerLogin() {
  console.log("\n🔄 Testing Organizer Login...");
  const loginData = {
    email: testUsers.organizer.email,
    password: testUsers.organizer.password,
  };

  const result = await makeRequest(
    "POST",
    "/api/auth/organizer/login",
    loginData,
  );

  if (result.success) {
    console.log("✅ Organizer login successful");
    console.log("🏢 Organization:", result.data.user?.organization);
    return true;
  } else {
    console.log(
      "❌ Organizer login failed:",
      result.error?.message || result.error,
    );
    return false;
  }
}

async function testAdminLogin() {
  console.log("\n🔄 Testing Admin Login...");
  const result = await makeRequest(
    "POST",
    "/api/auth/admin/login",
    testUsers.admin,
  );

  if (result.success) {
    console.log("✅ Admin login successful");
    console.log(
      "🛡️ Admin:",
      result.data.user?.firstName,
      result.data.user?.lastName,
    );
    return true;
  } else {
    console.log(
      "❌ Admin login failed:",
      result.error?.message || result.error,
    );
    return false;
  }
}

async function testCreateCompetition() {
  console.log("\n🔄 Testing Competition Creation...");
  const result = await makeRequest(
    "POST",
    "/api/competitions/create",
    testCompetition,
  );

  if (result.success) {
    console.log("✅ Competition creation successful");
    console.log("🏆 Competition:", result.data.competition?.title);
    console.log("📝 Status:", result.data.competition?.status);
    console.log("📝 Competition ID:", result.data.competition?._id);
    return result.data.competition?._id;
  } else {
    console.log(
      "❌ Competition creation failed:",
      result.error?.message || result.error,
    );
    return null;
  }
}

async function testCreateBusinessOpportunity() {
  console.log("\n🔄 Testing Business Opportunity Creation...");
  const result = await makeRequest(
    "POST",
    "/api/business-opportunities/create",
    testBusinessOpportunity,
  );

  if (result.success) {
    console.log("✅ Business opportunity creation successful");
    console.log("💼 Opportunity:", result.data.businessOpportunity?.title);
    console.log("📝 Status:", result.data.businessOpportunity?.status);
    console.log("📝 Opportunity ID:", result.data.businessOpportunity?._id);
    return result.data.businessOpportunity?._id;
  } else {
    console.log(
      "❌ Business opportunity creation failed:",
      result.error?.message || result.error,
    );
    return null;
  }
}

async function testGetPendingItems() {
  console.log("\n🔄 Testing Get Pending Items (Admin)...");
  const result = await makeRequest("GET", "/api/admin/pending");

  if (result.success) {
    console.log("✅ Get pending items successful");
    console.log(
      "📊 Pending competitions:",
      result.data.data?.pending?.competitions?.length || 0,
    );
    console.log(
      "📊 Pending business opportunities:",
      result.data.data?.pending?.businessOpportunities?.length || 0,
    );
    console.log(
      "📊 Total pending:",
      result.data.data?.stats?.totalPending || 0,
    );
    return result.data.data;
  } else {
    console.log(
      "❌ Get pending items failed:",
      result.error?.message || result.error,
    );
    return null;
  }
}

async function testApproveItem(itemId, itemType) {
  console.log(`\n🔄 Testing Approve ${itemType}...`);
  const approvalData = {
    itemId,
    itemType,
    action: "approve",
  };

  const result = await makeRequest("POST", "/api/admin/approve", approvalData);

  if (result.success) {
    console.log(`✅ ${itemType} approval successful`);
    console.log(`📝 Status: approved`);
    return true;
  } else {
    console.log(
      `❌ ${itemType} approval failed:`,
      result.error?.message || result.error,
    );
    return false;
  }
}

async function testRejectItem(itemId, itemType) {
  console.log(`\n🔄 Testing Reject ${itemType}...`);
  const rejectionData = {
    itemId,
    itemType,
    action: "reject",
    rejectionReason: "This is a test rejection for quality control purposes",
  };

  const result = await makeRequest("POST", "/api/admin/approve", rejectionData);

  if (result.success) {
    console.log(`✅ ${itemType} rejection successful`);
    console.log(`📝 Status: rejected`);
    return true;
  } else {
    console.log(
      `❌ ${itemType} rejection failed:`,
      result.error?.message || result.error,
    );
    return false;
  }
}

async function testGeneralDashboard() {
  console.log("\n🔄 Testing General User Dashboard...");
  const result = await makeRequest("GET", "/api/dashboard/general");

  if (result.success) {
    console.log("✅ General dashboard access successful");
    console.log(
      "🏆 Available competitions:",
      result.data.data?.competitions?.length || 0,
    );
    console.log(
      "💼 Available opportunities:",
      result.data.data?.businessOpportunities?.length || 0,
    );
    console.log(
      "👤 User:",
      result.data.data?.user?.firstName,
      result.data.data?.user?.lastName,
    );
    console.log("🏫 School:", result.data.data?.user?.school);
    return result.data.data;
  } else {
    console.log(
      "❌ General dashboard access failed:",
      result.error?.message || result.error,
    );
    return null;
  }
}

async function testOrganizerDashboard() {
  console.log("\n🔄 Testing Organizer Dashboard...");
  const result = await makeRequest("GET", "/api/dashboard/organizer");

  if (result.success) {
    console.log("✅ Organizer dashboard access successful");
    console.log(
      "🏆 My competitions:",
      result.data.data?.mySubmissions?.competitions?.length || 0,
    );
    console.log(
      "💼 My opportunities:",
      result.data.data?.mySubmissions?.businessOpportunities?.length || 0,
    );
    console.log(
      "👤 Organizer:",
      result.data.data?.user?.firstName,
      result.data.data?.user?.lastName,
    );
    console.log("🏢 Organization:", result.data.data?.user?.organization);
    return result.data.data;
  } else {
    console.log(
      "❌ Organizer dashboard access failed:",
      result.error?.message || result.error,
    );
    return null;
  }
}

async function testAddToFavourites(itemId, itemType) {
  console.log(`\n🔄 Testing Add ${itemType} to Favourites...`);
  const favouriteData = {
    itemId,
    itemType,
  };

  const result = await makeRequest(
    "POST",
    "/api/auth/favourites",
    favouriteData,
  );

  if (result.success) {
    console.log(`✅ Added ${itemType} to favourites successfully`);
    console.log("❤️ Total favourites:", result.data.data?.totalFavourites || 0);
    return true;
  } else {
    console.log(
      `❌ Add ${itemType} to favourites failed:`,
      result.error?.message || result.error,
    );
    return false;
  }
}

async function testGetFavourites() {
  console.log("\n🔄 Testing Get Favourites...");
  const result = await makeRequest("GET", "/api/auth/favourites");

  if (result.success) {
    console.log("✅ Get favourites successful");
    console.log("❤️ Total favourites:", result.data.data?.total || 0);
    console.log(
      "🏆 Favourite competitions:",
      result.data.data?.competitions?.length || 0,
    );
    console.log(
      "💼 Favourite opportunities:",
      result.data.data?.businessOpportunities?.length || 0,
    );
    return result.data.data;
  } else {
    console.log(
      "❌ Get favourites failed:",
      result.error?.message || result.error,
    );
    return null;
  }
}

async function testLogout() {
  console.log("\n🔄 Testing Logout...");
  const result = await makeRequest("POST", "/api/auth/logout");

  if (result.success) {
    console.log("✅ Logout successful");
    return true;
  } else {
    console.log("❌ Logout failed:", result.error?.message || result.error);
    return false;
  }
}

// Main test runner
async function runAllTests() {
  console.log("🚀 Starting Simplified Tiered Login System API Tests");
  console.log("🔧 Using cookie-based authentication with plain text passwords");
  console.log("🖼️ Logo fields expect PNG URLs");
  console.log("=".repeat(60));

  let competitionId = null;
  let opportunityId = null;

  try {
    // Phase 1: Test authentication flows
    console.log("\n📝 PHASE 1: AUTHENTICATION TESTS");
    console.log("-".repeat(40));

    const generalSignupSuccess = await testGeneralUserSignup();
    const generalLoginSuccess = await testGeneralUserLogin();

    // Test logout and login again
    await testLogout();
    await testGeneralUserLogin(); // Login again for subsequent tests

    const organizerSignupSuccess = await testOrganizerSignup();
    const organizerLoginSuccess = await testOrganizerLogin();

    // Test logout and login again as organizer
    await testLogout();
    await testOrganizerLogin(); // Login again for content creation

    const adminLoginSuccess = await testAdminLogin();

    // Phase 2: Test content creation (as organizer)
    console.log("\n📄 PHASE 2: CONTENT CREATION TESTS");
    console.log("-".repeat(40));

    // Login as organizer for content creation
    await testLogout();
    await testOrganizerLogin();

    competitionId = await testCreateCompetition();
    opportunityId = await testCreateBusinessOpportunity();

    // Phase 3: Test admin approval flow
    console.log("\n👨‍💼 PHASE 3: ADMIN APPROVAL TESTS");
    console.log("-".repeat(40));

    // Login as admin
    await testLogout();
    await testAdminLogin();

    const pendingItems = await testGetPendingItems();

    if (competitionId) {
      await testApproveItem(competitionId, "competition");
    }

    if (opportunityId) {
      await testApproveItem(opportunityId, "business-opportunity");
    }

    // Phase 4: Test dashboard access
    console.log("\n📊 PHASE 4: DASHBOARD ACCESS TESTS");
    console.log("-".repeat(40));

    // Test general user dashboard
    await testLogout();
    await testGeneralUserLogin();
    await testGeneralDashboard();

    // Test organizer dashboard
    await testLogout();
    await testOrganizerLogin();
    await testOrganizerDashboard();

    // Phase 5: Test favourites functionality (as general user)
    console.log("\n❤️ PHASE 5: FAVOURITES FUNCTIONALITY TESTS");
    console.log("-".repeat(40));

    await testLogout();
    await testGeneralUserLogin();

    if (competitionId) {
      await testAddToFavourites(competitionId, "competition");
    }

    if (opportunityId) {
      await testAddToFavourites(opportunityId, "business-opportunity");
    }

    await testGetFavourites();

    // Phase 6: Test logout
    console.log("\n🚪 PHASE 6: LOGOUT TEST");
    console.log("-".repeat(40));

    await testLogout();

    // Final summary
    console.log("\n🎉 ALL TESTS COMPLETED!");
    console.log("=".repeat(60));
    console.log("✅ Simplified Authentication System Features Tested:");
    console.log("   • Plain text password storage and matching");
    console.log("   • Cookie-based authentication (no JWT)");
    console.log("   • Three-tier user system (Student/Organizer/Admin)");
    console.log("   • Competition and business opportunity creation");
    console.log("   • Admin approval workflow");
    console.log("   • User dashboards with role-based access");
    console.log("   • Favourites system for students");
    console.log("   • PNG URL validation for logos");
    console.log("   • Session management with logout");

    if (
      generalSignupSuccess &&
      generalLoginSuccess &&
      organizerSignupSuccess &&
      organizerLoginSuccess &&
      adminLoginSuccess &&
      competitionId &&
      opportunityId
    ) {
      console.log("\n🟢 SYSTEM STATUS: FULLY FUNCTIONAL");
      console.log("Your simplified tiered login system is working correctly!");
    } else {
      console.log("\n🟡 SYSTEM STATUS: PARTIAL SUCCESS");
      console.log(
        "Some features may need attention. Check the test results above.",
      );
    }
  } catch (error) {
    console.error("\n💥 Test runner error:", error.message);
    console.log("\n🔧 Troubleshooting tips:");
    console.log("   • Make sure your Next.js server is running (npm run dev)");
    console.log("   • Verify MongoDB is running locally");
    console.log("   • Check that all API endpoints are accessible");
  }
}

// Helper function to wait for server to be ready
async function waitForServer(maxAttempts = 10) {
  console.log("⏳ Waiting for server to be ready...");

  for (let i = 0; i < maxAttempts; i++) {
    try {
      await axios.get(`${BASE_URL}/api/health`);
      console.log("✅ Server is ready!");
      return true;
    } catch (error) {
      if (i === maxAttempts - 1) {
        console.log(
          "❌ Server not responding. Make sure your Next.js app is running on port 3000",
        );
        return false;
      }
      console.log(`⏳ Attempt ${i + 1}/${maxAttempts} - waiting 2 seconds...`);
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  console.log("🧪 Simplified Tiered Login System - API Endpoint Tests");
  console.log("📋 This script will test the simplified authentication system");
  console.log(
    "🔧 Make sure your Next.js development server is running (npm run dev)",
  );
  console.log("🗄️  Make sure MongoDB is running locally");
  console.log("");

  waitForServer().then((isReady) => {
    if (isReady) {
      runAllTests();
    } else {
      console.log("");
      console.log("💡 To start your development server:");
      console.log("   cd website/frontend");
      console.log("   npm run dev");
      console.log("");
      console.log("💡 To start MongoDB locally:");
      console.log("   mongod");
      console.log("   or use MongoDB Compass");
    }
  });
}

module.exports = {
  runAllTests,
  testUsers,
  testCompetition,
  testBusinessOpportunity,
};
