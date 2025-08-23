import { useState, useEffect, useRef } from 'react'
import { useDocumentStore } from '../store/useDocumentStore'
import { useAuthStore } from '../store/useAuthStore'
import { 
  FileText, 
  Edit, 
  Save, 
  Plus, 
  Check, 
  X, 
  Shield,
  Clock,
  User
} from 'lucide-react'
import toast from 'react-hot-toast'

const CollaborativeDocument = () => {
  const { user: currentUser } = useAuthStore()
  const {
    documents,
    currentDocument,
    documentChanges,
    documentPermissions,
    createDocument,
    updateDocument,
    setCurrentDocument,
    addDocumentChange,
    approveChange,
    rejectChange,

    revokePermission,
    hasPermission
  } = useDocumentStore()

  const [showDocumentList, setShowDocumentList] = useState(false)
  const [showPermissions, setShowPermissions] = useState(false)
  const [showChanges, setShowChanges] = useState(false)
  const [newDocumentTitle, setNewDocumentTitle] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [localContent, setLocalContent] = useState('')
  const editorRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (currentDocument) {
      setLocalContent(currentDocument.content)
    }
  }, [currentDocument])

  const handleCreateDocument = () => {
    if (!newDocumentTitle.trim() || !currentUser) return
    
    createDocument(newDocumentTitle, currentUser.id)
    setNewDocumentTitle('')
    setShowDocumentList(false)
    toast.success('Document created successfully!')
  }

  const handleSaveDocument = () => {
    if (!currentDocument || !currentUser) return
    
    if (hasPermission(currentUser.id, 'edit')) {
      updateDocument(currentDocument.id, localContent)
      setIsEditing(false)
      toast.success('Document saved!')
    } else {
      // Submit change for approval
      addDocumentChange({
        documentId: currentDocument.id,
        userId: currentUser.id,
        userName: currentUser.name,
        change: {
          type: 'insert',
          position: 0,
          text: localContent
        }
      })
      setIsEditing(false)
      toast.success('Changes submitted for approval!')
    }
  }

  const handleApproveChange = (changeId: string) => {
    approveChange(changeId)
    toast.success('Change approved!')
  }

  const handleRejectChange = (changeId: string) => {
    rejectChange(changeId)
    toast.success('Change rejected!')
  }



  const pendingChanges = documentChanges.filter(change => change.pending)
  const canEdit = currentUser && currentDocument && hasPermission(currentUser.id, 'edit')
  const canApprove = currentUser && hasPermission(currentUser.id, 'approve')

  return (
    <div className="w-full h-full bg-white dark:bg-gray-800 rounded-lg shadow-lg flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <FileText className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Collaborative Document
              </h2>
              {currentDocument && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {currentDocument.title} • v{currentDocument.version}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowDocumentList(!showDocumentList)}
              className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              title="Document List"
            >
              <FileText className="w-5 h-5" />
            </button>
            
            <button
              onClick={() => setShowPermissions(!showPermissions)}
              className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              title="Permissions"
            >
              <Shield className="w-5 h-5" />
            </button>
            
            <button
              onClick={() => setShowChanges(!showChanges)}
              className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 relative"
              title="Pending Changes"
            >
              <Clock className="w-5 h-5" />
              {pendingChanges.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {pendingChanges.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex">
        {/* Main Editor */}
        <div className="flex-1 flex flex-col">
          {!currentDocument ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No Document Selected
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  Create a new document or select an existing one to start collaborating
                </p>
                <button
                  onClick={() => setShowDocumentList(true)}
                  className="btn-primary"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Document
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Editor Toolbar */}
              <div className="p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {isEditing ? (
                      <>
                        <button
                          onClick={handleSaveDocument}
                          className="btn-primary"
                        >
                          <Save className="w-4 h-4 mr-2" />
                          Save
                        </button>
                        <button
                          onClick={() => {
                            setIsEditing(false)
                            setLocalContent(currentDocument.content)
                          }}
                          className="btn-secondary"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setIsEditing(true)}
                        className={`btn-primary ${!canEdit ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={!canEdit}
                        title={!canEdit ? 'No edit permission' : 'Edit document'}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </button>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                    <User className="w-4 h-4" />
                    <span>{currentDocument.contributors.length} contributors</span>
                  </div>
                </div>
              </div>

              {/* Document Content */}
              <div className="flex-1 p-4">
                <textarea
                  ref={editorRef}
                  value={localContent}
                  onChange={(e) => setLocalContent(e.target.value)}
                  disabled={!isEditing}
                  className="w-full h-full p-4 border border-gray-200 dark:border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 dark:disabled:bg-gray-700 disabled:cursor-not-allowed"
                  placeholder="Start typing your document..."
                />
              </div>
            </>
          )}
        </div>

        {/* Side Panels */}
        <div className="w-80 border-l border-gray-200 dark:border-gray-700">
          {/* Document List */}
          {showDocumentList && (
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                Documents
              </h3>
              
              <div className="space-y-2 mb-4">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    onClick={() => setCurrentDocument(doc)}
                    className={`p-2 rounded-lg cursor-pointer transition-colors ${
                      currentDocument?.id === doc.id
                        ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <div className="text-sm font-medium">{doc.title}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      v{doc.version} • {new Date(doc.updatedAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="space-y-2">
                <input
                  type="text"
                  value={newDocumentTitle}
                  onChange={(e) => setNewDocumentTitle(e.target.value)}
                  placeholder="Document title"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm"
                />
                <button
                  onClick={handleCreateDocument}
                  className="w-full btn-primary"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create New
                </button>
              </div>
            </div>
          )}

          {/* Permissions */}
          {showPermissions && (
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                Permissions
              </h3>
              
              <div className="space-y-2">
                {documentPermissions.map((permission) => (
                  <div key={permission.userId} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div>
                      <div className="text-sm font-medium">{permission.userName}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {permission.permission} permission
                      </div>
                    </div>
                    <button
                      onClick={() => revokePermission(permission.userId)}
                      className="p-1 text-red-500 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pending Changes */}
          {showChanges && (
            <div className="p-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                Pending Changes
              </h3>
              
              {pendingChanges.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No pending changes
                </p>
              ) : (
                <div className="space-y-3">
                  {pendingChanges.map((change) => (
                    <div key={change.id} className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm font-medium">{change.userName}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(change.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                      
                      <div className="text-xs text-gray-600 dark:text-gray-300 mb-3">
                        {change.change.type}: {change.change.text || `${change.change.length} characters`}
                      </div>
                      
                      {canApprove && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleApproveChange(change.id)}
                            className="flex-1 px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
                          >
                            <Check className="w-3 h-3 mr-1" />
                            Approve
                          </button>
                          <button
                            onClick={() => handleRejectChange(change.id)}
                            className="flex-1 px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                          >
                            <X className="w-3 h-3 mr-1" />
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CollaborativeDocument
