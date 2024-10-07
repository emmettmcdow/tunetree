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
  X Make sure I'm avoiding sql-injection (GO parameterization does this by default)
  X validate email
  X Move spotify to backend
  X Validate passwords actually
  X Validate user/artist is not null on frontend and backend
  X Validate email and passwords on backend
  X Automatically refresh spotify token
  X hook up logging
  - Fix only 1 link bug
  - Validate links
- add sticker buy prompt
- Add banned passsword list
- Make sure I'm avoiding all the cors shit
- make rules for passwords
- Make failure in login and signup sexy
- micro adjust desktop
- dark mode?
- Put my logo guy in there?
- Specify if new artist signup failed due to duplicate user
  - Display special text saying if you think this is a mistake, contact XYZ
- Hook up email backend
  - Make newsletter table in DB
  - Hook up mailgun
  - Hook up support email that redirects to emmett.mcdow@gmail.com
  - Hook up form for support
- Hook up Spotify API
  - Make it more robust, if ambiguous, present to user and have them select
  - Return multiple values
  - Display selected artist
  X Add artist id to user table
  X Pull in album art from Spotify
- hook up analytics
- Figure out how the fuck to deploy to prod?
- Rotate icons slightly. Pointy side up.
- Add soundcloud support
- update field names for forms (fugly)
- improve shader performance
- Don't render in background
- Check for authentication expiry
- Hide login/signup for auth'd users
- Handle 404s on the backend with something on the frontend
- Rate limit backend requests to external services
- Get color palette from album art
  - https://dev.to/producthackers/creating-a-color-palette-with-javascript-44ip
