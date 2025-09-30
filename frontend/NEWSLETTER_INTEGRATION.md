# MailerLite Newsletter Integration

This document explains how the MailerLite newsletter subscription functionality is integrated into the homepage.

## Overview

The newsletter subscription feature allows users to sign up for updates about competitions and business opportunities directly from the homepage. It uses the MailerLite API to manage subscribers.

## Setup Instructions

### 1. Get MailerLite API Key

1. Sign up or log in to [MailerLite](https://www.mailerlite.com/)
2. Navigate to **Integrations** → **Developer API**
3. Generate a new API token
4. Copy the token for use in your environment variables

### 2. Environment Configuration

Create a `.env.local` file in the frontend directory and add your MailerLite API key:

```env
MAILERLITE_API_KEY=your_actual_api_key_here
```

**Important**: Never commit your actual API key to version control. The `.env.local` file should be added to `.gitignore`.

### 3. API Integration

The integration consists of two main parts:

#### Backend API Route
- **File**: `app/api/newsletter/subscribe/route.ts`
- **Endpoint**: `POST /api/newsletter/subscribe`
- **Purpose**: Handles subscription requests and communicates with MailerLite API

#### Frontend Component
- **File**: `components/sections/newsletter-section.tsx`
- **Purpose**: Newsletter signup form on the homepage

## API Endpoint Details

### Request Format

```typescript
POST /api/newsletter/subscribe
Content-Type: application/json

{
  "email": "user@example.com",
  "name": "Optional User Name"
}
```

### Response Format

#### Success Response (200/201)
```json
{
  "success": true,
  "message": "Successfully subscribed to newsletter!",
  "subscriber": {
    "email": "user@example.com",
    "status": "active",
    "name": "User Name"
  }
}
```

#### Error Response (400/500)
```json
{
  "error": "Error message describing what went wrong"
}
```

## Features

### ✅ Implemented Features

1. **Email Validation**: Both client and server-side email format validation
2. **Duplicate Handling**: MailerLite automatically handles existing subscribers
3. **Error Handling**: Comprehensive error handling with user-friendly messages
4. **Loading States**: Visual feedback during subscription process
5. **Toast Notifications**: Success and error messages using Sonner
6. **Security**: API key stored securely in environment variables
7. **CORS Support**: Proper CORS headers for cross-origin requests

### 🔧 Configuration Options

The API route supports the following MailerLite features:

- **Email**: Required field for subscription
- **Name**: Optional field for personalization
- **Groups**: Can be added to specific subscriber groups
- **Status**: Automatically set to "active"
- **IP Tracking**: Client IP is captured for analytics

## Error Handling

The integration handles various error scenarios:

1. **Invalid Email Format**: Validates email format before sending to MailerLite
2. **Missing API Key**: Returns server error if API key not configured
3. **MailerLite API Errors**: Handles 401, 422, and other API errors gracefully
4. **Network Errors**: Catches and handles network connectivity issues
5. **Rate Limiting**: MailerLite's built-in rate limiting is respected

## Testing

To test the newsletter subscription:

1. Ensure your MailerLite API key is configured
2. Start the development server: `npm run dev`
3. Navigate to the homepage
4. Scroll to the newsletter section
5. Enter a valid email and click "Subscribe"
6. Check your MailerLite dashboard for the new subscriber

## Security Considerations

1. **API Key Protection**: Never expose the MailerLite API key in client-side code
2. **Input Validation**: All inputs are validated before processing
3. **Rate Limiting**: Consider implementing additional rate limiting if needed
4. **HTTPS**: Always use HTTPS in production for secure data transmission

## Troubleshooting

### Common Issues

1. **"Newsletter service not configured"**
   - Ensure `MAILERLITE_API_KEY` is set in `.env.local`
   - Restart the development server after adding the environment variable

2. **"Invalid email format"**
   - Check that the email follows standard format (user@domain.com)
   - Ensure there are no extra spaces or special characters

3. **"Newsletter service authentication failed"**
   - Verify your MailerLite API key is correct and active
   - Check that the API key has proper permissions

4. **Network errors**
   - Verify internet connectivity
   - Check if MailerLite API is accessible from your network

### Debug Mode

For debugging, check the browser console and server logs for detailed error messages. The API route logs errors to the server console for troubleshooting.

## MailerLite Dashboard

After successful integration, you can:

1. View new subscribers in your MailerLite dashboard
2. Create email campaigns for your subscribers
3. Segment subscribers into different groups
4. Track engagement metrics and analytics

## Future Enhancements

Potential improvements for the newsletter integration:

1. **Custom Fields**: Add more subscriber fields (name, interests, etc.)
2. **Subscriber Groups**: Automatically assign subscribers to specific groups
3. **Double Opt-in**: Implement double opt-in confirmation emails
4. **Unsubscribe**: Add unsubscribe functionality
5. **Analytics**: Track subscription rates and conversion metrics
6. **A/B Testing**: Test different newsletter signup forms

## Support

For issues with:
- **MailerLite API**: Check [MailerLite API Documentation](https://developers.mailerlite.com/)
- **Integration Code**: Review this documentation and API route implementation
- **Frontend Issues**: Check the newsletter section component and form validation

## API Rate Limits

MailerLite API has the following rate limits:
- **120 requests per minute** for the subscribers endpoint
- Monitor your usage in the MailerLite dashboard
- The integration includes proper error handling for rate limit responses