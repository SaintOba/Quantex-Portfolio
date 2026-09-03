// Contact Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contact-form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactSubmit);
    }
});

function handleContactSubmit(e) {
    e.preventDefault();
    
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const subject = document.getElementById('subject').value.trim();
    const message = document.getElementById('message').value.trim();
    
    // Validate form
    if (!name || !email || !subject || !message) {
        showFormMessage('Please fill in all required fields.', 'error');
        return;
    }
    
    // Simulate sending message
    // In a real application, this would send to a backend API
    setTimeout(() => {
        // Reset form
        e.target.reset();
        
        // Show success message
        showFormMessage('Thank you for your message! We\'ll get back to you soon.', 'success');
        
        // Show notification
        Utils.showNotification('Message sent successfully!');
    }, 500);
}

function showFormMessage(message, type) {
    const messageDiv = document.getElementById('form-message');
    messageDiv.textContent = message;
    messageDiv.className = `form-message ${type}`;
    
    // Hide after 5 seconds
    setTimeout(() => {
        messageDiv.className = 'form-message';
    }, 5000);
}
