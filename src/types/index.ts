export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  isOnline: boolean;
}

export interface Message {
  id: string;
  sender: User;
  content: string;
  timestamp: Date;
  type: 'text' | 'file' | 'system';
}

export interface Room {
  id: string;
  name: string;
  type: 'one-on-one' | 'group' | 'webinar';
  participants: User[];
  host: User;
  isActive: boolean;
  createdAt: Date;
}

export interface VideoStream {
  id: string;
  user: User;
  stream: MediaStream;
  isScreenShare: boolean;
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
}

export interface TranscriptionResult {
  id: string;
  text: string;
  confidence: number;
  timestamp: Date;
  speaker: string;
  isSignLanguage: boolean;
}

export interface ScreenShare {
  id: string;
  user: User;
  stream: MediaStream;
  isActive: boolean;
}

export interface Recording {
  id: string;
  roomId: string;
  fileName: string;
  duration: number;
  size: number;
  createdAt: Date;
  url?: string;
}

export type CallType = 'one-on-one' | 'group' | 'webinar';
export type MediaType = 'audio' | 'video' | 'screen';
export type TranscriptionMode = 'speech' | 'sign-language' | 'both';

export interface Document {
  id: string;
  title: string;
  content: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  isPublic: boolean;
  contributors: string[];
  version: number;
}

export interface DocumentChange {
  id: string;
  documentId: string;
  userId: string;
  userName: string;
  change: {
    type: 'insert' | 'delete' | 'format';
    position: number;
    text?: string;
    length?: number;
    format?: {
      bold?: boolean;
      italic?: boolean;
      underline?: boolean;
      color?: string;
    };
  };
  timestamp: Date;
  approved: boolean;
  pending: boolean;
}

export interface DocumentPermission {
  userId: string;
  userName: string;
  permission: 'view' | 'edit' | 'approve';
  grantedBy: string;
  grantedAt: Date;
}
