// Password Recovery functionality for BeatSearch

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const recoveryForm = document.getElementById('recovery-form');
    const resetForm = document.getElementById('reset-form');
    const resendLink = document.getElementById('resend-link');
    const passwordToggles = document.querySelectorAll('.password-toggle');
    const notification = document.getElementById('notification');
    const notificationMessage = document.getElementById('notification-message');
    const newPasswordInput = document.getElementById('new-password');
    const strengthBar = document.querySelector('.strength-bar');
    const strengthValue = document.getElementById('strength-value');
    const recoveryEmailInput = document.getElementById('recovery-email');
    
    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const email = urlParams.get('email');
    
    // Pre-fill email if provided
    if (email && recoveryEmailInput) {
        recoveryEmailInput.value = email;
    }
    
    // If token exists, show step 3 (reset password form)
    if (token) {
        showStep(3);
    } else {
        showStep(1);
    }
    
    // Initialize animations
    initAnimations();
    
    // Initialize 3D logo
    init3DLogo();
    
    // Setup event listeners
    if (recoveryForm) {
        recoveryForm.addEventListener('submit', handleRecoverySubmit);
    }
    
    if (resetForm) {
        resetForm.addEventListener('submit', handleResetSubmit);
    }
    
    if (resendLink) {
        resendLink.addEventListener('click', handleResendLink);
    }
    
    // Initialize password toggles
    passwordToggles.forEach(toggle => {
        toggle.addEventListener('click', togglePasswordVisibility);
    });
    
    // Password strength meter
    if (newPasswordInput) {
        newPasswordInput.addEventListener('input', updatePasswordStrength);
    }
});

// Initialize 3D logo
function init3DLogo() {
    // Check if canvas exists
    const canvas = document.getElementById('logo-canvas');
    if (!canvas) return;
    
    // Three.js variables
    let scene, camera, renderer, logoObject;
    
    // Initialize Three.js scene
    function initThree() {
        // Create scene
        scene = new THREE.Scene();
        
        // Create camera
        camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
        camera.position.z = 5;
        
        // Create renderer
        renderer = new THREE.WebGLRenderer({ 
            canvas: canvas,
            antialias: true,
            alpha: true
        });
        renderer.setSize(canvas.clientWidth, canvas.clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        
        // Add lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);
        
        const pointLight = new THREE.PointLight(0x4285f4, 1, 100);
        pointLight.position.set(5, 5, 5);
        scene.add(pointLight);
        
        // Create logo
        createLogo();
        
        // Start animation
        animate();
    }
    
    // Create the torus knot logo
    function createLogo() {
        const geometry = new THREE.TorusKnotGeometry(1.2, 0.4, 100, 16);
        const material = new THREE.MeshStandardMaterial({
            color: 0x4285f4,
            metalness: 0.7,
            roughness: 0.2,
            emissive: 0x4285f4,
            emissiveIntensity: 0.2
        });
        
        logoObject = new THREE.Mesh(geometry, material);
        logoObject.castShadow = true;
        scene.add(logoObject);
        
        // Add a point light at the center of the logo
        const logoLight = new THREE.PointLight(0x4285f4, 2, 10);
        logoLight.position.set(0, 0, 0);
        scene.add(logoLight);
    }
    
    // Animation loop
    function animate() {
        requestAnimationFrame(animate);
        
        // Rotate logo
        if (logoObject) {
            logoObject.rotation.x += 0.01;
            logoObject.rotation.y += 0.02;
        }
        
        // Render scene
        renderer.render(scene, camera);
    }
    
    // Handle window resize
    function handleResize() {
        const container = canvas.parentElement;
        const width = container.clientWidth;
        const height = container.clientHeight;
        
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
    }
    
    window.addEventListener('resize', handleResize);
    
    // Initialize Three.js
    initThree();
}

// Initialize animations
function initAnimations() {
    // Animate auth card
    gsap.from('.auth-card', {
        duration: 1,
        y: 30,
        opacity: 0,
        ease: 'power3.out'
    });
    
    // Animate form elements
    gsap.from('.form-group, .recovery-info', {
        duration: 0.6,
        y: 20,
        opacity: 0,
        stagger: 0.1,
        delay: 0.5,
        ease: 'power2.out'
    });
    
    // Animate buttons
    gsap.from('.auth-button', {
        duration: 0.6,
        scale: 0.9,
        opacity: 0,
        delay: 0.8,
        ease: 'back.out(1.7)'
    });
}

// Setup password toggle
function setupPasswordToggle() {
    const toggles = document.querySelectorAll('.password-toggle');
    
    toggles.forEach(toggle => {
        toggle.addEventListener('click', () => {
            const input = toggle.previousElementSibling;
            
            if (input.type === 'password') {
                input.type = 'text';
                toggle.querySelector('.toggle-icon').textContent = '👁️‍🗨️';
            } else {
                input.type = 'password';
                toggle.querySelector('.toggle-icon').textContent = '👁️';
            }
        });
    });
}

// Setup form submission
function setupFormSubmission() {
    const recoveryForm = document.getElementById('recovery-form');
    const resetForm = document.getElementById('reset-form');
    const resendLink = document.getElementById('resend-link');
    
    // Recovery form
    if (recoveryForm) {
        recoveryForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const email = document.getElementById('recovery-email').value;
            
            if (!email) {
                showNotification('Please enter your email address', 'error');
                return;
            }
            
            // Simulate sending recovery email
            showNotification('Sending recovery email...', 'info');
            
            setTimeout(() => {
                // Show step 2
                document.getElementById('step-1').classList.remove('active');
                document.getElementById('step-2').classList.add('active');
            }, 1500);
        });
    }
    
    // Reset form
    if (resetForm) {
        resetForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const newPassword = document.getElementById('new-password').value;
            const confirmNewPassword = document.getElementById('confirm-new-password').value;
            
            if (!newPassword || !confirmNewPassword) {
                showNotification('Please fill in all fields', 'error');
                return;
            }
            
            if (newPassword !== confirmNewPassword) {
                showNotification('Passwords do not match', 'error');
                return;
            }
            
            // Simulate password reset
            showNotification('Resetting password...', 'info');
            
            setTimeout(() => {
                showNotification('Password reset successfully!', 'success');
                
                // Redirect to sign in page after notification
                setTimeout(() => {
                    window.location.href = 'signIn.html';
                }, 1500);
            }, 1500);
        });
    }
    
    // Resend link
    if (resendLink) {
        resendLink.addEventListener('click', () => {
            showNotification('Recovery email resent!', 'info');
        });
    }
}

