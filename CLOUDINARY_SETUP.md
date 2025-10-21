# Cloudinary Setup Instructions

## Step 1: Create Cloudinary Account

1. Go to https://cloudinary.com/users/register/free
2. Sign up for a **free account**
3. Verify your email address

## Step 2: Get Your Credentials

1. Log in to your Cloudinary dashboard
2. Go to **Dashboard** (home page)
3. You'll see your credentials in the "Account Details" section:
   - **Cloud Name** (e.g., `dxxxxxx`)
   - **API Key** (e.g., `123456789012345`)
   - **API Secret** (click "Show" to reveal it)

## Step 3: Add Credentials to .env

Open your `.env` file and add your Cloudinary credentials:

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME="your_cloud_name_here"
CLOUDINARY_API_KEY="your_api_key_here"
CLOUDINARY_API_SECRET="your_api_secret_here"
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your_cloud_name_here"
```

**Important**: Replace the placeholder values with your actual credentials from Cloudinary.

## Step 4: Restart Dev Server

After adding credentials, restart your development server:

```bash
# Stop the server (Ctrl+C)
# Then restart:
npm run dev
```

## Step 5: Test Upload

1. Go to http://localhost:3000 (or your dev server URL)
2. Create a moment with an image or audio file
3. If configured correctly, the upload should work!

## Troubleshooting

### Error: "Cloudinary not configured"
- Make sure all 4 environment variables are set in `.env`
- Make sure `.env` is in the root directory of your project
- Restart the dev server after adding credentials

### Upload fails
- Check file size (max 10MB)
- Check file type (images: jpg, png, gif, etc. / audio: mp3, wav, etc.)
- Check browser console for error messages

### Images don't display
- Verify the image URL in the database (should start with https://res.cloudinary.com)
- Check browser network tab for failed requests

## Free Tier Limits

Cloudinary free tier includes:
- **25 GB storage**
- **25 GB bandwidth/month**
- **Unlimited transformations**

This is more than enough for development and small projects!

## Next Steps

Once Cloudinary is configured, you'll be able to:
- Upload images with moment creation
- Upload audio files
- View uploaded media in moment cards
- Click images to view full size

---

**Note**: Your `.env` file is already in `.gitignore`, so your credentials won't be committed to git. Keep them secret!
