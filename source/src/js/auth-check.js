// Authentication check and management for BeatSearch

document.addEventListener('DOMContentLoaded', () => {
    // Check if user is authenticated
    const isAuthenticated = checkAuthentication();
    
    // Update UI based on authentication status
    updateAuthUI(isAuthenticated);
    
    // Setup event listeners
    setupAuthEventListeners();
});

// Check if user is authenticated
function checkAuthentication() {
    return localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
}

// Update UI based on authentication status
function updateAuthUI(isAuthenticated) {
    const loginButton = document.getElementById('login-button');
    const logoutButton = document.getElementById('logout-button');
    
    if (isAuthenticated) {
        // User is logged in
        if (loginButton) loginButton.style.display = 'none';
        if (logoutButton) logoutButton.style.display = 'block';
        
        // Get user data
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        
        // Update UI with user info if needed
        if (userData.name) {
            // You could display the user's name somewhere in the UI
            console.log(`Logged in as: ${userData.name}`);
        }
    } else {
        // User is not logged in
        if (loginButton) loginButton.style.display = 'block';
        if (logoutButton) logoutButton.style.display = 'none';
    }
}

// Setup authentication-related event listeners
function setupAuthEventListeners() {
    // Login button
    const loginButton = document.getElementById('login-button');
    if (loginButton) {
        loginButton.addEventListener('click', () => {
            window.location.href = 'signIn.html';
        });
    }
    
    // Logout button
    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', handleLogout);
    }
    
    // Forgot password link
    const forgotPasswordLink = document.getElementById('forgot-password-link');
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = 'password.html';
        });
    }
    
    // Login modal close button
    const closeModalButton = document.querySelector('.close-modal');
    if (closeModalButton) {
        closeModalButton.addEventListener('click', () => {
            document.getElementById('login-modal').classList.remove('visible');
        });
    }
    
    // Login form in modal
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLoginForm);
    }
}

// Handle login form submission
function handleLoginForm(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    // Validate inputs
    if (!username || !password) {
        showNotification('Please fill in all fields', 'error');
        return;
    }
    
    // Simulate login
    setTimeout(() => {
        // Store mock auth data
        const mockToken = 'auth-token-' + Date.now();
        localStorage.setItem('authToken', mockToken);
        
        const mockUser = {
            id: 'user123',
            name: username,
            email: `${username}@example.com`,
            avatar: null
        };
        localStorage.setItem('userData', JSON.stringify(mockUser));
        
        // Show success notification
        showNotification('Login successful!', 'success');
        
        // Close modal
        document.getElementById('login-modal').classList.remove('visible');
        
        // Update UI
        updateAuthUI(true);
    }, 1000);
}

// Handle logout
function handleLogout() {
    // Clear auth data
    localStorage.removeItem('authToken');
    sessionStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    
    // Show notification
    showNotification('You have been logged out', 'info');
    
    // Update UI
    updateAuthUI(false);
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    const notificationMessage = document.getElementById('notification-message');
    
    if (notification && notificationMessage) {
        notificationMessage.textContent = message;
        notification.className = 'notification';
        notification.classList.add(type);
        notification.classList.add('visible');
        
        // Hide notification after 5 seconds
        setTimeout(() => {
            notification.classList.remove('visible');
        }, 5000);
    }
} 