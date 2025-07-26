// Application state
let currentUser = null;
let currentView = 'homepage';

// Component loader function
async function loadComponent(componentPath) {
    try {
        const response = await fetch(componentPath);
        if (!response.ok) {
            throw new Error(`Failed to load component: ${componentPath}`);
        }
        return await response.text();
    } catch (error) {
        console.error('Error loading component:', error);
        return '<div>Error loading component</div>';
    }
}

// Function to load and display the homepage
async function loadHomepage() {
    const mainContent = document.getElementById('main-content');
    
    try {
        // Load all homepage components
        const navigation = await loadComponent('components/homepage/navigation.html');
        const hero = await loadComponent('components/homepage/hero.html');
        const features = await loadComponent('components/homepage/features.html');
        const loginModal = await loadComponent('components/shared/login-modal.html');
        
        // Assemble the homepage
        mainContent.innerHTML = navigation + hero + features + loginModal;
        
        // Re-attach event listeners after loading components
        attachHomepageEventListeners();
        
    } catch (error) {
        console.error('Error loading homepage:', error);
        mainContent.innerHTML = '<div style="text-align: center; padding: 50px;">Error loading application</div>';
    }
}

// Function to load and display the CRM dashboard
async function loadCRMDashboard() {
    const mainContent = document.getElementById('main-content');
    
    try {
        // Load CRM components
        const crmHeader = await loadComponent('components/crm/dashboard-header.html');
        const crmNav = await loadComponent('components/crm/dashboard-navigation.html');
        const dashboard = await loadComponent('components/crm/dashboard-overview.html');
        
        // Assemble the CRM dashboard
        mainContent.innerHTML = `
            <div class="crm-container" style="display: block; min-height: 100vh; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px;">
                <div class="crm-wrapper" style="max-width: 1400px; margin: 0 auto; background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(10px); border-radius: 20px; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1); overflow: hidden;">
                    ${crmHeader}
                    ${crmNav}
                    <div class="main-content">
                        ${dashboard}
                    </div>
                </div>
            </div>
        `;
        
        // Update current user display
        const currentUserElement = document.getElementById('current-user');
        if (currentUserElement && currentUser) {
            currentUserElement.textContent = currentUser.username;
        }
        
        // Re-attach event listeners for CRM
        attachCRMEventListeners();
        
    } catch (error) {
        console.error('Error loading CRM dashboard:', error);
        mainContent.innerHTML = '<div style="text-align: center; padding: 50px;">Error loading CRM dashboard</div>';
    }
}

// Event listeners for homepage
function attachHomepageEventListeners() {
    // Login modal functionality
    window.openLoginModal = function() {
        const modal = document.getElementById('loginModal');
        if (modal) {
            modal.style.display = 'block';
        }
    };
    
    window.closeLoginModal = function() {
        const modal = document.getElementById('loginModal');
        if (modal) {
            modal.style.display = 'none';
        }
    };
    
    // Close modal when clicking outside
    window.onclick = function(event) {
        const modal = document.getElementById('loginModal');
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    };
    
    // Login form submission
    window.handleLogin = function(event) {
        event.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        // Simple authentication (replace with your actual logic)
        if (username === 'admin' && password === 'admin') {
            currentUser = { username: username };
            currentView = 'crm';
            closeLoginModal();
            loadCRMDashboard();
        } else {
            alert('Invalid credentials. Please use admin/admin for demo.');
        }
    };
}

// Event listeners for CRM
function attachCRMEventListeners() {
    // Logout functionality
    window.logout = function() {
        currentUser = null;
        currentView = 'homepage';
        loadHomepage();
    };
    
    // CRM navigation
    window.showCRMSection = function(sectionName) {
        // Hide all sections
        const sections = document.querySelectorAll('.crm-section');
        sections.forEach(section => section.classList.remove('active'));
        
        // Show selected section
        const targetSection = document.getElementById(sectionName);
        if (targetSection) {
            targetSection.classList.add('active');
        } else {
            // If section doesn't exist, show a placeholder
            const mainContent = document.querySelector('.main-content');
            if (mainContent) {
                const placeholder = `
                    <div id="${sectionName}" class="crm-section active">
                        <div class="section-header-crm">
                            <h2>${sectionName.charAt(0).toUpperCase() + sectionName.slice(1)}</h2>
                        </div>
                        <div style="text-align: center; padding: 60px 20px; color: #666;">
                            <h3>Coming Soon</h3>
                            <p>The ${sectionName} section is under development.</p>
                        </div>
                    </div>
                `;
                mainContent.innerHTML = placeholder;
            }
        }
        
        // Update navigation active state
        const navItems = document.querySelectorAll('.crm-nav-item');
        navItems.forEach(item => item.classList.remove('active'));
        
        const activeNavItem = document.querySelector(`[onclick="showCRMSection('${sectionName}')"]`);
        if (activeNavItem) {
            activeNavItem.classList.add('active');
        }
    };
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Remove loading indicator
    const loadingElement = document.getElementById('loading');
    if (loadingElement) {
        loadingElement.remove();
    }
    
    // Load initial view
    if (currentView === 'homepage') {
        loadHomepage();
    } else if (currentView === 'crm') {
        loadCRMDashboard();
    }
});

// Handle browser back/forward buttons
window.addEventListener('popstate', function(event) {
    if (currentView === 'homepage') {
        loadHomepage();
    } else if (currentView === 'crm') {
        loadCRMDashboard();
    }
});

