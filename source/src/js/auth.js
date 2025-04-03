// Authentication functionality for BeatSearch

document.addEventListener('DOMContentLoaded', () => {
    // Initialize animations
    initAnimations();
    
    // Initialize 3D logo
    init3DLogo();
    
    // Setup password toggle
    setupPasswordToggle();
    
    // Setup form submission
    setupFormSubmission();
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
    gsap.from('.form-group', {
        duration: 0.6,
        y: 20,
        opacity: 0,
        stagger: 0.1,
        delay: 0.5,
        ease: 'power2.out'
    });
    
    // Animate buttons
    gsap.from('.auth-button, .social-button', {
        duration: 0.6,
        scale: 0.9,
        opacity: 0,
        stagger: 0.1,
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
    const signinForm = document.getElementById('signin-form');
    const signupForm = document.getElementById('signup-form');
    const recoveryForm = document.getElementById('recovery-form');
    const resetForm = document.getElementById('reset-form');
    
    // Sign In form
    if (signinForm) {
        signinForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const remember = document.getElementById('remember')?.checked;
            
            // Simulate authentication
            setTimeout(() => {
                // For demo purposes, any login works
                const token = 'demo-auth-token-' + Date.now();
                
                if (remember) {
                    localStorage.setItem('authToken', token);
                } else {
                    sessionStorage.setItem('authToken', token);
                }
                
                showNotification('Successfully signed in!', 'success');
                
                // Redirect to main page after notification
                setTimeout(() => {
                    window.location.href = 'mainpage.html';
                }, 1500);
            }, 1000);
        });
    }
    
    // Sign Up form
    if (signupForm) {
        signupForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const fullname = document.getElementById('fullname').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            const terms = document.getElementById('terms')?.checked;
            
            // Validate passwords match
            if (password !== confirmPassword) {
                showNotification('Passwords do not match!', 'error');
                return;
            }
            
            // Validate terms agreement
            if (!terms) {
                showNotification('Please agree to the Terms of Service and Privacy Policy', 'error');
                return;
            }
            
            // Simulate account creation
            setTimeout(() => {
                showNotification('Account created successfully!', 'success');
                
                // Redirect to sign in page after notification
                setTimeout(() => {
                    window.location.href = 'signIn.html';
                }, 1500);
            }, 1000);
        });
    }
    
    // Password Recovery form
    if (recoveryForm) {
        recoveryForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const email = document.getElementById('recovery-email').value;
            
            // Simulate sending recovery email
            setTimeout(() => {
                // Show step 2
                document.getElementById('step-1').classList.remove('active');
                document.getElementById('step-2').classList.add('active');
            }, 1000);
        });
    }
    
    // Password Reset form
    if (resetForm) {
        // Password strength meter
        const newPasswordInput = document.getElementById('new-password');
        if (newPasswordInput) {
            newPasswordInput.addEventListener('input', updatePasswordStrength);
        }
        
        resetForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const newPassword = document.getElementById('new-password').value;
            const confirmNewPassword = document.getElementById('confirm-new-password').value;
            
            // Validate passwords match
            if (newPassword !== confirmNewPassword) {
                showNotification('Passwords do not match!', 'error');
                return;
            }
            
            // Simulate password reset
            setTimeout(() => {
                showNotification('Password reset successfully!', 'success');
                
                // Redirect to sign in page after notification
                setTimeout(() => {
                    window.location.href = 'signIn.html';
                }, 1500);
            }, 1000);
        });
    }
    
    // Resend link button
    const resendLink = document.getElementById('resend-link');
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

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    const notificationMessage = document.getElementById('notification-message');
    
    if (!notification || !notificationMessage) return;
    
    notificationMessage.textContent = message;
    notification.className = 'notification';
    notification.classList.add(type);
    notification.classList.add('visible');
    
    // Hide notification after 5 seconds
    setTimeout(() => {
        notification.classList.remove('visible');
    }, 5000);
}

// Check if user is authenticated
function isAuthenticated() {
    return localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
}

// Logout function
function logout() {
    localStorage.removeItem('authToken');
    sessionStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    
    // Redirect to sign in page
    window.location.href = 'signIn.html';
} 