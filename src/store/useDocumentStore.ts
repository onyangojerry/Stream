import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Document, DocumentChange, DocumentPermission } from '../types'


interface DocumentState {
  // Documents
  documents: Document[];
  currentDocument: Document | null;
  documentChanges: DocumentChange[];
  documentPermissions: DocumentPermission[];
  
  // Actions
  createDocument: (title: string, createdBy: string) => void;
  updateDocument: (documentId: string, content: string) => void;
  deleteDocument: (documentId: string) => void;
  setCurrentDocument: (document: Document | null) => void;
  
  // Collaborative editing
  addDocumentChange: (change: Omit<DocumentChange, 'id' | 'timestamp' | 'approved' | 'pending'>) => void;
  approveChange: (changeId: string) => void;
  rejectChange: (changeId: string) => void;
  
  // Permissions
  grantPermission: (userId: string, userName: string, permission: 'view' | 'edit' | 'approve', grantedBy: string) => void;
  revokePermission: (userId: string) => void;
  hasPermission: (userId: string, permission: 'view' | 'edit' | 'approve') => boolean;
  
  // Reset
  reset: () => void;
}

export const useDocumentStore = create<DocumentState>()(
  persist(
    (set, get) => ({
      // Documents
      documents: [],
      currentDocument: null,
      documentChanges: [],
      documentPermissions: [],
      
      // Actions
      createDocument: (title, createdBy) => {
        const newDocument: Document = {
          id: `doc-${Date.now()}`,
          title,
          content: '',
          createdBy,
          createdAt: new Date(),
          updatedAt: new Date(),
          isPublic: false,
          contributors: [createdBy],
          version: 1
        }
        
        set((state) => ({
          documents: [...state.documents, newDocument],
          currentDocument: newDocument
        }))
      },
      
      updateDocument: (documentId, content) => {
        set((state) => ({
          documents: state.documents.map(doc => 
            doc.id === documentId 
              ? { ...doc, content, updatedAt: new Date(), version: doc.version + 1 }
              : doc
          ),
          currentDocument: state.currentDocument?.id === documentId
            ? { ...state.currentDocument, content, updatedAt: new Date(), version: state.currentDocument.version + 1 }
            : state.currentDocument
        }))
      },
      
      deleteDocument: (documentId) => {
        set((state) => ({
          documents: state.documents.filter(doc => doc.id !== documentId),
          currentDocument: state.currentDocument?.id === documentId ? null : state.currentDocument,
          documentChanges: state.documentChanges.filter(change => change.documentId !== documentId)
        }))
      },
      
      setCurrentDocument: (document) => set({ currentDocument: document }),
      
      // Collaborative editing
      addDocumentChange: (changeData) => {
        const newChange: DocumentChange = {
          id: `change-${Date.now()}`,
          ...changeData,
          timestamp: new Date(),
          approved: false,
          pending: true
        }
        
        set((state) => ({
          documentChanges: [...state.documentChanges, newChange]
        }))
      },
      
      approveChange: (changeId) => {
        set((state) => {
          const change = state.documentChanges.find(c => c.id === changeId)
          if (!change) return state
          
          // Apply the change to the document
          const document = state.documents.find(d => d.id === change.documentId)
          if (!document) return state
          
          let newContent = document.content
          
          switch (change.change.type) {
            case 'insert':
              if (change.change.text) {
                newContent = newContent.slice(0, change.change.position) + 
                            change.change.text + 
                            newContent.slice(change.change.position)
              }
              break
              
            case 'delete':
              if (change.change.length) {
                newContent = newContent.slice(0, change.change.position) + 
                            newContent.slice(change.change.position + change.change.length)
              }
              break
              
            case 'format':
              // Format changes would be applied to the UI layer
              break
          }
          
          const updatedDocument = {
            ...document,
            content: newContent,
            updatedAt: new Date(),
            version: document.version + 1
          }
          
          return {
            documentChanges: state.documentChanges.map(c => 
              c.id === changeId 
                ? { ...c, approved: true, pending: false }
                : c
            ),
            documents: state.documents.map(doc => 
              doc.id === change.documentId ? updatedDocument : doc
            ),
            currentDocument: state.currentDocument?.id === change.documentId
              ? updatedDocument
              : state.currentDocument
          }
        })
      },
      
      rejectChange: (changeId) => {
        set((state) => ({
          documentChanges: state.documentChanges.map(c => 
            c.id === changeId 
              ? { ...c, approved: false, pending: false }
              : c
          )
        }))
      },
      

      
      // Permissions
      grantPermission: (userId, userName, permission, grantedBy) => {
        set((state) => ({
          documentPermissions: [
            ...state.documentPermissions.filter(p => p.userId !== userId),
            {
              userId,
              userName,
              permission,
              grantedBy,
              grantedAt: new Date()
            }
          ]
        }))
      },
      
      revokePermission: (userId) => {
        set((state) => ({
          documentPermissions: state.documentPermissions.filter(p => p.userId !== userId)
        }))
      },
      
      hasPermission: (userId, permission) => {
        const state = get()
        const userPermission = state.documentPermissions.find(p => p.userId === userId)
        
        if (!userPermission) return false
        
        switch (permission) {
          case 'view':
            return ['view', 'edit', 'approve'].includes(userPermission.permission)
          case 'edit':
            return ['edit', 'approve'].includes(userPermission.permission)
          case 'approve':
            return userPermission.permission === 'approve'
          default:
            return false
        }
      },
      
      // Reset
      reset: () => set({
        documents: [],
        currentDocument: null,
        documentChanges: [],
        documentPermissions: []
      })
    }),
    {
      name: 'document-storage',
      partialize: (state) => ({
        documents: state.documents,
        documentPermissions: state.documentPermissions
      })
    }
  )
)
