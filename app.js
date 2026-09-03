// Main Application JavaScript
// This file handles core functionality across all pages

// Initialize app data structure
const AppData = {
    user: {
        name: 'Guest',
        email: 'guest@devbridge.com',
        bio: ''
    },
    skills: [],
    // Opportunities are loaded from the admin dashboard (localStorage['jobs'])
    // Do not hardcode anything here — use the admin dashboard to post real projects
    opportunities: [],
    appliedOpportunities: []
};

// Expose a promise that other pages can await until AppData finishes loading
window.AppReady = new Promise(resolve => {
    window.__resolveAppReady = resolve;
});

// Storage functions - uses Supabase for opportunities
const Storage = {
    save: function() {
        // Save user data to localStorage only (opportunities come from Supabase)
        const toSave = {
            user: AppData.user,
            skills: AppData.skills,
            appliedOpportunities: AppData.appliedOpportunities
        };
        localStorage.setItem('devbridge_data', JSON.stringify(toSave));
    },
    
    async load() {
        const data = localStorage.getItem('devbridge_data');
        if (data) {
            const parsed = JSON.parse(data);
            Object.assign(AppData, parsed);
        }
        // Load opportunities from Supabase
        await this.loadFromSupabase();
        this.calculateMatches();
    },

    async loadFromSupabase() {
        AppData.opportunities = [];
        try {
            const jobs = await supabase.getJobs();
            if (!Array.isArray(jobs)) {
                console.warn('Invalid jobs data from Supabase');
                return;
            }
            
            jobs.forEach(job => {
                const categoryMap = {
                    'Frontend': 'Programming', 'Backend': 'Programming',
                    'Fullstack': 'Programming', 'Mobile': 'Programming',
                    'DevOps': 'Programming', 'UI/UX Design': 'Design'
                };
                AppData.opportunities.push({
                    id: 'job_' + job.id,
                    _dbId: job.id,
                    title: job.title,
                    company: 'DevBridge',
                    type: job.type || 'Project',
                    location: 'Remote',
                    requiredSkills: job.skills || [],
                    category: categoryMap[job.type] || 'Programming',
                    description: job.description,
                    duration: job.duration || 'Flexible',
                    difficulty: job.difficulty || 'Medium',
                    slots: job.slots || null,
                    paid: false,
                    matchScore: 0,
                    isAdminJob: true
                });
            });
            console.log(`✓ Loaded ${AppData.opportunities.length} jobs from Supabase`);
        } catch (e) {
            console.warn('Could not load jobs from Supabase:', e);
        }
    },

    // Setup polling for job updates (real-time simulation)
    setupRealtimeSync() {
        if (!window.supabaseRealtimeSetup) {
            window.supabaseRealtimeSetup = true;
            console.log('📡 Starting job polling every 3 seconds...');
            supabase.startPollingJobs(async (jobs) => {
                console.log('✨ New jobs detected! Updating...');
                await this.loadFromSupabase();
                this.calculateMatches();
                // Trigger UI update if opportunities page is visible
                if (typeof displayOpportunities === 'function') {
                    displayOpportunities();
                    updateOpportunitiesCount();
                }
            }, 3000); // Poll every 3 seconds
        }
    },
    
    calculateMatches: function() {
        // Calculate match scores for opportunities based on user skills
        const userSkills = AppData.skills.map(s => s.name.toLowerCase());
        
        AppData.opportunities.forEach(opp => {
            const requiredSkills = opp.requiredSkills.map(s => s.toLowerCase());
            if (requiredSkills.length === 0) {
                opp.matchScore = 0;
                return;
            }
            const matchingSkills = userSkills.filter(skill => 
                requiredSkills.some(req => req.includes(skill) || skill.includes(req))
            );
            opp.matchScore = Math.round((matchingSkills.length / requiredSkills.length) * 100);
        });
        
        this.save();
    }
};

// Initialize user name display
function updateUserDisplay() {
    const userNameElements = document.querySelectorAll('#user-name');
    userNameElements.forEach(el => {
        el.textContent = AppData.user.name;
    });
}

// Utility functions
const Utils = {
    formatDate: function(date) {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    },
    
    generateId: function() {
        return Date.now() + Math.random().toString(36).substr(2, 9);
    },
    
    showNotification: function(message, type = 'success') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 2rem;
            background: ${type === 'success' ? '#10b981' : '#ef4444'};
            color: white;
            border-radius: 5px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            z-index: 9999;
            animation: slideIn 0.3s ease;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
};

