import { useState, useEffect, useRef } from 'react'
import { useAuthStore } from '../store/useAuthStore'
import { 
  Save, Download, Upload, Trash2, FileText, Bold, Italic, 
  Underline, Strikethrough, AlignLeft, AlignCenter, AlignRight, 
  AlignJustify, List, ListOrdered, Heading1, Heading2, Heading3,
  Minus, X, Maximize2, Minimize2, MoreHorizontal, MoreVertical
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'

interface DocumentContent {
  id: string
  title: string
  content: string
  createdAt: Date
  updatedAt: Date
  createdBy: string
  collaborators: string[]
  isPublic: boolean
  template?: string
}

interface DocumentState {
  documents: DocumentContent[]
  currentDocument: DocumentContent | null
  isEditing: boolean
  showCollaborators: boolean
  position: { x: number; y: number }
  size: { width: number; height: number }
  isMinimized: boolean
  isMaximized: boolean
}

const CollaborativeDocument = () => {
  const { user: currentUser } = useAuthStore()

  const [state, setState] = useState<DocumentState>({
    documents: [],
    currentDocument: null,
    isEditing: false,
    showCollaborators: false,
    position: { x: 50, y: 50 },
    size: { width: 800, height: 600 },
    isMinimized: false,
    isMaximized: false
  })

  const [showDocumentList, setShowDocumentList] = useState(false)
  const [showTemplates, setShowTemplates] = useState(false)
  const [fontSize, setFontSize] = useState(16)
  const [fontFamily, setFontFamily] = useState('Arial')
  const [textColor, setTextColor] = useState('#000000')
  const [backgroundColor, setBackgroundColor] = useState('#ffffff')
  const [isDragging, setIsDragging] = useState(false)
  const [showAdvancedToolbar, setShowAdvancedToolbar] = useState(false)
  const [showDocActionsMenu, setShowDocActionsMenu] = useState(false)
  const [showWindowMenu, setShowWindowMenu] = useState(false)
  const [windowSizePreset, setWindowSizePreset] = useState<'compact' | 'default' | 'wide'>('default')

  const editorRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const importInputRef = useRef<HTMLInputElement>(null)

  // Font options
  const fonts = [
    'Arial', 'Helvetica', 'Times New Roman', 'Georgia', 'Verdana', 
    'Courier New', 'Impact', 'Comic Sans MS', 'Tahoma', 'Trebuchet MS'
  ]

  // Templates
  const templates = [
    { id: 'blank', name: 'Blank Document', icon: FileText },
    { id: 'meeting-notes', name: 'Meeting Notes', icon: FileText },
    { id: 'presentation', name: 'Presentation', icon: FileText },
    { id: 'agenda', name: 'Meeting Agenda', icon: FileText }
  ]

  // Load documents from localStorage on mount
  useEffect(() => {
    const savedDocuments = localStorage.getItem('striim-documents')
    if (savedDocuments) {
      try {
        const documents = JSON.parse(savedDocuments)
        setState(prev => ({ ...prev, documents }))
      } catch (error) {
        console.error('Error loading documents:', error)
      }
    }
  }, [])

  // Save documents to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('striim-documents', JSON.stringify(state.documents))
  }, [state.documents])

  const createNewDocument = (template?: string) => {
    if (!currentUser) {
      toast.error('Please log in to create documents')
      return
    }

    const newDocument: DocumentContent = {
      id: `doc-${Date.now()}`,
      title: `New Document ${state.documents.length + 1}`,
      content: getTemplateContent(template),
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: currentUser.id,
      collaborators: [currentUser.id],
      isPublic: false,
      template
    }

    setState(prev => ({
      ...prev,
      documents: [...prev.documents, newDocument],
      currentDocument: newDocument,
      isEditing: true
    }))

    toast.success('New document created!')
  }

  const getTemplateContent = (template?: string): string => {
    switch (template) {
      case 'meeting-notes':
        return `
          <h1>Meeting Notes</h1>
          <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
          <p><strong>Attendees:</strong></p>
          <ul><li></li></ul>
          <h2>Agenda</h2>
          <ol><li></li></ol>
          <h2>Action Items</h2>
          <ul><li></li></ul>
        `
      case 'presentation':
        return `
          <h1>Presentation Title</h1>
          <h2>Slide 1</h2>
          <p>Your content here...</p>
          <h2>Slide 2</h2>
          <p>More content...</p>
        `
      case 'agenda':
        return `
          <h1>Meeting Agenda</h1>
          <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
          <p><strong>Time:</strong></p>
          <p><strong>Location:</strong></p>
          <h2>Agenda Items</h2>
          <ol><li></li></ol>
        `
      default:
        return '<p>Start typing your document...</p>'
    }
  }

  const saveDocument = () => {
    if (!state.currentDocument || !editorRef.current) return

    const updatedDocument = {
      ...state.currentDocument,
      content: editorRef.current.innerHTML,
      updatedAt: new Date()
    }

    setState(prev => ({
      ...prev,
      documents: prev.documents.map(doc => 
        doc.id === updatedDocument.id ? updatedDocument : doc
      ),
      currentDocument: updatedDocument
    }))

    toast.success('Document saved!')
  }

  const deleteDocument = (documentId: string) => {
    setState(prev => ({
      ...prev,
      documents: prev.documents.filter(doc => doc.id !== documentId),
      currentDocument: prev.currentDocument?.id === documentId ? null : prev.currentDocument
    }))

    toast.success('Document deleted!')
  }

  const loadDocument = (document: DocumentContent) => {
    setState(prev => ({
      ...prev,
      currentDocument: document,
      isEditing: true
    }))
  }

  const exportDocument = () => {
    if (!state.currentDocument) return

    const element = document.createElement('a')
    const file = new Blob([state.currentDocument.content], { type: 'text/html' })
    element.href = URL.createObjectURL(file)
    element.download = `${state.currentDocument.title}.html`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)

    toast.success('Document exported!')
  }

  const importDocument = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !currentUser) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      const newDocument: DocumentContent = {
        id: `doc-${Date.now()}`,
        title: file.name.replace('.html', ''),
        content,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: currentUser.id,
        collaborators: [currentUser.id],
        isPublic: false
      }

      setState(prev => ({
        ...prev,
        documents: [...prev.documents, newDocument],
        currentDocument: newDocument,
        isEditing: true
      }))

      toast.success('Document imported!')
    }
    reader.readAsText(file)
  }

  const applyFormat = (command: string, value?: string) => {
    if (!editorRef.current) return
    document.execCommand(command, false, value)
    editorRef.current.focus()
  }

  const toggleMinimize = () => {
    setState(prev => ({ ...prev, isMinimized: !prev.isMinimized }))
  }

  const toggleMaximize = () => {
    setState(prev => ({ ...prev, isMaximized: !prev.isMaximized }))
  }

  const applyWindowSizePreset = (preset: 'compact' | 'default' | 'wide') => {
    const sizes = {
      compact: { width: 640, height: 420 },
      default: { width: 800, height: 600 },
      wide: { width: 1040, height: 720 }
    }
    setWindowSizePreset(preset)
    setState(prev => ({
      ...prev,
      isMaximized: false,
      size: sizes[preset]
    }))
    setShowWindowMenu(false)
  }

  const cycleWindowSize = () => {
    const order: Array<'compact' | 'default' | 'wide'> = ['compact', 'default', 'wide']
    const currentIndex = order.indexOf(windowSizePreset)
    const next = order[(currentIndex + 1) % order.length]
    applyWindowSizePreset(next)
  }

  if (state.isMinimized) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="fixed bottom-4 right-4 z-50"
        style={{ left: state.position.x, top: state.position.y }}
      >
        <button
          onClick={toggleMinimize}
          className="flex items-center space-x-2 rounded-xl border border-gray-200 bg-white p-3 text-gray-900 shadow-lg hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:hover:bg-gray-800"
        >
          <FileText className="w-5 h-5" />
          <span>Canvas</span>
        </button>
      </motion.div>
    )
  }

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ 
        opacity: 1, 
        scale: 1,
        width: state.isMaximized ? '100vw' : state.size.width,
        height: state.isMaximized ? '100vh' : state.size.height
      }}
      className="fixed z-50 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-800"
      style={{
        left: state.isMaximized ? 0 : state.position.x,
        top: state.isMaximized ? 0 : state.position.y
      }}
      drag={isDragging}
      dragMomentum={false}
    >
      {/* Header */}
      <div 
        className="flex cursor-move items-center justify-between border-b border-gray-200 bg-gray-50 px-4 py-2 dark:border-gray-700 dark:bg-gray-900"
        onMouseDown={() => setIsDragging(true)}
        onMouseUp={() => setIsDragging(false)}
      >
        <div className="flex items-center space-x-3">
          <FileText className="w-4 h-4 text-gray-600 dark:text-gray-300" />
          <div>
            <span className="block text-sm font-semibold text-gray-900 dark:text-white">
              Canvas
            </span>
            <span className="block text-xs text-gray-500 dark:text-gray-400">
              {state.currentDocument?.title || 'Untitled document'}
            </span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button onClick={cycleWindowSize} className="menu-trigger text-xs" title="Toggle window size">
            {windowSizePreset === 'compact' ? 'S' : windowSizePreset === 'default' ? 'M' : 'L'}
          </button>
          <div className="relative">
            <button onClick={() => setShowWindowMenu(prev => !prev)} className="icon-btn h-8 w-8" title="Window actions">
              <MoreVertical className="w-4 h-4" />
            </button>
            <AnimatePresence>
              {showWindowMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="absolute right-0 top-9 z-20 w-36 rounded-xl border border-gray-200 bg-white p-1 shadow-lg dark:border-gray-700 dark:bg-gray-900"
                >
                  <button onClick={() => applyWindowSizePreset('compact')} className="w-full rounded-lg px-2.5 py-1.5 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-800">Small</button>
                  <button onClick={() => applyWindowSizePreset('default')} className="w-full rounded-lg px-2.5 py-1.5 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-800">Medium</button>
                  <button onClick={() => applyWindowSizePreset('wide')} className="w-full rounded-lg px-2.5 py-1.5 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-800">Large</button>
                  <button
                    onClick={() => {
                      toggleMaximize()
                      setShowWindowMenu(false)
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    {state.isMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                    {state.isMaximized ? 'Restore' : 'Fullscreen'}
                  </button>
                  <button onClick={() => { toggleMinimize(); setShowWindowMenu(false) }} className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-800">
                    <Minus className="w-4 h-4" />
                    Minimize
                  </button>
                  <button onClick={() => { setState(prev => ({ ...prev, isEditing: false })); setShowWindowMenu(false) }} className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-sm text-red-600 hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-950/30">
                    <X className="w-4 h-4" />
                    Close
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="border-b border-gray-200 bg-white p-2 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <button onClick={() => setShowDocActionsMenu(prev => !prev)} className="menu-trigger" title="Document actions">
              <FileText className="w-4 h-4" />
              Doc
              <MoreHorizontal className="w-4 h-4" />
            </button>
            <AnimatePresence>
              {showDocActionsMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="absolute left-0 top-11 z-20 w-36 rounded-xl border border-gray-200 bg-white p-1 shadow-lg dark:border-gray-700 dark:bg-gray-900"
                >
                  <button onClick={() => { setShowDocumentList(!showDocumentList); setShowDocActionsMenu(false) }} className="w-full rounded-lg px-2.5 py-1.5 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-800">Docs</button>
                  <button onClick={() => { setShowTemplates(!showTemplates); setShowDocActionsMenu(false) }} className="w-full rounded-lg px-2.5 py-1.5 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-800">Templates</button>
                  <button onClick={() => { saveDocument(); setShowDocActionsMenu(false) }} className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-800"><Save className="w-4 h-4" />Save</button>
                  <button onClick={() => { exportDocument(); setShowDocActionsMenu(false) }} className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-800"><Download className="w-4 h-4" />Export</button>
                  <button onClick={() => { importInputRef.current?.click(); setShowDocActionsMenu(false) }} className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-800"><Upload className="w-4 h-4" />Import</button>
                </motion.div>
              )}
            </AnimatePresence>
            <input ref={importInputRef} type="file" accept=".html" onChange={importDocument} className="hidden" />
          </div>

          <div className="flex items-center gap-1 rounded-xl border border-gray-200 bg-gray-50 p-1 dark:border-gray-700 dark:bg-gray-900">
            <select
              value={fontFamily}
              onChange={(e) => {
                setFontFamily(e.target.value)
                applyFormat('fontName', e.target.value)
              }}
              className="rounded-lg border border-gray-300 bg-white px-2 py-1 text-sm dark:border-gray-700 dark:bg-gray-800"
            >
              {fonts.map(font => (
                <option key={font} value={font}>{font}</option>
              ))}
            </select>
            <select
              value={fontSize}
              onChange={(e) => {
                setFontSize(Number(e.target.value))
                applyFormat('fontSize', e.target.value)
              }}
              className="w-16 rounded-lg border border-gray-300 bg-white px-2 py-1 text-sm dark:border-gray-700 dark:bg-gray-800"
            >
              {[8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 26, 28, 36, 48, 72].map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
            <button onClick={() => applyFormat('bold')} className="rounded-lg p-2 hover:bg-white dark:hover:bg-gray-800" title="Bold"><Bold className="w-4 h-4" /></button>
            <button onClick={() => applyFormat('italic')} className="rounded-lg p-2 hover:bg-white dark:hover:bg-gray-800" title="Italic"><Italic className="w-4 h-4" /></button>
            <button onClick={() => applyFormat('underline')} className="rounded-lg p-2 hover:bg-white dark:hover:bg-gray-800" title="Underline"><Underline className="w-4 h-4" /></button>
          </div>

          <div className="flex items-center gap-1 rounded-xl border border-gray-200 bg-gray-50 p-1 dark:border-gray-700 dark:bg-gray-900">
            <button onClick={() => applyFormat('justifyLeft')} className="rounded-lg p-2 hover:bg-white dark:hover:bg-gray-800" title="Align Left"><AlignLeft className="w-4 h-4" /></button>
            <button onClick={() => applyFormat('justifyCenter')} className="rounded-lg p-2 hover:bg-white dark:hover:bg-gray-800" title="Align Center"><AlignCenter className="w-4 h-4" /></button>
            <button onClick={() => applyFormat('insertUnorderedList')} className="rounded-lg p-2 hover:bg-white dark:hover:bg-gray-800" title="Bullet List"><List className="w-4 h-4" /></button>
          </div>

          <button onClick={() => setShowAdvancedToolbar(prev => !prev)} className="menu-trigger" title="More tools">
            <MoreHorizontal className="w-4 h-4" />
            More
          </button>
        </div>

        <AnimatePresence>
          {showAdvancedToolbar && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="mt-2 flex flex-wrap items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 p-2 dark:border-gray-700 dark:bg-gray-900"
            >
              <button onClick={() => applyFormat('strikeThrough')} className="rounded-lg p-2 hover:bg-white dark:hover:bg-gray-800" title="Strikethrough"><Strikethrough className="w-4 h-4" /></button>
              <button onClick={() => applyFormat('justifyRight')} className="rounded-lg p-2 hover:bg-white dark:hover:bg-gray-800" title="Align Right"><AlignRight className="w-4 h-4" /></button>
              <button onClick={() => applyFormat('justifyFull')} className="rounded-lg p-2 hover:bg-white dark:hover:bg-gray-800" title="Justify"><AlignJustify className="w-4 h-4" /></button>
              <button onClick={() => applyFormat('insertOrderedList')} className="rounded-lg p-2 hover:bg-white dark:hover:bg-gray-800" title="Numbered List"><ListOrdered className="w-4 h-4" /></button>
              <button onClick={() => applyFormat('formatBlock', '<h1>')} className="rounded-lg p-2 hover:bg-white dark:hover:bg-gray-800" title="Heading 1"><Heading1 className="w-4 h-4" /></button>
              <button onClick={() => applyFormat('formatBlock', '<h2>')} className="rounded-lg p-2 hover:bg-white dark:hover:bg-gray-800" title="Heading 2"><Heading2 className="w-4 h-4" /></button>
              <button onClick={() => applyFormat('formatBlock', '<h3>')} className="rounded-lg p-2 hover:bg-white dark:hover:bg-gray-800" title="Heading 3"><Heading3 className="w-4 h-4" /></button>
              <label className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs dark:border-gray-700 dark:bg-gray-800">
                Text
                <input
                  type="color"
                  value={textColor}
                  onChange={(e) => {
                    setTextColor(e.target.value)
                    applyFormat('foreColor', e.target.value)
                  }}
                  className="h-6 w-6 cursor-pointer border-0 p-0"
                  title="Text Color"
                />
              </label>
              <label className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs dark:border-gray-700 dark:bg-gray-800">
                Highlight
                <input
                  type="color"
                  value={backgroundColor}
                  onChange={(e) => {
                    setBackgroundColor(e.target.value)
                    applyFormat('hiliteColor', e.target.value)
                  }}
                  className="h-6 w-6 cursor-pointer border-0 p-0"
                  title="Background Color"
                />
              </label>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Content Area */}
      <div className="flex h-full">
        {/* Sidebar */}
        <AnimatePresence>
          {(showDocumentList || showTemplates) && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 250, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="overflow-hidden border-r border-gray-200 bg-gray-50/70 dark:border-gray-700 dark:bg-gray-900/60"
            >
              {showDocumentList && (
                <div className="p-4">
                  <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">Documents</h3>
                  <div className="space-y-2">
                    {state.documents.map(doc => (
                      <div
                        key={doc.id}
                        className="cursor-pointer rounded-xl border border-gray-200 bg-white p-2.5 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
                        onClick={() => loadDocument(doc)}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium truncate">{doc.title}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteDocument(doc.id)
                            }}
                            className="rounded-md p-1 text-red-500 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/20"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(doc.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => createNewDocument()} className="mt-3 w-full rounded-lg border border-gray-900 bg-gray-900 px-3 py-2 text-sm font-medium text-white dark:border-white dark:bg-white dark:text-gray-900">
                    New Document
                  </button>
                </div>
              )}

              {showTemplates && (
                <div className="p-4">
                  <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">Templates</h3>
                  <div className="space-y-2">
                    {templates.map(template => {
                      const Icon = template.icon
                      return (
                        <button
                          key={template.id}
                          onClick={() => {
                            createNewDocument(template.id)
                            setShowTemplates(false)
                          }}
                          className="w-full rounded-xl border border-gray-200 bg-white p-3 text-left hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
                        >
                          <div className="flex items-center space-x-2">
                            <Icon className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                            <span className="text-sm">{template.name}</span>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Editor */}
        <div className="flex-1 flex flex-col">
          <div
            ref={editorRef}
            contentEditable={true}
            onBlur={saveDocument}
            className="flex-1 overflow-y-auto p-4 focus:outline-none"
            style={{
              fontFamily,
              fontSize: `${fontSize}px`,
              color: textColor,
              backgroundColor,
              lineHeight: 1.55
            }}
            dangerouslySetInnerHTML={{
              __html: state.currentDocument?.content || '<p>Start typing your document...</p>'
            }}
          />
        </div>
      </div>
    </motion.div>
  )
}

export default CollaborativeDocument
