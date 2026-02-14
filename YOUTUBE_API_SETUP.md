# YouTube Search API Setup Guide

## Overview

The YouTube Downloader now includes a comprehensive **YouTube Search** feature powered by Google's YouTube Data API v3. This allows users to:

- Search for YouTube videos directly in the application
- View search results with thumbnails, titles, and channel information
- Click on any result to view detailed information
- Download the video directly in MP4 or MP3 format

## Prerequisites

Before using the YouTube Search feature, you need to:

1. **Have a Google Account** - Create one at [accounts.google.com](https://accounts.google.com)
2. **GitHub account credentials** - To store the API key securely (for production deployment)

## Step-by-Step Setup

### Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top
3. Click **NEW PROJECT**
4. Enter a project name (e.g., "YouTube Downloader")
5. Click **CREATE**

### Step 2: Enable YouTube Data API v3

1. In the Cloud Console, go to **APIs & Services** → **Library**
2. Search for "YouTube Data API v3"
3. Click on it and then click the **ENABLE** button
4. Wait for the API to be enabled (usually takes a few seconds)

### Step 3: Create an API Key

1. Go to **APIs & Services** → **Credentials**
2. Click **+ CREATE CREDENTIALS** at the top
3. Select **API Key**
4. A new API key will be generated - copy it
5. (Optional) Click on your new API key to restrict it to YouTube API only for security

### Step 4: Configure Local Development

1. Open `.env.local` in your project root
2. Find the line: `YOUTUBE_API_KEY=YOUR_YOUTUBE_API_KEY`
3. Replace `YOUR_YOUTUBE_API_KEY` with your actual API key
4. Save the file

Example:
```
YOUTUBE_API_KEY=AIzaSyDxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Step 5: Start the Application

Now you can start the development server with both frontend and backend:

```bash
pnpm run dev
```

The app will now be available at `http://localhost:3000` with YouTube search functionality enabled.

## Using YouTube Search

### Search Tab

1. Click on the **Search** tab at the top of the downloader
2. Type your search query (e.g., "JavaScript tutorial")
3. Click the **Search** button or press Enter
4. Browse through the results

### Click a Result

1. Click on any video card to view more details
2. A modal will open showing:
   - Video thumbnail
   - Title and channel name
   - Duration and view count
   - Description

### Download a Video

1. In the video details modal, click **Fetch Download Formats**
2. Wait for the available formats to load
3. Click either:
   - **Download MP4** - Download the full video
   - **Download MP3** - Extract and download audio only
4. The download will start automatically

## API Rate Limiting

The YouTube Data API has the following free tier quotas:

- **Default quota**: 10,000 units per day
- **Search queries**: ~1,000 searches per day (10 units each)
- **Video details**: ~5,000 lookups per day (2 units each)

For most personal use, this should be sufficient. If you need more quota, you can request an increase in the Google Cloud Console.

## Fallback: Direct Link Paste

The **Link** tab still allows you to paste YouTube URLs directly:

1. Click on the **Link** tab
2. Paste a YouTube video URL
3. Click **Fetch Formats**
4. Select a format and download

This method doesn't require YouTube API quota.

## Troubleshooting

### "YouTube Search API not available"

**Problem**: Search tab shows an error about API not being available

**Solution**:
- Check that `YOUTUBE_API_KEY` is set in `.env.local`
- Make sure the Python backend is running (`pnpm run dev` shows both servers)
- Verify your API key is valid in Google Cloud Console
- Restart the development server

### "Search quota exceeded"

**Problem**: Getting 403 quota exceeded errors

**Solution**:
- Wait until the next day (quota resets daily)
- Request a higher quota in Google Cloud Console
- Use the direct link paste method instead

### "Invalid API key"

**Problem**: Getting authentication errors

**Solution**:
- Verify you copied the API key correctly
- Make sure the YouTube Data API v3 is enabled in your project
- Regenerate the API key in Google Cloud Console and try again

### Backend not connecting

**Problem**: "Backend Server Not Running" message

**Solution**:
- Make sure you're running `pnpm run dev` (not just `next dev`)
- Check that port 8000 is not in use by another process
- Verify the backend started successfully in the terminal

## Production Deployment

For production deployment (e.g., on Vercel + Render):

1. **Set environment variable in Render dashboard**:
   - Go to your Render service settings
   - Add environment variable: `YOUTUBE_API_KEY=your_api_key_here`
   - Redeploy the service

2. **Important**: Never commit your API key to GitHub
   - The `.env.local` file is already in `.gitignore`
   - Always use environment variables for secrets

## Security Best Practices

1. ✅ **Keep API keys secret** - Never share or commit them
2. ✅ **Use environment variables** - Store keys in `.env.local` or deployment platform env vars
3. ✅ **Restrict API key usage** - In Google Cloud Console, restrict to YouTube API only
4. ✅ **Monitor usage** - Check Google Cloud Console regularly for quota usage
5. ✅ **Regenerate keys periodically** - For added security, rotate API keys occasionally

## Additional Resources

- [YouTube Data API Documentation](https://developers.google.com/youtube/v3)
- [Google Cloud Console](https://console.cloud.google.com/)
- [API Quotas & Limits](https://developers.google.com/youtube/v3/getting-started#quota)

## Questions?

If you encounter any issues:

1. Check the browser console (F12) for client-side errors
2. Check the terminal where you ran `pnpm run dev` for server errors
3. Review the .env.local configuration
4. Verify YouTube API is enabled in Google Cloud Console
