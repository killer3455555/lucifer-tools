// Background images array
const backgroundImages = [
    'goku_bg.jpg',
    '2353d19c3a21b405cdc0c35986199153.jpg',
    'ee3eca8923ea4714dfd76a18ba29558c.jpg',
    'ca122d8b3718d31db39a9159e8d2f5d6.jpg',
    '6566072d698ec8c6fb84220a7b944450.jpg'
];

let currentBgIndex = 0;
let isLoggedIn = false;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    createParticles();
    startBackgroundRotation();
    showWelcomeScreen();
});

// Create floating particles
function createParticles() {
    const particlesContainer = document.getElementById('particles');
    const particleCount = 50;

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 6 + 's';
        particle.style.animationDuration = (Math.random() * 3 + 3) + 's';
        particlesContainer.appendChild(particle);
    }
}

// Rotate background images
function startBackgroundRotation() {
    setInterval(() => {
        currentBgIndex = (currentBgIndex + 1) % backgroundImages.length;
        document.getElementById('bgOverlay').style.backgroundImage = 
            `url('${backgroundImages[currentBgIndex]}')`;
    }, 5000);
}

// Show welcome screen with animation
function showWelcomeScreen() {
    const welcomeScreen = document.getElementById('welcomeScreen');
    
    setTimeout(() => {
        welcomeScreen.style.opacity = '0';
        setTimeout(() => {
            welcomeScreen.style.display = 'none';
            showLoginScreen();
        }, 1000);
    }, 5000);
}

// Show login screen
function showLoginScreen() {
    const loginContainer = document.getElementById('loginContainer');
    loginContainer.style.display = 'flex';
    
    // Handle login form submission
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
}

// Handle login
async function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('loginError');
    
    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password })
        });
        
        const result = await response.json();
        
        if (result.success) {
            isLoggedIn = true;
            document.getElementById('loginContainer').style.display = 'none';
            document.getElementById('mainDashboard').style.display = 'block';
            errorDiv.style.display = 'none';
        } else {
            errorDiv.textContent = result.message;
            errorDiv.style.display = 'block';
        }
    } catch (error) {
        errorDiv.textContent = 'Login failed. Please try again.';
        errorDiv.style.display = 'block';
    }
}

// Show dashboard
function showDashboard() {
    document.querySelectorAll('.tool-content').forEach(content => {
        content.style.display = 'none';
    });
    document.getElementById('dashboardView').style.display = 'block';
}

// Show specific tool
function showTool(toolId) {
    document.getElementById('dashboardView').style.display = 'none';
    document.querySelectorAll('.tool-content').forEach(content => {
        content.style.display = 'none';
    });
    document.getElementById(toolId).style.display = 'block';
}

// Logout function
function logout() {
    isLoggedIn = false;
    document.getElementById('mainDashboard').style.display = 'none';
    document.getElementById('loginContainer').style.display = 'flex';
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
}

// Token Checker
async function checkToken() {
    const token = document.getElementById('tokenInput').value;
    const resultDiv = document.getElementById('tokenResult');
    
    if (!token) {
        alert('Please enter a token');
        return;
    }
    
    try {
        const response = await fetch('/api/token-check', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token })
        });
        
        const result = await response.json();
        
        if (result.success) {
            let html = '<h4>Token Check Results:</h4>';
            if (result.valid) {
                html += `
                    <div class="alert alert-success">
                        <strong>✅ Token is Valid!</strong><br>
                        <strong>User ID:</strong> ${result.user_id}<br>
                        <strong>User Name:</strong> ${result.user_name}<br>
                `;
                
                if (result.token_info && result.token_info.data) {
                    const tokenData = result.token_info.data;
                    html += `
                        <strong>App ID:</strong> ${tokenData.app_id || 'N/A'}<br>
                        <strong>Expires:</strong> ${tokenData.expires_at ? new Date(tokenData.expires_at * 1000).toLocaleString() : 'Never'}<br>
                        <strong>Scopes:</strong> ${tokenData.scopes ? tokenData.scopes.join(', ') : 'N/A'}
                    `;
                }
                html += '</div>';
            } else {
                html += `
                    <div class="alert alert-danger">
                        <strong>❌ Token is Invalid!</strong><br>
                        ${result.message}
                    </div>
                `;
            }
            
            resultDiv.innerHTML = html;
            resultDiv.style.display = 'block';
        } else {
            resultDiv.innerHTML = `<div class="alert alert-danger">Error: ${result.message}</div>`;
            resultDiv.style.display = 'block';
        }
    } catch (error) {
        resultDiv.innerHTML = `<div class="alert alert-danger">Error: ${error.message}</div>`;
        resultDiv.style.display = 'block';
    }
}

