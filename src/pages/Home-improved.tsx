import { FormEvent, useEffect, useMemo, useRef, useState } from 'react'
import { ArrowRight, Calendar, CheckCircle2, CircleDot, Play, Sparkles, Video } from 'lucide-react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'

type ActionId = 'instant' | 'join' | 'schedule' | 'recordings' | 'profile' | 'community'

type TerminalAction = {
  id: ActionId
  label: string
  command: string
  description: string
  aliases: string[]
}

const actions: TerminalAction[] = [
  {
    id: 'instant',
    label: 'Start instant meeting',
    command: 'meet.start',
    description: 'Create a room and launch a one-on-one call',
    aliases: ['instant', 'start', 'meet', 'call'],
  },
  {
    id: 'join',
    label: 'Join meeting',
    command: 'meet.join',
    description: 'Open join flow with meeting ID',
    aliases: ['join', 'meeting', 'room'],
  },
  {
    id: 'schedule',
    label: 'Schedule meeting',
    command: 'meet.schedule',
    description: 'Plan a future meeting',
    aliases: ['schedule', 'calendar'],
  },
  {
    id: 'recordings',
    label: 'Review recordings',
    command: 'media.recordings',
    description: 'Open saved sessions and recordings',
    aliases: ['recordings', 'review', 'media'],
  },
  {
    id: 'profile',
    label: 'Open profile',
    command: 'user.profile',
    description: 'Manage account and GitHub details',
    aliases: ['profile', 'account', 'user'],
  },
  {
    id: 'community',
    label: 'Open community',
    command: 'community.open',
    description: 'Live users, public materials, threads',
    aliases: ['community', 'network', 'public'],
  },
]

const capabilityLines = [
  '1. meeting controls      [ready]',
  '2. scheduler             [ready]',
  '3. community materials   [ready]',
  '4. threaded chats        [ready]',
  '5. join requests         [ready]',
]

