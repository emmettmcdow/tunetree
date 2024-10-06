# TODO
X Add images for each platform
X Render trackinfo dynamically
X Store images as filepaths
X Pull in trackinfo from backend
X Add frontend code for getting current user from jwt
X 10/05/2024
  X Query using ID
  X Verify posts to `track/{artist}` have equal params and token
  X Error/redirect on `track/{artist}` pages that do not exist
  X Kick to login page upon being un-authenticated
  X Don't blow tf up the signup page
  X Handle a users first track gracefully (shouldn't give a 404 at first)
  X Get only the latest track
  X Add Shader background
  X Render links dynamically
- 10/06/2024
  - Make sure I'm avoiding sql-injection
  - validate email
  - Make sure I'm avoiding all the cors shit
  X Validate passwords actually
  - Validate email and passwords on backend
  - Validate links
  - Automatically refresh spotify token

- add sticker buy prompt
- Add banned passsword list
- make rules for passwords
- Make failure in login and signup sexy
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
- Add soundcloud support
- update field names for forms (fugly)
- improve shader performance
- Fix only 1 link bug
- Don't render in background
- Check for authentication expiry
- Hide login/signup for auth'd users
- Handle 404s on the backend with something on the frontend

