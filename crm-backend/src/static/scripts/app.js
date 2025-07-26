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
        
        // Load users from backend
        loadUsersFromBackend();
        
    } catch (error) {
        console.error('Error loading CRM dashboard:', error);
        mainContent.innerHTML = '<div style="text-align: center; padding: 50px;">Error loading CRM dashboard</div>';
    }
}

// Function to load users from backend and update dashboard
async function loadUsersFromBackend() {
    try {
        const response = await fetch('/api/users');
        if (response.ok) {
            const users = await response.json();
            // Update the stats card with actual user count
            const activeUsersCard = document.querySelector('.stat-card:nth-child(2) .stat-number');
            if (activeUsersCard) {
                const activeUsers = users.filter(user => user.status === 'active').length;
                activeUsersCard.textContent = activeUsers;
            }
        }
    } catch (error) {
        console.error('Error loading users:', error);
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
    window.handleLogin = async function(event) {
        event.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password })
            });
            
            const data = await response.json();
            
            if (data.success) {
                currentUser = data.user;
                currentView = 'crm';
                closeLoginModal();
                loadCRMDashboard();
            } else {
                alert(data.error || 'Login failed. Please check your credentials.');
            }
        } catch (error) {
            console.error('Login error:', error);
            alert('Login failed. Please try again.');
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
            // If section doesn't exist, show a placeholder or load users section
            const mainContent = document.querySelector('.main-content');
            if (mainContent) {
                if (sectionName === 'users') {
                    loadUsersSection();
                } else {
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

// Function to load and display the users section
async function loadUsersSection() {
    try {
        const response = await fetch('/api/users');
        const users = await response.json();
        
        const usersHTML = `
            <div id="users" class="crm-section active">
                <div class="section-header-crm">
                    <h2>User Management</h2>
                    <button class="add-btn" onclick="showAddUserModal()">+ Add New User</button>
                </div>
                
                <div class="data-table">
                    <div class="table-header">
                        <div>Name & Email</div>
                        <div>Role</div>
                        <div>Status</div>
                        <div>Last Login</div>
                        <div>Actions</div>
                    </div>
                    ${users.map(user => `
                        <div class="table-row">
                            <div>
                                <div style="font-weight: 600; color: #2c3e50;">${user.username}</div>
                                <div style="color: #666; font-size: 0.9em;">${user.email}</div>
                            </div>
                            <div>
                                <span class="status-badge status-${user.role.toLowerCase()}">${user.role}</span>
                            </div>
                            <div>
                                <span class="status-badge status-${user.status.toLowerCase()}">${user.status}</span>
                            </div>
                            <div style="color: #666;">
                                ${user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}
                            </div>
                            <div>
                                <button class="btn btn-outline" style="margin-right: 10px; padding: 5px 15px; font-size: 12px;" onclick="editUser(${user.id})">Edit</button>
                                <button class="btn" style="background: #e74c3c; padding: 5px 15px; font-size: 12px;" onclick="deleteUser(${user.id})">Delete</button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <!-- Add User Modal -->
            <div id="addUserModal" class="modal" style="display: none;">
                <div class="modal-content">
                    <button class="close-btn" onclick="closeAddUserModal()">&times;</button>
                    <h2>Add New User</h2>
                    
                    <form onsubmit="handleAddUser(event)">
                        <div class="form-group">
                            <label for="newUsername">Username</label>
                            <input type="text" id="newUsername" class="form-control" required>
                        </div>
                        <div class="form-group">
                            <label for="newEmail">Email</label>
                            <input type="email" id="newEmail" class="form-control" required>
                        </div>
                        <div class="form-group">
                            <label for="newPassword">Password</label>
                            <input type="password" id="newPassword" class="form-control" required>
                        </div>
                        <div class="form-group">
                            <label for="newRole">Role</label>
                            <select id="newRole" class="form-control">
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                        <div class="login-actions">
                            <button type="submit" class="btn btn-primary">Create User</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.innerHTML = usersHTML;
        }
        
        // Attach event listeners for user management
        attachUserManagementListeners();
        
    } catch (error) {
        console.error('Error loading users:', error);
        alert('Failed to load users');
    }
}

// Event listeners for user management
function attachUserManagementListeners() {
    window.showAddUserModal = function() {
        const modal = document.getElementById('addUserModal');
        if (modal) {
            modal.style.display = 'block';
        }
    };
    
    window.closeAddUserModal = function() {
        const modal = document.getElementById('addUserModal');
        if (modal) {
            modal.style.display = 'none';
        }
    };
    
    window.handleAddUser = async function(event) {
        event.preventDefault();
        
        const userData = {
            username: document.getElementById('newUsername').value,
            email: document.getElementById('newEmail').value,
            password: document.getElementById('newPassword').value,
            role: document.getElementById('newRole').value
        };
        
        try {
            const response = await fetch('/api/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData)
            });
            
            const data = await response.json();
            
            if (data.success) {
                alert('User created successfully!');
                closeAddUserModal();
                loadUsersSection(); // Reload the users section
            } else {
                alert(data.error || 'Failed to create user');
            }
        } catch (error) {
            console.error('Error creating user:', error);
            alert('Failed to create user');
        }
    };
    
    window.deleteUser = async function(userId) {
        if (confirm('Are you sure you want to delete this user?')) {
            try {
                const response = await fetch(`/api/users/${userId}`, {
                    method: 'DELETE'
                });
                
                const data = await response.json();
                
                if (data.success) {
                    alert('User deleted successfully!');
                    loadUsersSection(); // Reload the users section
                } else {
                    alert('Failed to delete user');
                }
            } catch (error) {
                console.error('Error deleting user:', error);
                alert('Failed to delete user');
            }
        }
    };
    
    window.editUser = function(userId) {
        alert('Edit functionality coming soon!');
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

