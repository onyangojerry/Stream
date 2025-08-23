# Striim - Video Streaming Platform

A modern, feature-rich video streaming platform built with React, TypeScript, and WebRTC. Striim supports webinars, one-on-one calls, and group calls with advanced features like real-time transcription, sign language detection, screen sharing, and more.

## 🚀 Features

### Core Video Features
- **One-on-One Calls**: Private video calls with HD quality
- **Group Calls**: Multi-participant meetings with up to 50 users
- **Webinars**: Large-scale presentations with presenter/attendee roles
- **Screen Sharing**: Share your screen or specific applications
- **Recording**: Record meetings and webinars locally

### Advanced Features
- **Real-time Transcription**: Speech-to-text with confidence scoring
- **Sign Language Detection**: Computer vision-powered sign language recognition
- **Live Chat**: Real-time messaging during calls
- **Participant Management**: Mute all, breakout rooms, role management
- **Quality Controls**: Adjustable video quality and audio levels

### User Experience
- **Modern UI**: Clean, responsive design with dark mode
- **Floating Controls**: Easy-to-access control panel
- **Responsive Grid**: Adaptive video layout for different participant counts
- **Toast Notifications**: Real-time feedback and status updates
- **Keyboard Shortcuts**: Quick actions for power users

## 🛠️ Technology Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Notifications**: React Hot Toast
- **WebRTC**: Native browser APIs + Simple Peer

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd striim
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

## 🎯 Usage

### Starting a Call

1. **Home Page**: Choose your call type
   - One-on-One Call
   - Group Call
   - Webinar

2. **Quick Join**: Enter a meeting ID to join an existing call

3. **Permissions**: Allow camera and microphone access when prompted

### Call Controls

#### Basic Controls
- **🎤 Audio**: Toggle microphone on/off
- **📹 Video**: Toggle camera on/off
- **🖥️ Screen Share**: Share your screen or applications
- **⏺️ Record**: Start/stop meeting recording
- **💬 Chat**: Open/close chat panel
- **📝 Transcription**: Enable real-time transcription

#### Advanced Controls
- **Settings**: Audio levels, video quality, background blur
- **Participants**: View and manage meeting participants
- **Breakout Rooms**: Create smaller group discussions (Group Calls)
- **Polls**: Create live polls (Webinars)

### Transcription Features

#### Speech Transcription
- Real-time speech-to-text conversion
- Speaker identification
- Confidence scoring
- Downloadable transcripts

#### Sign Language Detection
- Computer vision-powered sign language recognition
- Real-time translation
- Support for common sign language gestures
- Combined speech and sign language mode

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:

```env
VITE_APP_NAME=Striim
VITE_APP_VERSION=1.0.0
```

### Customization

#### Styling
- Modify `tailwind.config.js` for theme customization
- Update `src/index.css` for global styles
- Component-specific styles in individual component files

#### Features
- Enable/disable features in the store configuration
- Modify transcription settings in `TranscriptionPanel.tsx`
- Adjust video quality settings in `ControlPanel.tsx`

## 📱 Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## 🔒 Privacy & Security

- All video/audio processing happens locally in the browser
- No server-side recording or storage
- WebRTC peer-to-peer connections
- Optional end-to-end encryption (can be implemented)

## 🚀 Deployment

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

### Build for Production
```bash
npm run build
```

### Deploy to Vercel
```bash
npm install -g vercel
vercel
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the code comments

## 🔮 Roadmap

- [ ] End-to-end encryption
- [ ] Virtual backgrounds
- [ ] Meeting scheduling
- [ ] Analytics dashboard
- [ ] Mobile app
- [ ] Integration with calendar systems
- [ ] Advanced AI features
- [ ] Multi-language support

---

Built with ❤️ using modern web technologies
