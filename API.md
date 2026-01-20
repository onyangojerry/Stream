# API Documentation

This document provides comprehensive API documentation for the Stream video communication platform, including WebRTC implementation, state management APIs, and integration patterns.

## 📋 Table of Contents

- [WebRTC API](#webrtc-api)
- [State Management API](#state-management-api)
- [Component API](#component-api)
- [Hooks API](#hooks-api)
- [Utility Functions](#utility-functions)
- [Event System](#event-system)
- [Configuration API](#configuration-api)

## 🎥 WebRTC API

### PeerConnectionManager

The core WebRTC connection management class.

#### Constructor

```typescript
constructor(config?: RTCConfiguration)
```

**Parameters:**
- `config` (optional): RTCConfiguration object for peer connection setup

**Example:**
```typescript
const peerManager = new PeerConnectionManager({
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { 
      urls: 'turn:your-turn-server.com',
      username: 'user',
      credential: 'pass'
    }
  ]
});
```

#### Methods

##### `createConnection(participantId: string): Promise<RTCPeerConnection>`

Creates a new peer connection for a participant.

**Parameters:**
- `participantId` (string): Unique identifier for the participant

**Returns:**
- `Promise<RTCPeerConnection>`: The created peer connection

**Example:**
```typescript
const peerConnection = await peerManager.createConnection('participant-123');
```

##### `addLocalStream(stream: MediaStream): void`

Adds local media stream to all peer connections.

**Parameters:**
- `stream` (MediaStream): Local media stream

**Example:**
```typescript
const localStream = await navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
});
peerManager.addLocalStream(localStream);
```

##### `createOffer(participantId: string): Promise<RTCSessionDescription>`

Creates an offer for a specific participant.

**Parameters:**
- `participantId` (string): Target participant ID

**Returns:**
- `Promise<RTCSessionDescription>`: The created offer

**Example:**
```typescript
const offer = await peerManager.createOffer('participant-123');
// Send offer via signaling server
signalingService.sendOffer(offer, 'participant-123');
```

##### `handleAnswer(participantId: string, answer: RTCSessionDescription): Promise<void>`

Handles answer from remote participant.

**Parameters:**
- `participantId` (string): Participant who sent the answer
- `answer` (RTCSessionDescription): The answer description

**Example:**
```typescript
await peerManager.handleAnswer('participant-123', answer);
```

##### `handleICECandidate(participantId: string, candidate: RTCIceCandidate): Promise<void>`

Handles ICE candidate from remote participant.

**Parameters:**
- `participantId` (string): Participant who sent the candidate
- `candidate` (RTCIceCandidate): The ICE candidate

**Example:**
```typescript
await peerManager.handleICECandidate('participant-123', candidate);
```

##### `closeConnection(participantId: string): void`

Closes connection with specific participant.

**Parameters:**
- `participantId` (string): Participant to disconnect

**Example:**
```typescript
peerManager.closeConnection('participant-123');
```

##### `closeAllConnections(): void`

Closes all peer connections and cleans up resources.

**Example:**
```typescript
peerManager.closeAllConnections();
```

#### Events

The PeerConnectionManager extends EventEmitter and emits the following events:

##### `'connectionStateChange'`

Emitted when connection state changes.

**Event Data:**
```typescript
{
  participantId: string;
  connectionState: RTCPeerConnectionState;
}
```

##### `'iceConnectionStateChange'`

Emitted when ICE connection state changes.

**Event Data:**
```typescript
{
  participantId: string;
  iceConnectionState: RTCIceConnectionState;
}
```

##### `'remoteStream'`

Emitted when remote stream is received.

**Event Data:**
```typescript
{
  participantId: string;
  stream: MediaStream;
}
```

##### `'error'`

Emitted when an error occurs.

**Event Data:**
```typescript
{
  participantId?: string;
  error: Error;
}
```

**Example:**
```typescript
peerManager.on('remoteStream', ({ participantId, stream }) => {
  console.log(`Received stream from ${participantId}`);
  // Add stream to UI
});

peerManager.on('error', ({ error, participantId }) => {
  console.error(`Connection error${participantId ? ` with ${participantId}` : ''}:`, error);
});
```

### MediaManager

Handles media device access and stream management.

#### Methods

##### `getUserMedia(constraints?: MediaStreamConstraints): Promise<MediaStream>`

Gets user media stream with specified constraints.

**Parameters:**
- `constraints` (optional): Media stream constraints

**Default Constraints:**
```typescript
{
  video: {
    width: { ideal: 1280 },
    height: { ideal: 720 },
    frameRate: { ideal: 30 }
  },
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true
  }
}
```

**Example:**
```typescript
const stream = await MediaManager.getUserMedia({
  video: { width: 640, height: 480 },
  audio: true
});
```

##### `getDisplayMedia(constraints?: DisplayMediaStreamConstraints): Promise<MediaStream>`

Gets screen sharing stream.

**Parameters:**
- `constraints` (optional): Display media constraints

**Example:**
```typescript
const screenStream = await MediaManager.getDisplayMedia({
  video: { mediaSource: 'screen' },
  audio: true
});
```

##### `enumerateDevices(): Promise<MediaDeviceInfo[]>`

Lists available media devices.

**Returns:**
- `Promise<MediaDeviceInfo[]>`: Array of available devices

**Example:**
```typescript
const devices = await MediaManager.enumerateDevices();
const cameras = devices.filter(device => device.kind === 'videoinput');
const microphones = devices.filter(device => device.kind === 'audioinput');
```

##### `switchCamera(deviceId: string): Promise<MediaStream>`

Switches to a different camera.

**Parameters:**
- `deviceId` (string): Device ID of the camera to switch to

**Example:**
```typescript
const newStream = await MediaManager.switchCamera('camera-device-id');
```

##### `stopStream(stream: MediaStream): void`

Stops all tracks in a media stream.

**Parameters:**
- `stream` (MediaStream): Stream to stop

**Example:**
```typescript
MediaManager.stopStream(localStream);
```

## 📦 State Management API

### useVideoStore

Zustand store for video call state management.

#### State Properties

```typescript
interface VideoStoreState {
  // Connection state
  isConnected: boolean;
  currentRoomId: string | null;
  connectionQuality: 'poor' | 'good' | 'excellent';
  
  // Media state
  localStream: MediaStream | null;
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  isScreenSharing: boolean;
  
  // Participants
  participants: Participant[];
  remoteStreams: Map<string, MediaStream>;
  
  // Call state
  callStartTime: Date | null;
  callDuration: number;
  isRecording: boolean;
  recordingUrl: string | null;
}
```

#### Actions

##### `joinRoom(roomId: string): Promise<void>`

Joins a video call room.

**Parameters:**
- `roomId` (string): Unique room identifier

**Example:**
```typescript
const { joinRoom } = useVideoStore();
await joinRoom('room-123');
```

##### `leaveRoom(): void`

Leaves current video call room.

**Example:**
```typescript
const { leaveRoom } = useVideoStore();
leaveRoom();
```

##### `toggleVideo(): void`

Toggles local video stream.

**Example:**
```typescript
const { toggleVideo } = useVideoStore();
toggleVideo();
```

##### `toggleAudio(): void`

Toggles local audio stream.

**Example:**
```typescript
const { toggleAudio } = useVideoStore();
toggleAudio();
```

##### `startScreenShare(): Promise<void>`

Starts screen sharing.

**Example:**
```typescript
const { startScreenShare } = useVideoStore();
await startScreenShare();
```

##### `stopScreenShare(): void`

Stops screen sharing.

**Example:**
```typescript
const { stopScreenShare } = useVideoStore();
stopScreenShare();
```

##### `startRecording(): Promise<void>`

Starts call recording.

**Example:**
```typescript
const { startRecording } = useVideoStore();
await startRecording();
```

##### `stopRecording(): Promise<string>`

Stops call recording and returns download URL.

**Returns:**
- `Promise<string>`: URL for downloading the recording

**Example:**
```typescript
const { stopRecording } = useVideoStore();
const recordingUrl = await stopRecording();
```

##### `addParticipant(participant: Participant): void`

Adds a new participant to the call.

**Parameters:**
- `participant` (Participant): Participant object

##### `removeParticipant(participantId: string): void`

Removes a participant from the call.

**Parameters:**
- `participantId` (string): Participant ID to remove

##### `updateConnectionQuality(quality: 'poor' | 'good' | 'excellent'): void`

Updates connection quality indicator.

**Parameters:**
- `quality`: Connection quality level

### useAuthStore

Authentication state management.

#### State Properties

```typescript
interface AuthStoreState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
```

#### Actions

##### `login(credentials: LoginCredentials): Promise<void>`

Logs in a user.

**Parameters:**
```typescript
interface LoginCredentials {
  email: string;
  password: string;
}
```

**Example:**
```typescript
const { login } = useAuthStore();
await login({ email: 'user@example.com', password: 'password123' });
```

##### `logout(): void`

Logs out the current user.

**Example:**
```typescript
const { logout } = useAuthStore();
logout();
```

##### `createDemoUser(): void`

Creates a temporary demo user for testing.

**Example:**
```typescript
const { createDemoUser } = useAuthStore();
createDemoUser();
```

##### `updateProfile(updates: Partial<User>): Promise<void>`

Updates user profile.

**Parameters:**
- `updates`: Partial user object with fields to update

**Example:**
```typescript
const { updateProfile } = useAuthStore();
await updateProfile({ name: 'New Name', avatar: 'new-avatar-url' });
```

## 🧩 Component API

### VideoGrid

Responsive grid component for displaying video streams.

#### Props

```typescript
interface VideoGridProps {
  participants: Participant[];
  layout?: 'auto' | 'grid' | 'speaker' | 'gallery';
  maxParticipants?: number;
  onParticipantClick?: (participant: Participant) => void;
  className?: string;
}
```

#### Example

```typescript
<VideoGrid
  participants={participants}
  layout="gallery"
  maxParticipants={16}
  onParticipantClick={(participant) => {
    console.log('Clicked:', participant.name);
  }}
/>
```

### ControlPanel

Video call control buttons panel.

#### Props

```typescript
interface ControlPanelProps {
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  isScreenSharing: boolean;
  isRecording: boolean;
  onToggleVideo: () => void;
  onToggleAudio: () => void;
  onToggleScreenShare: () => void;
  onToggleRecording: () => void;
  onEndCall: () => void;
  disabled?: boolean;
  className?: string;
}
```

#### Example

```typescript
<ControlPanel
  isVideoEnabled={isVideoEnabled}
  isAudioEnabled={isAudioEnabled}
  isScreenSharing={isScreenSharing}
  isRecording={isRecording}
  onToggleVideo={toggleVideo}
  onToggleAudio={toggleAudio}
  onToggleScreenShare={toggleScreenShare}
  onToggleRecording={toggleRecording}
  onEndCall={leaveRoom}
/>
```

### ChatPanel

Real-time chat component.

#### Props

```typescript
interface ChatPanelProps {
  roomId: string;
  currentUser: User;
  onSendMessage: (message: string) => void;
  onSendFile?: (file: File) => void;
  className?: string;
}
```

#### Example

```typescript
<ChatPanel
  roomId="room-123"
  currentUser={user}
  onSendMessage={(message) => {
    chatService.sendMessage(roomId, message);
  }}
  onSendFile={(file) => {
    chatService.sendFile(roomId, file);
  }}
/>
```

### TranscriptionPanel

Speech-to-text transcription display.

#### Props

```typescript
interface TranscriptionPanelProps {
  roomId: string;
  language?: string;
  showSpeakerLabels?: boolean;
  showTimestamps?: boolean;
  onTranscriptionUpdate?: (transcript: TranscriptEntry) => void;
  className?: string;
}
```

#### Example

```typescript
<TranscriptionPanel
  roomId="room-123"
  language="en-US"
  showSpeakerLabels={true}
  showTimestamps={true}
  onTranscriptionUpdate={(transcript) => {
    console.log('New transcript:', transcript);
  }}
/>
```

## 🎣 Hooks API

### useVideoCall

Custom hook for video call functionality.

#### Parameters

```typescript
interface UseVideoCallOptions {
  roomId: string;
  autoJoin?: boolean;
  mediaConstraints?: MediaStreamConstraints;
}
```

#### Return Value

```typescript
interface UseVideoCallReturn {
  // State
  isConnected: boolean;
  participants: Participant[];
  localStream: MediaStream | null;
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  error: Error | null;
  
  // Actions
  connect: () => Promise<void>;
  disconnect: () => void;
  toggleVideo: () => void;
  toggleAudio: () => void;
  
  // Advanced
  startScreenShare: () => Promise<void>;
  stopScreenShare: () => void;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<string>;
}
```

#### Example

```typescript
const {
  isConnected,
  participants,
  connect,
  disconnect,
  toggleVideo,
  toggleAudio
} = useVideoCall({
  roomId: 'room-123',
  autoJoin: true,
  mediaConstraints: {
    video: { width: 1280, height: 720 },
    audio: true
  }
});
```

### useMediaDevices

Hook for managing media devices.

#### Return Value

```typescript
interface UseMediaDevicesReturn {
  devices: MediaDeviceInfo[];
  selectedCamera: string | null;
  selectedMicrophone: string | null;
  selectedSpeaker: string | null;
  
  selectCamera: (deviceId: string) => Promise<void>;
  selectMicrophone: (deviceId: string) => Promise<void>;
  selectSpeaker: (deviceId: string) => Promise<void>;
  refreshDevices: () => Promise<void>;
}
```

#### Example

```typescript
const {
  devices,
  selectedCamera,
  selectCamera,
  refreshDevices
} = useMediaDevices();

const cameras = devices.filter(device => device.kind === 'videoinput');
```

### useScreenShare

Hook for screen sharing functionality.

#### Return Value

```typescript
interface UseScreenShareReturn {
  isScreenSharing: boolean;
  screenStream: MediaStream | null;
  error: Error | null;
  
  startScreenShare: () => Promise<void>;
  stopScreenShare: () => void;
}
```

#### Example

```typescript
const {
  isScreenSharing,
  screenStream,
  startScreenShare,
  stopScreenShare
} = useScreenShare();
```

### useRecording

Hook for call recording functionality.

#### Return Value

```typescript
interface UseRecordingReturn {
  isRecording: boolean;
  recordingDuration: number;
  recordingUrl: string | null;
  error: Error | null;
  
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<string>;
  pauseRecording: () => void;
  resumeRecording: () => void;
}
```

#### Example

```typescript
const {
  isRecording,
  recordingDuration,
  startRecording,
  stopRecording
} = useRecording();
```

## 🔧 Utility Functions

### Media Utilities

#### `getOptimalVideoConstraints(connectionQuality: string): MediaStreamConstraints`

Returns optimal video constraints based on connection quality.

**Parameters:**
- `connectionQuality`: 'poor' | 'good' | 'excellent'

**Returns:**
- `MediaStreamConstraints`: Optimized constraints

**Example:**
```typescript
const constraints = getOptimalVideoConstraints('poor');
// Returns: { video: { width: 320, height: 240, frameRate: 15 }, audio: true }
```

#### `analyzeConnectionQuality(stats: RTCStatsReport): ConnectionQuality`

Analyzes WebRTC stats to determine connection quality.

**Parameters:**
- `stats`: WebRTC stats report

**Returns:**
- `ConnectionQuality`: Quality assessment object

**Example:**
```typescript
const stats = await peerConnection.getStats();
const quality = analyzeConnectionQuality(stats);
console.log('Connection quality:', quality.level); // 'poor' | 'good' | 'excellent'
```

### Format Utilities

#### `formatDuration(milliseconds: number): string`

Formats duration in milliseconds to human-readable string.

**Example:**
```typescript
formatDuration(125000); // Returns: "2:05"
formatDuration(3665000); // Returns: "1:01:05"
```

#### `formatFileSize(bytes: number): string`

Formats file size in bytes to human-readable string.

**Example:**
```typescript
formatFileSize(1024); // Returns: "1 KB"
formatFileSize(1048576); // Returns: "1 MB"
```

### Validation Utilities

#### `validateRoomId(roomId: string): boolean`

Validates room ID format.

**Example:**
```typescript
validateRoomId('room-123'); // Returns: true
validateRoomId('invalid id'); // Returns: false
```

#### `validateEmail(email: string): boolean`

Validates email address format.

**Example:**
```typescript
validateEmail('user@example.com'); // Returns: true
validateEmail('invalid-email'); // Returns: false
```

## 📡 Event System

### VideoCallEvents

Event system for video call lifecycle events.

#### Events

##### `'call:started'`

Emitted when a call starts.

**Event Data:**
```typescript
{
  roomId: string;
  participants: Participant[];
  timestamp: Date;
}
```

##### `'call:ended'`

Emitted when a call ends.

**Event Data:**
```typescript
{
  roomId: string;
  duration: number;
  timestamp: Date;
}
```

##### `'participant:joined'`

Emitted when a participant joins.

**Event Data:**
```typescript
{
  participant: Participant;
  roomId: string;
  timestamp: Date;
}
```

##### `'participant:left'`

Emitted when a participant leaves.

**Event Data:**
```typescript
{
  participantId: string;
  roomId: string;
  timestamp: Date;
}
```

##### `'media:toggle'`

Emitted when media state changes.

**Event Data:**
```typescript
{
  participantId: string;
  type: 'video' | 'audio';
  enabled: boolean;
  timestamp: Date;
}
```

#### Usage

```typescript
import { VideoCallEvents } from './events';

// Listen to events
VideoCallEvents.on('participant:joined', ({ participant, roomId }) => {
  console.log(`${participant.name} joined room ${roomId}`);
});

// Emit events
VideoCallEvents.emit('call:started', {
  roomId: 'room-123',
  participants: [],
  timestamp: new Date()
});
```

## ⚙️ Configuration API

### Application Configuration

#### Environment Variables

```typescript
interface AppConfig {
  // Application
  APP_NAME: string;
  APP_VERSION: string;
  
  // WebRTC
  STUN_SERVERS: string[];
  TURN_SERVERS: TurnServer[];
  
  // Features
  ENABLE_RECORDING: boolean;
  ENABLE_TRANSCRIPTION: boolean;
  ENABLE_SCREEN_SHARE: boolean;
  
  // Limits
  MAX_PARTICIPANTS: number;
  MAX_FILE_SIZE: number;
  MAX_RECORDING_DURATION: number;
}
```

#### Configuration Functions

##### `getConfig(): AppConfig`

Gets current application configuration.

**Example:**
```typescript
const config = getConfig();
console.log('Max participants:', config.MAX_PARTICIPANTS);
```

##### `updateConfig(updates: Partial<AppConfig>): void`

Updates application configuration.

**Example:**
```typescript
updateConfig({
  MAX_PARTICIPANTS: 25,
  ENABLE_RECORDING: false
});
```

### Theme Configuration

#### `setTheme(theme: 'light' | 'dark' | 'auto'): void`

Sets application theme.

**Example:**
```typescript
setTheme('dark');
```

#### `getTheme(): 'light' | 'dark' | 'auto'`

Gets current theme setting.

**Example:**
```typescript
const currentTheme = getTheme();
```

---

This API documentation provides comprehensive coverage of Stream's programmatic interfaces. Use these APIs to integrate, extend, and customize the video communication platform.