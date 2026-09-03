// opportunities.js — connects to admin dashboard jobs & applications

let currentView = 'all';
let filteredOpportunities = [];
let userApplications = []; // Cache user's applications from Supabase

document.addEventListener('DOMContentLoaded', function () {
    // Clean up old localStorage to prevent quota exceeded errors
    try {
        localStorage.removeItem('applications');
        console.log('✓ Cleaned up old applications from localStorage');
    } catch (e) {
        console.warn('Could not clean localStorage:', e);
    }

    // Load user's applications from Supabase
    loadUserApplications().then(() => {
        // Wait a moment for AppData to be loaded from Supabase
        setTimeout(() => {
            displayOpportunities();
            updateOpportunitiesCount();
        }, 100);
    });

    document.getElementById('search-opportunities')?.addEventListener('input', filterOpportunities);
    document.getElementById('filter-type')?.addEventListener('change', filterOpportunities);
    document.getElementById('filter-skill')?.addEventListener('change', filterOpportunities);
    document.getElementById('filter-location')?.addEventListener('change', filterOpportunities);

    document.querySelectorAll('.toggle-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            document.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentView = this.dataset.view;
            filterOpportunities();
        });
    });

    document.getElementById('show-matches')?.addEventListener('click', function () {
        currentView = 'matched';
        document.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
        document.querySelector('.toggle-btn[data-view="matched"]').classList.add('active');
        filterOpportunities();
    });

    // Close detail modal
    document.querySelector('.close-modal')?.addEventListener('click', closeModal);
    window.addEventListener('click', function (e) {
        if (e.target === document.getElementById('opportunity-modal')) closeModal();
        if (e.target === document.getElementById('apply-modal')) closeApplyModal();
    });

    // Apply form submission
    const applyForm = document.getElementById('apply-form');
    if (applyForm) {
        applyForm.addEventListener('submit', submitApplication);
        console.log('✓ Apply form listener attached');
    } else {
        console.warn('⚠ Apply form not found!');
    }
});

// ─── DISPLAY ───
async function loadUserApplications() {
    try {
        const session = Auth.getSession();
        if (!session || !AppData.user.id) {
            userApplications = [];
            return;
        }
        const response = await fetch(`https://fsuhpjlyzojioezdjjld.supabase.co/rest/v1/applications?user_id=eq.${AppData.user.id}&order=created_at.desc`, {
            headers: {
                'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZzdWhwamx5em9qaW9lemRqamxkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcyMjIxNDksImV4cCI6MjA5Mjc5ODE0OX0.IkNVBJrpPKCuW9cKfuRNMWCa2mqjuerYWNUhuDdunlM',
                'Authorization': `Bearer ${session.access_token}`
            }
        });
        
        userApplications = response.ok ? await response.json() : [];
        console.log('📝 Loaded user applications:', userApplications.length);
    } catch (error) {
        console.error('Error loading user applications:', error);
        userApplications = [];
    }
}

function displayOpportunities(opps = null) {
    const container = document.getElementById('opportunities-container');
    const opportunities = opps || AppData.opportunities;

    if (!opportunities.length) {
        container.innerHTML = `
            <div class="empty-state" style="grid-column: 1/-1;">
                <div class="empty-icon">🔍</div>
                <h3>No opportunities found</h3>
                <p>Try adjusting your filters or add more skills to see matches!</p>
            </div>`;
        return;
    }

    container.innerHTML = opportunities.map(opp => {
        const appliedKey = 'applied_' + opp.id;
        
        // Check user's application from Supabase
        const userApp = userApplications.find(app => app.job_title === opp.title);
        const isApplied = userApp ? true : (AppData.appliedOpportunities.includes(opp.id) || localStorage.getItem(appliedKey) === 'true');
        const appStatus = userApp?.status || 'pending';
        
        // Status display
        const statusBadge = userApp ? `
            <span class="application-status-badge ${appStatus}">
                ${appStatus === 'accepted' ? '✓ Accepted' : appStatus === 'rejected' ? '✗ Rejected' : '⏳ Pending'}
            </span>` : '';
        
        const showMatch = opp.matchScore > 0 && AppData.skills.length > 0;

        const adminBadge = opp.isAdminJob ? `
            <span class="tag" style="background:#e0f2fe;color:#0369a1;border:1px solid #bae6fd;">
                ✦ DevBridge Project
            </span>` : '';

        const diffColor = {
            Easy: '#dcfce7|#166534',
            Medium: '#fef9c3|#854d0e',
            Hard: '#fee2e2|#991b1b'
        };
        const [bg, fg] = (diffColor[opp.difficulty] || '').split('|');
        const diffBadge = opp.difficulty ? `
            <span class="tag" style="background:${bg};color:${fg};border:1px solid ${bg};">
                ${opp.difficulty}
            </span>` : '';

        return `
        <div class="opportunity-card" data-opp-id="${opp.id}">
            <div class="opportunity-header">
                <h3>${opp.title}</h3>
                <p class="opportunity-company">${opp.company}</p>
                ${statusBadge}
            </div>

            <div class="opportunity-tags">
                <span class="tag type">${opp.type}</span>
                <span class="tag location">📍 ${opp.location}</span>
                ${opp.paid ? '<span class="tag skill">💰 Paid</span>' : ''}
                ${adminBadge}
                ${diffBadge}
            </div>

            ${showMatch ? `<div class="opportunity-match">${opp.matchScore}% Match with your skills!</div>` : ''}

            <p class="opportunity-description">${opp.description}</p>

            <div class="opportunity-footer">
                <div>
                    <strong>Duration:</strong> ${opp.duration}<br>
                    <strong>Skills:</strong> ${opp.requiredSkills.slice(0, 2).join(', ')}
                    ${opp.requiredSkills.length > 2 ? `+${opp.requiredSkills.length - 2}` : ''}
                </div>
            </div>

            <div class="opportunity-footer">
                <button class="btn-view-details" onclick="viewOpportunityDetails('${opp.id}')">
                    View Details
                </button>
                <button class="btn-apply" onclick="openApplyModal('${opp.id}')" ${isApplied ? 'disabled' : ''}>
                    ${isApplied ? (appStatus === 'accepted' ? '✓ Accepted' : appStatus === 'rejected' ? '✗ Rejected' : 'Applied ✓') : 'Apply Now'}
                </button>
            </div>
        </div>`;
    }).join('');
}

