# RLC — DM on Role Removal (with logging)

This bot DMs a user when a specific role is removed in your server and logs successes/failures to a chosen channel.

## Quick Start
1. Install Node.js 18+
2. Fill `.env` (already prefilled except BOT_TOKEN)
3. In terminal:
   ```bash
   npm install
   npm start
   ```
4. Test: remove the target role from a test account. Check DMs and the log channel.

## Notes
- Requires **Server Members Intent** enabled in Developer Portal → Bot tab.
- DM may fail if the user blocks DMs from server members; failures are logged.