# DynamoDB Database Schema

## Access Patterns & Table Design

All tables use a single-table design pattern with `pk` (Partition Key) and `sk` (Sort Key) for flexible querying.

---

## Table: Users
**Purpose:** Store user profiles and account information

| Attribute       | Type   | Key    | Description                    |
|-----------------|--------|--------|--------------------------------|
| pk              | String | PK     | `USER#{user_id}`               |
| sk              | String | SK     | `PROFILE`                      |
| user_id         | String |        | UUID                           |
| email           | String | GSI-PK | User email (email-index)       |
| name            | String |        | Full name                      |
| role            | String |        | student / admin / client       |
| status          | String |        | active / inactive / suspended  |
| created_at      | String |        | ISO 8601 timestamp             |
| updated_at      | String |        | ISO 8601 timestamp             |

**GSI:** `email-index` (PK: email)

---

## Table: Courses
**Purpose:** Store courses, tiers, and modules in single table

| Attribute       | Type   | Key    | Description                    |
|-----------------|--------|--------|--------------------------------|
| pk              | String | PK     | `COURSE#{course_id}`           |
| sk              | String | SK     | `METADATA` / `TIER#{name}` / `MODULE#{id}` |
| course_id       | String |        | UUID                           |
| name            | String |        | Course title                   |
| description     | String |        | Course description             |
| category        | String |        | finops / cloud / devops        |
| difficulty      | String |        | beginner / intermediate / advanced |
| instructor_id   | String |        | Instructor user ID             |
| status          | String |        | active / draft / archived      |

**Course Tiers (sk = TIER#{name}):**

| Attribute       | Type   | Description                    |
|-----------------|--------|--------------------------------|
| tier_name       | String | ignite / transformate          |
| price_usd       | Number | Price in USD                   |
| price_inr       | Number | Price in INR                   |

**Course Modules (sk = MODULE#{id}):**

| Attribute       | Type   | Description                    |
|-----------------|--------|--------------------------------|
| module_id       | String | UUID                           |
| module_name     | String | Module title                   |
| description     | String | Module description             |
| order           | Number | Display order                  |

---

## Table: Enrollments
**Purpose:** Track user course enrollments with tier

| Attribute       | Type   | Key    | Description                    |
|-----------------|--------|--------|--------------------------------|
| pk              | String | PK     | `USER#{user_id}`               |
| sk              | String | SK     | `ENROLLMENT#{course_id}`       |
| enrollment_id   | String |        | UUID                           |
| user_id         | String | GSI-PK | User ID (user-id-index)        |
| course_id       | String | GSI-PK | Course ID (course-id-index)    |
| tier_name       | String |        | **ignite** / **transformate**  |
| status          | String |        | active / expired / cancelled   |
| enrolled_at     | String |        | ISO 8601 timestamp             |

**Access Control Logic:**
```
IGNITE tier     → video, lab
TRANSFORMATE    → video, lab, mock_interview, placement_session
```

---

## Table: Lessons
**Purpose:** Store lesson content within modules

| Attribute       | Type   | Key    | Description                    |
|-----------------|--------|--------|--------------------------------|
| pk              | String | PK     | `MODULE#{module_id}`           |
| sk              | String | SK     | `LESSON#{lesson_id}`           |
| lesson_id       | String |        | UUID                           |
| module_id       | String | GSI-PK | Module ID (module-id-index)    |
| title           | String |        | Lesson title                   |
| lesson_type     | String |        | video / lab / mock_interview / placement_session |
| content_url     | String |        | S3 object key                  |
| duration_minutes| Number |        | Duration in minutes            |
| order           | Number |        | Display order within module    |

---

## Table: Progress
**Purpose:** Track lesson completion per user

| Attribute          | Type   | Key | Description                    |
|--------------------|--------|-----|--------------------------------|
| pk                 | String | PK  | `USER#{user_id}`               |
| sk                 | String | SK  | `LESSON#{lesson_id}`           |
| user_id            | String |     | User ID                        |
| lesson_id          | String |     | Lesson ID                      |
| status             | String |     | completed / in_progress        |
| completed_at       | String |     | ISO 8601 timestamp             |
| time_spent_minutes | Number |     | Time spent on lesson           |

---

## Table: Payments
**Purpose:** Payment records for course enrollments

| Attribute            | Type   | Key    | Description                  |
|----------------------|--------|--------|------------------------------|
| pk                   | String | PK     | `PAYMENT#{payment_id}`       |
| sk                   | String | SK     | `USER#{user_id}`             |
| payment_id           | String |        | UUID                         |
| user_id              | String |        | User ID                      |
| course_id            | String |        | Course ID                    |
| tier_name            | String |        | ignite / transformate        |
| amount               | String |        | Payment amount               |
| currency             | String |        | INR / USD                    |
| razorpay_order_id    | String |        | Razorpay order ID            |
| razorpay_payment_id  | String |        | Razorpay payment ID          |
| razorpay_signature   | String |        | Payment verification sig     |
| status               | String |        | created / paid / failed      |

---

## Table: ServiceLeads
**Purpose:** Consulting service lead capture

| Attribute       | Type   | Key    | Description                    |
|-----------------|--------|--------|--------------------------------|
| pk              | String | PK     | `LEAD#{lead_id}`               |
| sk              | String | SK     | `METADATA`                     |
| lead_id         | String |        | UUID                           |
| name            | String |        | Contact name                   |
| email           | String |        | Contact email                  |
| company         | String |        | Company name                   |
| cloud_spend     | String |        | Monthly cloud spend range      |
| requirement     | String |        | Service requirements           |
| phone           | String |        | Phone number                   |
| status          | String | GSI-PK | new / contacted / qualified / proposal / closed_won / closed_lost |

**GSI:** `status-index` (PK: status)

---

## Table: MentorshipSessions
**Purpose:** Mock interviews, mentorship, and placement sessions

| Attribute       | Type   | Key    | Description                    |
|-----------------|--------|--------|--------------------------------|
| pk              | String | PK     | `SESSION#{session_id}`         |
| sk              | String | SK     | `USER#{user_id}`               |
| session_id      | String |        | UUID                           |
| user_id         | String | GSI-PK | Student ID (user-id-index)     |
| mentor_id       | String | GSI-PK | Mentor ID (mentor-id-index)    |
| course_id       | String |        | Related course ID              |
| session_type    | String |        | mock_interview / mentorship / placement |
| scheduled_time  | String |        | ISO 8601 timestamp             |
| status          | String |        | scheduled / mentor_assigned / completed / cancelled |
| notes           | String |        | Session notes                  |

**GSIs:** `user-id-index` (PK: user_id), `mentor-id-index` (PK: mentor_id)

---

## Tier-Based Access Control Matrix

| Content Type       | IGNITE | TRANSFORMATE |
|--------------------|--------|--------------|
| Course Videos      | Yes    | Yes          |
| Lab Sessions       | Yes    | Yes          |
| Mock Interviews    | No     | Yes          |
| Placement Sessions | No     | Yes          |
| Resume Review      | No     | Yes          |
| 1:1 Mentorship     | No     | Yes          |
| Priority Support   | No     | Yes          |
