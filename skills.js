// Skills Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Load and display skills
    displaySkills();
    updateSkillsCount();
    
    // Form submission
    const form = document.getElementById('add-skill-form');
    if (form) {
        form.addEventListener('submit', handleAddSkill);
    }
    
    // Search and filter
    const searchInput = document.getElementById('search-skills');
    const filterCategory = document.getElementById('filter-category');
    
    if (searchInput) {
        searchInput.addEventListener('input', filterSkills);
    }
    
    if (filterCategory) {
        filterCategory.addEventListener('change', filterSkills);
    }
});

function handleAddSkill(e) {
    e.preventDefault();
    
    const skillName = document.getElementById('skill-name').value.trim();
    const skillCategory = document.getElementById('skill-category').value;
    const skillLevel = document.getElementById('skill-level').value;
    const skillSource = document.getElementById('skill-source').value.trim();
    const skillDescription = document.getElementById('skill-description').value.trim();
    
    // Create skill object
    const newSkill = {
        id: Utils.generateId(),
        name: skillName,
        category: skillCategory,
        level: skillLevel,
        source: skillSource,
        description: skillDescription,
        dateAdded: new Date().toISOString()
    };
    
    // Add to app data
    AppData.skills.push(newSkill);
    Storage.save();
    Storage.calculateMatches();
    
    // Reset form
    e.target.reset();
    
    // Refresh display
    displaySkills();
    updateSkillsCount();
    
    // Show notification
    Utils.showNotification('Skill added successfully!');
}

function displaySkills(skillsToShow = null) {
    const container = document.getElementById('skills-container');
    const skills = skillsToShow || AppData.skills;
    
    if (skills.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📚</div>
                <h3>No skills added yet</h3>
                <p>Add your first skill above to get matched with opportunities!</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = skills.map(skill => `
        <div class="skill-card" data-skill-id="${skill.id}">
            <div class="skill-card-header">
                <div>
                    <h3>${skill.name}</h3>
                    <span class="skill-category">${skill.category}</span>
                    <span class="skill-level">${skill.level}</span>
                </div>
            </div>
            ${skill.source ? `<p class="skill-source">📖 Learned from: ${skill.source}</p>` : ''}
            ${skill.description ? `<p class="skill-description">${skill.description}</p>` : ''}
            <div class="skill-actions">
                <button class="btn-delete" onclick="deleteSkill('${skill.id}')">Delete</button>
            </div>
        </div>
    `).join('');
}

function deleteSkill(skillId) {
    if (confirm('Are you sure you want to delete this skill?')) {
        AppData.skills = AppData.skills.filter(s => s.id !== skillId);
        Storage.save();
        Storage.calculateMatches();
        displaySkills();
        updateSkillsCount();
        Utils.showNotification('Skill deleted successfully!');
    }
}

function filterSkills() {
    const searchTerm = document.getElementById('search-skills').value.toLowerCase();
    const categoryFilter = document.getElementById('filter-category').value;
    
    let filtered = AppData.skills;
    
    // Filter by search term
    if (searchTerm) {
        filtered = filtered.filter(skill => 
            skill.name.toLowerCase().includes(searchTerm) ||
            skill.description.toLowerCase().includes(searchTerm)
        );
    }
    
    // Filter by category
    if (categoryFilter) {
        filtered = filtered.filter(skill => skill.category === categoryFilter);
    }
    
    displaySkills(filtered);
}

function updateSkillsCount() {
    const countElement = document.getElementById('skills-count');
    if (countElement) {
        countElement.textContent = AppData.skills.length;
    }
}
