# Space Cloud - Space Tourism CRM Prototype

A refined, accessible, and mobile-first web application prototype for space tourism customer relationship management, built with vanilla HTML, CSS, and JavaScript following modern UI/UX best practices.

## 🚀 Overview

Space Cloud is a comprehensive CRM platform designed specifically for space tourism companies. This prototype demonstrates key functionalities including astronaut record management, medical clearance tracking, flight manifest management, and sales pipeline operations.

## ✨ Key Features

### 🎯 **UI/UX Design Excellence**
- **Mobile-First Design**: Responsive layout that works seamlessly across all devices
- **Accessibility First**: WCAG 2.1 AA compliant with semantic HTML and ARIA attributes
- **Visual Hierarchy**: Clear information architecture with consistent design patterns
- **Touch-Friendly**: Minimum 44px touch targets for mobile interaction
- **Performance Optimized**: Fast loading with optimized assets and efficient CSS

### 👨‍🚀 **Core Functionalities**
- **Astronaut Records**: 360-degree customer profiles with journey timelines
- **Clearance Tracker**: Medical and safety clearance workflows with audit trails
- **Flight Manifest**: Visual seat management and flight scheduling
- **Sales Pipeline**: Specialized sales process for space tourism prospects
- **Waitlist Management**: Lead nurturing and segmentation
- **AI Integration**: AI agents for clearance monitoring and journey synthesis

### 🎨 **Design System**
- **BEM Methodology**: Consistent CSS class naming convention
- **CSS Custom Properties**: Flexible theming with design tokens
- **Dark Mode First**: Optimized for dark environments with light mode support
- **Typography Scale**: Modular typography system for consistent hierarchy
- **Component Library**: Reusable UI components with consistent behavior

## 🛠 Technology Stack

### Frontend
- **HTML5**: Semantic markup with accessibility features
- **CSS3**: Modern CSS with Grid, Flexbox, and Custom Properties
- **Vanilla JavaScript**: No frameworks or dependencies
- **Responsive Design**: Mobile-first approach with progressive enhancement
- **Accessibility**: WCAG 2.1 AA compliance

### Backend
- **Node.js**: Server runtime environment
- **Express**: Web application framework
- **jsforce**: Salesforce API integration library
- **OAuth 2.0**: Client Credentials flow for secure authentication
- **RESTful API**: REST endpoints for Salesforce operations

## 📁 Project Structure

```
Space Cloud/
├── index.html              # Landing page with role selection
├── dashboard.html          # Main dashboard with role-based views
├── astronaut-record.html   # Astronaut profile management
├── clearance-tracker.html  # Medical clearance workflows
├── flight-manifest.html    # Flight scheduling and seat management
├── sales-pipeline.html     # Sales pipeline management
├── waitlist.html          # Waitlist and lead nurturing
├── style.css              # Comprehensive stylesheet with design system
├── script.js              # Shared JavaScript functionality
├── server.js              # Express server with Salesforce integration
├── package.json           # Node.js dependencies
├── Procfile               # Heroku deployment configuration
├── .env.example           # Environment variables template
├── .gitignore             # Git ignore rules
├── test-salesforce.js     # Salesforce connection test script
└── README.md              # This documentation
```

## 🎨 Design System

### Color Palette
- **Primary**: `#6366f1` (Indigo)
- **Secondary**: `#0ea5e9` (Sky Blue)
- **Success**: `#10b981` (Emerald)
- **Warning**: `#f59e0b` (Amber)
- **Danger**: `#ef4444` (Red)
- **Info**: `#06b6d4` (Cyan)

### Typography
- **Font Family**: Inter (with system font fallbacks)
- **Scale**: Modular scale from 12px to 48px
- **Line Heights**: Optimized for readability (1.25, 1.5, 1.75)

### Spacing
- **Base Unit**: 8px (0.5rem)
- **Scale**: 4px, 8px, 16px, 24px, 32px, 48px, 64px
- **Consistent**: All spacing follows the 8px grid system

### Components
- **Cards**: Elevated containers with hover effects
- **Buttons**: Multiple variants with consistent touch targets
- **Forms**: Accessible form controls with validation states
- **Tables**: Responsive tables with sticky headers
- **Timelines**: Visual activity tracking
- **Alerts**: Contextual feedback messages

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v14 or higher) and **npm** (v6 or higher)
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Salesforce Connected App with OAuth 2.0 Client Credentials enabled

