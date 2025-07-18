# Database Schema Documentation

## Overview
This document describes the database schema for the AI Trivia Arena application.

## Tables

### `questions`
Stores trivia questions with multiple choice answers.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `question_text` | TEXT | The question text |
| `options` | TEXT[] | Array of multiple choice options (3-5 items) |
| `correct_answer` | TEXT | The correct answer (A, B, C, D, or E) |
| `category` | TEXT | Question category (default: 'General Knowledge') |
| `difficulty` | TEXT | Difficulty level (easy, medium, hard) |
| `explanation` | TEXT | Explanation of the correct answer |
| `created_at` | TIMESTAMP | When the question was created |
| `updated_at` | TIMESTAMP | When the question was last updated |

**Constraints:**
- `options` must have 3-5 items
- `difficulty` must be one of: 'easy', 'medium', 'hard'
- `correct_answer` must match one of the option letters

### `game_sessions`
Tracks individual game sessions for players.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `player_id` | TEXT | Player identifier |
| `score` | INTEGER | Total score for the session |
| `correct_answers` | INTEGER | Number of correct answers |
| `total_answers` | INTEGER | Total number of questions answered |
| `current_streak` | INTEGER | Current correct answer streak |
| `max_streak` | INTEGER | Maximum streak achieved in session |
| `difficulty_preference` | TEXT | Preferred difficulty level |
| `category_preference` | TEXT | Preferred category (optional) |
| `is_active` | BOOLEAN | Whether the session is currently active |
| `started_at` | TIMESTAMP | When the session started |
| `ended_at` | TIMESTAMP | When the session ended (optional) |
| `created_at` | TIMESTAMP | When the record was created |
| `updated_at` | TIMESTAMP | When the record was last updated |

### `answers`
Records individual answers submitted by players.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `question_id` | UUID | Foreign key to questions table |
| `session_id` | UUID | Foreign key to game_sessions table |
| `selected_answer` | TEXT | The answer selected by the player |
| `is_correct` | BOOLEAN | Whether the answer was correct |
| `time_taken` | INTEGER | Time taken to answer in milliseconds |
| `points_earned` | INTEGER | Points earned for this answer |
| `answered_at` | TIMESTAMP | When the answer was submitted |
| `created_at` | TIMESTAMP | When the record was created |

### `question_history`
Tracks which questions have been asked in each session to avoid duplicates.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `session_id` | UUID | Foreign key to game_sessions table |
| `question_id` | UUID | Foreign key to questions table |
| `asked_at` | TIMESTAMP | When the question was asked |
| `created_at` | TIMESTAMP | When the record was created |

**Constraints:**
- Unique constraint on `(session_id, question_id)` to prevent duplicate questions in a session

## Functions

### `get_random_question(p_session_id, p_category, p_difficulty)`
Returns a random question that hasn't been asked in the specified session.

**Parameters:**
- `p_session_id` (UUID): The game session ID
- `p_category` (TEXT, optional): Filter by category
- `p_difficulty` (TEXT, optional): Filter by difficulty

**Returns:**
Array of question objects with fields: `id`, `question_text`, `options`, `correct_answer`, `category`, `difficulty`

### `calculate_score(p_difficulty, p_time_taken)`
Calculates the score for an answer based on difficulty and time taken.

**Parameters:**
- `p_difficulty` (TEXT): The difficulty level of the question
- `p_time_taken` (INTEGER, optional): Time taken to answer in milliseconds

**Returns:**
INTEGER score value

**Scoring Rules:**
- Easy: 10 points base
- Medium: 20 points base  
- Hard: 30 points base
- Time bonus: +10 points if answered in under 5 seconds, +5 points if under 10 seconds

## Indexes

Performance indexes are created on:
- `questions`: category, difficulty, created_at
- `game_sessions`: player_id, is_active, created_at
- `answers`: question_id, session_id, answered_at
- `question_history`: session_id, question_id

## Row Level Security (RLS)

RLS is enabled on all tables with public access policies for single-player gameplay. In a production multi-user environment, you should implement more restrictive policies.

## Sample Data

The initial migration includes sample questions for testing:
- Geography: "What is the capital of France?"
- Science: "Which planet is known as the Red Planet?"
- Literature: "Who wrote the novel '1984'?"
- Nature: "What is the largest mammal in the world?"
- History: "In which year did World War II end?"

## Migration Files

Database changes are tracked in the `supabase/migrations/` directory:
- `001_initial_schema.sql`: Initial database schema setup

## Setup Instructions

1. Make sure you have a Supabase project created
2. Copy your project URL and keys to `.env.local`
3. Run the database setup script: `npm run db:setup`
4. Verify the setup with: `npm run test:config`

## Development Notes

- All tables use UUID primary keys for better scalability
- Timestamps are stored in UTC with timezone information
- The schema supports real-time subscriptions for live updates
- Foreign key constraints ensure data integrity
- Triggers automatically update `updated_at` fields
