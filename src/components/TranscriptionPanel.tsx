import { useState, useRef, useEffect } from 'react'
import { useVideoStore } from '../store/useVideoStore'
import { Mic, MicOff, Eye, Download, Trash2 } from 'lucide-react'
import { TranscriptionResult } from '../types'

const TranscriptionPanel = () => {
  const [isListening, setIsListening] = useState(false)
  const [transcriptionMode, setTranscriptionMode] = useState<'speech' | 'sign-language' | 'both'>('speech')
  const [confidence, setConfidence] = useState(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { 
    transcriptionResults, 
    addTranscriptionResult, 
    clearTranscription, 
    isTranscriptionEnabled,
    toggleTranscription,
    setTranscriptionMode: setStoreTranscriptionMode
  } = useVideoStore()

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

  const startTranscription = () => {
    setIsListening(true)
    // Simulate real-time transcription
    const mockTranscriptions = [
      { text: "Hello, how are you today?", speaker: "John", confidence: 0.95, isSignLanguage: false },
      { text: "I'm doing great, thank you!", speaker: "Sarah", confidence: 0.92, isSignLanguage: false },
      { text: "👋 Hello", speaker: "Alex", confidence: 0.88, isSignLanguage: true },
      { text: "Can you hear me clearly?", speaker: "John", confidence: 0.97, isSignLanguage: false },
      { text: "👍 Yes, perfectly", speaker: "Alex", confidence: 0.85, isSignLanguage: true },
    ]

    let index = 0
    const interval = setInterval(() => {
      if (index < mockTranscriptions.length && isTranscriptionEnabled) {
        const mock = mockTranscriptions[index]
        const result: TranscriptionResult = {
          id: `trans-${Date.now()}-${index}`,
          text: mock.text,
          confidence: mock.confidence,
          timestamp: new Date(),
          speaker: mock.speaker,
          isSignLanguage: mock.isSignLanguage
        }
        addTranscriptionResult(result)
        setConfidence(mock.confidence)
        index++
      } else {
        clearInterval(interval)
      }
    }, 3000)

    return () => clearInterval(interval)
  }

  const stopTranscription = () => {
    setIsListening(false)
    setConfidence(0)
  }

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
          <div className="mt-2 flex items-center space-x-2">
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
        )}
      </div>

      {/* Transcription Results */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {transcriptionResults.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 py-8">
            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
              <Mic className="w-6 h-6" />
            </div>
            <p className="text-sm">No transcription yet</p>
            <p className="text-xs">Start transcription to see results</p>
          </div>
        ) : (
          transcriptionResults.map((result) => (
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
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  )
}

export default TranscriptionPanel