// Update password strength meter
function updatePasswordStrength() {
    const password = document.getElementById('new-password').value;
    const strengthBar = document.querySelector('.strength-bar');
    const strengthValue = document.getElementById('strength-value');
    
    if (!strengthBar || !strengthValue) return;
    
    // Calculate password strength
    let strength = 0;
    
    // Length check
    if (password.length >= 8) strength += 25;
    
    // Contains lowercase
    if (/[a-z]/.test(password)) strength += 25;
    
    // Contains uppercase
    if (/[A-Z]/.test(password)) strength += 25;
    
    // Contains number or special char
    if (/[0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) strength += 25;
    
    // Update UI
    strengthBar.style.width = strength + '%';
    
    // Remove all classes
    strengthBar.classList.remove('weak', 'medium', 'strong', 'very-strong');
    strengthValue.classList.remove('weak', 'medium', 'strong', 'very-strong');
    
    // Add appropriate class
    if (strength <= 25) {
        strengthBar.classList.add('weak');
        strengthValue.classList.add('weak');
        strengthValue.textContent = 'Weak';
    } else if (strength <= 50) {
        strengthBar.classList.add('medium');
        strengthValue.classList.add('medium');
        strengthValue.textContent = 'Medium';
    } else if (strength <= 75) {
        strengthBar.classList.add('strong');
        strengthValue.classList.add('strong');
        strengthValue.textContent = 'Strong';
    } else {
        strengthBar.classList.add('very-strong');
        strengthValue.classList.add('very-strong');
        strengthValue.textContent = 'Very Strong';
    }
}

// Show specific step in the recovery process
function showStep(stepNumber) {
    // Hide all steps
    document.querySelectorAll('.recovery-step').forEach(step => {
        step.classList.remove('active');
    });
    
    // Show requested step
    document.getElementById(`step-${stepNumber}`).classList.add('active');
    
    // Animate the newly visible step
    gsap.from(`#step-${stepNumber} > *`, {
        duration: 0.5,
        y: 20,
        opacity: 0,
        stagger: 0.1,
        ease: 'power2.out'
    });
}

// Handle recovery form submission
function handleRecoverySubmit(e) {
    e.preventDefault();
    
    const email = document.getElementById('recovery-email').value;
    
    // Validate email
    if (!email) {
        showNotification('Please enter your email address', 'error');
        return;
    }
    
    // Simulate API call
    simulateApiCall({ email }, 'recovery')
        .then(response => {
            // Show success notification
            showNotification('Recovery email sent successfully!', 'success');
            
            // Move to step 2
            showStep(2);
        })
        .catch(error => {
            showNotification(error.message, 'error');
        });
}

// Handle reset form submission
function handleResetSubmit(e) {
    e.preventDefault();
    
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-new-password').value;
    
    // Validate inputs
    if (!newPassword || !confirmPassword) {
        showNotification('Please fill in all fields', 'error');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        showNotification('Passwords do not match', 'error');
        return;
    }
    
    // Check password strength
    const strength = calculatePasswordStrength(newPassword);
    if (strength === 'weak') {
        showNotification('Please choose a stronger password', 'error');
        return;
    }
    
    // Get token from URL
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    
    // Simulate API call
    simulateApiCall({
        token,
        newPassword
    }, 'reset')
        .then(response => {
            // Show success notification
            showNotification('Password reset successful! Redirecting to login...', 'success');
            
            // Redirect to sign in page after delay
            setTimeout(() => {
                window.location.href = 'signIn.html';
            }, 2000);
        })
        .catch(error => {
            showNotification(error.message, 'error');
        });
}

// Handle resend link click
function handleResendLink() {
    const email = document.getElementById('recovery-email').value;
    
    if (!email) {
        showNotification('Email address is missing', 'error');
        return;
    }
    
    showNotification('Recovery email resent!', 'success');
}

// Toggle password visibility
function togglePasswordVisibility(e) {
    const passwordField = e.currentTarget.parentElement.querySelector('input');
    const type = passwordField.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordField.setAttribute('type', type);
    
    // Change the icon
    e.currentTarget.querySelector('.toggle-icon').textContent = type === 'password' ? '👁️' : '🔒';
}

// Calculate password strength
function calculatePasswordStrength(password) {
    if (!password) return '';
    
    // Calculate score based on various criteria
    let score = 0;
    
    // Length check
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    
    // Complexity checks
    if (/[A-Z]/.test(password)) score += 1; // Has uppercase
    if (/[a-z]/.test(password)) score += 1; // Has lowercase
    if (/[0-9]/.test(password)) score += 1; // Has number
    if (/[^A-Za-z0-9]/.test(password)) score += 1; // Has special char
    
    // Determine strength based on score
    if (score < 3) return 'weak';
    if (score < 5) return 'medium';
    if (score < 7) return 'strong';
    return 'very-strong';
}

// Show notification
function showNotification(message, type = 'info') {
    notificationMessage.textContent = message;
    notification.className = 'notification';
    notification.classList.add(type);
    notification.classList.add('visible');
    
    // Hide notification after 5 seconds
    setTimeout(() => {
        notification.classList.remove('visible');
    }, 5000);
}

// Simulate API call (for demo purposes)
function simulateApiCall(data, type) {
    return new Promise((resolve, reject) => {
        // Simulate network delay
        setTimeout(() => {
            if (type === 'recovery') {
                // In a real app, you would send a recovery email
                console.log('Recovery email would be sent to:', data.email);
                resolve({ success: true });
            } else if (type === 'reset') {
                // In a real app, you would validate the token and update the password
                if (data.token === 'invalid') {
                    reject({ message: 'Invalid or expired token' });
                } else {
                    console.log('Password would be reset for token:', data.token);
                    resolve({ success: true });
                }
            }
        }, 1500);
    });
} 