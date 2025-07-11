# Password Reset and Change Password Features

This document describes the implementation of forget password and update password features in the HostSeba application.

## Features Implemented

### 1. Forget Password

- Users can request a password reset by entering their email address
- A secure reset token is generated and stored in the database
- An email is sent to the user with a reset link
- The reset token expires after 1 hour

### 2. Reset Password

- Users can reset their password using the token from the email
- The reset link format: `/reset-password/:token`
- Password validation ensures minimum 6 characters
- After successful reset, the token is cleared from the database

### 3. Change Password (for logged-in users)

- Authenticated users can change their password from their profile
- Requires current password verification
- New password must be different from current password
- Confirmation email is sent after successful password change

## API Endpoints

### POST `/api/auth/forget-password`

Request body:

```json
{
  "email": "user@example.com"
}
```

### POST `/api/auth/reset-password`

Request body:

```json
{
  "token": "reset_token_from_email",
  "newPassword": "new_password"
}
```

### POST `/api/auth/change-password`

Request body:

```json
{
  "currentPassword": "current_password",
  "newPassword": "new_password"
}
```

## Environment Variables Required

Add these to your `.env` file:

```env
# Email Configuration (for password reset)
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_email_app_password

# Frontend URL (for password reset links)
FRONTEND_URL=http://localhost:5173
```

## Email Setup

To use Gmail for sending emails:

1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a password for "Mail"
3. Use the generated password as `EMAIL_PASSWORD`

## Frontend Routes

- `/forget-password` - Forget password form
- `/reset-password/:token` - Reset password form
- `/login` - Login page (updated with forgot password link)

## Security Features

- Reset tokens expire after 1 hour
- Tokens are cleared after use
- Passwords are hashed using bcrypt
- Email confirmation for password changes
- Current password verification for logged-in users

## Database Schema Updates

The user model has been updated to include:

- `resetPasswordToken`: String field for storing reset tokens
- `resetPasswordExpires`: Date field for token expiration

## Usage Flow

1. **Forget Password**:

   - User clicks "Forgot password?" on login page
   - Enters email address
   - Receives email with reset link
   - Clicks link to go to reset password page

2. **Reset Password**:

   - User enters new password and confirmation
   - Password is updated and token is cleared
   - User is redirected to login page

3. **Change Password**:
   - User goes to Profile page in dashboard
   - Enters current password and new password
   - Password is updated and confirmation email is sent
