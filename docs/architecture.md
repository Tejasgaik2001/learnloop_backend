# Backend Architecture

## Module Structure

### AuthModule
- **Purpose**: JWT-based authentication
- **Components**:
  - `AuthController`: Register, login, get current user
  - `AuthService`: Password hashing, token generation
  - `JwtStrategy`: Passport JWT validation
  - `JwtAuthGuard`: Route protection
- **DTOs**: RegisterDto, LoginDto

### UsersModule
- **Purpose**: User data management
- **Components**:
  - `UsersService`: CRUD operations on users
- **Integration**: Used by AuthModule for lookups

### TopicsModule
- **Purpose**: Topic/learning content management
- **Components**:
  - `TopicsController`: CRUD endpoints
  - `TopicsService`: Business logic + auto-revision creation
- **Auto-Revisions**: Creates 5 revisions on topic creation (Day 1, 3, 7, 15, 30)
- **DTOs**: CreateTopicDto, UpdateTopicDto

### RevisionsModule
- **Purpose**: Spaced repetition scheduling
- **Components**:
  - `RevisionsController`: Get today's, complete revision
  - `RevisionsService`: Scheduler logic + strength scoring
- **Scheduler**:
  ```
  forgot → +1 day
  partial → +3 days
  strong → +7 days
  ```
- **Strength Scoring**:
  ```
  forgot → -5 points
  partial → +10 points
  strong → +10 points
  ```
- **DTOs**: CompleteRevisionDto

### DashboardModule
- **Purpose**: Aggregated statistics
- **Components**:
  - `DashboardController`: Summary endpoint
  - `DashboardService`: Stats calculation
- **Metrics**:
  - Due today count
  - Total topics
  - Weak topics (strength < 60)
  - Streak (consecutive days)
  - Weekly revisions
  - Retention rate (avg strength)
  - Estimated hours

### PracticeModule
- **Purpose**: Practice session tracking
- **Components**:
  - `PracticeController`: Submit practice
  - `PracticeService`: Save session + update strength
- **Strength**: +15 for correct, +10 for partial
- **DTOs**: CreatePracticeDto

## Data Flow

### Creating a Topic
1. User creates topic → POST /topics
2. TopicsService saves topic
3. TopicsService creates 5 revisions (Day 1, 3, 7, 15, 30)
4. Revisions appear in user's daily queue

### Completing a Revision
1. User submits confidence → POST /revisions/:id/complete
2. RevisionsService validates access
3. Calculate next due date based on confidence
4. Update topic strength score
5. Create next revision (unless forgot)
6. Return success with next date

### Practice Session
1. User submits practice → POST /practice
2. PracticeService saves session
3. If correct/partial → increment topic strength
4. Return saved session

## Security

- JWT tokens for authentication
- Bearer token in Authorization header
- User ID from token used for all queries
- Cannot access other users' data

## Database Relations

```
User ──< Topic
User ──< Revision
User ──< PracticeSession
Topic ──< Revision
Topic ──< PracticeSession
```

## API Response Format

### Success
```json
{
  "id": "uuid",
  "title": "...",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

### Error
```json
{
  "statusCode": 400,
  "message": "Error description",
  "error": "Bad Request"
}
```

## Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage
npm run test:cov
```

## Deployment Checklist

- [ ] Set up PostgreSQL database
- [ ] Configure production environment variables
- [ ] Run database migrations
- [ ] Set up SSL/TLS
- [ ] Configure CORS for production frontend
- [ ] Enable request rate limiting
- [ ] Set up logging/monitoring
