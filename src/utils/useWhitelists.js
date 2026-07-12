import { useEffect, useState } from 'react'

const STORAGE_KEY = 'allowlist-ledger.entries.v1'

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function useWhitelists() {
  const [entries, setEntries] = useState(load)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
    } catch {
      // storage full or unavailable — fail silently, data stays in memory
    }
  }, [entries])

  function addEntry(entry) {
    setEntries((prev) => [...prev, entry])
  }

  function updateEntry(id, updates) {
    setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, ...updates } : e)))
  }

  function deleteEntry(id) {
    setEntries((prev) => prev.filter((e) => e.id !== id))
  }

  return { entries, addEntry, updateEntry, deleteEntry }
}
