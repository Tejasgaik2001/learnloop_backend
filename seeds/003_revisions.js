/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('revisions').del();
  
  const now = new Date();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const revisions = [
    // John's revisions - Some due today, some overdue, some future
    {
      id: '770e8400-e29b-41d4-a716-446655440101',
      topic_id: '660e8400-e29b-41d4-a716-446655440101', // SQL Window Functions
      user_id: '550e8400-e29b-41d4-a716-446655440001',
      due_date: new Date(today.getTime() + 2 * 60 * 60 * 1000), // Due today (2 hours from now)
      confidence: null,
      next_due_date: null,
      status: 'pending',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: '770e8400-e29b-41d4-a716-446655440102',
      topic_id: '660e8400-e29b-41d4-a716-446655440102', // Redis Caching
      user_id: '550e8400-e29b-41d4-a716-446655440001',
      due_date: new Date(today.getTime() + 4 * 60 * 60 * 1000), // Due today (4 hours from now)
      confidence: null,
      next_due_date: null,
      status: 'pending',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: '770e8400-e29b-41d4-a716-446655440103',
      topic_id: '660e8400-e29b-41d4-a716-446655440103', // Load Balancing
      user_id: '550e8400-e29b-41d4-a716-446655440001',
      due_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // Overdue (2 days ago)
      confidence: null,
      next_due_date: null,
      status: 'missed',
      created_at: new Date(),
      updated_at: new Date()
    },

    // Sarah's revisions
    {
      id: '770e8400-e29b-41d4-a716-446655440201',
      topic_id: '660e8400-e29b-41d4-a716-446655440201', // React Hooks
      user_id: '550e8400-e29b-41d4-a716-446655440002',
      due_date: new Date(today.getTime() + 1 * 60 * 60 * 1000), // Due today (1 hour from now)
      confidence: null,
      next_due_date: null,
      status: 'pending',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: '770e8400-e29b-41d4-a716-446655440202',
      topic_id: '660e8400-e29b-41d4-a716-446655440202', // CSS Grid
      user_id: '550e8400-e29b-41d4-a716-446655440002',
      due_date: new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000), // Due tomorrow
      confidence: null,
      next_due_date: null,
      status: 'pending',
      created_at: new Date(),
      updated_at: new Date()
    },

    // Mike's revisions
    {
      id: '770e8400-e29b-41d4-a716-446655440301',
      topic_id: '660e8400-e29b-41d4-a716-446655440301', // Binary Search Tree
      user_id: '550e8400-e29b-41d4-a716-446655440003',
      due_date: new Date(today.getTime() + 3 * 60 * 60 * 1000), // Due today (3 hours from now)
      confidence: null,
      next_due_date: null,
      status: 'pending',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: '770e8400-e29b-41d4-a716-446655440302',
      topic_id: '660e8400-e29b-41d4-a716-446655440302', // Sliding Window
      user_id: '550e8400-e29b-41d4-a716-446655440003',
      due_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // Overdue (1 day ago)
      confidence: null,
      next_due_date: null,
      status: 'missed',
      created_at: new Date(),
      updated_at: new Date()
    },

    // Completed revisions for streak calculation
    {
      id: '770e8400-e29b-41d4-a716-446655440401',
      topic_id: '660e8400-e29b-41d4-a716-446655440101', // SQL Window Functions - previous revision
      user_id: '550e8400-e29b-41d4-a716-446655440001',
      due_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // Was due 3 days ago
      confidence: 'strong',
      next_due_date: new Date(today.getTime() + 2 * 60 * 60 * 1000), // Next due today
      status: 'completed',
      created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    },
    {
      id: '770e8400-e29b-41d4-a716-446655440402',
      topic_id: '660e8400-e29b-41d4-a716-446655440201', // React Hooks - previous revision
      user_id: '550e8400-e29b-41d4-a716-446655440002',
      due_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // Was due yesterday
      confidence: 'partial',
      next_due_date: new Date(today.getTime() + 1 * 60 * 60 * 1000), // Next due today
      status: 'completed',
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    },
    {
      id: '770e8400-e29b-41d4-a716-446655440403',
      topic_id: '660e8400-e29b-41d4-a716-446655440302', // Sliding Window - previous revision
      user_id: '550e8400-e29b-41d4-a716-446655440003',
      due_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // Was due 2 days ago
      confidence: 'forgot',
      next_due_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // Next due yesterday (now overdue)
      status: 'completed',
      created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    }
  ];

  await knex('revisions').insert(revisions);
};
