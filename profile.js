// Profile Page JavaScript

document.addEventListener('DOMContentLoaded', async function() {
    if (window.AppReady) {
        await window.AppReady;
    }
    
    await loadMessages();
    await loadAppliedOpportunities();
    loadProfileData();
    loadProfileSkills();
    loadRecommendedOpportunities();
    await loadWorkFilesAndSubmissions();
    await loadSubmissionHistory();
    await loadJourneyProgress();
    
    // Edit profile button
    document.getElementById('edit-profile-btn')?.addEventListener('click', openEditProfileModal);
    
    // Edit profile form
    document.getElementById('edit-profile-form')?.addEventListener('submit', handleEditProfile);
    
    // Modal close
    document.querySelector('.close-modal')?.addEventListener('click', closeEditModal);
    
    // Work submission form - ATTACH ONCE HERE
    const workSubmissionForm = document.getElementById('work-submission-form');
    if (workSubmissionForm) {
        workSubmissionForm.addEventListener('submit', submitWork);
    }
});

async function loadMessages() {
    const container = document.getElementById('messages-list');
    const countEl = document.getElementById('messages-count');
    if (!container) return;

    const session = Auth.getSession();
    if (!session || !AppData.user.id) {
        container.innerHTML = `
            <div class="empty-state-profile">
                <div class="empty-icon">🔒</div>
                <h3>Log in to see your messages</h3>
                <a href="login.html" class="cta-button primary">Log In</a>
            </div>
        `;
        return;
    }

    try {
        const response = await fetch(`https://fsuhpjlyzojioezdjjld.supabase.co/rest/v1/messages?recipient_id=eq.${AppData.user.id}&order=created_at.desc`, {
            headers: {
                'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZzdWhwamx5em9qaW9lemRqamxkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcyMjIxNDksImV4cCI6MjA5Mjc5ODE0OX0.IkNVBJrpPKCuW9cKfuRNMWCa2mqjuerYWNUhuDdunlM',
                'Authorization': `Bearer ${session.access_token}`
            }
        });
        const messages = response.ok ? await response.json() : [];

        if (countEl) countEl.textContent = `(${messages.length})`;

        if (!messages.length) {
            container.innerHTML = `
                <div class="empty-state-profile">
                    <div class="empty-icon">📭</div>
                    <h3>No messages yet</h3>
                </div>
            `;
            return;
        }

        container.innerHTML = messages.map(m => `
            <div style="border:1px solid #e5e7eb; border-radius:10px; padding:14px 16px; margin-bottom:12px; ${m.is_read ? '' : 'background:#f0f9ff; border-color:#bae6fd;'}">
                <div style="font-size:12px; color:#666; margin-bottom:6px;">
                    ${new Date(m.created_at).toLocaleString()} ${m.is_read ? '' : '• <strong style="color:#0369a1;">New</strong>'}
                </div>
                <div>${(m.content || '').replace(/</g, '&lt;')}</div>
            </div>
        `).join('');

        // Mark unread messages as read
        const unread = messages.filter(m => !m.is_read);
        if (unread.length) {
            await Promise.all(unread.map(m => fetch(`https://fsuhpjlyzojioezdjjld.supabase.co/rest/v1/messages?id=eq.${m.id}`, {
                method: 'PATCH',
                headers: {
                    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZzdWhwamx5em9qaW9lemRqamxkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcyMjIxNDksImV4cCI6MjA5Mjc5ODE0OX0.IkNVBJrpPKCuW9cKfuRNMWCa2mqjuerYWNUhuDdunlM',
                    'Authorization': `Bearer ${session.access_token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ is_read: true })
            })));
        }
    } catch (error) {
        console.error('Error loading messages:', error);
        container.innerHTML = `
            <div class="empty-state-profile">
                <div class="empty-icon">⚠️</div>
                <h3>Could not load messages</h3>
            </div>
        `;
    }
}

function loadProfileData() {
    document.getElementById('profile-name').textContent = AppData.user.name;
    document.getElementById('profile-email').textContent = AppData.user.email;
    
    // Update stats with correct mapping
    const appliedCount = AppData.appliedOpportunities ? AppData.appliedOpportunities.length : 0;
    const skillsCount = AppData.skills ? AppData.skills.length : 0;
    const opportunitiesCount = AppData.opportunities ? AppData.opportunities.length : 0;
    const profileProgress = AppData.user.profileCompletion || '75%';
    
    // Update stat-skills (Skills Added)
    const statSkillsEl = document.getElementById('stat-skills');
    if (statSkillsEl) statSkillsEl.textContent = skillsCount;
    
    // Update stat-opportunities (Opportunities Applied) - should show applied count
    const statOppsEl = document.getElementById('stat-opportunities');
    if (statOppsEl) statOppsEl.textContent = appliedCount;
    
    // Update stat-matches (Matches Found)
    const matchedOpps = AppData.opportunities.filter(opp => opp.matchScore > 50);
    const statMatchesEl = document.getElementById('stat-matches');
    if (statMatchesEl) statMatchesEl.textContent = matchedOpps.length;
    
    // Update stat-progress (Profile Progress)
    const statProgressEl = document.getElementById('stat-progress');
    if (statProgressEl) statProgressEl.textContent = profileProgress;
    
    console.log('Profile Data Loaded:', { 
        skills: skillsCount, 
        applied: appliedCount, 
        matches: matchedOpps.length, 
        progress: profileProgress 
    });
}

function loadProfileSkills() {
    const container = document.getElementById('profile-skills');
    
    if (AppData.skills.length === 0) {
        container.innerHTML = `
            <div class="empty-state-small">
                <p>No skills added yet. <a href="my-skills.html">Add your first skill</a></p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = `
        <div class="skills-showcase">
            ${AppData.skills.map(skill => `
                <span class="skill-badge">${skill.name}</span>
            `).join('')}
        </div>
    `;
}

function loadRecommendedOpportunities() {
    const container = document.getElementById('recommended-opportunities');
    
    if (AppData.skills.length === 0) {
        container.innerHTML = `
            <div class="empty-state-small">
                <p>Add skills to get personalized recommendations!</p>
            </div>
        `;
        return;
    }
    
    // Get top 3 matched opportunities
    const recommended = AppData.opportunities
        .filter(opp => opp.matchScore > 0)
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 3);
    
    if (recommended.length === 0) {
        container.innerHTML = `
            <div class="empty-state-small">
                <p>No matches found yet. Try adding more skills!</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = recommended.map(opp => `
        <div class="opportunity-card" style="margin-bottom: 1rem;">
            <div class="opportunity-header">
                <h3 style="font-size: 1.2rem;">${opp.title}</h3>
                <p class="opportunity-company">${opp.company}</p>
            </div>
            
            <div class="opportunity-tags">
                <span class="tag type">${opp.type}</span>
                <span class="tag location">📍 ${opp.location}</span>
            </div>
            
            <div class="opportunity-match">
                ${opp.matchScore}% Match with your skills!
            </div>
            
            <div style="margin-top: 1rem;">
                <a href="opportunities.html" class="btn-link">View Opportunity →</a>
            </div>
        </div>
    `).join('');
}

async function loadAppliedOpportunities() {
    const container = document.getElementById('applied-opportunities');
    
    try {
        // Fetch applications from Supabase for current user (by real account ID, not email text)
        const session = Auth.getSession();
        if (!session) {
            container.innerHTML = `
                <div class="empty-state-profile">
                    <div class="empty-icon">🔒</div>
                    <h3>Log in to see your applications</h3>
                    <a href="login.html" class="cta-button primary">Log In</a>
                </div>
            `;
            return;
        }
        const response = await fetch(`https://fsuhpjlyzojioezdjjld.supabase.co/rest/v1/applications?user_id=eq.${AppData.user.id}&order=created_at.desc`, {
            headers: {
                'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZzdWhwamx5em9qaW9lemRqamxkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcyMjIxNDksImV4cCI6MjA5Mjc5ODE0OX0.IkNVBJrpPKCuW9cKfuRNMWCa2mqjuerYWNUhuDdunlM',
                'Authorization': `Bearer ${session.access_token}`
            }
        });
        
        const applications = response.ok ? await response.json() : [];
        console.log('📝 Loaded applications for', AppData.user.email, ':', applications);
        
        if (!applications || applications.length === 0) {
            container.innerHTML = `
                <div class="empty-state-profile">
                    <div class="empty-icon">📭</div>
                    <h3>No applications yet</h3>
                    <p>Find and apply to opportunities that match your skills</p>
                    <a href="opportunities.html" class="cta-button primary">Find Opportunities</a>
                </div>
            `;
            document.getElementById('applied-count').textContent = '(0)';
            return;
        }
        
        // Map applications by job_id and job title so we can match Supabase apps to loaded opportunities
        const appByJobId = {};
        const appByTitle = {};
        applications.forEach(app => {
            if (app.job_id) appByJobId[app.job_id] = app;
            if (app.job_title) appByTitle[app.job_title] = app;
        });
        
        // Find all applied opportunities based on Supabase job references
        const applied = AppData.opportunities.filter(opp => {
            return Boolean(appByJobId[opp._dbId] || appByTitle[opp.title]);
        });
    
    console.log('Found applied opportunities:', applied);

    // Update applied stats from Supabase results
    const appliedCount = applications.length;
    const statOppsEl = document.getElementById('stat-opportunities');
    if (statOppsEl) statOppsEl.textContent = appliedCount;
    const journeyAppliedEl = document.getElementById('journey-applied');
    if (journeyAppliedEl) journeyAppliedEl.textContent = appliedCount;
    
    if (applied.length === 0) {
        container.innerHTML = `
            <div class="empty-state-profile">
                <div class="empty-icon">📭</div>
                <h3>No applications yet</h3>
                <p>Find and apply to opportunities that match your skills</p>
                <a href="opportunities.html" class="cta-button primary">Find Opportunities</a>
            </div>
        `;
        document.getElementById('applied-count').textContent = '(0)';
        return;
    }
    
    document.getElementById('applied-count').textContent = '(' + applied.length + ')';
    
    container.innerHTML = applied.map(opp => {
        const app = appByJobId[opp._dbId] || appByTitle[opp.title] || { status: 'pending' };
        const status = app.status || 'pending';
        const statusIcon = status === 'accepted' || status === 'approved' ? '✓' : 
                          status === 'rejected' ? '✗' : '⏳';
        const statusLabel = status === 'accepted' || status === 'approved' ? 'Accepted' :
                           status === 'rejected' ? 'Rejected' : 'Pending';
        
        return `
        <div class="opportunity-card" style="margin-bottom: 1rem;">
            <div class="opportunity-header">
                <div style="display: flex; justify-content: space-between; align-items: start;">
                    <div>
                        <h3 style="font-size: 1.2rem;">${opp.title}</h3>
                        <p class="opportunity-company">${opp.company}</p>
                    </div>
                    <span class="application-status-badge ${status}">
                        ${statusIcon} ${statusLabel}
                    </span>
                </div>
            </div>
            
            <div class="opportunity-body">
                <p class="opportunity-description">${opp.description || ''}</p>
                
                <div class="opportunity-meta">
                    <div class="meta-item">
                        <span class="meta-icon">📍</span>
                        <span>${opp.location}</span>
                    </div>
                    <div class="meta-item">
                        <span class="meta-icon">💼</span>
                        <span>${opp.type}</span>
                    </div>
                </div>
                
                <div class="opportunity-tags">
                    <span class="tag type">${opp.type}</span>
                    <span class="tag location">📍 ${opp.location}</span>
                    ${status === 'accepted' || status === 'approved' ? 
                        `<span class="tag" style="background: #10b981; color: white;">✓ Accepted</span>` :
                        `<span class="tag" style="background: #f59e0b; color: white;">⏳ Applied</span>`
                    }
                </div>
                
                <div class="opportunity-footer">
                    <a href="opportunities.html" class="opportunity-btn primary">View Details</a>
                    <a href="opportunities.html" class="opportunity-btn">Browse More</a>
                </div>
            </div>
        </div>
    `}).join('');
  } catch (error) {
      console.error('Error loading applied opportunities:', error);
      container.innerHTML = `
          <div class="empty-state-profile">
              <div class="empty-icon">⚠</div>
              <h3>Could not load applications</h3>
              <p>Please refresh the page or try again later.</p>
          </div>
      `;
      document.getElementById('applied-count').textContent = '(0)';
  }
}

function openEditProfileModal() {
    const modal = document.getElementById('edit-profile-modal');
    
    // Populate form with current data
    document.getElementById('edit-name').value = AppData.user.name;
    document.getElementById('edit-email').value = AppData.user.email;
    document.getElementById('edit-bio').value = AppData.user.bio || '';
    
    modal.classList.add('active');
}

function closeEditModal() {
    const modal = document.getElementById('edit-profile-modal');
    modal.classList.remove('active');
}

function handleEditProfile(e) {
    e.preventDefault();
    
    // Update user data
    AppData.user.name = document.getElementById('edit-name').value.trim();
    AppData.user.email = document.getElementById('edit-email').value.trim();
    AppData.user.bio = document.getElementById('edit-bio').value.trim();
    
    // Save to storage
    Storage.save();
    
    // Reload profile data
    loadProfileData();
    updateUserDisplay();
    
    // Close modal
    closeEditModal();
    
    // Show notification
    Utils.showNotification('Profile updated successfully!');
}

// ─── FILE DOWNLOADS & SUBMISSIONS ───

async function fetchUserApplications() {
    try {
        const session = Auth.getSession();
        if (!session || !AppData.user.id) return [];
        const response = await fetch(`https://fsuhpjlyzojioezdjjld.supabase.co/rest/v1/applications?user_id=eq.${AppData.user.id}&order=created_at.desc`, {
            headers: {
                'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZzdWhwamx5em9qaW9lemRqamxkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcyMjIxNDksImV4cCI6MjA5Mjc5ODE0OX0.IkNVBJrpPKCuW9cKfuRNMWCa2mqjuerYWNUhuDdunlM',
                'Authorization': `Bearer ${session.access_token}`
            }
        });
        return response.ok ? await response.json() : [];
    } catch (error) {
        console.error('Error fetching user applications:', error);
        return [];
    }
}

async function loadWorkFilesAndSubmissions() {
    // Only show section if there are accepted opportunities in Supabase
    const applications = await fetchUserApplications();
    const acceptedApps = applications.filter(app => app.status === 'accepted' || app.status === 'approved');
    
    const workFilesSection = document.getElementById('work-files-section');
    
    if (acceptedApps.length === 0) {
        if (workFilesSection) workFilesSection.style.display = 'none';
        return;
    }
    
    if (workFilesSection) workFilesSection.style.display = 'block';
    
    loadDownloadableFiles(acceptedApps);
    loadSubmissionForm(acceptedApps);
    loadSubmissionHistory();
}

function loadDownloadableFiles(acceptedApps) {
    const filesList = document.getElementById('downloadable-files-list');
    const oppsFiles = JSON.parse(localStorage.getItem('opportunity_files')) || {};
    
    let files = [];
    
    acceptedApps.forEach(app => {
        const jobId = app.job_id;  // Supabase uses job_id (UUID)
        if (oppsFiles[jobId]) {
            oppsFiles[jobId].forEach(file => {
                files.push({
                    ...file,
                    jobTitle: app.job_title,  // Supabase uses job_title
                    jobId: jobId
                });
            });
        }
    });
    
    if (files.length === 0) {
        filesList.innerHTML = `
            <div class="empty-state-profile" style="text-align: center; padding: 20px;">
                <p>No files uploaded yet. Check back soon!</p>
            </div>
        `;
        return;
    }
    
    filesList.innerHTML = files.map(file => `
        <div class="file-download-card">
            <div class="file-download-info">
                <div class="file-download-icon">📄</div>
                <div class="file-download-details">
                    <div class="file-name">${file.name}</div>
                    <div class="file-meta">
                        From: <strong>${file.jobTitle}</strong> • Size: ${(file.size / 1024).toFixed(2)} KB
                    </div>
                </div>
            </div>
            <button class="btn-download-file" onclick="downloadWorkFile('${file.id}', '${file.jobId}')">
                📥 Download
            </button>
        </div>
    `).join('');
}

function downloadWorkFile(fileId, jobId) {
    const oppsFiles = JSON.parse(localStorage.getItem('opportunity_files')) || {};
    const file = oppsFiles[jobId]?.find(f => f.id === fileId);
    
    if (!file) {
        alert('File not found');
        return;
    }
    
    const link = document.createElement('a');
    link.href = file.data;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    Utils.showNotification(`Downloaded: ${file.name}`);
}

function loadSubmissionForm(acceptedApps) {
    const form = document.getElementById('work-submission-form');
    const noAppsMsg = document.getElementById('no-applications-message');
    const jobSelect = document.getElementById('submission-job-select');
    
    if (acceptedApps.length === 0) {
        form.style.display = 'none';
        noAppsMsg.style.display = 'block';
        return;
    }
    
    form.style.display = 'block';
    noAppsMsg.style.display = 'none';
    
    // Populate job select with Supabase applications (job_id, job_title)
    jobSelect.innerHTML = '<option value="">-- Choose an opportunity --</option>' + 
        acceptedApps.map(app => `
            <option value="${app.job_id}" data-title="${app.job_title}">
                ${app.job_title}
            </option>
        `).join('');
    
    // Setup file input listeners
    const dropZone = document.getElementById('submission-drop-zone');
    const fileInput = document.getElementById('submission-files');
    
    dropZone.addEventListener('click', () => fileInput.click());
    
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('drag-over');
    });
    
    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('drag-over');
    });
    
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
        handleSubmissionFiles(Array.from(e.dataTransfer.files));
    });
    
    fileInput.addEventListener('change', (e) => {
        handleSubmissionFiles(Array.from(e.target.files));
    });
}