### Installation

1. **Clone or download the project files**
```bash
git clone <repository-url>
cd Space-Cloud
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure Salesforce credentials**

Create a `.env` file in the root directory (copy from `.env.example`):
```bash
cp .env.example .env
```

Edit `.env` and add your Salesforce credentials:
```env
SALESFORCE_LOGIN_URL=https://loyaltysampleappcom-a-dev-ed.develop.my.salesforce-setup.com
SALESFORCE_CLIENT_ID=your_consumer_key_here
SALESFORCE_CLIENT_SECRET=your_consumer_secret_here
PORT=3000
```

**⚠️ Important**: Never commit the `.env` file to version control. Credentials should be stored as Heroku Config Vars in production.

4. **Test Salesforce connection**
```bash
node test-salesforce.js
```

5. **Start the server**
```bash
npm start
```

6. **Access the application**
- Frontend: http://localhost:3000
- API Health Check: http://localhost:3000/api/health
- Salesforce Test: http://localhost:3000/api/salesforce/test

### Running the Application (Frontend Only)

If you just want to view the frontend without the backend:
```bash
# Simply open index.html in a browser
# Or use a local server for development
python -m http.server 8000
# Then visit http://localhost:8000
```

## 📱 Responsive Design

### Breakpoints
- **Mobile**: 320px - 767px (default)
- **Tablet**: 768px - 1023px
- **Desktop**: 1024px+

### Mobile-First Features
- Touch-friendly interface elements (44px minimum)
- Optimized navigation patterns
- Progressive disclosure of content
- Thumb-zone considerations for important actions

## ♿ Accessibility Features

### WCAG 2.1 AA Compliance
- **Semantic HTML**: Proper heading hierarchy and landmarks
- **ARIA Attributes**: Enhanced screen reader support
- **Keyboard Navigation**: Full keyboard accessibility
- **Focus Management**: Visible focus indicators
- **Color Contrast**: Sufficient contrast ratios
- **Alternative Text**: Descriptive text for non-text content

### Screen Reader Support
- Proper heading structure
- ARIA labels and descriptions
- Semantic landmarks (header, nav, main, aside, footer)
- Form labels and error messages
- Table headers and captions

## 🎯 User Personas

### 👨‍🚀 Experience Architect
- **Focus**: Customer journey optimization
- **Key Features**: Astronaut profiles, communication history, journey timelines
- **Goals**: Enhance astronaut experience and satisfaction

### 🛡️ Guardian of Safety
- **Focus**: Safety and compliance
- **Key Features**: Medical clearances, safety protocols, audit trails
- **Goals**: Ensure safety standards and regulatory compliance

### 💰 Growth Catalyst
- **Focus**: Revenue and business growth
- **Key Features**: Sales pipeline, prospect management, revenue tracking
- **Goals**: Drive business growth and market expansion

## 🔧 Customization

### Theming
The design system uses CSS custom properties for easy theming:

```css
:root {
  --color-primary: #6366f1;
  --color-bg-primary: #0f172a;
  --spacing-md: 1rem;
  /* ... more variables */
}
```

### Adding New Components
Follow the BEM methodology for consistent naming:

```css
.component-name {
  /* Base styles */
}

.component-name__element {
  /* Element styles */
}

.component-name--modifier {
  /* Modifier styles */
}
```

## 📊 Sample Data

The prototype includes realistic sample data for:
- **Astronauts**: 15 astronaut profiles with detailed information
- **Flights**: 8 scheduled flights with seat assignments
- **Clearances**: 12 medical clearance workflows
- **Sales**: 25 prospects in various pipeline stages
- **Waitlist**: 45 interested prospects

## 🔌 Salesforce Integration

### OAuth 2.0 Client Credentials Flow

Space Cloud uses OAuth 2.0 Client Credentials flow for secure server-to-server authentication with Salesforce. This flow is ideal for backend integrations where user interaction is not required.

### API Endpoints

All API endpoints are prefixed with `/api`:

- `GET /api/health` - Health check endpoint
- `GET /api/salesforce/test` - Test Salesforce connection
- `GET /api/salesforce/org` - Get organization information
- `POST /api/salesforce/query` - Execute SOQL queries
- `POST /api/salesforce/create` - Create Salesforce records
- `PUT /api/salesforce/update/:id` - Update Salesforce records
- `GET /api/salesforce/objects` - List all available objects
- `GET /api/salesforce/objects/:sobjectType` - Get object metadata

### Example API Usage

**Test Connection:**
```bash
curl http://localhost:3000/api/salesforce/test
```

**Query Records:**
```bash
curl -X POST http://localhost:3000/api/salesforce/query \
  -H "Content-Type: application/json" \
  -d '{"soql": "SELECT Id, Name FROM Account LIMIT 10"}'
