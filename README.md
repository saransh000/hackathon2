# CureMind - AI Healthcare Triage Platform

A comprehensive healthcare triage platform with AI-powered symptom analysis, personalized recommendations, and complete administrative management.

## 🌟 Project Overview

CureMind is a modern healthcare platform that provides:
- **AI-Powered Symptom Analysis**: Intelligent triage system for health concerns
- **Personalized Recommendations**: Home remedies, doctor visits, or emergency alerts
- **Data-Driven Health Insights**: Analytics and tracking for better health outcomes
- **Complete Admin Management**: Full-featured admin dashboard for platform oversight

## 📁 Project Structure

```
├── index.html          # Login page
├── styles.css          # Login page styles
├── script.js           # Login authentication logic
├── dashboard.html      # User dashboard (Triage Bot)
├── dashboard.css       # User dashboard styles
├── dashboard.js        # User dashboard functionality
├── admin.html          # Admin dashboard
├── admin.css           # Admin dashboard styles
├── admin.js            # Admin dashboard functionality
└── README.md           # Project documentation
```

## 🔐 Login Credentials

### Admin Access
- **Username**: `admin`
- **Password**: `CureMind2025Admin!Secure`
- **Access**: Full admin dashboard with analytics, AI monitoring, content management, and user management

### Regular User Access
Regular Users:
Username: john_doe
Password: password123

Username: jane_smith
Password: password123

## 🚀 Getting Started

### Option 1: Local HTTP Server (Recommended)

1. **Using Python**:
   ```bash
   cd path/to/newhackthon2
   python -m http.server 8000
   ```

2. **Open in browser**:
   - Main Login: `http://localhost:8000`
   - Or directly: `http://localhost:8000/index.html`

### Option 2: Direct File Opening
Simply open `index.html` in your web browser (some features may be limited)

## 🎯 Features

### 1. Login System
- **Smart Routing**: Automatically routes admin users to admin dashboard and regular users to user dashboard
- **Session Management**: Secure session handling with localStorage
- **Remember Me**: Option to save login credentials
- **Access Control**: Protected dashboards with session validation

### 2. User Dashboard (AI Triage Bot)
- ✅ **Personalized Welcome**: Greets users by name
- ✅ **Symptom Input**: Large text area for describing health concerns
- ✅ **AI Analysis**: Intelligent symptom analysis with recommendations
- ✅ **Three-Tier Triage**:
  - 🏠 Home Remedy: Self-care suggestions
  - 👨‍⚕️ Doctor Visit: Professional consultation needed
  - 🚨 Emergency: Immediate medical attention required
- ✅ **Quick Access Buttons**: Emergency help, connect with doctor, find pharmacy
- ✅ **Consultation History**: Track past symptom checks and recommendations
- ✅ **User Profile**: Display age, gender, and health information

### 3. Admin Dashboard
- ✅ **Overview Section**:
  - System status (Online/Degraded/Offline)
  - Key metrics (Active Users, Sign-ups, Triage Analyses, Emergency Alerts)
  - Critical alerts and notifications
  - Real-time activity charts

- ✅ **Usage Analytics**:
  - Interactive user activity graphs (24h/7days/30days)
  - Geographic distribution visualization
  - Top symptoms tracking
  - Engagement metrics

- ✅ **AI Model Monitoring**:
  - Recommendation distribution (Home/Doctor/Emergency)
  - Model performance stats (accuracy, response time, version)
  - Unrecognized symptoms log
  - User feedback analysis (ratings and satisfaction)

- ✅ **Content Management System (CMS)**:
  - Symptom & condition database editor
  - Recommendation editor (edit advice for each triage level)
  - Disclaimer management
  - Search and filter functionality

- ✅ **User Management**:
  - Complete user table with search and filters
  - User actions (view details, reset password, deactivate)
  - Pagination for large datasets
  - Export user data

## 🎨 Design Features

- **Modern UI/UX**: Clean, intuitive interface with gradient designs
- **Responsive**: Works on desktop, tablet, and mobile devices
- **Smooth Animations**: Engaging transitions and interactions
- **Color-Coded Alerts**: Visual hierarchy for different severity levels
- **Interactive Charts**: Powered by Chart.js for data visualization
- **Font Awesome Icons**: Professional iconography throughout

## 🔧 Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Charts**: Chart.js for data visualization
- **Icons**: Font Awesome 6.0
- **Storage**: LocalStorage for session management
- **No Backend Required**: Fully functional frontend demo

## 📊 How the AI Triage Works

The system uses keyword-based analysis (can be replaced with actual AI API):

1. **User Input**: User describes symptoms in natural language
2. **Analysis**: System analyzes for emergency keywords, severity indicators
3. **Classification**: Determines if Home Remedy, Doctor Visit, or Emergency
4. **Recommendation**: Provides specific, actionable advice
5. **History**: Saves consultation for future reference

### Emergency Keywords (triggers immediate alert):
- Chest pain, difficulty breathing, severe bleeding, unconsciousness, etc.

### Doctor Visit Keywords:
- Persistent symptoms, fever for days, severe pain, etc.

### Home Remedy (default):
- Mild symptoms, common ailments, general discomfort

## 🔒 Security Features

- Session validation on page load
- Role-based access control (admin vs user)
- Automatic redirection if unauthorized
- Logout clears all session data
- Protected routes for both dashboards

## 🌐 Browser Compatibility

- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)
- ✅ Opera (latest)

## 📝 Future Enhancements

### Backend Integration
- Real AI/ML model for symptom analysis
- Database for user management
- Secure authentication with JWT
- RESTful API for data operations

### Additional Features
- Email notifications for critical alerts
- SMS/WhatsApp integration for emergency contacts
- Telemedicine video consultation
- Prescription management
- Health tracking and trends
- Multi-language support
- Dark mode

### Advanced AI
- Natural Language Processing (NLP)
- Machine Learning for better accuracy
- Integration with medical databases
- Continuous learning from user feedback

## 🤝 Contributing

This is a hackathon project. Feel free to fork and enhance!

## 📄 License

Developed for CureMind Hackathon 2025

## 👨‍💻 Developer Notes

### Customizing Admin Credentials

Edit `script.js` to change admin credentials:

```javascript
const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: 'admin123'
};
```

### Adding More Admin Accounts

You can extend the system to support multiple admin accounts by modifying the authentication logic.

### Integrating Real AI

Replace the `performAIAnalysis()` function in `dashboard.js` with actual API calls to:
- Google Health AI
- OpenAI GPT-4
- Custom ML models
- Medical API services

## 📞 Support

For questions or issues, please open an issue on GitHub.

---

**CureMind** - Symptom Analysis, Personalized Cures, Data-Driven Health Insights

