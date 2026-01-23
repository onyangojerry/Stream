# Contributing Guide

Thank you for your interest in contributing to Stream! This guide will help you understand our development process, coding standards, and how to submit contributions.

## 🎯 Quick Start

### Prerequisites

- **Node.js** 18+ 
- **npm** 8+ or **yarn** 1.22+
- **Git** 2.30+
- Modern browser (Chrome 90+, Firefox 88+, Safari 14+)

### Getting Started

1. **Fork the repository**
   ```bash
   # Visit https://github.com/onyangojerry/Stream and click "Fork"
   ```

2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/Stream.git
   cd Stream
   ```

3. **Set up the development environment**
   ```bash
   # Install dependencies
   npm install
   
   # Set up environment variables
   cp .env.example .env
   
   # Start development server
   npm run dev
   ```

4. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

## 🌿 Development Workflow

### Branch Strategy

We follow **Git Flow** methodology:

- **`main`** - Production-ready code
- **`develop`** - Integration branch for features
- **`feature/*`** - Individual feature development
- **`bugfix/*`** - Bug fixes
- **`hotfix/*`** - Critical production fixes
- **`release/*`** - Release preparation

### Branch Naming

```bash
feature/video-call-recording
feature/sign-language-detection
bugfix/audio-not-working-safari
hotfix/security-vulnerability
release/v2.1.0
chore/update-dependencies
docs/improve-readme
```

### Commit Convention

We use **Conventional Commits** specification:

#### Format
```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

#### Types
- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation only changes
- **style**: Changes that don't affect code meaning (white-space, formatting)
- **refactor**: Code change that neither fixes a bug nor adds a feature
- **perf**: Performance improvements
- **test**: Adding missing tests or correcting existing tests
- **chore**: Changes to build process or auxiliary tools
- **ci**: Changes to CI configuration files and scripts

#### Examples
```bash
feat(video): add screen sharing functionality
fix(audio): resolve echo cancellation issue in Safari
docs(readme): update installation instructions
style(ui): improve button hover animations
refactor(store): optimize video call state management
test(e2e): add meeting creation workflow tests
chore(deps): update React to v18.2.0
```

### Pull Request Process

1. **Create your feature branch**
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/your-feature
   ```

2. **Make your changes**
   - Follow coding standards
   - Write clear commit messages
   - Add tests for new features
   - Update documentation

3. **Test your changes**
   ```bash
   npm run lint          # Check code style
   npm run type-check    # TypeScript validation
   npm run test          # Run unit tests
   npm run build         # Test production build
   ```

4. **Push your branch**
   ```bash
   git push -u origin feature/your-feature
   ```

5. **Create Pull Request**
   - Use our PR template
   - Link relevant issues
   - Add screenshots/videos for UI changes
   - Request review from maintainers

## 📝 Pull Request Template

```markdown
## Description
Brief description of the changes introduced by this PR.

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update
- [ ] Performance improvement
- [ ] Code refactoring

## Related Issues
Fixes #(issue number)
Related to #(issue number)

## Screenshots/Videos
<!-- Add screenshots or videos demonstrating the changes -->

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed
- [ ] Cross-browser testing done (Chrome, Firefox, Safari)
- [ ] Mobile responsive testing done

## Checklist
- [ ] My code follows the project's coding style
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes
- [ ] Any dependent changes have been merged and published
```

## 💻 Coding Standards

### TypeScript Guidelines

#### 1. Type Definitions

```typescript
// ✅ Good: Use specific interfaces
interface VideoCallProps {
  meetingId: string;
  participants: Participant[];
  isHost: boolean;
  onLeave: () => void;
}

// ❌ Bad: Avoid 'any' type
const handleResponse = (response: any) => { /* ... */ };

// ✅ Good: Use proper typing
const handleResponse = (response: ApiResponse) => { /* ... */ };
```

#### 2. React Components

```typescript
// ✅ Good: Functional component with proper typing
import React, { FC, useState, useCallback } from 'react';

interface ComponentProps {
  title: string;
  onAction?: (id: string) => void;
  children?: React.ReactNode;
}

const Component: FC<ComponentProps> = ({ title, onAction, children }) => {
  const [state, setState] = useState<ComponentState>({});
  
  const handleClick = useCallback((id: string) => {
    onAction?.(id);
  }, [onAction]);
  
  return (
    <div>
      <h2>{title}</h2>
      {children}
    </div>
  );
};

