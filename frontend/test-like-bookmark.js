/**
 * Test Script for Like and Bookmark Functionality
 * Run this with: node test-like-bookmark.js
 */

const https = require('https');
const http = require('http');

// Configuration
const BASE_URL = 'http://localhost:3000'; // Change this to your server URL
const TEST_USER = {
  email: 'test@example.com',
  password: 'testpassword123',
  userType: 'general'
};

// Helper function to make HTTP requests
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;

    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    };

    const req = client.request(requestOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: jsonData
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: data
          });
        }
      });
    });

    req.on('error', reject);

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }

    req.end();
  });
}

// Test functions
async function testServerHealth() {
  console.log('🏥 Testing server health...');
  try {
    const response = await makeRequest(`${BASE_URL}/api/health`);
    console.log(`✅ Server health: ${response.status}`);
    return response.status === 200;
  } catch (error) {
    console.log('❌ Server health check failed:', error.message);
    return false;
  }
}

async function testAuthentication() {
  console.log('🔐 Testing authentication...');
  try {
    const response = await makeRequest(`${BASE_URL}/api/debug/test-auth`);
    console.log('📊 Auth Debug Response:');
    console.log(JSON.stringify(response.data, null, 2));

    if (response.data.authResult?.success) {
      console.log('✅ Authentication working');
      return {
        success: true,
        userType: response.data.authResult.userType,
        email: response.data.authResult.email
      };
    } else {
      console.log('❌ Authentication failed');
      return { success: false };
    }
  } catch (error) {
    console.log('❌ Auth test failed:', error.message);
    return { success: false };
  }
}

async function testDashboardData() {
  console.log('📊 Testing dashboard data...');
  try {
    const response = await makeRequest(`${BASE_URL}/api/dashboard/general`);

    if (response.status === 200 && response.data.success) {
      const data = response.data.data;
      console.log(`✅ Dashboard loaded successfully`);
      console.log(`   - Competitions: ${data.competitions?.length || 0}`);
      console.log(`   - Business Opportunities: ${data.businessOpportunities?.length || 0}`);
      console.log(`   - Favourites: ${data.favourites?.length || 0}`);
      console.log(`   - Liked Items: ${data.likedItems?.length || 0}`);

      // Find database items
      const dbCompetitions = data.competitions?.filter(comp =>
        /^[0-9a-fA-F]{24}$/.test(comp._id || comp.id)
      ) || [];

      const dbOpportunities = data.businessOpportunities?.filter(opp =>
        /^[0-9a-fA-F]{24}$/.test(opp._id || opp.id)
      ) || [];

      console.log(`   - Database Competitions: ${dbCompetitions.length}`);
      console.log(`   - Database Opportunities: ${dbOpportunities.length}`);

      return {
        success: true,
        dbCompetitions,
        dbOpportunities,
        favourites: data.favourites || [],
        likedItems: data.likedItems || []
      };
    } else {
      console.log('❌ Dashboard failed:', response.data.message || response.status);
      return { success: false };
    }
  } catch (error) {
    console.log('❌ Dashboard test failed:', error.message);
    return { success: false };
  }
}

async function testLikeAPI(itemId, itemType) {
  console.log(`💖 Testing like API for ${itemType}: ${itemId}`);
  try {
    // Test adding like
    const addResponse = await makeRequest(`${BASE_URL}/api/auth/likes`, {
      method: 'POST',
      body: { itemId, itemType }
    });

    console.log(`   Add Like Response: ${addResponse.status}`);
    if (addResponse.data.success) {
      console.log(`   ✅ Like added successfully`);
      console.log(`   Item like count: ${addResponse.data.data.itemLikeCount}`);
    } else {
      console.log(`   ❌ Like failed: ${addResponse.data.message}`);
      return false;
    }

    // Test removing like
    const removeResponse = await makeRequest(`${BASE_URL}/api/auth/likes`, {
      method: 'DELETE',
      body: { itemId, itemType }
    });

    console.log(`   Remove Like Response: ${removeResponse.status}`);
    if (removeResponse.data.success) {
      console.log(`   ✅ Like removed successfully`);
      console.log(`   Item like count: ${removeResponse.data.data.itemLikeCount}`);
      return true;
    } else {
      console.log(`   ❌ Unlike failed: ${removeResponse.data.message}`);
      return false;
    }

  } catch (error) {
    console.log(`   ❌ Like API test failed: ${error.message}`);
    return false;
  }
}

