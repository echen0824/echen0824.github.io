// Auth state variables
let currentUser = null;
let isAdmin = false;

// Admin emails - store these in a more secure way in a production environment
const ADMIN_EMAILS = [
    'yichi824@gmail.com',
    // Add more admin emails as needed
];

// Handle Google Sign-In credential response
function handleCredentialResponse(response) {
    // Decode the JWT token to get user information
    const responsePayload = parseJwt(response.credential);
    
    // Extract user info
    const userData = {
        email: responsePayload.email,
        name: responsePayload.name,
        picture: responsePayload.picture,
        // Store the token for session management
        token: response.credential,
        // Generate a unique session ID
        sessionId: generateSessionId()
    };
    
    // Check if user is an admin
    userData.isAdmin = ADMIN_EMAILS.includes(userData.email);
    
    // Store user in localStorage
    localStorage.setItem('currentUser', JSON.stringify(userData));
    
    // Check for existing session in localStorage
    checkForExistingSession(userData);
    
    // Set session in sessionStorage
    sessionStorage.setItem('sessionId', userData.sessionId);
    
    // Update UI
    updateUIforLoggedInUser(userData);
    
    // Save user data
    saveUserData(userData);
    
    console.log("User signed in:", userData.name);
}

// Parse JWT token
function parseJwt(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        return JSON.parse(jsonPayload);
    } catch (e) {
        console.error("Error parsing JWT:", e);
        return {};
    }
}

// Generate a unique session ID
function generateSessionId() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Check for existing session in localStorage
function checkForExistingSession(userData) {
    // This simulates the single active session feature
    // In a production app, you would use a server-side solution
    const allUsers = JSON.parse(localStorage.getItem('allUsers') || '{}');
    
    if (allUsers[userData.email] && 
        allUsers[userData.email].sessionId !== userData.sessionId) {
        // Different session ID means user logged in from another device/browser
        console.log("New session detected for user");
    }
    
    // Update the user's session ID
    if (!allUsers[userData.email]) {
        allUsers[userData.email] = {};
    }
    
    allUsers[userData.email].sessionId = userData.sessionId;
    allUsers[userData.email].lastLogin = new Date().toISOString();
    
    localStorage.setItem('allUsers', JSON.stringify(allUsers));
}

// Save user data to localStorage
function saveUserData(userData) {
    // Store all users
    const allUsers = JSON.parse(localStorage.getItem('allUsers') || '{}');
    
    if (!allUsers[userData.email]) {
        allUsers[userData.email] = {};
    }
    
    // Update user data
    allUsers[userData.email] = {
        ...allUsers[userData.email],
        name: userData.name,
        email: userData.email,
        picture: userData.picture,
        isAdmin: userData.isAdmin,
        sessionId: userData.sessionId,
        lastLogin: new Date().toISOString()
    };
    
    // Save back to localStorage
    localStorage.setItem('allUsers', JSON.stringify(allUsers));
}

// Update UI for logged in user
function updateUIforLoggedInUser(userData) {
    // Show user info, hide login button
    document.getElementById('user-info').style.display = 'block';
    document.getElementById('login-section').style.display = 'none';
    document.getElementById('user-name').textContent = userData.name;
    
    if (document.getElementById('user-email')) {
        document.getElementById('user-email').textContent = userData.email;
    }
    
    // Always show dashboard link when logged in
    document.getElementById('dashboard-link').style.display = 'block';
    
    // Show admin link if user is admin
    if (userData.isAdmin) {
        document.getElementById('admin-link').style.display = 'block';
    } else {
        document.getElementById('admin-link').style.display = 'none';
    }
    
    // If on admin page and not admin
    if (document.getElementById('admin-content') && !userData.isAdmin) {
        document.getElementById('admin-content').style.display = 'none';
        document.getElementById('admin-error').style.display = 'block';
    }
    
    // If on admin page and is admin
    if (document.getElementById('admin-content') && userData.isAdmin) {
        document.getElementById('admin-content').style.display = 'block';
        document.getElementById('admin-error').style.display = 'none';
    }
    
    // If on a protected page, hide auth required message
    if (document.getElementById('auth-required-message')) {
        document.getElementById('auth-required-message').style.display = 'none';
    }
    
    // If on courses page
    if (document.getElementById('courses-grid')) {
        document.getElementById('courses-grid').style.display = 'grid';
        document.getElementById('auth-required-message').style.display = 'none';
    }
    
    // If on dashboard page
    if (document.getElementById('dashboard-content')) {
        document.getElementById('dashboard-content').style.display = 'block';
        document.getElementById('auth-required-message').style.display = 'none';
    }
}

// Update UI for logged out user
function updateUIforLoggedOutUser() {
    // Show login button, hide user info
    document.getElementById('user-info').style.display = 'none';
    document.getElementById('login-section').style.display = 'block';
    
    // Hide dashboard and admin links
    document.getElementById('dashboard-link').style.display = 'none';
    document.getElementById('admin-link').style.display = 'none';
    
    // If on a protected page, show auth required message
    if (document.getElementById('auth-required-message')) {
        document.getElementById('auth-required-message').style.display = 'block';
    }
    
    // If on courses page
    if (document.getElementById('courses-grid')) {
        document.getElementById('courses-grid').style.display = 'none';
        document.getElementById('auth-required-message').style.display = 'block';
    }
    
    // If on admin page
    if (document.getElementById('admin-content')) {
        document.getElementById('admin-content').style.display = 'none';
        document.getElementById('admin-error').style.display = 'block';
    }
    
    // If on dashboard page
    if (document.getElementById('dashboard-content')) {
        document.getElementById('dashboard-content').style.display = 'none';
        document.getElementById('auth-required-message').style.display = 'block';
    }
}

// Check if user is logged in
function checkLoginStatus() {
    const currentUserData = JSON.parse(localStorage.getItem('currentUser'));
    const currentSessionId = sessionStorage.getItem('sessionId');
    
    if (currentUserData && currentSessionId) {
        // Check if this is the current active session
        const allUsers = JSON.parse(localStorage.getItem('allUsers') || '{}');
        
        if (allUsers[currentUserData.email] && 
            allUsers[currentUserData.email].sessionId === currentSessionId) {
            // Valid session, update UI
            currentUser = currentUserData;
            isAdmin = currentUserData.isAdmin;
            updateUIforLoggedInUser(currentUserData);
            return true;
        } else {
            // Session is invalid or changed
            console.log("Session is invalid or user logged in elsewhere");
            logout();
            return false;
        }
    } else {
        // Not logged in
        updateUIforLoggedOutUser();
        return false;
    }
}

// Logout function
function logout() {
    // Clear user data
    localStorage.removeItem('currentUser');
    sessionStorage.removeItem('sessionId');
    
    // Update UI
    currentUser = null;
    isAdmin = false;
    updateUIforLoggedOutUser();
    
    console.log("User signed out");
}

// Check if user has access to a specific course/video
function hasAccessToVideo(videoId) {
    if (!currentUser) return false;
    
    // Get video access list
    const videoAccess = JSON.parse(localStorage.getItem('videoAccess') || '{}');
    
    // If admin, always has access
    if (currentUser.isAdmin) return true;
    
    // Check if video exists and user email is in the access list
    if (videoAccess[videoId] && 
        videoAccess[videoId].includes(currentUser.email)) {
        return true;
    }
    
    return false;
}

// Add event listener to logout button
document.getElementById('logout-btn').addEventListener('click', logout);

// Check login status when the page loads
document.addEventListener('DOMContentLoaded', checkLoginStatus);