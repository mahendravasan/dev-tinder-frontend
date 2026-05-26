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
- CORS - Installed cors in backedn => add middleware to app with configurations: origin : "http://localhost:5173" & credentials : true
- Wheneever you're making a login API call so pass axios => { withCredentials : true }
- Installed @reduxjs/toolkit and react-redux for state management
- Created a store (configureStore) => add Provider to app
- Created a userSlice and export actions(addUser, removeUser) and reducer
- imported userReducer to store(appStore.js)