async function testBookmarkAPI(itemId, itemType) {
  console.log(`🔖 Testing bookmark API for ${itemType}: ${itemId}`);
  try {
    // Test adding bookmark
    const addResponse = await makeRequest(`${BASE_URL}/api/auth/favourites`, {
      method: 'POST',
      body: { itemId, itemType }
    });

    console.log(`   Add Bookmark Response: ${addResponse.status}`);
    if (addResponse.data.success) {
      console.log(`   ✅ Bookmark added successfully`);
      console.log(`   Total favourites: ${addResponse.data.data.totalFavourites}`);
    } else {
      console.log(`   ❌ Bookmark failed: ${addResponse.data.message}`);
      return false;
    }

    // Test removing bookmark
    const removeResponse = await makeRequest(`${BASE_URL}/api/auth/favourites`, {
      method: 'DELETE',
      body: { itemId, itemType }
    });

    console.log(`   Remove Bookmark Response: ${removeResponse.status}`);
    if (removeResponse.data.success) {
      console.log(`   ✅ Bookmark removed successfully`);
      console.log(`   Total favourites: ${removeResponse.data.data.totalFavourites}`);
      return true;
    } else {
      console.log(`   ❌ Unbookmark failed: ${removeResponse.data.message}`);
      return false;
    }

  } catch (error) {
    console.log(`   ❌ Bookmark API test failed: ${error.message}`);
    return false;
  }
}

// Main test runner
async function runTests() {
  console.log('🚀 Starting Like & Bookmark Functionality Tests\n');

  // Test 1: Server Health
  const healthOk = await testServerHealth();
  if (!healthOk) {
    console.log('💥 Server is not responding. Make sure it\'s running on', BASE_URL);
    process.exit(1);
  }
  console.log('');

  // Test 2: Authentication
  const authResult = await testAuthentication();
  if (!authResult.success) {
    console.log('💥 Authentication not working. Please:');
    console.log('   1. Make sure you\'re logged in as a general user');
    console.log('   2. Check MongoDB connection');
    console.log('   3. Verify cookies are set properly');
    process.exit(1);
  }
  console.log('');

  // Test 3: Dashboard Data
  const dashboardResult = await testDashboardData();
  if (!dashboardResult.success) {
    console.log('💥 Dashboard data not loading properly');
    process.exit(1);
  }
  console.log('');

  // Test 4: API Functionality
  let testsPassed = 0;
  let testsTotal = 0;

  // Test with database competitions
  if (dashboardResult.dbCompetitions.length > 0) {
    const comp = dashboardResult.dbCompetitions[0];
    const compId = comp._id || comp.id;

    testsTotal += 2;
    if (await testLikeAPI(compId, 'competition')) testsPassed++;
    if (await testBookmarkAPI(compId, 'competition')) testsPassed++;
    console.log('');
  }

  // Test with database opportunities
  if (dashboardResult.dbOpportunities.length > 0) {
    const opp = dashboardResult.dbOpportunities[0];
    const oppId = opp._id || opp.id;

    testsTotal += 2;
    if (await testLikeAPI(oppId, 'business-opportunity')) testsPassed++;
    if (await testBookmarkAPI(oppId, 'business-opportunity')) testsPassed++;
    console.log('');
  }

  // Results
  console.log('📊 Test Results:');
  console.log(`   Passed: ${testsPassed}/${testsTotal}`);
  console.log(`   Success Rate: ${testsTotal > 0 ? Math.round(testsPassed/testsTotal*100) : 0}%`);

  if (testsTotal === 0) {
    console.log('\n⚠️  No database items found to test with!');
    console.log('   To test the functionality:');
    console.log('   1. Create a competition at /create/competition');
    console.log('   2. Approve it in the admin panel');
    console.log('   3. Run this test again');
  } else if (testsPassed === testsTotal) {
    console.log('\n🎉 All tests passed! Like and Bookmark functionality is working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Check the error messages above.');
  }

  console.log('\n✨ Test complete!');
}

// Handle command line execution
if (require.main === module) {
  runTests().catch(error => {
    console.error('💥 Test runner crashed:', error);
    process.exit(1);
  });
}

module.exports = { runTests, testLikeAPI, testBookmarkAPI };
