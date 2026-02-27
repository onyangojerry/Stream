import { create } from 'zustand';

interface Recording {
  id: string;
  title: string;
  duration: number;
  size: string;
  date: Date;
  participants: number;
  thumbnail: string;
  isStarred: boolean;
  tags: string[];
  quality: '720p' | '1080p' | '4K';
  format: 'webm' | 'mp4';
  meetingId: string;
  description?: string;
  downloadUrl: string;
  streamUrl: string;
  blob?: Blob;
}

interface RecordingState {
  mediaRecorder: MediaRecorder | null;
  isRecording: boolean;
  isPaused: boolean;
  recordingDuration: number;
  currentMeetingId: string | null;
  currentRecordingTitle: string | null;
  recordings: Recording[];
  currentRecordingId: string | null;
  chunks: Blob[];
  
  // Actions
  startRecording: (meetingId: string, title?: string) => Promise<void>;
  stopRecording: () => void;
  pauseRecording: () => void;
  resumeRecording: () => void;
  deleteRecording: (recordingId: string) => void;
  toggleStarRecording: (recordingId: string) => void;
  downloadRecording: (recordingId: string) => void;
  getRecordings: () => Recording[];
  clearRecordings: () => void;
}

export const useRecordingStore = create<RecordingState>((set, get) => ({
  mediaRecorder: null,
  isRecording: false,
  isPaused: false,
  recordingDuration: 0,
  currentMeetingId: null,
  currentRecordingTitle: null,
  recordings: [
    // Sample recordings for testing
    {
      id: '1',
      title: 'Team Standup - Weekly Review',
      duration: 3600,
      size: '2.4 GB',
      date: new Date(Date.now() - 24 * 60 * 60 * 1000),
      participants: 8,
      thumbnail: '/api/placeholder/320/180',
      isStarred: true,
      tags: ['standup', 'weekly', 'team'],
      quality: '1080p',
      format: 'webm',
      meetingId: 'abc-123-def',
      description: 'Weekly team standup discussing project progress and blockers',
      downloadUrl: '#',
      streamUrl: '#'
    },
    {
      id: '2',
      title: 'Product Planning Session',
      duration: 5400,
      size: '3.8 GB',
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      participants: 12,
      thumbnail: '/api/placeholder/320/180',
      isStarred: false,
      tags: ['planning', 'product', 'strategy'],
      quality: '1080p',
      format: 'webm',
      meetingId: 'xyz-456-ghi',
      description: 'Q1 product roadmap planning and feature prioritization',
      downloadUrl: '#',
      streamUrl: '#'
    }
  ],
  currentRecordingId: null,
  chunks: [],

  startRecording: async (meetingId: string, title = 'Screen Recording') => {
    try {
      if (get().isRecording) return
      // Request screen capture
      const displayMediaStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 30 }
        },
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          sampleRate: 44100
        }
      });

      // Get audio from microphone (optional)
      let audioStream: MediaStream | null = null;
      try {
        audioStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }
        });
      } catch (audioError) {
        console.warn('Could not access microphone:', audioError);
      }

      // Combine streams
      const combinedStream = new MediaStream();
      displayMediaStream.getVideoTracks().forEach(track => {
        combinedStream.addTrack(track);
      });
      
      if (audioStream) {
        audioStream.getAudioTracks().forEach(track => {
          combinedStream.addTrack(track);
        });
      }
      
      displayMediaStream.getAudioTracks().forEach(track => {
        combinedStream.addTrack(track);
      });

      // Create MediaRecorder
      const mediaRecorder = new MediaRecorder(combinedStream, {
        mimeType: 'video/webm;codecs=vp9,opus'
      });

      const recordingId = `recording-${Date.now()}`;
      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const size = (blob.size / (1024 * 1024)).toFixed(1) + ' MB';
        const url = URL.createObjectURL(blob);
        
        // Create thumbnail (placeholder for now)
        const canvas = document.createElement('canvas');
        canvas.width = 320;
        canvas.height = 180;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#1f2937';
          ctx.fillRect(0, 0, 320, 180);
          ctx.fillStyle = '#ffffff';
          ctx.font = '16px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('Screen Recording', 160, 90);
          ctx.fillText(new Date().toLocaleDateString(), 160, 110);
        }
        const thumbnail = canvas.toDataURL();

        const recording: Recording = {
          id: recordingId,
          title,
          duration: get().recordingDuration,
          size,
          date: new Date(),
          participants: 1,
          thumbnail,
          isStarred: false,
          tags: ['screen-recording', 'meeting'],
          quality: '1080p',
          format: 'webm',
          meetingId,
          description: `Screen recording from meeting ${meetingId}`,
          downloadUrl: url,
          streamUrl: url,
          blob
        };

        set(state => ({
          recordings: [recording, ...state.recordings],
          isRecording: false,
          isPaused: false,
          recordingDuration: 0,
          currentMeetingId: null,
          currentRecordingTitle: null,
          currentRecordingId: null,
          mediaRecorder: null,
          chunks: []
        }));

        // Clean up streams
        combinedStream.getTracks().forEach(track => track.stop());
        if (audioStream) {
          audioStream.getTracks().forEach(track => track.stop());
        }
      };

      mediaRecorder.onerror = (event) => {
        console.error('Recording error:', event);
        set({ isRecording: false, mediaRecorder: null, currentMeetingId: null, currentRecordingTitle: null });
      };

      // Handle screen share ending
      displayMediaStream.getVideoTracks()[0].onended = () => {
        if (get().isRecording) {
          get().stopRecording();
        }
      };

      // Start recording
      mediaRecorder.start(1000); // Collect data every second
      
      set({
        mediaRecorder,
        isRecording: true,
        isPaused: false,
        currentMeetingId: meetingId,
        currentRecordingTitle: title,
        currentRecordingId: recordingId,
        chunks
      });

      // Start duration timer
      const startTime = Date.now();
      const timer = setInterval(() => {
        if (!get().isRecording) {
          clearInterval(timer);
          return;
        }
        
        const duration = Math.floor((Date.now() - startTime) / 1000);
        set({ recordingDuration: duration });
      }, 1000);

    } catch (error) {
      console.error('Error starting recording:', error);
      throw error;
    }
  },

  stopRecording: () => {
    const { mediaRecorder } = get();
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
    }
  },

  pauseRecording: () => {
    const { mediaRecorder } = get();
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.pause();
      set({ isPaused: true });
    }
  },

  resumeRecording: () => {
    const { mediaRecorder } = get();
    if (mediaRecorder && mediaRecorder.state === 'paused') {
      mediaRecorder.resume();
      set({ isPaused: false });
    }
  },

  deleteRecording: (recordingId: string) => {
    set(state => {
      const recording = state.recordings.find(r => r.id === recordingId);
      if (recording?.downloadUrl && recording.downloadUrl.startsWith('blob:')) {
        URL.revokeObjectURL(recording.downloadUrl);
      }
      return {
        recordings: state.recordings.filter(r => r.id !== recordingId)
      };
    });
  },

  toggleStarRecording: (recordingId: string) => {
    set(state => ({
      recordings: state.recordings.map(r =>
        r.id === recordingId ? { ...r, isStarred: !r.isStarred } : r
      )
    }));
  },

  downloadRecording: (recordingId: string) => {
    const recording = get().recordings.find(r => r.id === recordingId);
    if (recording) {
      const a = document.createElement('a');
      a.href = recording.downloadUrl;
      a.download = `${recording.title.replace(/[^a-z0-9]/gi, '_')}.${recording.format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  },

  getRecordings: () => get().recordings,

  clearRecordings: () => {
    const { recordings } = get();
    // Clean up blob URLs
    recordings.forEach(recording => {
      if (recording.downloadUrl && recording.downloadUrl.startsWith('blob:')) {
        URL.revokeObjectURL(recording.downloadUrl);
      }
    });
    set({ recordings: [] });
  }
}));
