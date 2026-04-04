/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('practice_sessions').del();
  
  const sessions = [
    // John's practice sessions
    {
      id: '880e8400-e29b-41d4-a716-446655440101',
      topic_id: '660e8400-e29b-41d4-a716-446655440101', // SQL Window Functions
      user_id: '550e8400-e29b-41d4-a716-446655440001',
      question: 'What is the difference between RANK() and DENSE_RANK() in SQL?',
      answer: 'RANK() skips numbers after ties (1,2,2,4), while DENSE_RANK() does not skip (1,2,2,3). Both are window functions used for ranking.',
      result: 'correct',
      completed_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
    },
    {
      id: '880e8400-e29b-41d4-a716-446655440102',
      topic_id: '660e8400-e29b-41d4-a716-446655440102', // Redis Caching
      user_id: '550e8400-e29b-41d4-a716-446655440001',
      question: 'Explain the Cache-Aside pattern and when to use it.',
      answer: 'Cache-Aside: Application manages cache. Check cache first, if miss, load from DB and populate cache. Use when you want full control and cache invalidation logic.',
      result: 'partial',
      completed_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
    },

    // Sarah's practice sessions
    {
      id: '880e8400-e29b-41d4-a716-446655440201',
      topic_id: '660e8400-e29b-41d4-a716-446655440201', // React Hooks
      user_id: '550e8400-e29b-41d4-a716-446655440002',
      question: 'Why is cleanup important in useEffect? Give an example.',
      answer: 'Cleanup prevents memory leaks by removing subscriptions, timers, or event listeners when component unmounts or effect re-runs. Example: clearInterval() in return function.',
      result: 'correct',
      completed_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
    },
    {
      id: '880e8400-e29b-41d4-a716-446655440202',
      topic_id: '660e8400-e29b-41d4-a716-446655440202', // CSS Grid
      user_id: '550e8400-e29b-41d4-a716-446655440002',
      question: 'When would you use CSS Grid vs Flexbox?',
      answer: 'Grid for 2D layouts (rows and columns), Flexbox for 1D alignment. Use Grid for page layout, Flexbox for component internal alignment.',
      result: 'correct',
      completed_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
    },

    // Mike's practice sessions
    {
      id: '880e8400-e29b-41d4-a716-446655440301',
      topic_id: '660e8400-e29b-41d4-a716-446655440301', // Binary Search Tree
      user_id: '550e8400-e29b-41d4-a716-446655440003',
      question: 'What is the time complexity of search in a balanced BST vs unbalanced?',
      answer: 'Balanced BST: O(log n). Unbalanced BST (worst case): O(n) when it becomes like a linked list.',
      result: 'correct',
      completed_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) // 4 days ago
    },
    {
      id: '880e8400-e29b-41d4-a716-446655440302',
      topic_id: '660e8400-e29b-41d4-a716-446655440302', // Sliding Window
      user_id: '550e8400-e29b-41d4-a716-446655440003',
      question: 'Write a function to find the maximum sum of subarray of size k.',
      answer: 'Use sliding window: maintain window sum, add new element, remove old element. Track max sum. O(n) time, O(1) space.',
      result: 'incorrect',
      completed_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
    }
  ];

  await knex('practice_sessions').insert(sessions);
};
