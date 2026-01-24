# Troubleshooting Guide

## Common Issues

### Authentication Issues

#### "Invalid API credentials"
**Problem**: App can't connect to Supabase.

**Solutions**:
1. Verify `.env` file exists in project root
2. Check `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are correct
3. Restart dev server after changing `.env`
4. Ensure no extra spaces or quotes in `.env` values

```bash
# Correct format:
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...

# Incorrect (no quotes needed):
VITE_SUPABASE_URL="https://xxxxx.supabase.co"
```

#### "Profiles table not found"
**Problem**: Database schema not set up.

**Solution**: Run the SQL setup from `docs/SUPABASE_SETUP.md` in your Supabase SQL Editor.

#### "Row Level Security policy violation"
**Problem**: RLS policies not configured correctly.

**Solution**: 
1. Go to Supabase dashboard → **Authentication** → **Policies**
2. Select `profiles` table
3. Verify all 3 policies exist:
   - Public profiles viewable
   - Users can insert own profile
   - Users can update own profile

### Development Server Issues

#### Dev server won't start
**Problem**: Port 3000 already in use or TypeScript errors.

**Solutions**:
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
npm run dev -- --port 3001

# Check for TypeScript errors
npx tsc --noEmit
```

#### "Property 'env' does not exist on type 'ImportMeta'"
**Problem**: Missing Vite type definitions.

**Solution**: Ensure `src/vite-env.d.ts` exists and `tsconfig.json` includes Vite types.

```json
// tsconfig.json
{
  "compilerOptions": {
    "types": ["vite/client"]
  }
}
```

### Build Issues

#### Build fails with module errors
**Solutions**:
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf node_modules/.vite
```

### WebRTC Issues

#### Can't connect to peer
**Problem**: ICE candidates failing or NAT traversal issues.

**Solutions**:
1. Verify STUN server is accessible
2. Add TURN servers for production
3. Check firewall/router settings
4. Test on different network

#### No video/audio
**Problem**: Permission denied or device not found.

**Solutions**:
1. Grant camera/microphone permissions in browser
2. Check device is not in use by another app
3. Test in different browser
4. Verify device drivers are up to date

### Database Issues

#### Can't read/write profiles
**Problem**: RLS policies blocking access.

**Solutions**:
1. Verify user is authenticated: `supabase.auth.getUser()`
2. Check RLS policies allow the operation
3. Test with RLS disabled (not for production):
   ```sql
   ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
   ```
4. Re-enable after testing:
   ```sql
   ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
   ```

## Getting More Help

### Debug Mode
Enable verbose logging:

```typescript
// src/lib/supabase.ts
const supabase = createClient(url, key, {
  auth: {
    debug: true  // Enable auth debug logs
  }
})
```

### Check Console
1. Open browser DevTools (F12)
2. Check Console tab for errors
3. Check Network tab for failed requests

### Verify Environment
```bash
# Check Node version
node --version  # Should be 18+

# Check npm version
npm --version

# Verify all dependencies installed
npm list
```

### Reset Everything
```bash
# Complete reset
rm -rf node_modules package-lock.json .vite
npm install
npm run dev
```

## Reporting Issues

When reporting bugs, include:
- Browser and version
- OS and version
- Node.js version
- Error messages from console
- Steps to reproduce
- Screenshots if relevant

Create an issue at: https://github.com/onyangojerry/Stream/issues
