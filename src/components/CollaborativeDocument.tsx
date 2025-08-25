import { useState, useEffect, useRef } from 'react'
import { useAuthStore } from '../store/useAuthStore'
import { 
  Save, Download, Upload, Trash2, FileText, Type, Bold, Italic, 
  Underline, Strikethrough, AlignLeft, AlignCenter, AlignRight, 
  AlignJustify, List, ListOrdered, Heading1, Heading2, Heading3,
  Minus, X, Maximize2, Minimize2
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

  const editorRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

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
          className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg shadow-lg flex items-center space-x-2"
        >
          <FileText className="w-5 h-5" />
          <span>Document Editor</span>
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
      className="fixed bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50"
      style={{
        left: state.isMaximized ? 0 : state.position.x,
        top: state.isMaximized ? 0 : state.position.y
      }}
      drag={isDragging}
      dragMomentum={false}
    >
      {/* Header */}
      <div 
        className="bg-gray-100 dark:bg-gray-700 px-4 py-2 flex items-center justify-between cursor-move"
        onMouseDown={() => setIsDragging(true)}
        onMouseUp={() => setIsDragging(false)}
      >
        <div className="flex items-center space-x-3">
          <FileText className="w-5 h-5 text-blue-600" />
          <span className="font-semibold text-gray-900 dark:text-white">
            Collaborative Document
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={toggleMinimize}
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
          >
            <Minus className="w-4 h-4" />
          </button>
          <button
            onClick={toggleMaximize}
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
          >
            {state.isMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setState(prev => ({ ...prev, isEditing: false }))}
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-2">
        <div className="flex items-center space-x-2 flex-wrap">
          {/* Document Actions */}
          <div className="flex items-center space-x-1 border-r border-gray-300 pr-2">
            <button
              onClick={() => setShowDocumentList(!showDocumentList)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              title="Documents"
            >
              <FileText className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowTemplates(!showTemplates)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              title="Templates"
            >
              <Type className="w-4 h-4" />
            </button>
            <button
              onClick={saveDocument}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              title="Save"
            >
              <Save className="w-4 h-4" />
            </button>
            <button
              onClick={exportDocument}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              title="Export"
            >
              <Download className="w-4 h-4" />
            </button>
            <label className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer">
              <Upload className="w-4 h-4" />
              <input
                type="file"
                accept=".html"
                onChange={importDocument}
                className="hidden"
              />
            </label>
          </div>

          {/* Text Formatting */}
          <div className="flex items-center space-x-1 border-r border-gray-300 pr-2">
            <select
              value={fontFamily}
              onChange={(e) => {
                setFontFamily(e.target.value)
                applyFormat('fontName', e.target.value)
              }}
              className="px-2 py-1 text-sm border border-gray-300 rounded"
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
              className="px-2 py-1 text-sm border border-gray-300 rounded w-16"
            >
              {[8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 26, 28, 36, 48, 72].map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>

            <button
              onClick={() => applyFormat('bold')}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              title="Bold"
            >
              <Bold className="w-4 h-4" />
            </button>
            <button
              onClick={() => applyFormat('italic')}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              title="Italic"
            >
              <Italic className="w-4 h-4" />
            </button>
            <button
              onClick={() => applyFormat('underline')}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              title="Underline"
            >
              <Underline className="w-4 h-4" />
            </button>
            <button
              onClick={() => applyFormat('strikeThrough')}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              title="Strikethrough"
            >
              <Strikethrough className="w-4 h-4" />
            </button>
          </div>

          {/* Alignment */}
          <div className="flex items-center space-x-1 border-r border-gray-300 pr-2">
            <button
              onClick={() => applyFormat('justifyLeft')}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              title="Align Left"
            >
              <AlignLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => applyFormat('justifyCenter')}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              title="Align Center"
            >
              <AlignCenter className="w-4 h-4" />
            </button>
            <button
              onClick={() => applyFormat('justifyRight')}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              title="Align Right"
            >
              <AlignRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => applyFormat('justifyFull')}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              title="Justify"
            >
              <AlignJustify className="w-4 h-4" />
            </button>
          </div>

          {/* Lists */}
          <div className="flex items-center space-x-1 border-r border-gray-300 pr-2">
            <button
              onClick={() => applyFormat('insertUnorderedList')}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              title="Bullet List"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => applyFormat('insertOrderedList')}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              title="Numbered List"
            >
              <ListOrdered className="w-4 h-4" />
            </button>
          </div>

          {/* Headings */}
          <div className="flex items-center space-x-1 border-r border-gray-300 pr-2">
            <button
              onClick={() => applyFormat('formatBlock', '<h1>')}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              title="Heading 1"
            >
              <Heading1 className="w-4 h-4" />
            </button>
            <button
              onClick={() => applyFormat('formatBlock', '<h2>')}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              title="Heading 2"
            >
              <Heading2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => applyFormat('formatBlock', '<h3>')}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              title="Heading 3"
            >
              <Heading3 className="w-4 h-4" />
            </button>
          </div>

          {/* Colors */}
          <div className="flex items-center space-x-1">
            <input
              type="color"
              value={textColor}
              onChange={(e) => {
                setTextColor(e.target.value)
                applyFormat('foreColor', e.target.value)
              }}
              className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
              title="Text Color"
            />
            <input
              type="color"
              value={backgroundColor}
              onChange={(e) => {
                setBackgroundColor(e.target.value)
                applyFormat('hiliteColor', e.target.value)
              }}
              className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
              title="Background Color"
            />
          </div>
        </div>
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
              className="bg-gray-50 dark:bg-gray-700 border-r border-gray-200 dark:border-gray-600 overflow-hidden"
            >
              {showDocumentList && (
                <div className="p-4">
                  <h3 className="font-semibold mb-3">Documents</h3>
                  <div className="space-y-2">
                    {state.documents.map(doc => (
                      <div
                        key={doc.id}
                        className="p-2 bg-white dark:bg-gray-800 rounded border cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                        onClick={() => loadDocument(doc)}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium truncate">{doc.title}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteDocument(doc.id)
                            }}
                            className="text-red-500 hover:text-red-700"
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
                  <button
                    onClick={() => createNewDocument()}
                    className="w-full mt-3 p-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    New Document
                  </button>
                </div>
              )}

              {showTemplates && (
                <div className="p-4">
                  <h3 className="font-semibold mb-3">Templates</h3>
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
                          className="w-full p-3 text-left bg-white dark:bg-gray-800 rounded border hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          <div className="flex items-center space-x-2">
                            <Icon className="w-4 h-4 text-blue-600" />
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
            className="flex-1 p-4 overflow-y-auto focus:outline-none"
            style={{
              fontFamily,
              fontSize: `${fontSize}px`,
              color: textColor,
              backgroundColor
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
