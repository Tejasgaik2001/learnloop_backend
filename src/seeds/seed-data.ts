import * as bcrypt from 'bcrypt';
import { DatabaseService } from '../common/database.service';

export const seedData = async (db: DatabaseService) => {
  console.log('🌱 Starting database seeding...');

  try {
    // Clear existing data using knex directly
    await db.knex('revisions').del();
    await db.knex('topics').del();
    await db.knex('users').del();
    await db.knex('practice_sessions').del();

    console.log('🗑️ Cleared existing data');

    // Create users
    const users = [
      {
        name: 'John Doe',
        email: 'john@example.com',
        password_hash: await bcrypt.hash('password123', 10),
      },
      {
        name: 'Jane Smith',
        email: 'jane@example.com',
        password_hash: await bcrypt.hash('password123', 10),
      },
      {
        name: 'Alex Johnson',
        email: 'alex@example.com',
        password_hash: await bcrypt.hash('password123', 10),
      },
    ];

    const createdUsers = [];
    for (const user of users) {
      const [createdUser] = await db.knex('users').insert(user).returning('*');
      createdUsers.push(createdUser);
    }

    console.log(`👥 Created ${createdUsers.length} users`);

    // Create topics with realistic data
    const topics = [
      {
        user_id: createdUsers[0].id,
        title: 'Binary Search Algorithm',
        category: 'DSA',
        notes: `Binary search is a searching algorithm that works on sorted arrays. It repeatedly divides the search interval in half.

Key Points:
- Time Complexity: O(log n)
- Space Complexity: O(1)
- Requires sorted array
- Divide and conquer approach

Implementation:
1. Find middle element
2. Compare with target
3. If equal, return index
4. If target < middle, search left half
5. If target > middle, search right half`,
        code_snippet: `function binarySearch(arr, target) {
  let left = 0;
  let right = arr.length - 1;
  
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    
    if (arr[mid] === target) {
      return mid;
    } else if (arr[mid] < target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }
  
  return -1;
}`,
        created_at: new Date('2026-03-28T10:00:00Z'),
        strength_score: 85,
      },
      {
        user_id: createdUsers[0].id,
        title: 'React useEffect Hook',
        category: 'Frontend',
        notes: `useEffect is a React Hook that lets you perform side effects in functional components.

Key Points:
- Runs after every render by default
- Can be conditionally run with dependencies array
- Cleanup function available
- Replaces componentDidMount, componentDidUpdate, componentWillUnmount

Common Use Cases:
- Data fetching
- Subscriptions
- DOM manipulation
- Timers and intervals`,
        code_snippet: `import { useEffect, useState } from 'react';

function MyComponent() {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    fetchData().then(setData);
    
    return () => {
      // Cleanup
    };
  }, [dependency]); // Dependency array
  
  return <div>{data}</div>;
}`,
        created_at: new Date('2026-03-29T14:30:00Z'),
        strength_score: 78,
      },
      {
        user_id: createdUsers[1].id,
        title: 'REST API Design Principles',
        category: 'Backend',
        notes: `REST (Representational State Transfer) is an architectural style for designing networked applications.

Key Principles:
- Statelessness
- Client-server architecture
- Cacheability
- Uniform interface
- Layered system

HTTP Methods:
- GET: Retrieve data
- POST: Create data
- PUT: Update data
- DELETE: Remove data
- PATCH: Partial update`,
        code_snippet: `// Express.js REST API example
app.get('/api/users', async (req, res) => {
  const users = await User.findAll();
  res.json(users);
});

app.post('/api/users', async (req, res) => {
  const user = await User.create(req.body);
  res.status(201).json(user);
});`,
        created_at: new Date('2026-03-30T09:15:00Z'),
        strength_score: 92,
      },
      {
        user_id: createdUsers[1].id,
        title: 'Docker Containerization',
        category: 'DevOps',
        notes: `Docker is a platform for developing, shipping, and running applications in containers.

Key Concepts:
- Containers: Lightweight, isolated environments
- Images: Blueprints for containers
- Dockerfile: Instructions to build images
- Docker Compose: Multi-container applications

Benefits:
- Consistency across environments
- Resource efficiency
- Scalability
- Portability`,
        code_snippet: `# Dockerfile example
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]`,
        created_at: new Date('2026-03-31T16:45:00Z'),
        strength_score: 70,
      },
      {
        user_id: createdUsers[2].id,
        title: 'Debugging Memory Leaks',
        category: 'Debugging',
        notes: `Memory leaks occur when programs don't release memory they no longer need.

Common Causes:
- Event listeners not removed
- Timers not cleared
- Circular references
- Closures retaining references

Debugging Tools:
- Chrome DevTools Memory tab
- Heap snapshots
- Memory timeline
- Performance profiling`,
        code_snippet: `// Common memory leak pattern
class Component {
  constructor() {
    this.data = new LargeDataSet();
    // ❌ Event listener not cleaned up
    window.addEventListener('resize', this.handleResize);
  }
  
  // ✅ Proper cleanup
  destroy() {
    window.removeEventListener('resize', this.handleResize);
    this.data = null;
  }
}`,
        created_at: new Date('2026-04-01T11:20:00Z'),
        strength_score: 65,
      },
      {
        user_id: createdUsers[2].id,
        title: 'Microservices Architecture',
        category: 'Architecture',
        notes: `Microservices is an architectural style that structures an application as a collection of services.

Key Characteristics:
- Single responsibility per service
- Independent deployment
- Decentralized data management
- Technology diversity
- Fault isolation

Challenges:
- Network complexity
- Data consistency
- Service discovery
- Monitoring and logging`,
        code_snippet: `// Example microservice communication
// Order Service
app.post('/orders', async (req, res) => {
  const order = await createOrder(req.body);
  
  // Communicate with other services
  await notifyPaymentService(order);
  await updateInventoryService(order);
  
  res.status(201).json(order);
});`,
        created_at: new Date('2026-04-02T13:00:00Z'),
        strength_score: 88,
      },
    ];

    const createdTopics = [];
    for (const topic of topics) {
      const [createdTopic] = await db.knex('topics').insert(topic).returning('*');
      createdTopics.push(createdTopic);
    }

    console.log(`📚 Created ${createdTopics.length} topics`);

    // Create revisions with realistic dates
    const now = new Date();
    const revisions = [];

    for (const topic of createdTopics) {
      // Create Day 1, 4, 7 revisions
      const schedule = [1, 4, 7];
      
      for (const days of schedule) {
        const dueDate = new Date(topic.created_at);
        dueDate.setDate(dueDate.getDate() + days);
        
        // Set some revisions as completed, others as pending
        const isCompleted = days === 1 && dueDate < now; // Day 1 revisions are completed
        
        revisions.push({
          topic_id: topic.id,
          user_id: topic.user_id,
          due_date: dueDate,
          revision_day: days,
          status: isCompleted ? 'completed' : 'pending',
          confidence: isCompleted ? 'strong' : null,
          completed_at: isCompleted ? new Date(dueDate.getTime() - 86400000) : null, // Completed one day before due
        });
      }
    }

    await db.knex('revisions').insert(revisions);
    console.log(`📅 Created ${revisions.length} revisions`);

    // Create practice sessions
    const practiceSessions = [
      {
        user_id: createdUsers[0].id,
        topic_id: createdTopics[0].id,
        question: 'What is the time complexity of binary search?',
        answer: 'O(log n) - Binary search has logarithmic time complexity because it divides the search space in half with each comparison.',
        result: 'correct',
        completed_at: new Date('2026-03-28T10:30:00Z'),
      },
      {
        user_id: createdUsers[0].id,
        topic_id: createdTopics[1].id,
        question: 'When does useEffect run in React?',
        answer: 'useEffect runs after every render by default, but you can control when it runs using the dependency array.',
        result: 'partial',
        completed_at: new Date('2026-03-29T15:00:00Z'),
      },
      {
        user_id: createdUsers[1].id,
        topic_id: createdTopics[2].id,
        question: 'What HTTP method would you use to update a resource partially?',
        answer: 'PATCH - PATCH is used for partial updates, while PUT replaces the entire resource.',
        result: 'correct',
        completed_at: new Date('2026-03-30T09:45:00Z'),
      },
    ];

    await db.knex('practice_sessions').insert(practiceSessions);
    console.log(`🎯 Created ${practiceSessions.length} practice sessions`);

    console.log('✅ Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`- Users: ${createdUsers.length}`);
    console.log(`- Topics: ${createdTopics.length}`);
    console.log(`- Revisions: ${revisions.length}`);
    console.log(`- Practice Sessions: ${practiceSessions.length}`);
    
    // Show login credentials
    console.log('\n🔑 Login Credentials:');
    createdUsers.forEach(user => {
      console.log(`- ${user.email} / password123`);
    });

    return {
      users: createdUsers,
      topics: createdTopics,
      revisions,
      practiceSessions,
    };

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
};