// Add animation keyframes
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Notification Bar System
function checkAcceptedApplications() {
    const applications = JSON.parse(localStorage.getItem('applications')) || [];
    const acceptedApps = applications.filter(app => app.status === 'accepted' || app.status === 'approved');
    
    if (acceptedApps.length > 0) {
        displayApplicationNotifications(acceptedApps);
    }
}

function displayApplicationNotifications(acceptedApps) {
    // Check if notification bar already exists, if not create it
    let notificationBar = document.getElementById('application-notification-bar');
    
    if (!notificationBar) {
        notificationBar = document.createElement('div');
        notificationBar.id = 'application-notification-bar';
        notificationBar.className = 'notification-bar accepted-bar';
        document.body.prepend(notificationBar);
    }
    
    // Build notification message
    if (acceptedApps.length === 1) {
        const app = acceptedApps[0];
        notificationBar.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">🎉</span>
                <span class="notification-text"><strong>Congratulations!</strong> Your application for "<strong>${app.jobTitle}</strong>" <br>has been accepted by the admin!</span>
                <button class="notification-close" onclick="closeApplicationNotification()">&times;</button>
            </div>
        `;
    } else {
        notificationBar.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">🎉</span>
                <span class="notification-text"><strong>Great News!</strong> You have <strong>${acceptedApps.length}</strong> accepted application(s)! <a href="profile.html" class="notification-link">View Details →</a></span>
                <button class="notification-close" onclick="closeApplicationNotification()">&times;</button>
            </div>
        `;
    }
    
    notificationBar.style.display = 'block';
}

function closeApplicationNotification() {
    const notificationBar = document.getElementById('application-notification-bar');
    if (notificationBar) {
        notificationBar.style.display = 'none';
    }
}

// Helper function for admin to mark applications as accepted
// Usage: acceptApplication('jobId') — called after admin receives/reviews applications
window.acceptApplication = function(jobTitleOrId) {
    const applications = JSON.parse(localStorage.getItem('applications')) || [];
    let updated = false;
    
    applications.forEach(app => {
        if (app.jobTitle === jobTitleOrId || app.jobId === jobTitleOrId) {
            app.status = 'accepted';
            updated = true;
        }
    });
    
    if (updated) {
        localStorage.setItem('applications', JSON.stringify(applications));
        console.log(`✓ Application(s) for "${jobTitleOrId}" marked as accepted!`);
        checkAcceptedApplications();
        return true;
    } else {
        console.warn(`✗ No application found for "${jobTitleOrId}"`);
        return false;
    }
};

// Helper to view all applications (for admin)
window.viewAllApplications = function() {
    const applications = JSON.parse(localStorage.getItem('applications')) || [];
    console.table(applications);
    return applications;
};

// Check real login session and update AppData.user + nav accordingly
async function loadAuthState() {
    if (typeof Auth === 'undefined' || !Auth.isLoggedIn()) {
        return; // not logged in — AppData.user stays as the default Guest
    }
    const profile = await Auth.getProfile();
    if (profile) {
        AppData.user.name = profile.name || AppData.user.name;
        AppData.user.email = profile.email || AppData.user.email;
        AppData.user.id = profile.id;
        AppData.user.isAdmin = !!profile.is_admin;
    }
}

// Show "Log In" link for guests, or the real name + "Log Out" for logged-in users
function updateAuthNav() {
    const loggedIn = typeof Auth !== 'undefined' && Auth.isLoggedIn();
    document.querySelectorAll('#login-link').forEach(el => {
        if (loggedIn) {
            el.textContent = 'Log Out';
            el.href = '#';
            el.onclick = function(e) {
                e.preventDefault();
                Auth.signOut();
            };
        } else {
            el.textContent = 'Log In';
            el.href = 'login.html';
            el.onclick = null;
        }
    });
}

// Initialize app on page load
document.addEventListener('DOMContentLoaded', async function() {
    await Storage.load();
    await loadAuthState();
    Storage.setupRealtimeSync();
    updateUserDisplay();
    updateAuthNav();
    
    if (typeof window.__resolveAppReady === 'function') {
        window.__resolveAppReady();
    }
    
    // Check for accepted applications and show notifications
    setTimeout(() => {
        checkAcceptedApplications();
    }, 500);
});

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AppData, Storage, Utils };
}