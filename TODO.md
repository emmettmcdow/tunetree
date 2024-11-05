# TODO
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
X 10/06/2024
  X Make sure I'm avoiding sql-injection (GO parameterization does this by default)
  X validate email
  X Move spotify to backend
  X Validate passwords actually
  X Validate user/artist is not null on frontend and backend
  X Validate email and passwords on backend
  X Automatically refresh spotify token
  X hook up logging
  X Fix only 1 link bug
  X Fix form submit bug
X 10/12/2024
  X Dynamic config of backend host in frontend
  X Same for backend
  X Change app name and icon
  X Don't display link name, display artist name
  X Put my logo guy in there?
X 10/13/2024
  X Remove console logs
  X Fix webgl error - Seems like this goes away when we don't log?
  X Backend as volume
  X hook up analytics
  X Make buttons "selectable"
  X update field names for forms (fugly)
  X Add title/logo to each page
  X Make selection text bouncy on selection
  X Standard buttons
- 10/14/2024
  X Handle errors on the backend with something on the frontend
  X Handle creation of existing user or artist
  X Fix undefined track post
X Remove track from FE path
X Add validation for acceptable artist links
X Automatically change up if unacceptable artist name
X Add images for each platform
X Render trackinfo dynamically
X Store images as filepaths
X Pull in trackinfo from backend
X Add frontend code for getting current user from jwt
X Figure out how the fuck to deploy to prod?
X make rules for passwords
- Add `your url will be`
  X Add button to change the url
  - Un-fuglify it 
  - Add validation for custom
  X Add field in user designating the encoded url
  X Add backend ^
- Hook up Spotify API
  - Better error handling for Spotify
  - Make it more robust, if ambiguous, present to user and have them select
  - Return multiple values
  - Display selected artist
  X Add artist id to user table
  X Pull in album art from Spotify
- Get color palette from album art
  X Backend storage
  X Backend calculation
  - Speed up compute
  - Render on track page
  - Render on artist page
  - Render on GLSL
- NO-track = off center in track edit page
- Validate links
- add sticker buy prompt
- Add banned passsword list
- Make sure I'm avoiding all the cors shit
- Make failure in login and signup sexy
- micro adjust desktop
- dark mode?
- Specify if new artist signup failed due to duplicate user
  - Display special text saying if you think this is a mistake, contact XYZ
- Hook up email backend
  - Make newsletter table in DB
  - Hook up mailgun
  - Hook up support email that redirects to emmett.mcdow@gmail.com
  - Hook up form for support
- Rotate icons slightly. Pointy side up.
- Add soundcloud support
- improve shader performance
- Make logo on home rainbow
- Check for authentication expiry
- Hide login/signup for auth'd users
- Rate limit backend requests to external services
- Give message when user gets kicked to login for being un-authenticated.
- Send message and log when *we* fuck something up.
- Autofill messing up font?
X Do things the next way(server side props etc)
X Unfuglify login
X Unfuglify signup
- Add forgot password workflow
- remove unnessessary deps
X Fix FE deployment lol
- About page
- Fix silly looking track page w/links
- Fix dynamic links on artist page spilling into footer on mobile
X Fix all the stuff next messed up...
- Fix continuous polling of spotify on forms
