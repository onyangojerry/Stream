import { useState, useRef, useEffect } from 'react'
import { useVideoStore } from '../store/useVideoStore'
import { Mic, MicOff, Eye, Download, Trash2, AlertCircle } from 'lucide-react'
import { TranscriptionResult } from '../types'

// Extend SpeechRecognition interface for better TypeScript support
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

const TranscriptionPanel = () => {
  const [isListening, setIsListening] = useState(false)
  const [transcriptionMode, setTranscriptionMode] = useState<'speech' | 'sign-language' | 'both'>('speech')
  const [confidence, setConfidence] = useState(0)
  const [currentSpeaker, setCurrentSpeaker] = useState('Speaker')
  const [error, setError] = useState<string | null>(null)
  const [isSupported, setIsSupported] = useState(true)
  const [interimText, setInterimText] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const { 
    transcriptionResults, 
    addTranscriptionResult, 
    clearTranscription, 
    isTranscriptionEnabled,
    toggleTranscription,
    setTranscriptionMode: setStoreTranscriptionMode
  } = useVideoStore()

  // Check browser support for Web Speech API
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      setError('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [transcriptionResults])

  useEffect(() => {
    setStoreTranscriptionMode(transcriptionMode)
  }, [transcriptionMode, setStoreTranscriptionMode])

  const handleToggleTranscription = () => {
    toggleTranscription()
    if (!isTranscriptionEnabled) {
      startTranscription()
    } else {
      stopTranscription()
    }
  }

  const startTranscription = async () => {
    if (!isSupported) return;
    
    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US'; // Can be made configurable
      
      recognition.onstart = () => {
        setIsListening(true);
        setError(null);
        console.log('Speech recognition started');
      };
      
      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let interimTranscript = '';
        let finalTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const transcript = result[0].transcript;
          const confidence = result[0].confidence || 0.8;
          
          if (result.isFinal) {
            finalTranscript += transcript + ' ';
            setConfidence(confidence);
            
            // Add final transcription result
            const transcriptionResult: TranscriptionResult = {
              id: `trans-${Date.now()}`,
              text: transcript.trim(),
              confidence,
              timestamp: new Date(),
              speaker: currentSpeaker,
              isSignLanguage: false
            };
            
            addTranscriptionResult(transcriptionResult);
          } else {
            interimTranscript += transcript;
          }
        }
        
        setInterimText(interimTranscript);
      };
      
      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error);
        setError(`Speech recognition error: ${event.error}`);
        setIsListening(false);
      };
      
      recognition.onend = () => {
        setIsListening(false);
        setInterimText('');
        console.log('Speech recognition ended');
        
        // Restart if transcription is still enabled and no error occurred
        if (isTranscriptionEnabled && !error) {
          setTimeout(() => {
            if (recognitionRef.current && isTranscriptionEnabled) {
              recognitionRef.current.start();
            }
          }, 100);
        }
      };
      
      recognitionRef.current = recognition;
      recognition.start();
      
    } catch (err) {
      console.error('Failed to start speech recognition:', err);
      setError('Failed to start speech recognition. Please check microphone permissions.');
      setIsListening(false);
    }
  };

  const stopTranscription = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
    setConfidence(0);
    setInterimText('');
    setError(null);
  };

  const handleDownload = () => {
    const content = transcriptionResults.map(result => 
      `[${result.timestamp.toLocaleTimeString()}] ${result.speaker}: ${result.text}`
    ).join('\n')
    
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `transcription-${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  }

  const getConfidenceColor = (conf: number) => {
    if (conf >= 0.9) return 'text-green-600'
    if (conf >= 0.7) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Transcription</h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleToggleTranscription}
              className={`p-2 rounded-lg transition-colors ${
                isTranscriptionEnabled 
                  ? 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
              }`}
              title={isTranscriptionEnabled ? 'Stop Transcription' : 'Start Transcription'}
            >
              {isTranscriptionEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
            </button>
            <button
              onClick={handleDownload}
              className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              title="Download Transcription"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={clearTranscription}
              className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
              title="Clear Transcription"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {/* Mode Selector */}
        <div className="flex space-x-2">
          <button
            onClick={() => setTranscriptionMode('speech')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              transcriptionMode === 'speech'
                ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
            }`}
          >
            Speech
          </button>
          <button
            onClick={() => setTranscriptionMode('sign-language')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              transcriptionMode === 'sign-language'
                ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
            }`}
          >
            Sign Language
          </button>
          <button
            onClick={() => setTranscriptionMode('both')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              transcriptionMode === 'both'
                ? 'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
            }`}
          >
            Both
          </button>
        </div>

        {/* Status */}
        {isTranscriptionEnabled && (
          <div className="mt-3 space-y-2">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={currentSpeaker}
                onChange={(e) => setCurrentSpeaker(e.target.value)}
                placeholder="Speaker name"
                className="flex-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                {transcriptionMode.includes('speech') && (
                  <Mic className={`w-3 h-3 ${isListening ? 'text-green-500' : 'text-gray-400'}`} />
                )}
                {transcriptionMode.includes('sign-language') && (
                  <Eye className={`w-3 h-3 ${isListening ? 'text-green-500' : 'text-gray-400'}`} />
                )}
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {isListening ? 'Listening...' : 'Ready'}
              </span>
              {confidence > 0 && (
                <span className={`text-xs ${getConfidenceColor(confidence)}`}>
                  {Math.round(confidence * 100)}% confidence
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Transcription Results */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {/* Error Display */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-3">
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-red-800 dark:text-red-400">
                  Transcription Error
                </h4>
                <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
                {!isSupported && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-2">
                    Try using Chrome, Edge, or Safari for the best speech recognition experience.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Browser Support Warning */}
        {!isSupported && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mb-3">
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-400">
                  Browser Not Supported
                </h4>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                  Real-time transcription requires a modern browser with Web Speech API support.
                </p>
              </div>
            </div>
          </div>
        )}

        {transcriptionResults.length === 0 && !error ? (
          <div className="text-center text-gray-500 dark:text-gray-400 py-8">
            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
              <Mic className="w-6 h-6" />
            </div>
            <p className="text-sm">No transcription yet</p>
            <p className="text-xs">Start transcription to see results</p>
            {isSupported && (
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                Make sure to allow microphone access when prompted
              </p>
            )}
          </div>
        ) : (
          <>
            {transcriptionResults.map((result) => (
              <div key={result.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                <div className="flex items-start justify-between mb-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      {result.speaker}
                    </span>
                    {result.isSignLanguage && (
                      <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-xs rounded-full">
                        Sign Language
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {formatTime(result.timestamp)}
                  </span>
                </div>
                <p className="text-sm text-gray-900 dark:text-white mb-1">{result.text}</p>
                <div className="flex items-center justify-between">
                  <span className={`text-xs ${getConfidenceColor(result.confidence)}`}>
                    {Math.round(result.confidence * 100)}% confidence
                  </span>
                  <div className="flex items-center space-x-1">
                    {result.isSignLanguage ? (
                      <Eye className="w-3 h-3 text-green-500" />
                    ) : (
                      <Mic className="w-3 h-3 text-blue-500" />
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Interim Text Display */}
            {interimText && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-lg p-3 border-dashed">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-medium text-blue-700 dark:text-blue-400">
                      {currentSpeaker}
                    </span>
                    <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs rounded-full">
                      Live
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-blue-600 dark:text-blue-400">Speaking...</span>
                  </div>
                </div>
                <p className="text-sm text-blue-900 dark:text-blue-100 italic">{interimText}</p>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  )
}

export default TranscriptionPanel