export default Component;
```

#### 3. Custom Hooks

```typescript
// ✅ Good: Properly typed custom hook
interface UseVideoCallReturn {
  isConnected: boolean;
  participants: Participant[];
  connect: (meetingId: string) => Promise<void>;
  disconnect: () => void;
}

export const useVideoCall = (roomId: string): UseVideoCallReturn => {
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

### CSS/Styling Standards

#### 1. Tailwind CSS Classes

```typescript
// ✅ Good: Organized class groups
const buttonClasses = `
  // Layout
  flex items-center justify-center gap-2
  // Sizing
  w-full h-10 px-4 py-2
  // Typography
  text-sm font-medium
  // Colors
  bg-blue-600 text-white
  // Effects
  rounded-lg shadow-sm
  // States
  hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
  // Responsive
  md:w-auto md:h-12
  // Dark mode
  dark:bg-blue-500 dark:hover:bg-blue-600
  // Disabled
  disabled:opacity-50 disabled:cursor-not-allowed
`;

// ❌ Bad: Unorganized, hard to read
const buttonClasses = "flex bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 w-full items-center justify-center h-10 text-sm font-medium shadow-sm focus:ring-2 focus:ring-blue-500 md:w-auto md:h-12 dark:bg-blue-500";
```

#### 2. Component Styling Patterns

```typescript
// ✅ Good: Reusable style constants
const styles = {
  card: `
    bg-white dark:bg-gray-800
    border border-gray-200 dark:border-gray-700
    rounded-lg shadow-sm
    p-6
  `,
  button: {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800',
    danger: 'bg-red-600 hover:bg-red-700 text-white'
  }
};

// Usage
<div className={styles.card}>
  <button className={`${styles.button.primary} px-4 py-2 rounded`}>
    Click me
  </button>
</div>
```

### State Management Standards

#### 1. Zustand Store Structure

```typescript
// ✅ Good: Well-organized store
interface VideoStoreState {
  // State grouped logically
  connection: {
    isConnected: boolean;
    roomId: string | null;
    quality: ConnectionQuality;
  };
  
  media: {
    localStream: MediaStream | null;
    isVideoEnabled: boolean;
    isAudioEnabled: boolean;
    isScreenSharing: boolean;
  };
  
  participants: {
    list: Participant[];
    remoteStreams: Map<string, MediaStream>;
  };
  
  // Actions grouped by domain
  connectionActions: {
    joinRoom: (roomId: string) => Promise<void>;
    leaveRoom: () => void;
    updateQuality: (quality: ConnectionQuality) => void;
  };
  
  mediaActions: {
    toggleVideo: () => void;
    toggleAudio: () => void;
    startScreenShare: () => Promise<void>;
    stopScreenShare: () => void;
  };
  
  participantActions: {
    addParticipant: (participant: Participant) => void;
    removeParticipant: (participantId: string) => void;
  };
}
```

### Error Handling Standards

```typescript
// ✅ Good: Comprehensive error handling
const handleVideoCall = async (roomId: string) => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    });
    
    await joinRoom(roomId, stream);
    
  } catch (error) {
    if (error instanceof Error) {
      switch (error.name) {
        case 'NotAllowedError':
          toast.error('Camera/microphone permission denied');
          break;
        case 'NotFoundError':
          toast.error('No camera/microphone found');
          break;
        case 'NotReadableError':
          toast.error('Camera/microphone is in use by another application');
          break;
        default:
          console.error('Video call error:', error);
          toast.error('Failed to start video call');
      }
    }
  }
};
```

## 🧪 Testing Standards

### Unit Testing

```typescript
// ✅ Good: Comprehensive unit test
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { VideoCallButton } from '../VideoCallButton';

// Mock dependencies
vi.mock('../hooks/useVideoStore', () => ({
  useVideoStore: vi.fn()
}));

describe('VideoCallButton', () => {
  const mockJoinCall = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
    (useVideoStore as vi.Mock).mockReturnValue({
      joinRoom: mockJoinCall,
      isConnected: false
    });
  });

  it('should render with correct text when not connected', () => {
    render(<VideoCallButton roomId="test-room" />);
    
    expect(screen.getByRole('button', { name: /join call/i })).toBeInTheDocument();
  });

  it('should call joinRoom when clicked', async () => {
    render(<VideoCallButton roomId="test-room" />);
    
    fireEvent.click(screen.getByRole('button', { name: /join call/i }));
    
    await waitFor(() => {
      expect(mockJoinCall).toHaveBeenCalledWith('test-room');
    });
  });

  it('should be disabled when already connected', () => {
    (useVideoStore as vi.Mock).mockReturnValue({
      joinRoom: mockJoinCall,
      isConnected: true
    });
    
    render(<VideoCallButton roomId="test-room" />);
    
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('should handle join call errors gracefully', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockJoinCall.mockRejectedValue(new Error('Failed to join'));
    
    render(<VideoCallButton roomId="test-room" />);
    
    fireEvent.click(screen.getByRole('button', { name: /join call/i }));
    
    await waitFor(() => {
      expect(consoleError).toHaveBeenCalledWith(
        'Failed to join call:',
        expect.any(Error)
      );
    });
    
    consoleError.mockRestore();
  });
});
```

### Integration Testing

```typescript
// ✅ Good: Integration test
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { VideoCallPage } from '../pages/VideoCallPage';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';

describe('VideoCallPage Integration', () => {
  const renderWithRouter = (initialEntries = ['/call/test-room']) => {
    const router = createMemoryRouter([
      {
        path: '/call/:roomId',
        element: <VideoCallPage />
      }
    ], {
      initialEntries
    });
    
    return render(<RouterProvider router={router} />);
  };

  beforeEach(() => {
    // Reset stores
    useVideoStore.getState().reset();
    useAuthStore.getState().reset();
  });

  it('should complete video call workflow', async () => {
    // Mock getUserMedia
    Object.defineProperty(navigator, 'mediaDevices', {
      value: {
        getUserMedia: vi.fn().mockResolvedValue(new MediaStream())
      }
    });

    renderWithRouter();

    // Should show join button initially
    expect(screen.getByRole('button', { name: /join call/i })).toBeInTheDocument();

    // Join the call
    fireEvent.click(screen.getByRole('button', { name: /join call/i }));

    // Should show video controls after joining
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /toggle video/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /toggle audio/i })).toBeInTheDocument();
    });

    // Should be able to toggle video
    fireEvent.click(screen.getByRole('button', { name: /toggle video/i }));
    
    await waitFor(() => {
      expect(useVideoStore.getState().isVideoEnabled).toBe(false);
    });
  });
});
```

## 📚 Documentation Standards

### Component Documentation

```typescript
/**
 * VideoGrid component displays video streams in a responsive grid layout.
 * 
 * Features:
 * - Automatically adjusts layout based on participant count
 * - Responsive design for different screen sizes
 * - Support for different view modes (gallery, speaker, etc.)
 * - Accessibility features with keyboard navigation
 * 
 * @example
 * ```tsx
 * <VideoGrid
 *   participants={participants}
 *   layout="gallery"
 *   onParticipantClick={handleParticipantClick}
 * />
 * ```
 */
interface VideoGridProps {
  /** Array of participants to display */
  participants: Participant[];
  
  /** Layout mode for the grid */
  layout?: 'auto' | 'grid' | 'speaker' | 'gallery';
  
  /** Maximum number of participants to display */
  maxParticipants?: number;
  
  /** Callback when a participant is clicked */
  onParticipantClick?: (participant: Participant) => void;
  
  /** Additional CSS classes */
  className?: string;
}

const VideoGrid: FC<VideoGridProps> = ({ 
  participants, 
  layout = 'auto',
  maxParticipants = 16,
  onParticipantClick,
  className 
}) => {
  // Implementation
};
```

### API Documentation

```typescript
/**
 * Custom hook for managing video call functionality.
 * 
 * Handles WebRTC connections, media stream management, and call state.
 * Automatically cleans up resources when component unmounts.
 * 
 * @param options - Configuration options for the video call
 * @returns Object with call state and control functions
 * 
 * @example
 * ```tsx
 * const {
 *   isConnected,
 *   participants,
 *   connect,
 *   disconnect
 * } = useVideoCall({
 *   roomId: 'room-123',
 *   autoJoin: true
 * });
 * ```
 */
export const useVideoCall = (options: UseVideoCallOptions): UseVideoCallReturn => {
  // Implementation
};
```

## 🔍 Code Review Guidelines

### What We Look For

#### ✅ Good Code Review Items

1. **Functionality**
   - Does the code do what it's supposed to do?
   - Are edge cases handled properly?
   - Is error handling comprehensive?

2. **Code Quality**
   - Is the code readable and maintainable?
   - Are naming conventions consistent?
   - Is the code properly structured and organized?

3. **Performance**
   - Are there any performance bottlenecks?
   - Is the code optimized for the use case?
   - Are unnecessary re-renders avoided?

4. **Security**
   - Are user inputs validated and sanitized?
   - Are sensitive operations properly authenticated?
   - Are there any potential security vulnerabilities?

5. **Testing**
   - Are new features covered by tests?
   - Do existing tests still pass?
   - Are tests meaningful and comprehensive?

### Review Process

1. **Automated Checks**
   - All CI checks must pass
   - Code coverage should not decrease
   - No linting errors or warnings

2. **Manual Review**
   - At least one maintainer must approve
   - Address all review comments
   - Ensure PR description is comprehensive

3. **Testing**
   - Manual testing in multiple browsers
   - Mobile responsiveness check
   - Performance impact assessment

## 🐛 Bug Report Guidelines

### Bug Report Template

```markdown
## Bug Description
A clear and concise description of what the bug is.

## Steps to Reproduce
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

## Expected Behavior
A clear description of what you expected to happen.

## Actual Behavior
A clear description of what actually happened.

## Screenshots/Videos
If applicable, add screenshots or videos to help explain your problem.

## Environment
- OS: [e.g. macOS, Windows, Linux]
- Browser: [e.g. Chrome 95, Firefox 92, Safari 15]
- Device: [e.g. Desktop, Mobile, Tablet]
- Screen Resolution: [e.g. 1920x1080]

## Console Errors
Please include any console errors or warnings.

## Additional Context
Add any other context about the problem here.
```

### Bug Investigation Process

1. **Reproduce the Issue**
   - Follow the steps to reproduce
   - Test in different browsers/devices
   - Document any variations

2. **Gather Information**
   - Check browser console for errors
   - Review network requests
   - Check application state

3. **Create Minimal Example**
   - Create the smallest possible reproduction
   - Remove unnecessary code/steps
   - Focus on the core issue

## 💡 Feature Request Guidelines

### Feature Request Template

```markdown
## Feature Description
A clear and concise description of what the feature is.

## Problem/Use Case
Explain the problem this feature would solve or the use case it addresses.

## Proposed Solution
A clear and concise description of what you want to happen.

## Alternative Solutions
A clear and concise description of any alternative solutions or features you've considered.

## Implementation Ideas
If you have ideas about how to implement this feature, share them here.

## Mockups/Examples
If applicable, add mockups, wireframes, or examples from other applications.

## Additional Context
Add any other context or screenshots about the feature request here.
```

## 🏷️ Release Process

### Version Numbering

We follow **Semantic Versioning** (SemVer):

- **MAJOR** version: Breaking changes
- **MINOR** version: New features (backward compatible)
- **PATCH** version: Bug fixes (backward compatible)

### Release Checklist

1. **Pre-release**
   - [ ] All tests pass
   - [ ] Documentation updated
   - [ ] CHANGELOG.md updated
   - [ ] Version number bumped

2. **Release**
   - [ ] Create release branch
   - [ ] Final testing in staging
   - [ ] Create GitHub release
   - [ ] Deploy to production

3. **Post-release**
   - [ ] Monitor for issues
   - [ ] Update documentation
   - [ ] Communicate changes to users

## 📞 Getting Help

### Community Support

- **GitHub Discussions**: General questions and ideas
- **GitHub Issues**: Bug reports and feature requests
- **Pull Request Reviews**: Code-related questions

### Development Questions

If you're working on a contribution and need help:

1. Check existing documentation
2. Search closed issues and PRs
3. Ask in GitHub Discussions
4. Tag relevant maintainers in your PR

### Maintainer Contact

For urgent issues or sensitive matters, contact maintainers directly through GitHub.

---

Thank you for contributing to Stream! Your efforts help make video communication more accessible and feature-rich for everyone. 🙏