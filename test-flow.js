const axios = require('axios');

const API_BASE = 'http://localhost:3001';

async function testFlow() {
  console.log('🚀 Testing Learning Platform Flow with Dummy Data\n');

  try {
    // Test 1: Authentication Flow
    console.log('1️⃣ Testing Authentication Flow...');
    
    // Login with existing user
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'john@example.com',
      password: 'password123'
    });
    const token = loginResponse.data.token;
    console.log('✅ Login successful');
    
    const authHeaders = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // Test 2: Dashboard Flow
    console.log('\n2️⃣ Testing Dashboard Flow...');
    const dashboardResponse = await axios.get(`${API_BASE}/dashboard/summary`, {
      headers: authHeaders
    });
    console.log('✅ Dashboard data:', {
      dueToday: dashboardResponse.data.dueToday,
      totalTopics: dashboardResponse.data.totalTopics,
      streak: dashboardResponse.data.streak,
      retention: dashboardResponse.data.retention
    });

    // Test 3: Add Learning Flow
    console.log('\n3️⃣ Testing Add Learning Flow...');
    const topicResponse = await axios.post(`${API_BASE}/topics`, {
      title: 'JavaScript Async/Await',
      category: 'JavaScript',
      notes: 'Async/await is syntactic sugar over Promises. Makes asynchronous code look synchronous.',
      codeSnippet: `async function fetchData() {
  try {
    const response = await fetch('/api/data');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
  }
}`
    }, { headers: authHeaders });
    console.log('✅ Topic created:', topicResponse.data.title);

    // Test 4: Get Topics
    console.log('\n4️⃣ Testing Get Topics...');
    const topicsResponse = await axios.get(`${API_BASE}/topics`, {
      headers: authHeaders
    });
    console.log('✅ Topics retrieved:', topicsResponse.data.length, 'topics');

    // Test 5: Revision Flow
    console.log('\n5️⃣ Testing Revision Flow...');
    const revisionsResponse = await axios.get(`${API_BASE}/revisions/today`, {
      headers: authHeaders
    });
    console.log('✅ Today\'s revisions:', revisionsResponse.data.length, 'due');

    if (revisionsResponse.data.length > 0) {
      const firstRevision = revisionsResponse.data[0];
      console.log('   First revision:', firstRevision.title);
      
      // Complete revision
      const completeResponse = await axios.post(
        `${API_BASE}/revisions/${firstRevision.id}/complete`,
        { confidence: 'strong' },
        { headers: authHeaders }
      );
      console.log('✅ Revision completed:', completeResponse.data.message);
    }

    // Test 6: Practice Flow
    console.log('\n6️⃣ Testing Practice Flow...');
    if (topicsResponse.data.length > 0) {
      const practiceResponse = await axios.post(`${API_BASE}/practice`, {
        topicId: topicsResponse.data[0].id,
        question: 'What is async/await?',
        answer: 'Syntactic sugar over Promises for cleaner async code',
        result: 'correct'
      }, { headers: authHeaders });
      console.log('✅ Practice session created');
    }

    // Test 7: Progress Flow
    console.log('\n7️⃣ Testing Progress Flow...');
    const progressResponse = await axios.get(`${API_BASE}/progress/summary`, {
      headers: authHeaders
    });
    console.log('✅ Progress data:', progressResponse.data);

    console.log('\n🎉 All flows tested successfully!');
    console.log('\n📊 Dummy Data Summary:');
    console.log('- Users: john@example.com, sarah@example.com, mike@example.com');
    console.log('- Password: password123 (for all users)');
    console.log('- Topics: SQL, Redis, System Design, React, CSS, DSA');
    console.log('- Revisions: Some due today, some overdue, some completed');
    console.log('- Practice Sessions: Mixed results (correct, partial, incorrect)');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the test
testFlow();
