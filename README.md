# Stream - Modern Video Communication Platform

A cutting-edge, feature-rich video communication platform built with React 18, TypeScript, and WebRTC. Stream provides a comprehensive solution for modern video communication including webinars, one-on-one calls, and group meetings with advanced features like real-time transcription, sign language detection, collaborative documents, intelligent waiting rooms, and seamless screen sharing.

## ✨ Key Highlights

- **🚀 Production Ready**: Deployed on Netlify with automated CI/CD
- **🔐 Secure**: WebRTC peer-to-peer connections with optional authentication
- **📱 Responsive**: Works seamlessly on desktop, tablet, and mobile devices
- **🎨 Modern UI**: Clean, intuitive interface with dark/light mode support
- **⚡ Fast**: Built with Vite for lightning-fast development and builds
- **🧩 Modular**: Component-based architecture for easy customization

## 🚀 Features

### Core Video Communication
- **One-on-One Calls**: Private HD video calls with crystal-clear audio
- **Group Calls**: Multi-participant meetings supporting up to 50 users
- **Webinars**: Large-scale presentations with presenter/attendee roles and audience management
- **Screen Sharing**: Share entire screen or specific applications with high quality
- **Recording**: Local meeting recording with download capabilities

### Advanced Communication Features
- **Real-time Transcription**: AI-powered speech-to-text with confidence scoring and speaker identification
- **Sign Language Detection**: Computer vision-powered sign language recognition and translation
- **Live Chat**: Real-time messaging during calls with file sharing support
- **Collaborative Documents**: Shared document editing with real-time collaboration
- **Interactive Whiteboard**: Digital whiteboard for visual collaboration

### Smart Meeting Management
- **Waiting Room System**: Intelligent host-controlled waiting room with notifications
- **Participant Controls**: Advanced participant management with role-based permissions
- **Meeting Scheduler**: Built-in meeting scheduling with calendar integration
- **Quality Controls**: Adjustable video quality (720p, 1080p, 4K) and audio levels
- **Call Dashboard**: Comprehensive call statistics and duration tracking

### User Experience Excellence
- **Responsive Design**: Adaptive layouts for all screen sizes
- **Dark/Light Mode**: Toggle between themes for optimal viewing comfort
- **Toast Notifications**: Real-time feedback and status updates
- **Floating Controls**: Easy-to-access control panel that doesn't obstruct content
- **Performance Optimized**: Code splitting and lazy loading for fast initial loads

## 🛠️ Technology Stack

### Frontend Architecture
- **React 18**: Latest React with concurrent features and Suspense
- **TypeScript**: Full type safety and enhanced developer experience
- **Vite**: Ultra-fast build tool with HMR and optimized bundling

### UI/UX Technologies
- **Tailwind CSS**: Utility-first CSS framework for rapid styling
- **Lucide React**: Beautiful, customizable icon library
- **Framer Motion**: Smooth animations and transitions
- **React Hot Toast**: Elegant notification system

### State & Data Management
- **Zustand**: Lightweight, powerful state management
- **React Router DOM**: Client-side routing with lazy loading

### Real-time Communication
- **WebRTC**: Native browser APIs for peer-to-peer communication
- **Simple Peer**: WebRTC wrapper for easier implementation
- **Socket.io Client**: Real-time bidirectional communication

### Media & Files
- **React Webcam**: Camera access and control
- **React Dropzone**: Drag-and-drop file uploads

### Development Tools
- **ESLint**: Code linting with React hooks rules
- **TypeScript ESLint**: TypeScript-specific linting
- **Terser**: JavaScript minification for production builds

## 📦 Installation & Setup

