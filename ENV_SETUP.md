# Environment Variables Setup Guide

## Overview
This guide shows you how to securely store your Supabase credentials using environment variables instead of hardcoding them in your HTML files.

## Files Created

### 1. `.env` - Your actual credentials (DO NOT COMMIT TO GIT)
```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 2. `.env.example` - Template for others (SAFE TO COMMIT)
```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. `points-env.html` - HTML file that loads from localStorage
- Prompts user to enter credentials on first visit
- Saves credentials securely in browser's localStorage
- No hardcoded credentials in the code

## Setup Instructions

### Step 1: Create your .env file
1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` with your actual Supabase credentials:
   ```bash
   # Replace with your actual values
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

### Step 2: Get your Supabase credentials
1. Go to your Supabase project dashboard
2. Navigate to **Settings** > **API**
3. Copy:
   - **Project URL** → `SUPABASE_URL`
   - **anon public** key → `SUPABASE_ANON_KEY`

### Step 3: Use the secure HTML file
1. Use `points-env.html` instead of `points-supabase.html`
2. The first time someone visits, they'll see a configuration screen
3. Enter your Supabase credentials
4. The system will save them securely in the browser

## Security Benefits

### ✅ What's Secure:
- **No hardcoded credentials** in your HTML files
- **Credentials stored locally** in the user's browser
- **Environment variables** for server-side code
- **Git ignores** your `.env` file automatically

### ⚠️ Important Notes:
- The `.env` file is in `.gitignore` - it won't be committed to Git
- The anon key is safe to use in client-side code
- Never commit your `.env` file to version control
- Share `.env.example` with others, not `.env`

## For Development

### Local Development:
1. Use `points-env.html` for development
2. Enter your credentials once
3. They're saved in your browser's localStorage

### Production Deployment:
1. Deploy `points-env.html` to your server
2. Users will enter credentials on first visit
3. Or you can pre-configure by setting localStorage

## For Cloudflare Workers

### Update wrangler.toml:
```toml
[env.production.vars]
SUPABASE_URL = "https://your-project.supabase.co"
SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Deploy with environment variables:
```bash
wrangler deploy --env production
```

## Alternative: Server-Side Configuration

If you want to avoid users entering credentials, you can:

1. **Pre-configure localStorage** by modifying the HTML
2. **Use a server** to inject the credentials
3. **Use Cloudflare Workers** with environment variables

### Example: Pre-configure localStorage
```javascript
// Add this to the top of points-env.html
localStorage.setItem('brother-points-config', JSON.stringify({
    url: 'https://your-project.supabase.co',
    key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
}));
```

## Troubleshooting

### Common Issues:

1. **"Please configure Supabase first"**
   - Make sure you've entered both URL and Key
   - Check that the URL starts with `https://`
   - Verify the key is the anon key, not the service role key

2. **"Invalid configuration"**
   - Double-check your Supabase URL and key
   - Make sure there are no extra spaces or characters
   - Try copying the credentials again from Supabase

3. **"Error loading data"**
   - Check your Supabase project is active
   - Verify the database schema was created
   - Check the browser console for detailed error messages

### Debug Steps:
1. Open browser developer tools (F12)
2. Check the Console tab for errors
3. Check the Application tab > Local Storage for saved config
4. Verify your Supabase credentials in the dashboard

## File Structure
```
homelab-dashboard/
├── .env                    # Your actual credentials (DO NOT COMMIT)
├── .env.example           # Template for others (SAFE TO COMMIT)
├── .gitignore             # Ignores .env file
├── points-env.html        # Secure HTML file
├── points-supabase.html   # Original with hardcoded credentials
└── ENV_SETUP.md          # This guide
```

## Best Practices

1. **Never commit `.env`** to version control
2. **Always use `.env.example`** as a template
3. **Rotate your keys** regularly
4. **Use different keys** for development and production
5. **Monitor API usage** in your Supabase dashboard
6. **Set up proper RLS policies** for production

## Next Steps

1. Set up your `.env` file with your Supabase credentials
2. Test the `points-env.html` file
3. Deploy to production
4. Monitor usage in your Supabase dashboard
5. Consider adding more security features as needed
