import { useEffect, useMemo, useRef, useState } from 'react'
import type { TournamentTag } from '../lib/types'
import { useToast } from '../context/ToastContext'

export interface AutoOption {
  key: string
  name: string
  /** Pre-formatted date label (tournaments only). */
  date?: string
  tag?: TournamentTag | null
}

interface Group {
  label: string | null
  items: AutoOption[]
}

interface AutocompleteProps {
  value: string
  options: AutoOption[]
  /** All names already in use this season (lowercased). */
  usedNames: Set<string>
  mode: 'tournament' | 'player'
  /**
   * 'change' — fire onCommit on every keystroke (add-pick form keeps live state).
   * 'blur'   — fire onCommit only on selection / valid blur (inline cells → DB).
   */
  commitMode: 'change' | 'blur'
  onCommit: (name: string) => void
  placeholder?: string
  inputClassName?: string
  autoFocus?: boolean
}

const TAG_LABEL: Record<TournamentTag, string> = {
  major: 'Major',
  signature: 'Sig',
  playoff: 'Playoff',
}

export function Autocomplete({
  value,
  options,
  usedNames,
  mode,
  commitMode,
  onCommit,
  placeholder,
  inputClassName,
  autoFocus,
}: AutocompleteProps) {
  const { showToast } = useToast()
  const [text, setText] = useState(value)
  const [focused, setFocused] = useState(false)
  const [active, setActive] = useState(-1)
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Keep the draft in sync with external value changes while not editing.
  useEffect(() => {
    if (!focused) setText(value)
  }, [value, focused])

  const isUsed = (name: string) =>
    usedNames.has(name.toLowerCase()) && name.toLowerCase() !== value.toLowerCase()

  const groups: Group[] = useMemo(() => {
    const q = text.trim().toLowerCase()
    if (mode === 'tournament') {
      if (!q) {
        const available = options.filter((o) => !isUsed(o.name))
        const used = options.filter((o) => isUsed(o.name))
        const g: Group[] = []
        if (available.length) g.push({ label: 'Available', items: available })
        if (used.length) g.push({ label: 'Already Used', items: used })
        return g
      }
      const matches = options.filter((o) => o.name.toLowerCase().includes(q))
      return matches.length ? [{ label: null, items: matches }] : []
    }
    // player: only after typing
    if (!q) return []
    const matches = options.filter((o) => o.name.toLowerCase().includes(q)).slice(0, 12)
    return matches.length ? [{ label: null, items: matches }] : []
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, options, mode, usedNames, value])

  // Flat list of selectable (non-used) options for keyboard navigation.
  const selectable = useMemo(
    () => groups.flatMap((g) => g.items).filter((o) => !isUsed(o.name)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [groups],
  )

  const open = focused && groups.length > 0

  function select(name: string) {
    if (isUsed(name)) {
      showToast('Already used', true)
      return
    }
    setText(name)
    onCommit(name)
    setFocused(false)
    setActive(-1)
  }

  function handleChange(v: string) {
    setText(v)
    setActive(-1)
    if (commitMode === 'change') onCommit(v)
  }

  function handleBlur() {
    blurTimer.current = setTimeout(() => setFocused(false), 150)
    if (commitMode !== 'blur') return
    const trimmed = text.trim()
    if (trimmed === value) return
    // Required fields: don't allow clearing to empty.
    if (!trimmed) {
      setText(value)
      return
    }
    if (usedNames.has(trimmed.toLowerCase()) && trimmed.toLowerCase() !== value.toLowerCase()) {
      showToast(`${trimmed} already used`, true)
      setText(value)
      return
    }
    onCommit(trimmed)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((a) => Math.min(a + 1, selectable.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((a) => Math.max(a - 1, 0))
    } else if (e.key === 'Enter') {
      if (active >= 0 && selectable[active]) {
        e.preventDefault()
        select(selectable[active].name)
      }
    } else if (e.key === 'Escape') {
      setFocused(false)
      setActive(-1)
    }
  }

  return (
    <>
      <input
        type="text"
        className={inputClassName}
        value={text}
        placeholder={placeholder}
        autoComplete="off"
        autoFocus={autoFocus}
        onChange={(e) => handleChange(e.target.value)}
        onFocus={() => {
          if (blurTimer.current) clearTimeout(blurTimer.current)
          setFocused(true)
        }}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
      />
      <div className={`auto-list${open ? ' open' : ''}`}>
        {groups.map((group) => (
          <div key={group.label ?? '_'}>
            {group.label && <div className="auto-group-header">{group.label}</div>}
            {group.items.map((opt) => {
              const used = isUsed(opt.name)
              const activeIdx = selectable.indexOf(opt)
              return (
                <div
                  key={opt.key}
                  className={`auto-item${used ? ' used' : ''}${
                    !used && activeIdx === active ? ' active' : ''
                  }`}
                  onMouseDown={(e) => {
                    e.preventDefault()
                    select(opt.name)
                  }}
                >
                  <span className="name">{opt.name}</span>
                  <span className="auto-meta">
                    {opt.tag && (
                      <span className={`auto-badge ${opt.tag}`}>{TAG_LABEL[opt.tag]}</span>
                    )}
                    {opt.date && <span className="auto-date">{opt.date}</span>}
                    {used && <span className="auto-tag">Used</span>}
                  </span>
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </>
  )
}
