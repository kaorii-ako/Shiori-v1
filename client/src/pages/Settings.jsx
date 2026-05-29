import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  User,
  Link2,
  Link2Off,
  Bell,
  Palette,
  Database,
  Shield,
  ChevronRight,
  Check,
  X,
  ExternalLink,
  RefreshCw
} from 'lucide-react'
import GlassCard from '../components/GlassCard'
import Badge from '../components/Badge'
import Button from '../components/Button'
import Avatar from '../components/Avatar'
import { useAuthStore, useUIStore } from '../stores'
import { googleAuth } from '../lib/api'

const Settings = () => {
  const { user, googleConnected, setGoogleConnected, setUser } = useAuthStore()
  const { addToast, geminiApiKey, setGeminiApiKey } = useUIStore()
  const [connecting, setConnecting] = useState(false)
  const [apiKeyInput, setApiKeyInput] = useState(geminiApiKey || '')
  const [apiKeySaved, setApiKeySaved] = useState(false)

  const handleSaveApiKey = () => {
    setGeminiApiKey(apiKeyInput.trim())
    setApiKeySaved(true)
    setTimeout(() => setApiKeySaved(false), 2000)
  }

  const handleGoogleConnect = async () => {
    setConnecting(true)
    try {
      const response = await googleAuth.initiate()
      window.location.href = response.data.url
    } catch (error) {
      addToast({
        type: 'error',
        message: 'Failed to initiate Google connection'
      })
      setConnecting(false)
    }
  }

  const handleGoogleDisconnect = async () => {
    try {
      await googleAuth.disconnect()
      setGoogleConnected(false)
      setUser(null)
      addToast({
        type: 'success',
        message: 'Google account disconnected'
      })
    } catch (error) {
      addToast({
        type: 'error',
        message: 'Failed to disconnect Google account'
      })
    }
  }

  const settingsSections = [
    {
      icon: User,
      title: 'Profile',
      description: 'Manage your account information',
      items: [
        { label: 'Name', value: user?.name || 'Not signed in', editable: false },
        { label: 'Email', value: user?.email || 'Not connected', editable: false }
      ]
    },
    {
      icon: Link2,
      title: 'Google Connections',
      description: 'Connect your Google services',
      items: [
        {
          label: 'Google Classroom',
          value: googleConnected ? 'Connected' : 'Not connected',
          status: googleConnected ? 'success' : 'warning',
          action: googleConnected ? 'Disconnect' : 'Connect',
          onAction: googleConnected ? handleGoogleDisconnect : handleGoogleConnect,
          loading: connecting
        },
        {
          label: 'Gmail',
          value: googleConnected ? 'Connected' : 'Not connected',
          status: googleConnected ? 'success' : 'warning',
          action: googleConnected ? 'Disconnect' : 'Connect'
        },
        {
          label: 'Google Calendar',
          value: googleConnected ? 'Connected' : 'Not connected',
          status: googleConnected ? 'success' : 'warning',
          action: googleConnected ? 'Disconnect' : 'Connect'
        }
      ]
    },
    {
      icon: Bell,
      title: 'Notifications',
      description: 'Configure alerts and reminders',
      items: [
        { label: 'Assignment Reminders', enabled: true },
        { label: 'Grade Updates', enabled: true },
        { label: 'Email Notifications', enabled: false },
        { label: 'Study Session Reminders', enabled: true }
      ]
    },
    {
      icon: Palette,
      title: 'Appearance',
      description: 'Customize the look and feel',
      items: [
        { label: 'Dark Mode', enabled: true, disabled: true },
        { label: 'Accent Color', value: 'Purple (Default)' },
        { label: 'Animations', enabled: true }
      ]
    },
    {
      icon: Database,
      title: 'Data & Privacy',
      description: 'Manage your data',
      items: [
        { label: 'Export Data', action: 'Export' },
        { label: 'Clear Local Cache', action: 'Clear', danger: true },
        { label: 'Delete Account', action: 'Delete', danger: true }
      ]
    }
  ]

  return (
    <div className="space-y-6 max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-heading font-bold">Settings</h1>
        <p className="text-text-secondary mt-1">Manage your preferences and connections</p>
      </motion.div>

      {/* Gemini API Key */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <GlassCard>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <Shield size={16} style={{ color: '#c44dff' }} />
            <h2 style={{ fontFamily: '"Press Start 2P"', fontSize: 10, color: '#8c90a0' }}>GEMINI AI KEY</h2>
            {geminiApiKey && <span style={{ fontFamily: 'VT323', fontSize: 14, color: '#4dff91', padding: '2px 8px', background: 'rgba(77,255,145,0.1)', borderRadius: 4 }}>Active</span>}
          </div>
          <p style={{ fontFamily: 'VT323', fontSize: 15, color: '#8c90a0', marginBottom: 12 }}>
            Add your free Gemini API key to enable AI study plans and flashcard generation — no server setup needed.
            Get one free at{' '}
            <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer"
              style={{ color: '#afc6ff' }}>aistudio.google.com/apikey</a>
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="password"
              value={apiKeyInput}
              onChange={e => setApiKeyInput(e.target.value)}
              placeholder="AIza..."
              style={{ flex: 1, padding: '10px 12px', background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)', borderRadius: 6,
                color: '#dfe2eb', fontFamily: 'monospace', fontSize: 13, outline: 'none' }}
            />
            <button onClick={handleSaveApiKey}
              style={{ padding: '10px 18px', borderRadius: 6, cursor: 'pointer', border: 'none',
                background: apiKeySaved ? 'rgba(77,255,145,0.2)' : 'rgba(196,77,255,0.2)',
                color: apiKeySaved ? '#4dff91' : '#c44dff',
                fontFamily: '"Press Start 2P"', fontSize: 9, whiteSpace: 'nowrap' }}>
              {apiKeySaved ? 'SAVED!' : 'SAVE KEY'}
            </button>
          </div>
        </GlassCard>
      </motion.div>

      <div className="space-y-6">
        {settingsSections.map((section, sectionIndex) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: sectionIndex * 0.1 }}
          >
            <GlassCard>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-accent-primary/20">
                  <section.icon className="w-5 h-5 text-accent-primary" />
                </div>
                <div>
                  <h2 className="font-heading font-semibold">{section.title}</h2>
                  <p className="text-sm text-text-muted">{section.description}</p>
                </div>
              </div>

              <div className="space-y-3">
                {section.items.map((item, itemIndex) => (
                  <div
                    key={itemIndex}
                    className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {item.enabled !== undefined && !item.disabled ? (
                        <div className="relative">
                          <input
                            type="checkbox"
                            id={item.label}
                            checked={item.enabled}
                            onChange={() => {}}
                            className="sr-only"
                          />
                          <label
                            htmlFor={item.label}
                            className={`
                              w-11 h-6 rounded-full cursor-pointer transition-colors
                              ${item.enabled ? 'bg-accent-primary' : 'bg-white/20'}
                            `}
                          >
                            <div className={`
                              w-5 h-5 rounded-full bg-white shadow-md
                              transform transition-transform mt-0.5
                              ${item.enabled ? 'translate-x-5 ml-0.5' : 'translate-x-0.5'}
                            `} />
                          </label>
                        </div>
                      ) : null}
                      <div>
                        <p className="font-medium text-sm">{item.label}</p>
                        {item.value && (
                          <p className="text-xs text-text-muted">{item.value}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {item.status && (
                        <Badge variant={item.status}>
                          {item.status === 'success' ? (
                            <Check className="w-3 h-3 mr-1" />
                          ) : (
                            <X className="w-3 h-3 mr-1" />
                          )}
                          {item.value}
                        </Badge>
                      )}

                      {item.action && (
                        <Button
                          variant={item.danger ? 'danger' : 'secondary'}
                          size="sm"
                          onClick={item.onAction}
                          loading={item.loading}
                        >
                          {item.action}
                        </Button>
                      )}

                      <ChevronRight className="w-4 h-4 text-text-muted" />
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </motion.div>
        ))}

        {/* MCP Data Export */}
        <GlassCard>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <Database size={16} style={{ color: '#afc6ff' }} />
            <h2 style={{ fontFamily: '"Press Start 2P"', fontSize: 10, color: '#8c90a0' }}>EXPORT DATA (MCP)</h2>
          </div>
          <p style={{ fontFamily: 'VT323', fontSize: 15, color: '#8c90a0', marginBottom: 14 }}>
            Export your Shiori data as JSON for use with the Shiori MCP server in Claude Code or Claude Desktop.
            See <code style={{ color: '#afc6ff', fontSize: 13 }}>mcp/README.md</code> for setup.
          </p>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              const keys = ['shiori-assignments', 'shiori-grades', 'shiori-notes', 'shiori-flashcards', 'shiori-auth']
              const data = { exportedAt: new Date().toISOString() }
              keys.forEach(k => {
                try {
                  const raw = localStorage.getItem(k)
                  if (raw) {
                    const parsed = JSON.parse(raw)
                    const state = parsed?.state || parsed
                    Object.assign(data, state)
                  }
                } catch {}
              })
              const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
              const a = document.createElement('a'); a.href = URL.createObjectURL(blob)
              a.download = 'shiori-data.json'; a.click()
            }}
          >
            Export shiori-data.json
          </Button>
        </GlassCard>

        <GlassCard>
          <div className="text-center py-4">
            <p className="text-text-muted text-sm">
              Shiori v2.1.0 • Made with
              <span className="text-accent-tertiary mx-1">♥</span>
              for students everywhere
            </p>
          </div>
        </GlassCard>
      </div>
    </div>
  )
}

export default Settings
