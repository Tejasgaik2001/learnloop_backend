# Learn With Repetition - Backend API

## Project Overview

A NestJS REST API for a learning platform with spaced repetition, practice sessions, and progress tracking.

## Tech Stack

- **Framework**: NestJS
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT
- **API Docs**: Swagger

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your database credentials

# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:migrate

# Start development server
npm run start:dev
```

## API Documentation

Once running, visit: `http://localhost:3000/api`

## Environment Variables

```
DATABASE_URL="postgresql://user:password@localhost:5432/learn_with_repetition?schema=public"
JWT_SECRET="your-secret-key"
JWT_EXPIRATION="7d"
PORT=3000
FRONTEND_URL="http://localhost:5173"
```

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login user |
| GET | `/auth/me` | Get current user |

### Topics
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/topics` | Create topic |
| GET | `/topics` | List all topics |
| GET | `/topics/:id` | Get topic by ID |
| PATCH | `/topics/:id` | Update topic |
| DELETE | `/topics/:id` | Delete topic |

### Revisions
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/revisions/today` | Get today's revisions |
| POST | `/revisions/:id/complete` | Complete revision |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/dashboard/summary` | Get dashboard stats |

### Practice
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/practice` | Submit practice session |

## Folder Structure

```
src/
├── auth/              # Authentication (JWT, guards)
├── users/             # User management
├── topics/            # Topic CRUD + auto-revision creation
├── revisions/         # Revision scheduler + completion
├── dashboard/         # Summary statistics
├── practice/          # Practice sessions
├── common/            # Prisma service
└── config/            # Configuration
```

## Database Schema

### Users
- id, name, email, passwordHash, createdAt, updatedAt

### Topics
- id, userId, title, category, notes, codeSnippet, strengthScore
- Auto-creates revisions on creation (Day 1, 3, 7, 15, 30)

### Revisions
- id, topicId, userId, dueDate, confidence, nextDueDate, status
- Status: pending, completed, missed

### PracticeSessions
- id, topicId, userId, question, answer, result, completedAt

## Revision Scheduler Logic

When completing a revision:
- **Forgot** → Next revision in 1 day
- **Partial** → Next revision in 3 days  
- **Strong** → Next revision in 7 days

## Strength Score Rules

- Successful recall (complete revision): +10
- Problem solved (practice): +15
- Missed revision: -5
- Range: 0-100

## Authentication

All endpoints (except auth) require Bearer token:
```
Authorization: Bearer <jwt-token>
```

## Next Steps

1. Set up PostgreSQL database
2. Configure environment variables
3. Run migrations
4. Test API endpoints via Swagger UI
5. Connect frontend to API
