# Auth Debugging - Fixed Issues

## Problem Identified
The error "data and hash arguments required" in bcrypt.compare() was caused by:

1. **Missing password_hash field**: The `findUserByEmail` method wasn't explicitly selecting the `password_hash` field
2. **Undefined values**: bcrypt.compare() received undefined for either password or hash

## Fixes Applied

### 1. Database Service Updates
```typescript
// Before (didn't guarantee password_hash selection)
async findUserByEmail(email: string) {
  return this.db('users').where({ email }).first();
}

// After (explicitly selects all fields including password_hash)
async findUserByEmail(email: string) {
  return this.db('users').where({ email }).select('*').first();
}
```

### 2. Auth Service Error Handling
```typescript
async login(dto: LoginDto) {
  const user = await this.usersService.findByEmail(dto.email);
  if (!user) {
    throw new UnauthorizedException('Invalid credentials');
  }

  // Validate that passwordHash exists
  if (!user.passwordHash) {
    console.error('User found but passwordHash is missing:', { userId: user.id, email: user.email });
    throw new UnauthorizedException('Invalid credentials');
  }

  // Validate that password is provided
  if (!dto.password) {
    throw new UnauthorizedException('Password is required');
  }

  try {
    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }
  } catch (error) {
    console.error('Password comparison error:', error);
    throw new UnauthorizedException('Invalid credentials');
  }

  // ... rest of login logic
}
```

## Database Schema Verification
The users table schema is correct:
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  email VARCHAR UNIQUE NOT NULL,
  password_hash VARCHAR NOT NULL,  -- ✅ This field exists
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## Testing the Fix

1. **Restart the backend server** to apply the database service changes
2. **Test login with existing user** or create a new user
3. **Check backend logs** for any remaining errors

## Expected Behavior

After the fix:
- ✅ User lookup includes password_hash field
- ✅ bcrypt.compare() receives valid password and hash
- ✅ Login works correctly
- ✅ No more "data and hash arguments required" errors

## Debug Commands

If issues persist:

```sql
-- Check if users have password_hash
SELECT id, email, CASE WHEN password_hash IS NULL THEN 'MISSING' ELSE 'PRESENT' END as hash_status 
FROM users;

-- Test user lookup manually
SELECT * FROM users WHERE email = 'your-test-email@example.com';
```

The fix should resolve the bcrypt comparison error completely.