function handleSubmissionFiles(files) {
    const preview = document.getElementById('submission-file-preview');
    const existingFiles = Array.from(preview.querySelectorAll('.submission-file-item')).length;
    
    if (files.length + existingFiles > 10) {
        alert('Maximum 10 files per submission');
        return;
    }
    
    const newHTML = Array.from(files).map((file, idx) => `
        <div class="submission-file-item">
            <div>
                <div class="file-name">📄 ${file.name}</div>
                <div class="file-size">${(file.size / 1024).toFixed(2)} KB</div>
            </div>
            <button type="button" class="btn-remove-file" onclick="this.parentElement.remove()">Remove</button>
        </div>
    `).join('');
    
    preview.innerHTML += newHTML;
}

function submitWork(e) {
    e.preventDefault();
    
    const jobId = document.getElementById('submission-job-select').value;
    const jobTitle = document.getElementById('submission-job-select').selectedOptions[0]?.getAttribute('data-title');
    const notes = document.getElementById('submission-notes').value;
    const fileInput = document.getElementById('submission-files');
    const files = Array.from(fileInput.files);
    
    if (!jobId) {
        alert('Please select an opportunity');
        return;
    }
    
    if (files.length === 0) {
        alert('Please select at least one file');
        return;
    }
    
    // Convert files to base64
    let fileCount = 0;
    const submissionFiles = [];
    
    files.forEach((file, idx) => {
        const reader = new FileReader();
        reader.onload = async function(event) {
            submissionFiles.push({
                id: 'file_' + Date.now() + '_' + idx,
                name: file.name,
                size: file.size,
                type: file.type,
                data: event.target.result
            });
            
            fileCount++;
            if (fileCount === files.length) {
                // All files converted, save submission
                await saveSubmission(jobId, jobTitle, submissionFiles, notes);
            }
        };
        reader.readAsDataURL(file);
    });
}

