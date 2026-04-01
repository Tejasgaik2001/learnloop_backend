# BACKEND SPEC — Learning Platform MVP

**Tech Stack:** NestJS
**Database:** PostgreSQL
**Architecture:** Modular REST API

---

# Folder Structure

```text
src/
 ├── auth/
 ├── users/
 ├── topics/
 ├── revisions/
 ├── practice/
 ├── dashboard/
 ├── common/
 └── config/
```

---

# Modules

Required modules:

```text
AuthModule
UsersModule
TopicsModule
RevisionsModule
PracticeModule
DashboardModule
```

---

# Database Entities

---

## Users

```text
id
name
email
password_hash
created_at
updated_at
```

---

## Topics

```text
id
user_id
title
category
notes
code_snippet
strength_score
created_at
updated_at
```

---

## Revisions

```text
id
topic_id
due_date
confidence
next_due_date
status
created_at
updated_at
```

status:

```text
pending
completed
missed
```

---

## Practice Sessions

```text
id
topic_id
question
answer
result
completed_at
```

---

# API Endpoints

---

## Auth

```text
POST /auth/register
POST /auth/login
GET /auth/me
```

---

## Topics

```text
POST /topics
GET /topics
GET /topics/:id
PATCH /topics/:id
DELETE /topics/:id
```

---

## Revisions

```text
GET /revisions/today
POST /revisions/:id/complete
```

Request body:

```json
{
  "confidence": "strong"
}
```

---

## Dashboard

```text
GET /dashboard/summary
```

Response:

```json
{
  "dueToday": 5,
  "weakTopics": 2,
  "streak": 7,
  "hoursThisWeek": 4
}
```

---

# Business Logic

---

## Revision Scheduler

Core logic:

```text
forgot → +1 day
partial → +3 days
strong → +7 days
```

Service responsibility:

```text
calculate next due date
update revision status
increase strength score
```

---

## Strength Score

Rules:

```text
successful recall → +10
problem solved → +15
missed revision → -5
```

Range:

```text
0 to 100
```

---

# Security

Use:

```text
JWT auth
route guards
request validation DTOs
```

---

# DTOs Required

```text
CreateTopicDto
UpdateTopicDto
CompleteRevisionDto
CreatePracticeDto
LoginDto
RegisterDto
```

---

# Development Priority

Phase 1:

* auth
* topics CRUD
* dashboard

Phase 2:

* revision scheduler
* confidence update

Phase 3:

* practice
* analytics
* notifications
