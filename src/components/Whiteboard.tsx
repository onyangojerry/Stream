import { useEffect, useRef, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { 
  Pen, 
  Eraser, 
  Square, 
  Circle, 
  Type, 
  Undo, 
  Redo, 
  Download, 
  Trash2,
  Palette,
  Users,
  Check,
  X
} from 'lucide-react'
import toast from 'react-hot-toast'

interface DrawingPoint {
  x: number
  y: number
  pressure?: number
}

interface DrawingStroke {
  id: string
  points: DrawingPoint[]
  color: string
  width: number
  tool: 'pen' | 'eraser' | 'rectangle' | 'circle' | 'text'
  userId: string
  userName: string
  timestamp: number
}

interface WhiteboardProps {
  isOpen: boolean
  onClose: () => void
  currentUser: any
  isHost: boolean
}

const Whiteboard = ({ isOpen, onClose, currentUser, isHost }: WhiteboardProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const contextRef = useRef<CanvasRenderingContext2D | null>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentTool, setCurrentTool] = useState<'pen' | 'eraser' | 'rectangle' | 'circle' | 'text'>('pen')
  const [currentColor, setCurrentColor] = useState('#000000')
  const [currentWidth, setCurrentWidth] = useState(2)
  const [strokes, setStrokes] = useState<DrawingStroke[]>([])
  const [undoStack, setUndoStack] = useState<DrawingStroke[]>([])
  const [redoStack, setRedoStack] = useState<DrawingStroke[]>([])
  const [activeUsers] = useState<any[]>([])
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [pendingChanges, setPendingChanges] = useState<DrawingStroke[]>([])

  const colors = [
    '#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00',
    '#FF00FF', '#00FFFF', '#FFA500', '#800080', '#008000',
    '#FFC0CB', '#A52A2A', '#808080', '#FFFFFF'
  ]

  const tools = [
    { id: 'pen', icon: Pen, label: 'Pen' },
    { id: 'eraser', icon: Eraser, label: 'Eraser' },
    { id: 'rectangle', icon: Square, label: 'Rectangle' },
    { id: 'circle', icon: Circle, label: 'Circle' },
    { id: 'text', icon: Type, label: 'Text' }
  ]

  // Initialize canvas
  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    canvas.width = canvas.offsetWidth * 2
    canvas.height = canvas.offsetHeight * 2
    canvas.style.width = `${canvas.offsetWidth}px`
    canvas.style.height = `${canvas.offsetHeight}px`

    const context = canvas.getContext('2d')
    if (context) {
      context.scale(2, 2)
      context.lineCap = 'round'
      context.lineJoin = 'round'
      context.strokeStyle = currentColor
      context.lineWidth = currentWidth
      contextRef.current = context
    }
  }, [isOpen])

  // Redraw canvas when strokes change
  useEffect(() => {
    if (!contextRef.current || !canvasRef.current) return

    const context = contextRef.current
    const canvas = canvasRef.current

    // Clear canvas
    context.clearRect(0, 0, canvas.width / 2, canvas.height / 2)

    // Draw all strokes
    strokes.forEach(stroke => {
      drawStroke(context, stroke)
    })
  }, [strokes])

  const drawStroke = useCallback((context: CanvasRenderingContext2D, stroke: DrawingStroke) => {
    context.strokeStyle = stroke.color
    context.lineWidth = stroke.width
    context.fillStyle = stroke.color

    if (stroke.tool === 'pen' || stroke.tool === 'eraser') {
      context.beginPath()
      stroke.points.forEach((point, index) => {
        if (index === 0) {
          context.moveTo(point.x, point.y)
        } else {
          context.lineTo(point.x, point.y)
        }
      })
      context.stroke()
    } else if (stroke.tool === 'rectangle') {
      const start = stroke.points[0]
      const end = stroke.points[stroke.points.length - 1]
      const width = end.x - start.x
      const height = end.y - start.y
      context.strokeRect(start.x, start.y, width, height)
    } else if (stroke.tool === 'circle') {
      const start = stroke.points[0]
      const end = stroke.points[stroke.points.length - 1]
      const radius = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2))
      context.beginPath()
      context.arc(start.x, start.y, radius, 0, 2 * Math.PI)
      context.stroke()
    }
  }, [])

  const getMousePos = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return { x: 0, y: 0 }

    const rect = canvasRef.current.getBoundingClientRect()
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    }
  }, [])

  const startDrawing = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true)
    const pos = getMousePos(e)
    const newStroke: DrawingStroke = {
      id: `stroke-${Date.now()}-${Math.random()}`,
      points: [pos],
      color: currentTool === 'eraser' ? '#FFFFFF' : currentColor,
      width: currentWidth,
      tool: currentTool,
      userId: currentUser.id,
      userName: currentUser.name,
      timestamp: Date.now()
    }
    setStrokes(prev => [...prev, newStroke])
  }, [currentTool, currentColor, currentWidth, currentUser, getMousePos])

  const draw = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return

    const pos = getMousePos(e)
    setStrokes(prev => {
      const newStrokes = [...prev]
      const currentStroke = newStrokes[newStrokes.length - 1]
      if (currentStroke) {
        currentStroke.points.push(pos)
      }
      return newStrokes
    })
  }, [isDrawing, getMousePos])

  const stopDrawing = useCallback(() => {
    setIsDrawing(false)
    // Add to pending changes for host approval
    if (!isHost) {
      const lastStroke = strokes[strokes.length - 1]
      if (lastStroke) {
        setPendingChanges(prev => [...prev, lastStroke])
        toast.success('Drawing sent for host approval')
      }
    }
  }, [isHost, strokes])

  const handleUndo = () => {
    if (strokes.length > 0) {
      const lastStroke = strokes[strokes.length - 1]
      setUndoStack(prev => [...prev, lastStroke])
      setStrokes(prev => prev.slice(0, -1))
    }
  }

  const handleRedo = () => {
    if (redoStack.length > 0) {
      const strokeToRedo = redoStack[redoStack.length - 1]
      setUndoStack(prev => [...prev, strokeToRedo])
      setRedoStack(prev => prev.slice(0, -1))
      setStrokes(prev => [...prev, strokeToRedo])
    }
  }

  const clearCanvas = () => {
    setStrokes([])
    setUndoStack([])
    setRedoStack([])
    setPendingChanges([])
  }

  const downloadCanvas = () => {
    if (!canvasRef.current) return

    const link = document.createElement('a')
    link.download = 'whiteboard.png'
    link.href = canvasRef.current.toDataURL()
    link.click()
  }

  const approveChange = (strokeId: string) => {
    setPendingChanges(prev => prev.filter(stroke => stroke.id !== strokeId))
    toast.success('Change approved')
  }

  const rejectChange = (strokeId: string) => {
    setPendingChanges(prev => prev.filter(stroke => stroke.id !== strokeId))
    setStrokes(prev => prev.filter(stroke => stroke.id !== strokeId))
    toast.error('Change rejected')
  }

  const approveAllChanges = () => {
    setPendingChanges([])
    toast.success('All changes approved')
  }

  const rejectAllChanges = () => {
    setPendingChanges([])
    setStrokes(prev => prev.filter(stroke => 
      !pendingChanges.some(pending => pending.id === stroke.id)
    ))
    toast.error('All changes rejected')
  }

  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4"
    >
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-7xl h-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-bold">Collaborative Whiteboard</h2>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Users className="w-4 h-4" />
              <span>{activeUsers.length + 1} active users</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Toolbar */}
          <div className="w-16 bg-gray-50 border-r flex flex-col items-center py-4 space-y-4">
            {tools.map(tool => (
              <button
                key={tool.id}
                onClick={() => setCurrentTool(tool.id as any)}
                className={`p-2 rounded-lg transition-colors ${
                  currentTool === tool.id 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'hover:bg-gray-200'
                }`}
                title={tool.label}
              >
                <tool.icon className="w-5 h-5" />
              </button>
            ))}

            <div className="border-t pt-4 w-full">
              <button
                onClick={() => setShowColorPicker(!showColorPicker)}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors w-full"
                title="Color Picker"
              >
                <Palette className="w-5 h-5" />
              </button>
            </div>

            <div className="border-t pt-4 w-full">
              <input
                type="range"
                min="1"
                max="20"
                value={currentWidth}
                onChange={(e) => setCurrentWidth(Number(e.target.value))}
                className="w-full"
                title={`Brush width: ${currentWidth}`}
              />
            </div>
          </div>

          {/* Color Picker */}
          {showColorPicker && (
            <div className="absolute left-20 top-20 bg-white border rounded-lg shadow-lg p-3 z-10">
              <div className="grid grid-cols-7 gap-1">
                {colors.map(color => (
                  <button
                    key={color}
                    onClick={() => {
                      setCurrentColor(color)
                      setShowColorPicker(false)
                    }}
                    className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Canvas */}
          <div className="flex-1 relative">
            <canvas
              ref={canvasRef}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              className="border border-gray-300 cursor-crosshair w-full h-full"
            />
          </div>

          {/* Side Panel */}
          <div className="w-80 bg-gray-50 border-l flex flex-col">
            {/* Controls */}
            <div className="p-4 border-b">
              <div className="flex space-x-2 mb-4">
                <button
                  onClick={handleUndo}
                  disabled={strokes.length === 0}
                  className="p-2 bg-white border rounded-lg hover:bg-gray-50 disabled:opacity-50"
                  title="Undo"
                >
                  <Undo className="w-4 h-4" />
                </button>
                <button
                  onClick={handleRedo}
                  disabled={undoStack.length === 0}
                  className="p-2 bg-white border rounded-lg hover:bg-gray-50 disabled:opacity-50"
                  title="Redo"
                >
                  <Redo className="w-4 h-4" />
                </button>
                <button
                  onClick={clearCanvas}
                  className="p-2 bg-white border rounded-lg hover:bg-gray-50"
                  title="Clear Canvas"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={downloadCanvas}
                  className="p-2 bg-white border rounded-lg hover:bg-gray-50"
                  title="Download"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>

              <div className="text-sm text-gray-600">
                <p>Current tool: <span className="font-medium">{currentTool}</span></p>
                <p>Color: <span className="font-medium">{currentColor}</span></p>
                <p>Width: <span className="font-medium">{currentWidth}px</span></p>
              </div>
            </div>

            {/* Host Approval Panel */}
            {isHost && pendingChanges.length > 0 && (
              <div className="flex-1 p-4 border-b">
                <h3 className="font-medium mb-3">Pending Changes ({pendingChanges.length})</h3>
                <div className="space-y-2 mb-4">
                  {pendingChanges.map(change => (
                    <div key={change.id} className="bg-white p-3 rounded-lg border">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">{change.userName}</p>
                          <p className="text-xs text-gray-500">{change.tool}</p>
                        </div>
                        <div className="flex space-x-1">
                          <button
                            onClick={() => approveChange(change.id)}
                            className="p-1 bg-green-100 text-green-600 rounded hover:bg-green-200"
                            title="Approve"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => rejectChange(change.id)}
                            className="p-1 bg-red-100 text-red-600 rounded hover:bg-red-200"
                            title="Reject"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={approveAllChanges}
                    className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                  >
                    Approve All
                  </button>
                  <button
                    onClick={rejectAllChanges}
                    className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                  >
                    Reject All
                  </button>
                </div>
              </div>
            )}

            {/* Active Users */}
            <div className="flex-1 p-4">
              <h3 className="font-medium mb-3">Active Users</h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-2 p-2 bg-blue-50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm font-medium">{currentUser.name}</span>
                  <span className="text-xs text-gray-500">(You)</span>
                </div>
                {activeUsers.map(user => (
                  <div key={user.id} className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">{user.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default Whiteboard
