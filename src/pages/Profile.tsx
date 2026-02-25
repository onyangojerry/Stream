import { FormEvent, useEffect, useMemo, useState } from 'react'
import { useAuthStore } from '../store/useAuthStore'
import { Check, Copy, Github, KeyRound, Mail, Shield, User as UserIcon } from 'lucide-react'
import { useCommunityStore } from '../store/useCommunityStore'
import toast from 'react-hot-toast'

const formatDate = (value?: Date) => {
  if (!value) return 'Unavailable'
  try {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(value))
  } catch {
    return 'Unavailable'
  }
}

export default function Profile() {
  const { user, updateProfile, resetPassword, isLoading } = useAuthStore()
  const upsertPublicUser = useCommunityStore((state) => state.upsertPublicUser)
  const [name, setName] = useState('')
  const [avatar, setAvatar] = useState('')
  const [githubProfile, setGithubProfile] = useState('')
  const [interestDescription, setInterestDescription] = useState('')
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (user) {
      setName(user.name || '')
      setAvatar(user.avatar || '')
      setGithubProfile(user.githubProfile || '')
      setInterestDescription(user.interestDescription || '')
    }
  }, [user])

  const initials = useMemo(() => (name || user?.name || 'U').trim().charAt(0).toUpperCase(), [name, user?.name])

  if (!user) {
    return (
      <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Profile</h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Sign in to manage your account details.</p>
      </div>
    )
  }

  const handleSave = async (e: FormEvent) => {
    e.preventDefault()
    const trimmedName = name.trim()
    if (!trimmedName) {
      toast.error('Name is required')
      return
    }

    setSaving(true)
    try {
      const nextGithub = githubProfile.trim()
      const nextInterest = interestDescription.trim()
      await updateProfile({
        name: trimmedName,
        avatar: avatar.trim() || undefined,
        githubProfile: nextGithub || undefined,
        interestDescription: nextInterest || undefined,
      })
      upsertPublicUser({
        id: user.id,
        name: trimmedName,
        email: user.email,
        avatar: avatar.trim() || undefined,
        githubProfile: nextGithub || undefined,
        bio: nextInterest || undefined,
        isRegisteredUser: true,
        isActive: true,
      })
      toast.success('Profile updated')
    } catch {
      toast.error('Could not update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleResetPassword = async () => {
    const ok = await resetPassword(user.email)
    if (ok) toast.success('Password reset email sent')
    else toast.error('Could not send reset email')
  }

  const copyId = async () => {
    try {
      await navigator.clipboard.writeText(user.id)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      toast.error('Could not copy user ID')
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">Profile</h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Manage your personal info and account settings.</p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
            <Shield className="h-4 w-4" />
            Account protected
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr]">
        <aside className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex flex-col items-center text-center">
            {avatar ? (
              <img src={avatar} alt={user.name} className="h-20 w-20 rounded-full border border-gray-200 object-cover dark:border-gray-700" />
            ) : (
              <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-gray-900 text-2xl font-semibold text-white dark:bg-white dark:text-gray-900">
                {initials}
              </div>
            )}
            <h2 className="mt-4 text-base font-semibold text-gray-900 dark:text-white">{user.name}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
            {user.githubProfile && (
              <a
                href={user.githubProfile.startsWith('http') ? user.githubProfile : `https://github.com/${user.githubProfile.replace(/^@/, '')}`}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-2 py-1 text-xs text-gray-700 hover:bg-white dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
              >
                <Github className="h-3 w-3" />
                {user.githubProfile}
              </a>
            )}
          </div>

          <div className="mt-6 space-y-3">
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800">
              <p className="text-xs uppercase tracking-[0.12em] text-gray-500 dark:text-gray-400">Account ID</p>
              <div className="mt-2 flex items-center justify-between gap-2">
                <code className="truncate text-xs text-gray-700 dark:text-gray-200">{user.id}</code>
                <button onClick={copyId} className="rounded-lg border border-gray-200 bg-white p-1.5 text-gray-500 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800">
                  {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800">
              <p className="text-xs uppercase tracking-[0.12em] text-gray-500 dark:text-gray-400">Created</p>
              <p className="mt-1 text-sm text-gray-800 dark:text-gray-200">{formatDate(user.createdAt)}</p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800">
              <p className="text-xs uppercase tracking-[0.12em] text-gray-500 dark:text-gray-400">Last login</p>
              <p className="mt-1 text-sm text-gray-800 dark:text-gray-200">{formatDate(user.lastLoginAt)}</p>
            </div>
          </div>
        </aside>

        <section className="space-y-6">
          <form onSubmit={handleSave} className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="mb-5 flex items-center gap-2">
              <UserIcon className="h-4 w-4 text-gray-500" />
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">Personal information</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Full name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-gray-400 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:focus:border-gray-600"
                  placeholder="Your name"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">This name is shown in meetings and chat.</p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Avatar URL (optional)</label>
                <input
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-gray-400 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:focus:border-gray-600"
                  placeholder="https://..."
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Use a public image URL. Leave blank to use initials.</p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">GitHub profile (name or URL)</label>
                <div className="relative">
                  <Github className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <input
                    value={githubProfile}
                    onChange={(e) => setGithubProfile(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm text-gray-900 outline-none focus:border-gray-400 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:focus:border-gray-600"
                    placeholder="@username or https://github.com/username"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Used to pre-fill join requests and show your public builder profile.</p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Interests / short description</label>
                <textarea
                  value={interestDescription}
                  onChange={(e) => setInterestDescription(e.target.value)}
                  rows={3}
                  className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-gray-400 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:focus:border-gray-600"
                  placeholder="What are you looking to collaborate on?"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Shown when you request to join ongoing meetings and collaborate on public materials.</p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Email address</label>
                <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span className="truncate">{user.email}</span>
                </div>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Email is managed by authentication and cannot be changed here.</p>
              </div>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-2 border-t border-gray-200 pt-4 dark:border-gray-800 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => {
                  setName(user.name || '')
                  setAvatar(user.avatar || '')
                  setGithubProfile(user.githubProfile || '')
                  setInterestDescription(user.interestDescription || '')
                }}
                className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
              >
                Reset
              </button>
              <button
                type="submit"
                disabled={saving || isLoading}
                className="rounded-xl border border-gray-900 bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:border-white dark:bg-white dark:text-gray-900"
              >
                {saving ? 'Saving...' : 'Save changes'}
              </button>
            </div>
          </form>

          <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="mb-4 flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-gray-500" />
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">Security</h2>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Send yourself a password reset email to update your password securely.</p>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
                Reset link will be sent to <span className="font-medium">{user.email}</span>
              </div>
              <button
                onClick={handleResetPassword}
                className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
              >
                Send reset email
              </button>
            </div>
          </section>
        </section>
      </div>
    </div>
  )
}
