# Workflows & Development Guide

This document outlines the development workflows, coding standards, and best practices for the Stream video communication platform.

## Table of Contents

- [Development Workflow](#development-workflow)
- [Git Workflow](#git-workflow)
- [Code Standards](#code-standards)
- [Testing Workflow](#testing-workflow)
- [Release Workflow](#release-workflow)
- [Debugging Guide](#debugging-guide)
- [Performance Optimization](#performance-optimization)
- [Team Collaboration](#team-collaboration)
- [Quality Assurance](#quality-assurance)
- [Deployment Pipeline](#deployment-pipeline)

## Development Workflow

### Initial Setup

1. **Environment Setup**
   ```bash
   # Clone the repository
   git clone https://github.com/onyangojerry/Stream.git
   cd Stream
   
   # Install Node.js dependencies
   npm install
   
   # Set up environment variables
   cp .env.example .env
   
   # Start development server
   npm run dev
   ```

2. **IDE Configuration**
   - **VS Code Extensions**: 
     - TypeScript Importer
     - ESLint
     - Tailwind CSS IntelliSense
     - Auto Rename Tag
     - Bracket Pair Colorizer
     - GitLens
     - Error Lens
   - **Settings**: Enable format on save, TypeScript suggestions

### Git Workflow

We use **Git Flow** with the following branches:

- **`main`**: Production-ready code
- **`develop`**: Integration branch for features
- **`feature/*`**: Individual feature development
- **`hotfix/*`**: Critical production fixes
- **`release/*`**: Prepare releases

### Branch Naming Convention

```bash
feature/video-call-recording
feature/sign-language-detection
bugfix/audio-not-working-safari
hotfix/security-vulnerability-webrtc
release/v2.1.0
```

### Commit Message Standards

Follow **Conventional Commits** specification:

```bash
# Format: <type>[optional scope]: <description>

feat(video): add screen sharing functionality
fix(audio): resolve echo cancellation issue
docs(readme): update installation instructions
style(ui): improve button hover animations
refactor(store): optimize state management performance
test(e2e): add meeting creation workflow tests
chore(deps): update React to v18.2.0
```

### Commit Types
- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, semicolons, etc.)
- **refactor**: Code refactoring
- **test**: Adding or modifying tests
- **chore**: Build process or auxiliary tool changes

## Code Standards

### TypeScript Guidelines

#### Type Definitions
```typescript
// Define interfaces for all props and data structures
interface VideoCallProps {
  meetingId: string;
  participants: Participant[];
  isHost: boolean;
  onLeave: () => void;
}

// Use proper return types
const processVideoStream = (stream: MediaStream): Promise<ProcessedStream> => {
  // Implementation
};

// Avoid 'any' type - use unknown or specific types
const handleApiResponse = (response: unknown): ApiResponse => {
  // Type guard implementation
  if (isApiResponse(response)) {
    return response;
  }
  throw new Error('Invalid API response');
};
```

#### React Component Patterns
```typescript
// Functional components with proper typing
import React, { FC, useState, useCallback, useEffect } from 'react';

interface ComponentProps {
  title: string;
  onAction?: (id: string) => void;
  children?: React.ReactNode;
}

const Component: FC<ComponentProps> = ({ title, onAction, children }) => {
  const [state, setState] = useState<ComponentState>({});
  
  // Use useCallback for event handlers
  const handleClick = useCallback((id: string) => {
    onAction?.(id);
  }, [onAction]);
  
  // Use useEffect for side effects
  useEffect(() => {
    // Cleanup function
    return () => {
      // Cleanup logic
    };
  }, []);
  
  return (
    <div>
      <h2>{title}</h2>
      {children}
    </div>
  );
};
```

## Testing Workflow

### Testing Strategy

#### Test Pyramid
```
E2E Tests (10%)     - Complete user workflows
Integration (20%)   - Component interactions
Unit Tests (70%)    - Individual functions/components
```

#### Testing Tools
- **Unit Testing**: Vitest + React Testing Library
- **Integration Testing**: Vitest + MSW (Mock Service Worker)
- **E2E Testing**: Playwright
- **Visual Testing**: Chromatic (Storybook)

#### Test Commands
```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e

# Run specific test file
npm run test -- VideoCallButton.test.tsx
```

## Release Workflow

### Version Management
We follow **Semantic Versioning** (SemVer):
- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

### Release Steps
```bash
# 1. Create release branch
git checkout develop
git pull origin develop
git checkout -b release/v2.1.0

# 2. Update version
npm version minor # or major/patch

# 3. Update CHANGELOG.md
# Add release notes

# 4. Commit changes
git commit -m "chore(release): prepare v2.1.0"

# 5. Push release branch
git push origin release/v2.1.0

# 6. Create pull request to main
# After approval and merge:

# 7. Create git tag
git tag v2.1.0
git push origin v2.1.0

# 8. Deploy to production
npm run build
npm run deploy
```

## Team Collaboration

### Communication Protocols

#### Daily Communication
- **Stand-up Meetings**: 9:00 AM daily, 15 minutes maximum
- **Slack Updates**: Async updates for distributed team members
- **Blocker Reports**: Immediate escalation of blocking issues
- **Progress Sharing**: End-of-day summary for major milestones

#### Weekly Coordination
- **Sprint Planning**: Bi-weekly planning sessions
- **Architecture Reviews**: Weekly technical design discussions
- **Cross-team Sync**: Weekly inter-team coordination meetings
- **Knowledge Sharing**: Tech talks and learning sessions

### Collaboration Tools

#### Development Tools
- **VS Code Live Share**: Real-time collaborative coding
- **GitHub Discussions**: Technical architecture discussions
- **Confluence**: Documentation and knowledge base
- **Miro**: Collaborative diagramming and brainstorming

#### Communication Platforms
- **Slack**: Daily communication and quick coordination
- **Microsoft Teams**: Video meetings and screen sharing
- **Zoom**: Large group meetings and external presentations
- **Asana**: Task management and project tracking

## Quality Assurance

### Quality Gates

#### Code Quality
- **Minimum Test Coverage**: 80% for new code, 70% overall
- **Code Review**: Mandatory two-reviewer approval
- **Static Analysis**: ESLint, TypeScript compiler checks
- **Security Scanning**: Automated vulnerability scanning

#### Performance Standards
- **Page Load Time**: Under 3 seconds on 3G connection
- **Time to Interactive**: Under 5 seconds
- **Lighthouse Score**: Above 90 for Performance, Accessibility, SEO
- **Bundle Size**: Main bundle under 500KB gzipped

### Testing Standards

#### Unit Testing Requirements
- **Component Testing**: All components must have unit tests
- **Utility Function Testing**: 100% coverage for utility functions
- **Store Testing**: Complete state management test coverage
- **Error Handling**: Test error scenarios and edge cases

#### Integration Testing Standards
- **API Integration**: Test all API endpoints and error responses
- **Component Integration**: Test component interactions and data flow
- **User Workflow Testing**: Test complete user scenarios
- **Cross-browser Testing**: Test on Chrome, Firefox, Safari, Edge

## Deployment Pipeline

### Continuous Integration

#### Automated Pipeline Stages
```yaml
# CI Pipeline Overview
1. Code Commit → Git Push
2. Automated Tests → Unit, Integration, E2E
3. Code Quality Checks → ESLint, TypeScript, Security
4. Build Process → Production build and optimization
5. Deployment → Staging environment deployment
6. Smoke Tests → Basic functionality validation
7. Production Deployment → Blue-green deployment
8. Post-deployment Tests → Production health checks
```

#### Environment Management
- **Development**: Local development environments
- **Feature Branches**: Automated feature branch deployments
- **Staging**: Pre-production testing environment
- **Production**: Live production environment
- **Rollback**: Automated rollback capability

### Deployment Strategies

#### Blue-Green Deployment
- **Blue Environment**: Current production version
- **Green Environment**: New version deployment target
- **Traffic Switch**: Instant traffic routing to green environment
- **Rollback**: Immediate switch back to blue if issues detected

#### Monitoring and Alerting
- **Application Performance**: Response time, error rate monitoring
- **Infrastructure Health**: Server resources, database performance
- **User Experience**: Real user monitoring, error tracking
- **Business Metrics**: Feature usage, conversion rates

This comprehensive workflow documentation ensures consistent, high-quality development practices across all team members and project phases.
    C --> D[Run Lint & Format]
    D --> E[Test Locally]
    E --> F[Create PR]
    F --> G[Code Review]
    G --> H[Deploy to Staging]
    H --> I[Merge to Main]
```

#### 2. Development Commands
```bash
# Start development server with hot reload
npm run dev

# Type checking
npm run type-check

# Linting
npm run lint
npm run lint:fix

# Build for production
npm run build

# Preview production build
npm run preview
```

#### 3. File Structure Conventions
```
src/
├── components/           # Reusable UI components
│   ├── ui/              # Basic UI components (Button, Input, etc.)
│   ├── features/        # Feature-specific components
│   └── layout/          # Layout components
├── pages/               # Route components
├── hooks/               # Custom React hooks
├── store/               # State management (Zustand)
├── utils/               # Helper functions
├── types/               # TypeScript definitions
├── constants/           # Application constants
└── styles/              # Global styles and themes
```

## 🌿 Git Workflow

### Branch Strategy

We use **Git Flow** with the following branches:

- **`main`**: Production-ready code
- **`develop`**: Integration branch for features
- **`feature/*`**: Individual feature development
- **`hotfix/*`**: Critical production fixes
- **`release/*`**: Prepare releases

### Branch Naming Convention

```bash
feature/video-call-recording
feature/sign-language-detection
bugfix/audio-not-working-safari
hotfix/security-vulnerability-webrtc
release/v2.1.0
```

### Commit Message Standards

Follow **Conventional Commits** specification:

```bash
# Format: <type>[optional scope]: <description>

feat(video): add screen sharing functionality
fix(audio): resolve echo cancellation issue
docs(readme): update installation instructions
style(ui): improve button hover animations
refactor(store): optimize state management performance
test(e2e): add meeting creation workflow tests
chore(deps): update React to v18.2.0
```

### Commit Types
- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, semicolons, etc.)
- **refactor**: Code refactoring
- **test**: Adding or modifying tests
- **chore**: Build process or auxiliary tool changes

### Pull Request Workflow

#### 1. Create Feature Branch
```bash
git checkout develop
git pull origin develop
git checkout -b feature/your-feature-name
```

#### 2. Development Process
```bash
# Make changes and commit frequently
git add .
git commit -m "feat(feature): implement core functionality"

# Push changes
git push -u origin feature/your-feature-name
```

#### 3. Pull Request Template
```markdown
## Description
Brief description of changes made.

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed
- [ ] Cross-browser testing done

## Screenshots/Videos
Add screenshots or videos demonstrating the changes.

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Commented hard-to-understand areas
- [ ] Documentation updated
- [ ] No new warnings introduced
```

## 💻 Code Standards

### TypeScript Guidelines

#### 1. Type Definitions
```typescript
// Define interfaces for all props and data structures
interface VideoCallProps {
  meetingId: string;
  participants: Participant[];
  isHost: boolean;
  onLeave: () => void;
}

// Use proper return types
const processVideoStream = (stream: MediaStream): Promise<ProcessedStream> => {
  // Implementation
};

// Avoid 'any' type - use unknown or specific types
const handleApiResponse = (response: unknown): ApiResponse => {
  // Type guard implementation
  if (isApiResponse(response)) {
    return response;
  }
  throw new Error('Invalid API response');
};
```

#### 2. React Component Patterns
```typescript
// Functional components with proper typing
import React, { FC, useState, useCallback, useEffect } from 'react';

interface ComponentProps {
  title: string;
  onAction?: (id: string) => void;
  children?: React.ReactNode;
}

const Component: FC<ComponentProps> = ({ title, onAction, children }) => {
  const [state, setState] = useState<ComponentState>({});
  
  // Use useCallback for event handlers
  const handleClick = useCallback((id: string) => {
    onAction?.(id);
  }, [onAction]);
  
  // Use useEffect for side effects
  useEffect(() => {
    // Cleanup function
    return () => {
      // Cleanup logic
    };
  }, []);
  
  return (
    <div>
      <h2>{title}</h2>
      {children}
    </div>
  );
};
```

#### 3. Custom Hooks Pattern
```typescript
// Custom hooks should start with 'use'
import { useState, useEffect, useCallback } from 'react';

interface UseVideoCallReturn {
  isConnected: boolean;
  participants: Participant[];
  connect: (meetingId: string) => Promise<void>;
  disconnect: () => void;
}

export const useVideoCall = (): UseVideoCallReturn => {
  const [isConnected, setIsConnected] = useState(false);
  const [participants, setParticipants] = useState<Participant[]>([]);
  
  const connect = useCallback(async (meetingId: string) => {
    // Implementation
  }, []);
  
  const disconnect = useCallback(() => {
    // Implementation
  }, []);
  
  return {
    isConnected,
    participants,
    connect,
    disconnect
  };
};
```

### CSS/Styling Guidelines

#### 1. Tailwind CSS Best Practices
```typescript
// Use semantic class groupings
const buttonClasses = `
  // Layout
  flex items-center justify-center
  // Sizing
  w-full h-10 px-4 py-2
  // Styling
  bg-blue-600 text-white rounded-lg
  // States
  hover:bg-blue-700 focus:ring-2 focus:ring-blue-500
  // Responsive
  md:w-auto md:h-12
  // Dark mode
  dark:bg-blue-500 dark:hover:bg-blue-600
`;

// Extract repeated patterns into reusable classes
const cardClasses = `
  bg-white dark:bg-gray-800
  border border-gray-200 dark:border-gray-700
  rounded-lg shadow-sm
  p-6
`;
```

#### 2. Component Styling Patterns
```typescript
// Use CSS-in-JS for dynamic styles
const getDynamicStyles = (isActive: boolean, theme: 'light' | 'dark') => ({
  backgroundColor: isActive ? '#3B82F6' : '#6B7280',
  color: theme === 'dark' ? '#F9FAFB' : '#111827',
});

// Use CSS variables for theming
const themeVariables = {
  '--color-primary': '#3B82F6',
  '--color-secondary': '#6B7280',
  '--color-success': '#10B981',
  '--color-error': '#EF4444',
};
```

### State Management Patterns

#### 1. Zustand Store Structure
```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface VideoStoreState {
  // State
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  participants: Participant[];
  currentRoom: Room | null;
  
  // Actions
  toggleVideo: () => void;
  toggleAudio: () => void;
  joinRoom: (roomId: string) => Promise<void>;
  leaveRoom: () => void;
  
  // Async actions
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<string>; // Returns recording URL
}

export const useVideoStore = create<VideoStoreState>()(
  persist(
    (set, get) => ({
      // Initial state
      isVideoEnabled: false,
      isAudioEnabled: false,
      participants: [],
      currentRoom: null,
      
      // Actions
      toggleVideo: () => set(state => ({ 
        isVideoEnabled: !state.isVideoEnabled 
      })),
      
      toggleAudio: () => set(state => ({ 
        isAudioEnabled: !state.isAudioEnabled 
      })),
      
      joinRoom: async (roomId: string) => {
        try {
          // Implementation
          const room = await joinRoomApi(roomId);
          set({ currentRoom: room });
        } catch (error) {
          console.error('Failed to join room:', error);
        }
      },
      
      leaveRoom: () => set({ 
        currentRoom: null, 
        participants: [] 
      }),
    }),
    {
      name: 'video-store',
      partialize: (state) => ({ 
        isVideoEnabled: state.isVideoEnabled,
        isAudioEnabled: state.isAudioEnabled
      }),
    }
  )
);
```

## 🧪 Testing Workflow

### Testing Strategy

#### 1. Test Pyramid
```
E2E Tests (10%)     - Complete user workflows
Integration (20%)   - Component interactions
Unit Tests (70%)    - Individual functions/components
```

#### 2. Testing Tools
- **Unit Testing**: Vitest + React Testing Library
- **Integration Testing**: Vitest + MSW (Mock Service Worker)
- **E2E Testing**: Playwright
- **Visual Testing**: Chromatic (Storybook)

#### 3. Test Structure
```typescript
// Unit test example
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { VideoCallButton } from '../VideoCallButton';

describe('VideoCallButton', () => {
  it('should call onJoinCall when clicked', () => {
    const mockOnJoinCall = vi.fn();
    
    render(
      <VideoCallButton 
        isEnabled={true} 
        onJoinCall={mockOnJoinCall} 
      />
    );
    
    fireEvent.click(screen.getByRole('button', { name: /join call/i }));
    
    expect(mockOnJoinCall).toHaveBeenCalledTimes(1);
  });
  
  it('should be disabled when isEnabled is false', () => {
    render(
      <VideoCallButton 
        isEnabled={false} 
        onJoinCall={vi.fn()} 
      />
    );
    
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

#### 4. Testing Commands
```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e

# Run specific test file
npm run test -- VideoCallButton.test.tsx
```

## 🚀 Release Workflow

### Release Process

#### 1. Version Management
We follow **Semantic Versioning** (SemVer):
- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

#### 2. Release Steps
```bash
# 1. Create release branch
git checkout develop
git pull origin develop
git checkout -b release/v2.1.0

# 2. Update version
npm version minor # or major/patch

# 3. Update CHANGELOG.md
# Add release notes

# 4. Commit changes
git commit -m "chore(release): prepare v2.1.0"

# 5. Push release branch
git push origin release/v2.1.0

# 6. Create pull request to main
# After approval and merge:

# 7. Create git tag
git tag v2.1.0
git push origin v2.1.0

# 8. Deploy to production
npm run build
npm run deploy
```

#### 3. Changelog Format
```markdown
# Changelog

## [2.1.0] - 2024-01-20

### Added
- Screen sharing functionality with application window selection
- Real-time transcription with speaker identification
- Collaborative document editing with operational transforms

### Changed
- Improved video quality selection with 4K support
- Enhanced mobile responsive design
- Optimized WebRTC connection stability

### Fixed
- Audio echo cancellation in Safari browser
- Memory leak in video stream cleanup
- Dark mode toggle persistence issue

### Security
- Updated WebRTC security protocols
- Enhanced meeting room access controls
```

## 🐛 Debugging Guide

### Development Debugging

#### 1. Browser DevTools
```javascript
// Debug WebRTC connections
const logPeerConnectionStats = async (peerConnection) => {
  const stats = await peerConnection.getStats();
  stats.forEach(report => {
    if (report.type === 'inbound-rtp' && report.mediaType === 'video') {
      console.log('Video Stats:', {
        bytesReceived: report.bytesReceived,
        packetsLost: report.packetsLost,
        frameRate: report.frameRate
      });
    }
  });
};

// Debug state changes
const debugStore = (storeName, state) => {
  console.group(`🔍 ${storeName} State Update`);
  console.log('Previous:', state.previousState);
  console.log('Current:', state.currentState);
  console.log('Action:', state.action);
  console.groupEnd();
};
```

#### 2. React DevTools
- Install React DevTools browser extension
- Use Profiler to identify performance bottlenecks
- Monitor component renders and state changes

#### 3. Common Issues & Solutions

| Issue | Symptoms | Solution |
|-------|----------|----------|
| Video not showing | Black screen, no video element | Check camera permissions, verify getUserMedia |
| Audio echo | Echo during calls | Implement echo cancellation, check audio constraints |
| Connection fails | No peer connection established | Verify STUN/TURN servers, check network connectivity |
| Poor video quality | Pixelated, low resolution | Adjust video constraints, check bandwidth |
| Memory leaks | Browser becomes slow/crashes | Properly cleanup streams and event listeners |

### Production Debugging

#### 1. Error Monitoring
```typescript
// Error boundary for React components
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to monitoring service
    console.error('Error caught by boundary:', error, errorInfo);
    // Send to error tracking service (e.g., Sentry)
  }

  render() {
    if (this.state.hasError) {
      return <FallbackComponent />;
    }
    return this.props.children;
  }
}
```

#### 2. Performance Monitoring
```typescript
// Performance tracking
const trackPerformance = (operationName: string) => {
  const startTime = performance.now();
  
  return {
    end: () => {
      const duration = performance.now() - startTime;
      console.log(`${operationName} took ${duration}ms`);
      
      // Send to analytics
      if (typeof gtag !== 'undefined') {
        gtag('event', 'timing_complete', {
          name: operationName,
          value: Math.round(duration)
        });
      }
    }
  };
};

// Usage
const perf = trackPerformance('video-call-connection');
await connectToCall();
perf.end();
```

## ⚡ Performance Optimization

### React Performance

#### 1. Component Optimization
```typescript
// Use React.memo for expensive components
const VideoThumbnail = React.memo<VideoThumbnailProps>(({ 
  participant, 
  isActive 
}) => {
  return (
    <div className={`thumbnail ${isActive ? 'active' : ''}`}>
      <video ref={participant.videoRef} autoPlay muted />
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function
  return prevProps.participant.id === nextProps.participant.id &&
         prevProps.isActive === nextProps.isActive;
});

// Use useCallback for event handlers
const VideoControls = () => {
  const toggleVideo = useCallback(() => {
    videoStore.getState().toggleVideo();
  }, []);

  const toggleAudio = useCallback(() => {
    videoStore.getState().toggleAudio();
  }, []);

  return (
    <div>
      <button onClick={toggleVideo}>Toggle Video</button>
      <button onClick={toggleAudio}>Toggle Audio</button>
    </div>
  );
};
```

#### 2. Code Splitting
```typescript
// Route-based code splitting
const VideoCall = lazy(() => 
  import('../pages/VideoCall').then(module => ({
    default: module.VideoCall
  }))
);

const GroupCall = lazy(() => 
  import('../pages/GroupCall').then(module => ({
    default: module.GroupCall
  }))
);

// Component-based code splitting
const TranscriptionPanel = lazy(() => 
  import('../components/TranscriptionPanel')
);
```

#### 3. Bundle Optimization
```typescript
// Vite configuration for optimization
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          webrtc: ['simple-peer'],
          ui: ['framer-motion', 'lucide-react'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'zustand'],
  },
});
```

### WebRTC Performance

#### 1. Video Quality Management
```typescript
const adaptVideoQuality = (connectionQuality: 'poor' | 'good' | 'excellent') => {
  const constraints = {
    poor: { width: 320, height: 240, frameRate: 15 },
    good: { width: 640, height: 480, frameRate: 24 },
    excellent: { width: 1280, height: 720, frameRate: 30 }
  };

  return navigator.mediaDevices.getUserMedia({
    video: constraints[connectionQuality],
    audio: true
  });
};
```

#### 2. Connection Monitoring
```typescript
const monitorConnection = (peerConnection: RTCPeerConnection) => {
  const checkConnectionQuality = async () => {
    const stats = await peerConnection.getStats();
    
    stats.forEach(report => {
      if (report.type === 'candidate-pair' && report.state === 'succeeded') {
        const { availableOutgoingBitrate, currentRoundTripTime } = report;
        
        if (currentRoundTripTime > 200) {
          console.warn('High latency detected:', currentRoundTripTime);
          // Consider reducing video quality
        }
        
        if (availableOutgoingBitrate < 500000) {
          console.warn('Low bandwidth detected:', availableOutgoingBitrate);
          // Consider switching to audio-only mode
        }
      }
    });
  };

  setInterval(checkConnectionQuality, 5000);
};
```

---

This workflows document provides comprehensive guidance for developing, testing, and maintaining the Stream platform. Follow these workflows to ensure code quality, performance, and maintainability.