// CPU Monitor
async function getCPUStats() {
    const resultDiv = document.getElementById('cpuResult');
    
    try {
        const response = await fetch('/api/cpu-monitor');
        const result = await response.json();
        
        if (result.success) {
            const stats = result.current_stats;
            const html = `
                <h4>System Performance:</h4>
                <div class="row">
                    <div class="col-md-6">
                        <div class="card bg-dark mb-3">
                            <div class="card-body">
                                <h5 class="card-title text-info">CPU Usage</h5>
                                <h2 class="text-warning">${stats.cpu_percent}%</h2>
                                <div class="progress">
                                    <div class="progress-bar bg-warning" style="width: ${stats.cpu_percent}%"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="card bg-dark mb-3">
                            <div class="card-body">
                                <h5 class="card-title text-info">Memory Usage</h5>
                                <h2 class="text-danger">${stats.memory_percent}%</h2>
                                <div class="progress">
                                    <div class="progress-bar bg-danger" style="width: ${stats.memory_percent}%"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="card bg-dark mb-3">
                            <div class="card-body">
                                <h5 class="card-title text-info">Disk Usage</h5>
                                <h2 class="text-success">${stats.disk_percent}%</h2>
                                <div class="progress">
                                    <div class="progress-bar bg-success" style="width: ${stats.disk_percent}%"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="card bg-dark mb-3">
                            <div class="card-body">
                                <h5 class="card-title text-info">Uptime</h5>
                                <h2 class="text-primary">${stats.uptime_days} days</h2>
                                <p>Total Requests: ${stats.total_requests}</p>
                                <p>Active Users: ${stats.active_users}</p>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            resultDiv.innerHTML = html;
            resultDiv.style.display = 'block';
        } else {
            resultDiv.innerHTML = `<div class="alert alert-danger">Error: ${result.message}</div>`;
            resultDiv.style.display = 'block';
        }
    } catch (error) {
        resultDiv.innerHTML = `<div class="alert alert-danger">Error: ${error.message}</div>`;
        resultDiv.style.display = 'block';
    }
}

// Facebook Posts
async function getFacebookPosts() {
    const token = document.getElementById('postsTokenInput').value;
    const resultDiv = document.getElementById('postsResult');
    
    if (!token) {
        alert('Please enter a token');
        return;
    }
    
    try {
        const response = await fetch('/api/facebook-posts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token })
        });
        
        const result = await response.json();
        
        if (result.success) {
            let html = `<h4>Facebook Posts (${result.total_posts} found):</h4>`;
            
            if (result.posts.length > 0) {
                html += '<div class="table-responsive"><table class="table table-dark table-striped">';
                html += '<thead><tr><th>Post ID</th><th>Message</th><th>Created Time</th></tr></thead><tbody>';
                
                result.posts.forEach(post => {
                    html += `
                        <tr>
                            <td><code>${post.id}</code></td>
                            <td>${post.message}</td>
                            <td>${new Date(post.created_time).toLocaleString()}</td>
                        </tr>
                    `;
                });
                
                html += '</tbody></table></div>';
            } else {
                html += '<div class="alert alert-info">No posts found for this token.</div>';
            }
            
            resultDiv.innerHTML = html;
            resultDiv.style.display = 'block';
        } else {
            resultDiv.innerHTML = `<div class="alert alert-danger">Error: ${result.message}</div>`;
            resultDiv.style.display = 'block';
        }
    } catch (error) {
        resultDiv.innerHTML = `<div class="alert alert-danger">Error: ${error.message}</div>`;
        resultDiv.style.display = 'block';
    }
}

// Uptime Bot Status
async function getUptimeStatus() {
    const resultDiv = document.getElementById('uptimeResult');
    
    try {
        const response = await fetch('/api/uptime-status');
        const result = await response.json();
        
        if (result.success) {
            const progressColor = result.progress_percent >= 80 ? 'success' : 
                                 result.progress_percent >= 50 ? 'warning' : 'danger';
            
            const html = `
                <h4>Uptime Bot Status:</h4>
                <div class="row">
                    <div class="col-md-8">
                        <div class="card bg-dark">
                            <div class="card-body">
                                <h5 class="card-title text-info">100-Day Challenge Progress</h5>
                                <div class="mb-3">
                                    <div class="d-flex justify-content-between">
                                        <span>Days Running: ${result.uptime_days}</span>
                                        <span>Target: ${result.target_days} days</span>
                                    </div>
                                    <div class="progress" style="height: 25px;">
                                        <div class="progress-bar bg-${progressColor}" 
                                             style="width: ${result.progress_percent}%">
                                            ${result.progress_percent}%
                                        </div>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col-md-4">
                                        <h6 class="text-muted">Status</h6>
                                        <span class="badge bg-success">${result.status.toUpperCase()}</span>
                                    </div>
                                    <div class="col-md-4">
                                        <h6 class="text-muted">Total Requests</h6>
                                        <strong>${result.total_requests}</strong>
                                    </div>
                                    <div class="col-md-4">
                                        <h6 class="text-muted">Active Users</h6>
                                        <strong>${result.active_users}</strong>
                                    </div>
                                </div>
                                <hr>
                                <div class="row">
                                    <div class="col-md-6">
                                        <h6 class="text-muted">Start Time</h6>
                                        <small>${new Date(result.start_time).toLocaleString()}</small>
                                    </div>
                                    <div class="col-md-6">
                                        <h6 class="text-muted">Deployments</h6>
                                        <strong>${result.deployments}</strong>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            resultDiv.innerHTML = html;
            resultDiv.style.display = 'block';
        } else {
            resultDiv.innerHTML = `<div class="alert alert-danger">Error: ${result.message}</div>`;
            resultDiv.style.display = 'block';
        }
    } catch (error) {
        resultDiv.innerHTML = `<div class="alert alert-danger">Error: ${error.message}</div>`;
        resultDiv.style.display = 'block';
    }
}

// Auto-refresh uptime status every 30 seconds if on uptime page
setInterval(() => {
    const uptimeContent = document.getElementById('uptimeBot');
    if (uptimeContent && uptimeContent.style.display !== 'none' && isLoggedIn) {
        getUptimeStatus();
    }
}, 30000);