async function saveSubmission(jobId, jobTitle, files, notes) {
    const session = Auth.getSession();
    if (!session || !AppData.user.id) {
        alert('Please log in to submit work.');
        window.location.href = 'login.html';
        return;
    }

    try {
        const response = await fetch('https://fsuhpjlyzojioezdjjld.supabase.co/rest/v1/submissions', {
            method: 'POST',
            headers: {
                'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZzdWhwamx5em9qaW9lemRqamxkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcyMjIxNDksImV4cCI6MjA5Mjc5ODE0OX0.IkNVBJrpPKCuW9cKfuRNMWCa2mqjuerYWNUhuDdunlM',
                'Authorization': `Bearer ${session.access_token}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify({
                job_id: jobId,
                job_title: jobTitle,
                user_id: AppData.user.id,
                name: AppData.user.name,
                notes: notes,
                files: files,
                status: 'submitted'
            })
        });

        if (!response.ok) {
            console.error('Submission failed:', await response.text());
            alert('Failed to submit work. Please try again.');
            return;
        }

        // Reset form
        document.getElementById('work-submission-form').reset();
        document.getElementById('submission-file-preview').innerHTML = '';
        
        // Reload submissions
        await loadSubmissionHistory();
        
        Utils.showNotification('✓ Work submitted successfully! Admin will review it soon.');
    } catch (error) {
        console.error('Error saving submission:', error);
        alert('Failed to submit work. Please check your connection and try again.');
    }
}

let userSubmissionsCache = [];

async function loadSubmissionHistory() {
    const list = document.getElementById('submissions-history-list');
    const session = Auth.getSession();

    if (!session || !AppData.user.id) {
        list.innerHTML = `
            <div class="empty-state-profile" style="text-align: center; padding: 20px;">
                <p>Log in to see your submissions.</p>
            </div>
        `;
        return;
    }

    try {
        const response = await fetch(`https://fsuhpjlyzojioezdjjld.supabase.co/rest/v1/submissions?user_id=eq.${AppData.user.id}&order=created_at.desc`, {
            headers: {
                'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZzdWhwamx5em9qaW9lemRqamxkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcyMjIxNDksImV4cCI6MjA5Mjc5ODE0OX0.IkNVBJrpPKCuW9cKfuRNMWCa2mqjuerYWNUhuDdunlM',
                'Authorization': `Bearer ${session.access_token}`
            }
        });
        userSubmissionsCache = response.ok ? await response.json() : [];
    } catch (error) {
        console.error('Error loading submissions:', error);
        userSubmissionsCache = [];
    }

    const submissions = userSubmissionsCache;
    
    if (submissions.length === 0) {
        list.innerHTML = `
            <div class="empty-state-profile" style="text-align: center; padding: 20px;">
                <p>No submissions yet. Complete your work and submit it above.</p>
            </div>
        `;
        return;
    }
    
    list.innerHTML = submissions.map(submission => `
        <div class="submission-card-profile">
            <div class="submission-card-header">
                <div>
                    <div class="submission-title">${submission.job_title}</div>
                    <div class="submission-date">
                        Submitted: ${new Date(submission.created_at).toLocaleDateString()}
                    </div>
                </div>
                <span class="submission-status-badge ${submission.status}">
                    ${submission.status === 'reviewed' ? '✓ Reviewed' : 
                      submission.status === 'rejected' ? '✗ Rejected' : '⏳ Submitted'}
                </span>
            </div>
            
            ${submission.notes ? `
                <div class="submission-notes">
                    <strong>Your Notes:</strong><br>${submission.notes}
                </div>
            ` : ''}
            
            ${submission.files && submission.files.length > 0 ? `
                <div class="submission-files-container">
                    <h4>📁 Submitted Files (${submission.files.length})</h4>
                    <div class="submission-file-list">
                        ${submission.files.map(file => `
                            <div class="submission-file-download">
                                <div class="file-info">
                                    <div class="file-icon">📄</div>
                                    <div class="file-detail">
                                        <div class="file-name">${file.name}</div>
                                        <div class="file-size">${(file.size / 1024).toFixed(2)} KB</div>
                                    </div>
                                </div>
                                <button class="btn-download-submission" onclick="downloadSubmittedFile('${submission.id}', '${file.id}')">
                                    📥 Download
                                </button>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
        </div>
    `).join('');
}

function downloadSubmittedFile(submissionId, fileId) {
    const submission = userSubmissionsCache.find(s => s.id === submissionId);
    
    if (!submission) {
        alert('Submission not found');
        return;
    }
    
    const file = submission.files.find(f => f.id === fileId);
    if (!file) {
        alert('File not found');
        return;
    }
    
    const link = document.createElement('a');
    link.href = file.data;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// ─── JOURNEY PROGRESS TRACKING ───

async function loadJourneyProgress() {
    // Applications live in Supabase now, not localStorage — fetch the real data
    const applications = await fetchUserApplications();
    const submissions = userSubmissionsCache;
    
    // Count applied opportunities
    const appliedCount = applications.length;
    
    // Completed = submissions that have been reviewed
    const reviewedSubmissions = submissions.filter(sub => sub.status === 'reviewed');
    const completedCount = reviewedSubmissions.length;
    const reviewedTitles = new Set(reviewedSubmissions.map(sub => sub.job_title));
    
    // In-progress = accepted but NOT already completed/reviewed (avoid double-counting)
    const inProgressCount = applications.filter(app => 
        (app.status === 'accepted' || app.status === 'approved') &&
        !reviewedTitles.has(app.job_title)
    ).length;
    
    // Update the UI
    document.getElementById('journey-applied').textContent = appliedCount;
    document.getElementById('journey-in-progress').textContent = inProgressCount;
    document.getElementById('journey-completed').textContent = completedCount;
    
    // Update progress path indicators
    if (appliedCount > 0) {
        document.getElementById('path-applied').style.background = 'linear-gradient(to right, var(--accent), var(--accent))';
    }
    if (inProgressCount > 0) {
        document.getElementById('path-progress').style.background = 'linear-gradient(to right, var(--accent), var(--accent))';
    }
    if (completedCount > 0) {
        document.getElementById('path-completed').style.background = 'linear-gradient(to right, var(--accent), var(--accent))';
    }
}