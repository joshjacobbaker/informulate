# Database Setup Guide

This guide will help you set up the Supabase database schema for AI Trivia Arena.

## Prerequisites

- A Supabase account and project
- Environment variables configured in `.env.local`
- Supabase service role key with proper permissions

## Option 1: Using Supabase Dashboard (Recommended)

1. **Go to your Supabase Dashboard**
   - Navigate to https://app.supabase.com
   - Select your project

2. **Open SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Run the Migration**
   - Copy the contents of `supabase/migrations/001_initial_schema.sql`
   - Paste it into the SQL editor
   - Click "Run" to execute

4. **Enable Row Level Security (RLS)**
   - Go to "Authentication" > "Policies"
   - Enable RLS for the following tables:
     - `questions`
     - `game_sessions`
     - `answers`
     - `question_history`

5. **Set up Realtime**
   - Go to "Database" > "Replication"
   - Enable Realtime for the following tables:
     - `questions`
     - `game_sessions`
     - `answers`

## Option 2: Using Supabase CLI

1. **Install Supabase CLI**
   ```bash
   npm install -g @supabase/cli
   ```

2. **Initialize Supabase**
   ```bash
   supabase init
   ```

3. **Link to your project**
   ```bash
   supabase link --project-ref YOUR_PROJECT_ID
   ```

4. **Run migrations**
   ```bash
   supabase db push
   ```

## Option 3: Using our Scripts

1. **Check current schema**
   ```bash
   npm run db:check
   ```

2. **If schema is missing, follow the instructions to run SQL manually**

3. **Seed sample data**
   ```bash
   npm run db:seed
   ```

## Verification

After setting up the database, verify everything is working:

```bash
# Check database schema
npm run db:check

# Test overall configuration
npm run test:config

# Add sample questions
npm run db:seed
```

## Database Schema Overview

### Tables

1. **questions** - Stores trivia questions and answers
2. **game_sessions** - Tracks player game sessions
3. **answers** - Records user answers to questions
4. **question_history** - Tracks which questions were asked to which players

### Functions

1. **calculate_score** - Calculates score based on difficulty and time
2. **get_random_question** - Retrieves a random question for a player
3. **update_game_stats** - Updates session statistics

### Indexes

- Optimized for quick question retrieval
- Efficient session and answer lookups
- Category and difficulty filtering

## Troubleshooting

### Common Issues

1. **Permission Denied**
   - Ensure your service role key has proper permissions
   - Check that RLS policies are correctly configured

2. **Table Not Found**
   - Run the migration SQL manually in Supabase dashboard
   - Check that all tables were created successfully

3. **Function Not Found**
   - Ensure all functions were created in the migration
   - Check function permissions

### Getting Help

If you encounter issues:
1. Check the Supabase logs in your dashboard
2. Verify your environment variables
3. Run `npm run db:check` to diagnose problems
4. Check the migration file for syntax errors

## Next Steps

After setting up the database:
1. Test the configuration with `npm run test:config`
2. Add sample questions with `npm run db:seed`
3. Start building your frontend components
4. Test the OpenAI integration

## Security Notes

- Never commit your service role key to version control
- Use environment variables for all sensitive data
- Enable RLS on all tables in production
- Review and customize the security policies as needed