export default function Home() {
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuthStore()
  const inputRef = useRef<HTMLInputElement>(null)
  const [commandInput, setCommandInput] = useState('')
  const [revealedCount, setRevealedCount] = useState(0)
  const [typedPrompt, setTypedPrompt] = useState('')
  const [logLines, setLogLines] = useState<string[]>([
    '$ boot workspace',
    '> loading modules...',
    '> terminal ui ready',
  ])

  const visibleActions = useMemo(
    () => actions.filter((action) => (isAuthenticated ? true : !['recordings', 'profile'].includes(action.id))),
    [isAuthenticated],
  )

  useEffect(() => {
    setRevealedCount(0)
    const interval = window.setInterval(() => {
      setRevealedCount((count) => {
        if (count >= visibleActions.length) {
          window.clearInterval(interval)
          return count
        }
        return count + 1
      })
    }, 170)
    return () => window.clearInterval(interval)
  }, [visibleActions.length])

  useEffect(() => {
    const prompt = isAuthenticated && user ? `hello ${user.name.split(' ')[0].toLowerCase()}` : 'welcome guest'
    setTypedPrompt('')
    let index = 0
    const interval = window.setInterval(() => {
      index += 1
      setTypedPrompt(prompt.slice(0, index))
      if (index >= prompt.length) window.clearInterval(interval)
    }, 55)
    return () => window.clearInterval(interval)
  }, [isAuthenticated, user])

  const pushLog = (line: string) => {
    setLogLines((prev) => [...prev.slice(-6), line])
  }

  const executeAction = (action: TerminalAction) => {
    pushLog(`$ ${action.command}`)
    pushLog(`> executing ${action.label.toLowerCase()}...`)

    switch (action.id) {
      case 'instant':
        navigate(`/call/${Math.random().toString(36).slice(2, 12)}`)
        break
      case 'join':
        navigate('/join')
        break
      case 'schedule':
        navigate('/scheduler')
        break
      case 'recordings':
        navigate('/recordings')
        break
      case 'profile':
        navigate('/profile')
        break
      case 'community':
        navigate('/community')
        break
      default:
        break
    }
  }

  const parseAndExecute = (raw: string) => {
    const value = raw.trim().toLowerCase()
    if (!value) return

    const numeric = Number(value)
    if (!Number.isNaN(numeric) && Number.isInteger(numeric)) {
      const action = visibleActions[numeric - 1]
      if (action) {
        executeAction(action)
      } else {
        pushLog(`> unknown option: ${value}`)
      }
      return
    }

    const action = visibleActions.find(
      (item) => item.command === value || item.label.toLowerCase() === value || item.aliases.includes(value),
    )

    if (action) {
      executeAction(action)
      return
    }

    pushLog(`> command not found: ${value}`)
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    parseAndExecute(commandInput)
    setCommandInput('')
  }

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 md:p-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.08),transparent_45%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.12),transparent_50%)]" />
        <div className="relative space-y-5">
          <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
            <Sparkles className="h-3.5 w-3.5" />
            Command workspace
          </div>

          <div>
            <h1 className="max-w-4xl text-2xl font-semibold tracking-tight text-gray-950 dark:text-white md:text-4xl">
              {isAuthenticated && user
                ? `Welcome back, ${user.name.split(' ')[0]}. Launch meetings from a terminal-style dashboard.`
                : 'Launch meetings and tools from a clean terminal-style workspace.'}
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-gray-600 dark:text-gray-400 md:text-base">
              Actions reveal top-down. Click a numbered command, type its number, or enter a command string and run it.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-950">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <span className="h-2 w-2 rounded-full bg-rose-400" />
                  <span className="h-2 w-2 rounded-full bg-amber-400" />
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  <span className="ml-2">workspace.shell</span>
                </div>
                <button
                  onClick={() => inputRef.current?.focus()}
                  className="btn-compact text-xs"
                  type="button"
                >
                  Focus input
                </button>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-3 font-mono text-sm dark:border-gray-800 dark:bg-gray-900">
                <div className="mb-2 text-gray-500 dark:text-gray-400">
                  <span className="text-emerald-600 dark:text-emerald-400">$ </span>
                  {typedPrompt}
                  <span className="ml-0.5 inline-block h-4 w-2 animate-pulse bg-gray-400 align-middle dark:bg-gray-500" />
                </div>

                <div className="space-y-1.5">
                  {visibleActions.slice(0, revealedCount).map((action, index) => (
                    <motion.button
                      key={action.id}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.15 }}
                      onClick={() => executeAction(action)}
                      className="group flex w-full items-start gap-3 rounded-lg border border-transparent px-2 py-2 text-left hover:border-gray-200 hover:bg-gray-50 dark:hover:border-gray-700 dark:hover:bg-gray-800"
                    >
                      <span className="w-6 text-emerald-600 dark:text-emerald-400">{index + 1}.</span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="truncate text-gray-900 dark:text-gray-100">{action.command}</span>
                          <span className="text-xs text-gray-400 dark:text-gray-500"># {action.label}</span>
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{action.description}</div>
                      </div>
                      <ArrowRight className="mt-0.5 h-4 w-4 text-gray-300 transition group-hover:translate-x-0.5 dark:text-gray-600" />
                    </motion.button>
                  ))}
                </div>

                <form onSubmit={handleSubmit} className="mt-3">
                  <label className="mb-1 block text-xs text-gray-500 dark:text-gray-400">
                    Enter number or command string (example: `1` or `meet.schedule`)
                  </label>
                  <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-2 py-2 dark:border-gray-700 dark:bg-gray-800">
                    <span className="font-mono text-emerald-600 dark:text-emerald-400">$</span>
                    <input
                      ref={inputRef}
                      value={commandInput}
                      onChange={(e) => setCommandInput(e.target.value)}
                      placeholder="type command..."
                      className="min-w-0 flex-1 bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400 dark:text-white"
                    />
                    <button
                      type="submit"
                      className="rounded-md border border-gray-300 bg-white px-2.5 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
                    >
                      Run
                    </button>
                  </div>
                </form>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-950">
              <div className="mb-3 text-xs uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">Session</div>
              <div className="rounded-xl border border-gray-200 bg-white p-3 font-mono text-xs dark:border-gray-800 dark:bg-gray-900">
                <div className="space-y-2 text-gray-600 dark:text-gray-300">
                  <div className="flex items-center justify-between">
                    <span>auth.status</span>
                    <span className={isAuthenticated ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}>
                      {isAuthenticated ? 'authenticated' : 'guest'}
                    </span>
                  </div>
                  {isAuthenticated && user && (
                    <>
                      <div className="flex items-center justify-between gap-3">
                        <span>user.name</span>
                        <span className="truncate text-right text-gray-900 dark:text-white">{user.name}</span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span>profile.github</span>
                        <span className="truncate text-right">{user.githubProfile || 'unset'}</span>
                      </div>
                    </>
                  )}
                  <div className="flex items-center justify-between">
                    <span>workspace.mode</span>
                    <span>terminal-ui</span>
                  </div>
                  <div className="pt-1">
                    <button
                      onClick={() => navigate(isAuthenticated ? '/profile' : '/login')}
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-left text-xs text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
                    >
                      {isAuthenticated ? '> open user.profile' : '> open auth.login'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">Execution log</h2>
            <CircleDot className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 font-mono text-xs dark:border-gray-700 dark:bg-gray-950">
            <div className="space-y-1.5">
              {logLines.map((line, index) => (
                <div key={`${line}-${index}`} className={line.startsWith('$') ? 'text-emerald-700 dark:text-emerald-300' : 'text-gray-600 dark:text-gray-300'}>
                  {line}
                </div>
              ))}
              <div className="text-gray-400 dark:text-gray-500">
                <span className="text-emerald-600 dark:text-emerald-400">$</span> waiting...
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">Modules</h2>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 font-mono text-xs dark:border-gray-700 dark:bg-gray-950">
            <div className="space-y-1.5 text-gray-700 dark:text-gray-300">
              {capabilityLines.map((line) => (
                <div key={line}>{line}</div>
              ))}
              <div className="pt-2 text-gray-500 dark:text-gray-400">
                shortcuts: `instant`, `join`, `schedule`, `community`
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="mb-3 text-sm font-semibold uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">
          Preset commands
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {[
            { icon: Video, label: 'meet.start', detail: 'Launch instant call', id: 'instant' as const },
            { icon: Calendar, label: 'meet.schedule', detail: 'Plan a future meeting', id: 'schedule' as const },
            { icon: Play, label: 'media.recordings', detail: 'Review saved sessions', id: 'recordings' as const },
          ]
            .filter((item) => isAuthenticated || item.id !== 'recordings')
            .map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.label}
                  onClick={() => executeAction(actions.find((a) => a.id === item.id)!)}
                  className="rounded-2xl border border-gray-200 bg-gray-50 p-4 text-left transition hover:bg-white dark:border-gray-700 dark:bg-gray-950 dark:hover:bg-gray-800"
                >
                  <div className="mb-2 inline-flex rounded-lg border border-gray-200 bg-white p-2 text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="font-mono text-sm text-gray-900 dark:text-white">{item.label}</div>
                  <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">{item.detail}</div>
                </button>
              )
            })}
        </div>
      </section>
    </div>
  )
}