function filterOpportunities() {
    const searchTerm = document.getElementById('search-opportunities').value.toLowerCase();
    const typeFilter = document.getElementById('filter-type').value;
    const skillFilter = document.getElementById('filter-skill').value;
    const locationFilter = document.getElementById('filter-location').value;

    let filtered = [...AppData.opportunities];

    if (currentView === 'matched') {
        filtered = filtered.filter(o => o.matchScore > 0).sort((a, b) => b.matchScore - a.matchScore);
    }
    if (searchTerm) {
        filtered = filtered.filter(o =>
            o.title.toLowerCase().includes(searchTerm) ||
            o.company.toLowerCase().includes(searchTerm) ||
            o.description.toLowerCase().includes(searchTerm)
        );
    }
    if (typeFilter) filtered = filtered.filter(o => o.type === typeFilter);
    if (skillFilter) filtered = filtered.filter(o => o.category === skillFilter);
    if (locationFilter) filtered = filtered.filter(o => o.location === locationFilter);

    filteredOpportunities = filtered;
    displayOpportunities(filtered);
    updateOpportunitiesCount(filtered.length);
}

function updateOpportunitiesCount(count = null) {
    const el = document.getElementById('opportunities-count');
    if (el) el.textContent = count !== null ? count : AppData.opportunities.length;
    const heroEl = document.getElementById('hero-count');
    if (heroEl) heroEl.textContent = AppData.opportunities.length;
}

// ─── DETAIL MODAL ───
function viewOpportunityDetails(oppId) {
    const opportunity = AppData.opportunities.find(o => String(o.id) === String(oppId));
    if (!opportunity) return;

    const modal = document.getElementById('opportunity-modal');
    const modalBody = document.getElementById('modal-body');
    const isApplied = AppData.appliedOpportunities.includes(opportunity.id) ||
        localStorage.getItem('applied_' + opportunity.id) === 'true';
    const showMatch = opportunity.matchScore > 0 && AppData.skills.length > 0;

    modalBody.innerHTML = `
        <h2>${opportunity.title}</h2>
        <h3 style="color:#666;font-weight:500;margin-top:4px;">${opportunity.company}</h3>

        <div class="opportunity-tags" style="margin:1rem 0;">
            <span class="tag type">${opportunity.type}</span>
            <span class="tag location">📍 ${opportunity.location}</span>
            ${opportunity.paid ? '<span class="tag skill">💰 Paid</span>' : '<span class="tag">Volunteer</span>'}
            ${opportunity.isAdminJob ? '<span class="tag" style="background:#e0f2fe;color:#0369a1;">✦ DevBridge Project</span>' : ''}
        </div>

        ${showMatch ? `<div class="opportunity-match" style="margin:1rem 0;">${opportunity.matchScore}% Match with your skills!</div>` : ''}

        <div style="margin:1.5rem 0;">
            <h4>Description</h4>
            <p style="margin-top:0.5rem;color:#444;line-height:1.7;">${opportunity.description}</p>
        </div>

        <div style="margin:1.5rem 0;">
            <h4>Required Skills</h4>
            <div style="display:flex;flex-wrap:wrap;gap:0.5rem;margin-top:0.5rem;">
                ${opportunity.requiredSkills.map(s => `<span class="skill-badge">${s}</span>`).join('')}
            </div>
        </div>

        <div style="margin:1.5rem 0;">
            <h4>Details</h4>
            <p><strong>Duration:</strong> ${opportunity.duration}</p>
            <p><strong>Location:</strong> ${opportunity.location}</p>
            <p><strong>Type:</strong> ${opportunity.type}</p>
            ${opportunity.difficulty ? `<p><strong>Difficulty:</strong> ${opportunity.difficulty}</p>` : ''}
            ${opportunity.slots ? `<p><strong>Open Slots:</strong> ${opportunity.slots}</p>` : ''}
            <p><strong>Compensation:</strong> ${opportunity.paid ? 'Paid' : 'Volunteer / Experience'}</p>
        </div>

        <button class="btn-apply cta-button primary"
            onclick="closeModal(); openApplyModal('${opportunity.id}');"
            ${isApplied ? 'disabled' : ''}>
            ${isApplied ? 'Already Applied ✓' : 'Apply Now'}
        </button>`;

    modal.classList.add('active');
}

