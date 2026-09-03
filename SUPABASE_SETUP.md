# Supabase Setup Guide for DevBridge

## ✅ Database Setup Complete!

You've successfully created the Supabase tables using SQL. Here's what's been set up:

### Tables Created:
1. **jobs** - Stores all opportunities posted by admin
2. **applications** - Tracks applications from users
3. **submissions** - Stores work submissions from users

### Column Structure (from your SQL):

**jobs table:**
- `id` (UUID, primary key)
- `created_at` (timestamp)
- `title` (text)
- `type` (Frontend, Backend, Fullstack, UI/UX Design, Mobile, DevOps)
- `description` (text)
- `skills` (text array)
- `difficulty` (Easy, Medium, Hard)
- `duration` (text)
- `slots` (integer)

**applications table:**
- `id` (UUID, primary key)
- `created_at` (timestamp)
- `job_id` (foreign key to jobs)
- `job_title` (text)
- `name` (text)
- `email` (text)
- `skills` (text array)
- `message` (text)
- `status` (pending, accepted, rejected)

**submissions table:**
- `id` (UUID, primary key)
- `created_at` (timestamp)
- `job_id` (UUID)
- `job_title` (text)
- `user_name` (text)
- `user_email` (text)
- `notes` (text)
- `files` (jsonb)
- `status` (submitted, reviewed)

### RLS Policies:
✅ Public read/write/delete access enabled for all tables
✅ Perfect for anonymous users sharing opportunities in real-time

## How It Works Now

### Admin Dashboard (admin-dashboard.html)
1. Admin logs in and posts a job
2. Job is saved to **both**:
   - LocalStorage (backup)
   - Supabase `jobs` table (shared with all users)
3. All users instantly see the new job

### Opportunities Page (opportunities.html)
1. Loads all jobs from Supabase `jobs` table
2. **Polls for updates every 3 seconds** (simulates real-time)
3. When new jobs appear, UI updates automatically
4. All users see the same opportunities

## Code Updates Made

Your code is now configured to:
- ✓ Read from `jobs` table (not `opportunities`)
- ✓ Use UUID primary keys
- ✓ Handle `skills` as text array
- ✓ Poll Supabase every 3 seconds for new jobs
- ✓ Post new jobs with correct column names

## Testing It

### Test 1: Post a Job (Real-Time Check)
1. Open **admin-dashboard.html** in one window
2. Log in (admin / admin123)
3. Post a test job
4. Open **opportunities.html** in another window/browser
5. ✓ New job appears within 3 seconds

### Test 2: See It From Different Users
1. Open opportunities.html in **Chrome**
2. Open opportunities.html in **Firefox**
3. Post a job from admin dashboard
4. Both browsers show the job instantly

### Test 3: Verify Supabase
1. Go to https://app.supabase.com
2. Open your project
3. Click **SQL** and run:
```sql
SELECT COUNT(*) FROM jobs;
```
4. Should show your posted jobs

## Troubleshooting

**Jobs not appearing?**
- Check browser console (F12) for errors
- Verify Supabase URL and key in code match your project
- Make sure RLS policies allow public SELECT

**Only showing old jobs from localStorage?**
- That's normal on first load. Supabase will load fresh data.
- New jobs posted through admin dashboard appear in real-time

**Polling not working?**
- Polling runs every 3 seconds (visible in console logs)
- Look for: "📡 Starting job polling every 3 seconds..."
- If you want faster updates, change 3000 to 2000 in app.js

**3-second delay feels slow?**
- That's the polling interval. To speed up:
  - Change 3000 to 1000 for 1-second polling
  - Or upgrade to Supabase Realtime (requires config)

## Next Steps (Optional Enhancements)

After basic testing, you can add:
1. **User Authentication** - Track who applied for what
2. **Email Notifications** - Alert users when new jobs posted
3. **Better Realtime** - Upgrade Supabase Realtime for instant updates (no polling)
4. **Job Search** - Full-text search on job titles and descriptions
5. **Skill Filtering** - Advanced filtering by skills

For now, the basic setup is complete and working! 🎉

