# DevBridge - Turn Your Skills Into Real World Experience

A fully functional multi-page website that helps learners connect their skills with real-world opportunities.

## Features

### 🏠 Home Page (index.html)
- Hero section with call-to-action buttons
- Statistics showcase
- How it works section
- Responsive design

### 📚 My Skills Page (my-skills.html)
- Add new skills with details (name, category, level, source, description)
- View all your skills in a card layout
- Search and filter skills by name or category
- Delete skills you no longer want to track
- Real-time skill count

### 🎯 Opportunities Page (opportunities.html)
- Browse 10+ pre-loaded opportunities
- Advanced filtering (type, skill category, location)
- Search functionality
- View all opportunities or only those matched to your skills
- Match percentage calculation based on your skills
- Detailed opportunity view in modal
- Apply to opportunities
- Track applied opportunities

### 👤 Profile Page (profile.html)
- View your profile information
- Edit profile (name, email, bio)
- See statistics (skills added, opportunities applied, matches found)
- View your skills summary
- See recommended opportunities based on your skills
- Track applied opportunities

### 📞 Contact Page (contact.html)
- Contact form with validation
- Company information display
- FAQ section
- Success/error message feedback

### ℹ️ About Page (about.html)
- Mission statement
- What we do
- Why DevBridge
- Company story

## Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Storage**: LocalStorage for data persistence
- **Design**: Responsive, mobile-first design
- **No dependencies**: Pure vanilla JavaScript, no frameworks required

## How It Works

1. **Add Your Skills**: Navigate to "My Skills" and add the skills you've learned with details about proficiency and where you learned them.

2. **Smart Matching**: The system automatically calculates match percentages between your skills and available opportunities.

3. **Browse Opportunities**: Go to "Opportunities" to see all available positions. Filter by type, location, or skill category.

4. **View Matches**: Click "Show My Matches" to see opportunities that match your skills, sorted by match percentage.

5. **Apply**: Click on any opportunity to view details and apply. Your applications are tracked in your profile.

6. **Track Progress**: Visit your profile to see statistics and recommendations.

## Data Persistence

All data is stored in the browser's LocalStorage:
- User profile information
- Added skills
- Applied opportunities
- Match calculations

Data persists across browser sessions but is specific to each browser/device.

## Pre-loaded Opportunities

The website comes with 10 diverse opportunities across different categories:
- Programming (Frontend, Full Stack, Mobile Development)
- Design (UI/UX, Graphic Design)
- Marketing (Social Media, SEO)
- Data Science (Data Analysis)
- Business (Business Analysis)
- Writing (Content Creation)

## File Structure

```
devbridge-site/
├── index.html              # Home page
├── my-skills.html          # Skills management page
├── opportunities.html      # Opportunities browsing page
├── profile.html           # User profile page
├── about.html             # About page
├── contact.html           # Contact page
├── styles.css             # Main stylesheet
├── app.js                 # Core application logic
├── skills.js              # Skills page functionality
├── opportunities.js       # Opportunities page functionality
├── profile.js             # Profile page functionality
├── contact.js             # Contact page functionality
└── README.md              # This file
```

## Getting Started

1. Open `index.html` in a web browser
2. Navigate to "My Skills" to add your first skill
3. Browse opportunities and see how they match your skills
4. Apply to opportunities you're interested in
5. Check your profile to track your progress

## Browser Compatibility

Works on all modern browsers:
- Chrome/Edge (recommended)
- Firefox
- Safari
- Opera

## Features in Detail

### Smart Matching Algorithm
The matching system compares your skills with required skills for each opportunity:
- Calculates percentage match
- Shows match score on opportunity cards
- Sorts matched opportunities by relevance
- Updates automatically when you add/remove skills

### Responsive Design
- Mobile-friendly navigation
- Adaptive layouts for all screen sizes
- Touch-friendly buttons and interactions
- Optimized for tablets and smartphones

### User Experience
- Real-time search and filtering
- Instant notifications for actions
- Modal dialogs for detailed views
- Empty states with helpful guidance
- Form validation with clear error messages

## Future Enhancements

Potential features for future versions:
- User authentication
- Backend API integration
- Email notifications
- Resume/portfolio upload
- Messaging system
- Company profiles
- Skill endorsements
- Achievement badges

## Credits

Created for the DevBridge platform to help learners bridge the gap between learning and real-world experience.

## License

This is a demonstration project. Feel free to use and modify as needed.