### Prerequisites
- **Node.js 18+**: Download from [nodejs.org](https://nodejs.org/)
- **Git**: For cloning the repository
- **Modern Browser**: Chrome 80+, Firefox 75+, Safari 13+, or Edge 80+

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/onyangojerry/Stream.git
   cd Stream
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

### Build for Production

```bash
# Create optimized production build
npm run build

# Preview production build locally
npm run preview
```

### Development Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Create production build with optimizations
- `npm run lint` - Run ESLint for code quality checks
- `npm run preview` - Preview production build locally

## 🎯 Usage Guide

### Getting Started

#### Creating Your First Meeting

1. **Navigate to Home Page**: Access the main dashboard
2. **Choose Meeting Type**:
   - **One-on-One Call**: For private conversations
   - **Group Call**: For team meetings (up to 50 participants)
   - **Webinar**: For presentations and large audiences
3. **Grant Permissions**: Allow camera and microphone access when prompted
4. **Start Meeting**: Click "Start Call" to begin

#### Joining an Existing Meeting

1. **Get Meeting Link**: Receive invitation link from meeting host
2. **Click Link**: Opens in waiting room (if enabled by host)
3. **Wait for Approval**: Host will approve your entry
4. **Join Meeting**: Automatically connected once approved

### Core Features Usage

#### Video & Audio Controls
- **🎤 Mute/Unmute**: Toggle microphone (Space bar shortcut)
- **📹 Camera On/Off**: Toggle video feed
- **🔊 Audio Settings**: Adjust microphone and speaker levels
- **🎬 Video Quality**: Switch between 720p, 1080p, and 4K

#### Screen Sharing
- **Start Sharing**: Click monitor icon, select screen/window/tab
- **Share Options**: Entire screen, application window, or browser tab
- **Stop Sharing**: Click monitor icon again or use browser stop sharing button

#### Real-time Features
- **💬 Live Chat**: Send messages, share files, emoji reactions
- **📝 Transcription**: Toggle speech-to-text, download transcripts
- **🤝 Sign Language**: Enable sign language detection and translation
- **📄 Collaborative Docs**: Create and edit shared documents

#### Meeting Management
- **👥 Participants**: View attendee list, manage permissions
- **⏱️ Duration**: Track meeting time with built-in timer
- **⏺️ Recording**: Start/stop local recording, download files
- **🚪 Waiting Room**: Manage attendee approval queue

### Advanced Features

#### Host Controls
- **Participant Management**: Mute all, remove participants, assign roles
- **Waiting Room**: Enable/disable, approve/reject attendees in bulk
- **Meeting Settings**: Control recording permissions, chat settings
- **Share Meeting**: Generate and share meeting links instantly

#### Transcription System
The platform offers three transcription modes:

1. **Speech Transcription**:
   - Real-time speech-to-text conversion
   - Speaker identification and timestamps
   - Confidence scoring for accuracy
   - Downloadable transcripts in .txt format

2. **Sign Language Detection**:
   - Computer vision-powered gesture recognition
   - Real-time sign language translation
   - Visual indicators for detected signs

3. **Combined Mode**:
   - Both speech and sign language detection
   - Comprehensive accessibility support
   - Unified transcript output

#### Quality & Performance
- **Adaptive Quality**: Automatic quality adjustment based on connection
- **Manual Override**: Force specific video quality settings
- **Performance Monitoring**: Real-time connection quality indicators
- **Bandwidth Optimization**: Smart compression and streaming protocols

## ⚙️ Configuration & Customization

### Environment Variables
Create a `.env` file in the root directory for custom configuration:

```env
# Application Settings
VITE_APP_NAME=Stream
VITE_APP_VERSION=2.0.0

# Optional: Custom branding
VITE_APP_LOGO_URL=https://yourdomain.com/logo.png
VITE_APP_PRIMARY_COLOR=#3B82F6

# WebRTC Configuration (Optional)
VITE_STUN_SERVERS=stun:stun.l.google.com:19302

# Feature Toggles
VITE_ENABLE_TRANSCRIPTION=true
VITE_ENABLE_SIGN_LANGUAGE=true
VITE_ENABLE_COLLABORATIVE_DOCS=true
```

### Customization Options

#### Theme Customization
- **Tailwind Config**: Modify `tailwind.config.js` for colors, fonts, spacing
- **Global Styles**: Update `src/index.css` for base styles
- **Dark Mode**: Built-in dark/light mode toggle with system preference detection

#### Feature Configuration
```typescript
// Configure features in store files
export const CONFIG = {
  maxParticipants: 50,
  recordingEnabled: true,
  transcriptionEnabled: true,
  waitingRoomEnabled: true,
  videoQualityOptions: ['720p', '1080p', '4K']
}
```

#### UI Components
- **Modular Components**: Each UI component is independently customizable
- **Icon System**: Uses Lucide React - easily replaceable icon sets
- **Animation Settings**: Framer Motion configurations in component files

### Advanced Configuration

#### WebRTC Settings
```javascript
const rtcConfig = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    // Add your own TURN servers for production
  ],
  sdpSemantics: 'unified-plan'
}
```

#### Performance Optimization
- **Code Splitting**: Automatic route-based code splitting implemented
- **Bundle Analysis**: Use `npm run build` to see chunk sizes
- **Memory Management**: Automatic cleanup of streams and connections

## 🌍 Browser Support & Compatibility

### Supported Browsers
| Browser | Version | WebRTC | Screen Share | Recording |
|---------|---------|--------|--------------|-----------|
| Chrome  | 80+     | ✅     | ✅          | ✅       |
| Firefox | 75+     | ✅     | ✅          | ✅       |
| Safari  | 13+     | ✅     | ✅          | ⚠️       |
| Edge    | 80+     | ✅     | ✅          | ✅       |

### Mobile Support
- **iOS Safari**: Full support on iOS 13+
- **Android Chrome**: Full support on Android 8+
- **Responsive Design**: Optimized touch interface for mobile devices

### Required Permissions
- **Camera Access**: Required for video calls
- **Microphone Access**: Required for audio communication
- **Screen Recording**: Required for screen sharing (desktop only)
- **Notifications**: Optional, for better user experience

## 🔒 Privacy & Security

### Data Protection
- **No Server Storage**: All communication is peer-to-peer via WebRTC
- **Local Processing**: Video/audio processing happens in browser only
- **No Data Collection**: No user data is stored or transmitted to external services
- **GDPR Compliant**: Designed with European privacy regulations in mind

### Security Features
- **Secure Connections**: All WebRTC connections use DTLS encryption
- **Media Encryption**: SRTP encryption for all audio/video streams
- **Authentication**: Optional user authentication system
- **Meeting Security**: Waiting room and host controls for meeting access

### Privacy Controls
- **Camera/Mic Controls**: Users have full control over media devices
- **Screen Share Permissions**: Explicit permission required for screen sharing
- **Recording Consent**: Clear indication when recording is active
- **Data Retention**: Local storage only, no cloud backup by default

## 🚀 Deployment

### Netlify Deployment (Recommended)

#### One-Click Deploy
[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/onyangojerry/Stream)

#### Manual Netlify Deployment
1. **Build the project**:
   ```bash
   npm run build
   ```

2. **Deploy to Netlify**:
   - Drag and drop the `dist` folder to Netlify dashboard
   - Or connect your Git repository for continuous deployment

#### Automated Deployment
The repository includes:
- **netlify.toml**: Netlify configuration file
- **deploy.sh**: Deployment script for automation
- **_redirects**: SPA routing configuration

### Alternative Deployment Options

#### Vercel
```bash
npm i -g vercel
vercel --prod
```

#### Docker Deployment
```dockerfile
# Dockerfile included in project
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

#### Static Hosting
Build files can be deployed to any static hosting service:
- AWS S3 + CloudFront
- GitHub Pages
- Firebase Hosting
- DigitalOcean App Platform

### Production Considerations
- **HTTPS Required**: WebRTC requires secure connections in production
- **STUN/TURN Servers**: Configure your own servers for reliable connectivity
- **CDN**: Use CDN for better global performance
- **Monitoring**: Set up error tracking and performance monitoring

### Netlify Deployment (Recommended)

This application is configured for easy deployment on Netlify with the included `netlify.toml` configuration file.

#### Option 1: Deploy via Netlify UI (Recommended)

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Connect to Netlify:**
   - Go to [netlify.com](https://netlify.com)
   - Sign up/Login with your GitHub account
   - Click "New site from Git"
   - Choose your repository
   - Set build settings:
     - **Build command:** `npm run build`
     - **Publish directory:** `dist`
   - Click "Deploy site"

#### Option 2: Deploy via Netlify CLI

1. **Install Netlify CLI:**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify:**
   ```bash
   netlify login
   ```

3. **Deploy:**
   ```bash
   netlify deploy --prod
   ```

#### Environment Variables (Optional)

If you need to add environment variables later:
- Go to Site settings > Environment variables
- Add any required environment variables

## 🏗️ Architecture & Project Structure

### Project Layout
```
src/
├── components/          # Reusable UI components
│   ├── CallDashboard.tsx       # Meeting statistics and duration
│   ├── ChatPanel.tsx           # Real-time messaging interface
│   ├── CollaborativeDocument.tsx # Shared document editing
│   ├── ControlButton.tsx       # Styled control buttons
│   ├── ControlPanel.tsx        # Main call controls
│   ├── Layout.tsx              # App layout wrapper
│   ├── MeetingScheduler.tsx    # Meeting scheduling interface
│   ├── ProtectedRoute.tsx      # Authentication wrapper
│   ├── ThemeToggle.tsx         # Dark/light mode toggle
│   ├── TranscriptionPanel.tsx  # Speech/sign language transcription
│   ├── VideoGrid.tsx           # Responsive video layout
│   ├── WaitingRoom.tsx         # Waiting room management
│   └── Whiteboard.tsx          # Interactive whiteboard
├── pages/              # Route components
│   ├── Home.tsx               # Main landing page
│   ├── VideoCall.tsx          # One-on-one call interface
│   ├── GroupCall.tsx          # Group meeting interface
│   ├── Webinar.tsx            # Webinar presentation mode
│   ├── Scheduler.tsx          # Meeting scheduling page
│   ├── Login.tsx              # User authentication
│   └── Signup.tsx             # User registration
├── store/              # State management (Zustand)
│   ├── useAuthStore.ts        # Authentication state
│   ├── useVideoStore.ts       # Video call state and controls
│   ├── useDocumentStore.ts    # Collaborative document state
│   ├── useSchedulerStore.ts   # Meeting scheduling state
│   └── useThemeStore.ts       # Theme preference state
├── types/              # TypeScript type definitions
│   └── index.ts               # All interface definitions
├── utils/              # Helper functions
│   ├── iconLoader.ts          # Dynamic icon loading
│   ├── notifications.ts       # Notification utilities
│   └── performance.ts         # Performance optimization
├── App.tsx             # Main application component
├── main.tsx            # Application entry point
└── index.css           # Global styles
```

### State Management Architecture

#### Zustand Stores
The application uses multiple specialized stores for different features:

- **useVideoStore**: Manages video calls, streams, participants, transcription
- **useAuthStore**: Handles user authentication and profile management
- **useDocumentStore**: Controls collaborative document editing
- **useSchedulerStore**: Manages meeting scheduling and calendar integration
- **useThemeStore**: Controls dark/light mode preferences

#### Data Flow
1. **User Actions** → Component Event Handlers
2. **Event Handlers** → Zustand Store Actions
3. **Store Actions** → State Updates
4. **State Updates** → Component Re-renders
5. **Component Re-renders** → UI Updates

### Component Architecture

#### Design Patterns
- **Container/Presentational**: Pages contain business logic, components handle presentation
- **Compound Components**: Complex components broken into smaller, focused pieces
- **Custom Hooks**: Reusable logic extracted into custom hooks
- **Higher-Order Components**: ProtectedRoute wraps components requiring authentication

#### WebRTC Integration
```typescript
// WebRTC connection flow
initializeConnection() → 
getUserMedia() → 
createPeerConnection() → 
exchangeOffers() → 
establishConnection()
```

## 🤝 Contributing

We welcome contributions from the community! Here's how to get involved:

### Development Setup
1. **Fork the repository** on GitHub
2. **Clone your fork**:
   ```bash
   git clone https://github.com/your-username/Stream.git
   cd Stream
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

### Development Guidelines

#### Code Standards
- **TypeScript**: All new code must be written in TypeScript
- **ESLint**: Follow the established linting rules
- **Prettier**: Use for consistent code formatting
- **Naming**: Use descriptive, camelCase variable names

#### Component Guidelines
```typescript
// Example component structure
interface ComponentProps {
  prop: string;
}

const Component: React.FC<ComponentProps> = ({ prop }) => {
  // Hooks at the top
  const [state, setState] = useState();
  
  // Event handlers
  const handleAction = () => {};
  
  // Render
  return <div>{/* JSX */}</div>;
};
```

#### Testing (Future Enhancement)
- Unit tests for utility functions
- Component testing with React Testing Library
- Integration tests for critical user flows
- E2E tests for complete user journeys

### Pull Request Process
1. **Update Documentation**: Include relevant documentation changes
2. **Add Tests**: Write tests for new functionality (when testing is implemented)
3. **Update README**: Add new features to the feature list
4. **Review Process**: All PRs require review before merging

### Areas for Contribution
- 🐛 **Bug Fixes**: Help fix issues reported by users
- ✨ **New Features**: Add features from the roadmap
- 📚 **Documentation**: Improve documentation and examples
- 🎨 **UI/UX**: Enhance user interface and experience
- ⚡ **Performance**: Optimize application performance
- 🔒 **Security**: Strengthen security measures

## 🆘 Support & Community

### Getting Help
- **📚 Documentation**: Check this README and code comments
- **🐛 Issues**: Create an issue for bugs or feature requests
- **💬 Discussions**: Use GitHub Discussions for questions
- **📧 Contact**: Reach out via the contact information in the repository

### Issue Reporting
When reporting bugs, please include:
- **Browser and version** (Chrome 95, Firefox 92, etc.)
- **Operating system** (Windows 10, macOS 12, Ubuntu 20.04)
- **Steps to reproduce** the issue
- **Expected vs actual behavior**
- **Console errors** (if any)
- **Screenshots/videos** (if helpful)

### Feature Requests
For new feature suggestions:
- Check existing issues to avoid duplicates
- Describe the problem you're trying to solve
- Explain how the feature would work
- Consider implementation complexity
- Provide mockups or examples if possible

## 📄 License & Legal

### MIT License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

### Third-Party Acknowledgments
This project uses several open-source libraries:
- **React & React DOM**: UI framework (MIT License)
- **TypeScript**: Type safety (Apache 2.0 License)
- **Vite**: Build tool (MIT License)
- **Tailwind CSS**: Utility-first CSS (MIT License)
- **Zustand**: State management (MIT License)
- **Framer Motion**: Animations (MIT License)
- **Lucide React**: Icons (ISC License)
- **Simple Peer**: WebRTC wrapper (MIT License)

### Usage Rights
- ✅ **Commercial Use**: Use in commercial projects
- ✅ **Modification**: Modify the source code
- ✅ **Distribution**: Distribute copies of the software
- ✅ **Private Use**: Use for private purposes
- ❗ **Liability**: No warranty provided

## 🔮 Roadmap & Future Development

### Short-term Goals (Next 3-6 months)
- [ ] **📱 Mobile App**: Native iOS and Android applications
- [ ] **🔐 End-to-End Encryption**: Enhanced security for enterprise users
- [ ] **🎭 Virtual Backgrounds**: AI-powered background replacement
- [ ] **📊 Analytics Dashboard**: Meeting insights and statistics
- [ ] **🧪 Testing Suite**: Comprehensive test coverage

### Medium-term Goals (6-12 months)
- [ ] **📅 Calendar Integration**: Google Calendar, Outlook, Apple Calendar
- [ ] **🤖 AI Features**: Meeting summaries, action items extraction
- [ ] **🌍 Internationalization**: Multi-language support
- [ ] **🎙️ Advanced Audio**: Noise cancellation, echo suppression
- [ ] **👥 Breakout Rooms**: Automated breakout room management

### Long-term Vision (1+ years)
- [ ] **🏢 Enterprise Features**: SSO, admin controls, compliance tools
- [ ] **🎯 Industry Solutions**: Healthcare, education, legal-specific features
- [ ] **🌐 Global Infrastructure**: Worldwide TURN server network
- [ ] **🤝 Platform Integrations**: Slack, Microsoft Teams, Zoom compatibility
- [ ] **🧠 Advanced AI**: Real-time translation, sentiment analysis

### Community-Driven Features
Vote on features and contribute ideas:
- GitHub Issues with "enhancement" label
- Community Discord server (coming soon)
- Monthly community calls
- Developer surveys and feedback sessions

---

**Built with ❤️ using modern web technologies**

*Striim is an open-source project dedicated to making high-quality video communication accessible to everyone. Join our community of developers, designers, and users working together to build the future of digital communication.*