```

**Create Record:**
```bash
curl -X POST http://localhost:3000/api/salesforce/create \
  -H "Content-Type: application/json" \
  -d '{
    "sobjectType": "Account",
    "record": {
      "Name": "Space Tourism Corp"
    }
  }'
```

### Heroku Deployment

1. **Set Heroku Config Vars** (never commit credentials):
```bash
heroku config:set SALESFORCE_CLIENT_ID=your_consumer_key
heroku config:set SALESFORCE_CLIENT_SECRET=your_consumer_secret
heroku config:set SALESFORCE_LOGIN_URL=https://your-instance.salesforce.com
```

2. **Deploy to Heroku:**
```bash
git push heroku main
```

3. **Verify deployment:**
```bash
heroku open
curl https://your-app.herokuapp.com/api/salesforce/test
```

### Security Best Practices

- ✅ **Never commit credentials** to version control
- ✅ **Use environment variables** for all sensitive data
- ✅ **Store credentials in Heroku Config Vars** for production
- ✅ **Use HTTPS** for all API calls in production
- ✅ **Implement rate limiting** for production deployments
- ✅ **Monitor access tokens** and implement token refresh logic

## 🔮 Future Enhancements

### Planned Features
- **Real-time Collaboration**: Multi-user editing capabilities
- **Advanced Analytics**: Detailed reporting and insights
- **Mobile App**: Native mobile application
- **Advanced AI**: Machine learning for predictive insights
- **Salesforce Data Sync**: Real-time bidirectional data synchronization

### Technical Improvements
- **Service Workers**: Offline functionality
- **Progressive Web App**: Installable web application
- **Performance**: Further optimization for Core Web Vitals
- **Testing**: Comprehensive automated testing suite

## 🧪 Testing

### Browser Compatibility
- **Chrome**: 90+
- **Firefox**: 88+
- **Safari**: 14+
- **Edge**: 90+

### Testing Checklist
- [ ] Responsive design across devices
- [ ] Keyboard navigation
- [ ] Screen reader compatibility
- [ ] Touch interaction on mobile
- [ ] Performance on slow connections
- [ ] Color contrast compliance

## 📈 Performance

### Optimizations
- **CSS**: Efficient selectors and minimal specificity
- **JavaScript**: Modular code with lazy loading
- **Images**: Optimized SVGs and minimal external assets
- **Fonts**: System font fallbacks for faster loading

### Core Web Vitals
- **LCP**: Optimized for fast loading
- **FID**: Smooth interactions
- **CLS**: Stable layout with no content shifts

## 🤝 Contributing

### Development Guidelines
1. Follow BEM methodology for CSS
2. Maintain accessibility standards
3. Test across multiple devices
4. Use semantic HTML
5. Optimize for performance

### Code Style
- **HTML**: Semantic and accessible
- **CSS**: BEM methodology with custom properties
- **JavaScript**: Modular and well-documented

## 📄 License

This project is a prototype demonstration. For commercial use, please contact the development team.

## 🆘 Support

For questions or issues:
1. Check the browser console for errors
2. Ensure you're using a modern browser
3. Verify all files are in the same directory
4. Try refreshing the page

## 🎉 Acknowledgments

- **Design Inspiration**: Modern space tourism and aviation interfaces
- **Accessibility**: WCAG guidelines and best practices
- **Typography**: Inter font family by Google Fonts
- **Icons**: Emoji-based icons for simplicity and accessibility

---

**Space Cloud** - The future of space tourism CRM management, built with modern web standards and accessibility in mind.
