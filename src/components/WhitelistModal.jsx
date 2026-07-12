import { useState } from 'react'
import { X } from 'lucide-react'
import { CHAINS, STATUS_ORDER, STATUS } from '../utils/constants'

const FIELD_CLASS =
  'w-full bg-ink border border-line rounded-sm px-3 py-2 text-sm text-parchment placeholder:text-muted/70 focus:border-gold/60 outline-none transition-colors'
const LABEL_CLASS = 'text-[11px] uppercase tracking-wider text-muted block mb-1.5'

export default function WhitelistModal({ initial, onSave, onClose }) {
  const [form, setForm] = useState(initial)
  const isEditing = Boolean(initial.projectName) || Boolean(initial.mintDate)

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.projectName.trim()) return
    onSave(form)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/60 backdrop-blur-sm px-4 py-8 overflow-y-auto">
      <div className="bg-surface border border-line rounded-sm max-w-lg w-full">
        <div className="flex items-center justify-between px-6 py-4 border-b border-line">
          <h2 className="font-display text-xl text-parchment">
            {isEditing ? 'Edit entry' : 'New ledger entry'}
          </h2>
          <button onClick={onClose} className="text-muted hover:text-parchment transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label className={LABEL_CLASS}>Project name *</label>
            <input
              required
              autoFocus
              value={form.projectName}
              onChange={(e) => set('projectName', e.target.value)}
              placeholder="e.g. Gba Project"
              className={FIELD_CLASS}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={LABEL_CLASS}>Chain</label>
              <select
                value={form.chain}
                onChange={(e) => set('chain', e.target.value)}
                className={FIELD_CLASS}
              >
                {CHAINS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={LABEL_CLASS}>Status</label>
              <select
                value={form.status}
                onChange={(e) => set('status', e.target.value)}
                className={FIELD_CLASS}
              >
                {STATUS_ORDER.map((key) => (
                  <option key={key} value={key}>
                    {STATUS[key].label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className={LABEL_CLASS}>Mint date &amp; time</label>
            <input
              type="datetime-local"
              value={form.mintDate}
              onChange={(e) => set('mintDate', e.target.value)}
              className={FIELD_CLASS}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={LABEL_CLASS}>Mint price</label>
              <input
                value={form.mintPrice}
                onChange={(e) => set('mintPrice', e.target.value)}
                placeholder="e.g. 20 USD"
                className={FIELD_CLASS}
              />
            </div>
            <div>
              <label className={LABEL_CLASS}>Wallet used</label>
              <input
                value={form.walletUsed}
                onChange={(e) => set('walletUsed', e.target.value)}
                placeholder="e.g. 0xA1...9F2 or label"
                className={`${FIELD_CLASS} font-mono`}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={LABEL_CLASS}>Project X / Twitter</label>
              <input
                value={form.twitterHandle}
                onChange={(e) => set('twitterHandle', e.target.value)}
                placeholder="handle"
                className={FIELD_CLASS}
              />
            </div>
            <div>
              <label className={LABEL_CLASS}>Mint link</label>
              <input
                value={form.mintLink}
                onChange={(e) => set('mintLink', e.target.value)}
                placeholder="https://..."
                className={FIELD_CLASS}
              />
            </div>
          </div>

          <div>
            <label className={LABEL_CLASS}>Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => set('notes', e.target.value)}
              placeholder="How you got on the list, gas plan, reminders..."
              rows={3}
              className={`${FIELD_CLASS} resize-none`}
            />
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              className="text-sm px-4 py-2 rounded-sm border border-line text-muted hover:text-parchment transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="text-sm px-5 py-2 rounded-sm bg-gold text-ink font-medium hover:bg-goldSoft transition-colors"
            >
              {isEditing ? 'Save changes' : 'Add to ledger'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
