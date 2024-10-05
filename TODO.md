# TODO
- Render links dynamically
X Add images for each platform
X Render trackinfo dynamically
X Store images as filepaths
X Pull in trackinfo from backend
- Make sure I'm avoiding sql-injection
- Make sure I'm avoiding all the cors shit
- Add cool webgl backgrounds
- add sticker buy prompt
X Add frontend code for getting current user from jwt
- Validate passwords actually
- make rules for passwords
- validate email
- Make failure in login and signup sexy
- deploy
- micro adjust desktop
- dark mode?
- Put my logo guy in there?
- Hook up email backend
- Hook up Spotify API
  - Make it more robust, if ambiguous, present to user and have them select
  - Return multiple values
  - Display selected artist
  X Add artist id to user table
  X Pull in album art from Spotify
- Make newsletter table in DB
- hook up analytics
- hook up logging
- Figure out how the fuck to deploy to prod?
- Rotate icons slightly. Pointy side up.
- Only render icons of non-null links
- Automatically refresh spotify token
- update field names for forms (fugly)
- TODAY - 10/05/2024
  X Query using ID
  X Verify posts to `track/{artist}` have equal params and token
  - Error/redirect on `track/{artist}` pages that do not exist
  - Kick to login page upon being un-authenticated
  - Check for authentication expiry
  - Hide login/signup for auth'd users
  - Handle 404s on the backend with something on the frontend
