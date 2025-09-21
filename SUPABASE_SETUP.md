# Supabase Setup Guide for Brother's Points System

## Overview
This guide will help you set up a Supabase database for your brother's points system, giving you a proper backend to manage tasks, shop items, and user data.

## Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in to your account
3. Click "New Project"
4. Choose your organization
5. Enter project details:
   - **Name**: `brother-points-system`
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Choose the closest to your location
6. Click "Create new project"
7. Wait for the project to be created (2-3 minutes)

## Step 2: Get Your Project Credentials

1. In your Supabase dashboard, go to **Settings** > **API**
2. Copy the following values:
   - **Project URL** (e.g., `https://your-project.supabase.co`)
   - **anon public** key (starts with `eyJ...`)

## Step 3: Set Up the Database

1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy and paste the entire contents of `supabase-schema.sql`
4. Click "Run" to execute the SQL
5. You should see "Success. No rows returned" or similar success messages

## Step 4: Update the HTML File

1. Open `points-supabase.html`
2. Find these lines near the top:
   ```javascript
   const SUPABASE_URL = 'YOUR_SUPABASE_URL';
   const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
   ```
3. Replace with your actual values:
   ```javascript
   const SUPABASE_URL = 'https://your-project.supabase.co';
   const SUPABASE_ANON_KEY = 'eyJ...your-actual-key...';
   ```

## Step 5: Test the System

1. Open `points-supabase.html` in your browser
2. You should see your brother's 3 points displayed
3. Try completing a task to earn points
4. Try purchasing an item from the shop
5. Check the admin panel to add new tasks

## Step 6: Deploy to Production

### Option A: Replace the existing points.html
```bash
# Backup the old file
mv points.html points-backup.html

# Use the Supabase version
mv points-supabase.html points.html
```

### Option B: Keep both versions
- Use `points.html` for local development
- Use `points-supabase.html` for production with database

## Database Schema Overview

### Tables Created:
- **users**: Stores user information and point balances
- **tasks**: Stores available tasks to complete
- **shop_items**: Stores items available for purchase
- **user_tasks**: Tracks which tasks each user has completed
- **user_purchases**: Tracks which items each user has purchased
- **user_activity**: Audit log of all user actions

### Functions Created:
- **complete_task()**: Handles task completion and point awarding
- **purchase_item()**: Handles item purchases and point deduction
- **get_user_dashboard()**: Retrieves complete user dashboard data

## Admin Features

### Adding New Tasks
1. Click the "🔧 Admin" button
2. Fill in the task details:
   - Title (e.g., "Clean Bathroom")
   - Description (e.g., "Clean the bathroom thoroughly")
   - Points (e.g., 25)
   - Category (chores, academic, health, family)
3. Click "Add Task"

### Managing Shop Items
You can add new shop items directly in the Supabase dashboard:
1. Go to **Table Editor** > **shop_items**
2. Click "Insert" > "Insert row"
3. Fill in the details:
   - id: unique identifier (e.g., "pizza_night")
   - title: Item name (e.g., "Pizza Night")
   - description: What the item gives (e.g., "Choose pizza for dinner")
   - price: Points cost (e.g., 40)
   - category: Item type (e.g., "privileges")

## Security Considerations

### Row Level Security (RLS)
- Currently set to allow all operations for simplicity
- For production, consider adding proper RLS policies
- Example policy for users table:
  ```sql
  CREATE POLICY "Users can only see their own data" ON users
  FOR ALL USING (auth.uid() = id);
  ```

### API Keys
- The anon key is safe to use in client-side code
- It only allows operations defined in your RLS policies
- Never expose your service role key in client code

## Monitoring and Analytics

### View User Activity
1. Go to **Table Editor** > **user_activity**
2. See all completed tasks and purchases
3. Track point changes over time

### Database Metrics
1. Go to **Reports** in your Supabase dashboard
2. View database performance and usage
3. Monitor API calls and storage usage

## Troubleshooting

### Common Issues:

1. **"Invalid API key" error**
   - Check that you copied the correct anon key
   - Make sure there are no extra spaces or characters

2. **"Failed to load data" error**
   - Check that the database schema was created successfully
   - Verify the user exists in the users table

3. **Tasks/items not loading**
   - Check that the tasks and shop_items tables have data
   - Verify the is_active column is set to true

4. **Points not updating**
   - Check the browser console for errors
   - Verify the complete_task and purchase_item functions exist

### Debug Steps:
1. Open browser developer tools (F12)
2. Check the Console tab for error messages
3. Check the Network tab for failed API calls
4. Verify your Supabase credentials are correct

## Backup and Maintenance

### Regular Backups
- Supabase automatically backs up your database
- You can also export data manually from the dashboard

### Adding More Users
To add more family members:
1. Go to **Table Editor** > **users**
2. Click "Insert" > "Insert row"
3. Add their details:
   - username: unique identifier
   - display_name: their name
   - points: starting points (default 3)

### Updating the System
- Always test changes in a development environment first
- Keep backups of your database schema
- Document any custom modifications you make

## Support
- Supabase Documentation: [supabase.com/docs](https://supabase.com/docs)
- Supabase Community: [github.com/supabase/supabase](https://github.com/supabase/supabase)
- For issues with this points system, check the browser console and Supabase logs
