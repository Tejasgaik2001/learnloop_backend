/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('topics').del();
  
  const userId1 = '550e8400-e29b-41d4-a716-446655440001'; // John Developer
  const userId2 = '550e8400-e29b-41d4-a716-446655440002'; // Sarah Engineer
  const userId3 = '550e8400-e29b-41d4-a716-446655440003'; // Mike Coder

  const topics = [
    // John's topics - Backend focused
    {
      id: '660e8400-e29b-41d4-a716-446655440101',
      user_id: userId1,
      title: 'SQL Window Functions',
      category: 'Database',
      notes: 'Window functions perform calculations across a set of table rows. RANK() vs DENSE_RANK() vs ROW_NUMBER(). RANK() skips numbers after ties, DENSE_RANK() does not.',
      code_snippet: `SELECT 
  employee_id,
  department,
  salary,
  RANK() OVER (PARTITION BY department ORDER BY salary DESC) as rank_dept,
  DENSE_RANK() OVER (PARTITION BY department ORDER BY salary DESC) as dense_rank_dept
FROM employees;`,
      strength_score: 75,
      created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
      updated_at: new Date()
    },
    {
      id: '660e8400-e29b-41d4-a716-446655440102',
      user_id: userId1,
      title: 'Redis Caching Strategies',
      category: 'Cache',
      notes: 'Cache-Aside: Application manages cache. Write-Through: Write to cache and DB simultaneously. Write-Behind: Write to cache first, then DB asynchronously.',
      code_snippet: `// Cache-Aside Pattern
async function getUser(id) {
  let user = await redis.get(\`user:\${id}\`);
  if (!user) {
    user = await db.getUser(id);
    await redis.setex(\`user:\${id}\`, 3600, JSON.stringify(user));
  }
  return JSON.parse(user);
}`,
      strength_score: 60,
      created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
      updated_at: new Date()
    },
    {
      id: '660e8400-e29b-41d4-a716-446655440103',
      user_id: userId1,
      title: 'System Design - Load Balancing',
      category: 'System Design',
      notes: 'Load balancers distribute incoming traffic across multiple servers. Types: Application Layer (L7), Network Layer (L4). Algorithms: Round Robin, Least Connections, IP Hash.',
      code_snippet: `# Nginx Load Balancer Example
upstream backend {
    least_conn;
    server 10.0.0.1:8080;
    server 10.0.0.2:8080;
    server 10.0.0.3:8080;
}

server {
    listen 80;
    location / {
        proxy_pass http://backend;
    }
}`,
      strength_score: 45,
      created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      updated_at: new Date()
    },

    // Sarah's topics - Frontend focused
    {
      id: '660e8400-e29b-41d4-a716-446655440201',
      user_id: userId2,
      title: 'React Hooks - useEffect Cleanup',
      category: 'React',
      notes: 'useEffect cleanup function prevents memory leaks. Runs when component unmounts or before effect re-runs. Essential for subscriptions, timers, event listeners.',
      code_snippet: `useEffect(() => {
    const timer = setInterval(() => {
      console.log('Timer tick');
    }, 1000);

    // Cleanup function
    return () => {
      clearInterval(timer);
    };
  }, []); // Empty dependency array = run once`,
      strength_score: 85,
      created_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000), // 12 days ago
      updated_at: new Date()
    },
    {
      id: '660e8400-e29b-41d4-a716-446655440202',
      user_id: userId2,
      title: 'CSS Grid vs Flexbox',
      category: 'CSS',
      notes: 'Grid: 2D layout (rows + columns). Flexbox: 1D layout (row OR column). Use Grid for overall page layout, Flexbox for component alignment.',
      code_snippet: `/* CSS Grid - 2D Layout */
.grid-container {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  grid-template-rows: auto 1fr auto;
  gap: 1rem;
}

/* Flexbox - 1D Layout */
.flex-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}`,
      strength_score: 70,
      created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), // 8 days ago
      updated_at: new Date()
    },

    // Mike's topics - DSA focused
    {
      id: '660e8400-e29b-41d4-a716-446655440301',
      user_id: userId3,
      title: 'Binary Search Tree Operations',
      category: 'Data Structures',
      notes: 'BST property: left < root < right. Insert: O(log n) average, O(n) worst case. Search: O(log n) average. In-order traversal gives sorted order.',
      code_snippet: `class TreeNode {
  constructor(val) {
    this.val = val;
    this.left = null;
    this.right = null;
  }
}

function searchBST(root, val) {
  if (!root || root.val === val) return root;
  
  return val < root.val 
    ? searchBST(root.left, val)
    : searchBST(root.right, val);
}`,
      strength_score: 55,
      created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), // 20 days ago
      updated_at: new Date()
    },
    {
      id: '660e8400-e29b-41d4-a716-446655440302',
      user_id: userId3,
      title: 'Sliding Window Technique',
      category: 'Algorithms',
      notes: 'Optimal for subarray problems. Maintain window [left, right]. Expand right, shrink left when condition violated. Time: O(n), Space: O(1).',
      code_snippet: `function maxSubarraySum(nums, k) {
  let maxSum = 0;
  let windowSum = 0;
  let left = 0;
  
  for (let right = 0; right < nums.length; right++) {
    windowSum += nums[right];
    
    if (right - left + 1 === k) {
      maxSum = Math.max(maxSum, windowSum);
      windowSum -= nums[left];
      left++;
    }
  }
  
  return maxSum;
}`,
      strength_score: 80,
      created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      updated_at: new Date()
    }
  ];

  await knex('topics').insert(topics);
};