function closeModal() {
    document.getElementById('opportunity-modal')?.classList.remove('active');
}

// ─── APPLICATION MODAL ───
let currentApplyOppId = null;

function openApplyModal(oppId) {
    const isApplied = AppData.appliedOpportunities.includes(oppId) ||
        localStorage.getItem('applied_' + oppId) === 'true';
    if (isApplied) { Utils.showNotification('You have already applied!', 'error'); return; }

    currentApplyOppId = oppId;
    const opp = AppData.opportunities.find(o => String(o.id) === String(oppId));

    // Pre-fill skills from user profile
    const userSkills = AppData.skills.map(s => s.name).join(', ');
    document.getElementById('apply-skills').value = userSkills || '';
    document.getElementById('apply-job-title').textContent = opp ? opp.title : 'this opportunity';
    document.getElementById('apply-name').value = AppData.user?.name !== 'Guest' ? AppData.user.name : '';
    document.getElementById('apply-email').value = AppData.user?.email !== 'guest@devbridge.com' ? AppData.user.email : '';
    document.getElementById('apply-message').value = '';
    document.getElementById('apply-error').style.display = 'none';

    document.getElementById('apply-modal').classList.add('active');
}

function closeApplyModal() {
    document.getElementById('apply-modal')?.classList.remove('active');
    currentApplyOppId = null;
}

function submitApplication(e) {
    e.preventDefault();
    console.log('📝 Submit application clicked');

    if (typeof Auth === 'undefined' || !Auth.isLoggedIn()) {
        alert('Please log in first to apply.');
        window.location.href = 'login.html';
        return;
    }

    const name = document.getElementById('apply-name').value.trim();
    const email = document.getElementById('apply-email').value.trim();
    const skillsRaw = document.getElementById('apply-skills').value.trim();
    const message = document.getElementById('apply-message').value.trim();
    const errEl = document.getElementById('apply-error');

    console.log('Form values:', { name, email, skillsRaw, message, oppId: currentApplyOppId });

    if (!name || !email) {
        const err = 'Please fill in your name and email.';
        console.warn('❌ ' + err);
        errEl.textContent = err;
        errEl.style.display = 'block';
        return;
    }

    if (!currentApplyOppId) {
        const err = 'Error: No opportunity selected.';
        console.error('❌ ' + err);
        errEl.textContent = err;
        errEl.style.display = 'block';
        return;
    }

    const opp = AppData.opportunities.find(o => String(o.id) === String(currentApplyOppId));
    console.log('Found opportunity:', opp);

    if (!opp) {
        const err = `Error: Could not find job (ID: ${currentApplyOppId}). Please try refreshing the page.`;
        console.error('❌ ' + err);
        errEl.textContent = err;
        errEl.style.display = 'block';
        return;
    }

    const skills = skillsRaw.split(',').map(s => s.trim()).filter(Boolean);
    console.log('Parsed skills:', skills);

    // Save to Supabase applications table (PRIMARY)
    if (supabase && supabase.addApplication) {
        supabase.addApplication({
            job_id: opp._dbId,  // UUID from Supabase
            job_title: opp.title,
            user_id: AppData.user.id,
            name: name,
            email: email,
            skills: skills,
            message: message,
            status: 'pending'
        }).then(result => {
            console.log('✓ Application saved to Supabase:', result);
            // Reload user applications to show the new status
            loadUserApplications();
        }).catch(err => {
            console.error('❌ Error saving to Supabase:', err);
            errEl.textContent = 'Error submitting application. Please try again.';
            errEl.style.display = 'block';
        });
    } else {
        console.error('❌ Supabase not available!');
        errEl.textContent = 'Application service unavailable. Please check your connection.';
        errEl.style.display = 'block';
        return;
    }

    // Mark as applied locally (lightweight, not storing full application)
    AppData.appliedOpportunities.push(currentApplyOppId);
    localStorage.setItem('applied_' + currentApplyOppId, 'true');
    Storage.save();

    closeApplyModal();
    filterOpportunities();
    Utils.showNotification('✓ Application submitted! We\'ll be in touch soon.');
    console.log('✓ Application process complete');
}
