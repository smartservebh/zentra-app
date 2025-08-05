# Google Login Setup Guide for Zentra

## Why "Google login coming soon"?

The Google login feature is fully implemented in the code but requires a **Google OAuth Client ID** to work. This is a security requirement from Google.

## How to Enable Google Login

### Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Google+ API** or **Google Identity API**

### Step 2: Create OAuth 2.0 Credentials

1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth client ID**
3. Choose **Web application**
4. Add your authorized JavaScript origins:
   - `http://localhost:3000` (for development)
   - `https://zentrahub.pro` (for production)
5. Add authorized redirect URIs:
   - `http://localhost:3000/auth/google/callback`
   - `https://zentrahub.pro/auth/google/callback`

### Step 3: Update Your Code

1. Copy your **Client ID** from Google Cloud Console
2. Update the following files:

#### In `public/js/auth.js`:
```javascript
// Replace this line:
client_id: 'YOUR_GOOGLE_CLIENT_ID',

// With your actual client ID:
client_id: '123456789-abcdefg.apps.googleusercontent.com',
```

#### In `.env` file:
```
GOOGLE_CLIENT_ID=123456789-abcdefg.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
```

### Step 4: Update Backend

In `api/auth.js`, add the Google authentication endpoints:

```javascript
// Google OAuth callback
router.post('/google', async (req, res) => {
  try {
    const { code, redirectUri } = req.body;
    
    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken({
      code,
      redirect_uri: redirectUri
    });
    
    // Get user info
    const userInfo = await oauth2Client.getTokenInfo(tokens.access_token);
    
    // Create or update user in database
    let user = await User.findOne({ email: userInfo.email });
    
    if (!user) {
      user = await User.create({
        email: userInfo.email,
        username: userInfo.email.split('@')[0],
        provider: 'google',
        googleId: userInfo.sub
      });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({ token, user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
```

### Step 5: Enable the Feature

Once you have your Google Client ID:

1. Uncomment this line in `auth.js`:
```javascript
// initializeGoogleSignIn();
```

2. The Google login button will now work!

## Alternative: Use Demo Mode

If you want to test without setting up Google OAuth:

1. Create a demo login endpoint in your backend
2. Update the `loginWithGoogle()` function to use demo credentials:

```javascript
async function loginWithGoogle() {
    // Demo mode - remove in production
    const demoUser = {
        email: 'demo@zentrahub.pro',
        username: 'demo_user'
    };
    
    const response = await zentra.apiRequest('/api/auth/demo-login', {
        method: 'POST',
        body: JSON.stringify(demoUser)
    });
    
    // Continue with normal login flow...
}
```

## Security Notes

- Never commit your Google Client Secret to version control
- Use environment variables for sensitive data
- Implement proper token validation on the backend
- Add rate limiting to prevent abuse

## Need Help?

If you need assistance setting up Google OAuth:
1. Check [Google's OAuth 2.0 documentation](https://developers.google.com/identity/protocols/oauth2)
2. Review the [Google Sign-In JavaScript guide](https://developers.google.com/identity/gsi/web/guides/overview)
3. Contact support at support@zentrahub.pro