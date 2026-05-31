# DevTinder

S2E15:

- Create a Vite + React application project setup
- Remove unneccessary files
- Installed tailwind css
- Installed daisyUI Tailwind css component library
- Created separate NavBar component and imported to Body.jsx
- Installed react-router-dom for routing
- Created BrowserRouter > Routes > Route=/ Body > RouteChildren
- Created an Outlet in your Body.jsx to render the RouteChildren like login and profile
- Created separate Footer component and imported to Body.jsx

S2E16:

- Login page UI integration with daisyUI components
- Installed axios for API integration
- Created handleLogin function to make login API call
- CORS - Installed cors in backend => add middleware to app with configurations: origin : "http://localhost:5173" & credentials : true
- Wheneever you're making a login API call so pass axios => { withCredentials : true }
- Installed @reduxjs/toolkit and react-redux for state management
- Created a store (configureStore) => add Provider to app
- Created a userSlice and export actions(addUser, removeUser) and reducer
- imported userReducer to store(appStore.js)
- Created Feed component
- Dispatch addUser action and add user data to use slice and Redirect to feed component after login
- Updated the user name and profile pic in NavBar component using useSelector(user data from userSlice) after login
- Refactor the code with constant file (BASE_URL) instead of using hard code API URL in components

S2E17:

- You should not be able access other routes without login
- If token is not present, redirect user to login page
- Logout feature => API call => Whenever the user click on logout, make an API call to backend, clear token from backend cookies and remove user from userSlice using dispatch(removeUser()) and redirect user to login page
- Added login form validations and show error message to user if any validation fails
- Feed => add API call => Whenever the user on feed page, make an API call to backend and show the feed & store feed in feedSlice
- Build the user card component and render on feed page
- Implement EditProfile component with real-time preview and form validation in profile page

S2E18:

- Connection page - Implement connections API to show all my connections with redux state management
- Request page - Implement requests API to show all my received requests with redux state management
- Accept/Reject connection request functionality => make POST /request/review API call with status and request_id as params in url

S2E19:

- Insterested/Ignores user card functionality from the feed page => make POST /request/send/:status/:id API call with status and user id as params in url
- Implement user sign up functionality
