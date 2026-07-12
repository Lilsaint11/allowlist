export const STATUS = {
  guaranteed: {
    label: 'Guaranteed',
    stampText: 'GUARANTEED',
    color: '#E4C766',
    textClass: 'text-goldSoft',
  },
  fcfs: {
    label: 'FCFS',
    stampText: 'FCFS',
    color: '#4C7A5E',
    textClass: 'text-emerald',
  },
  maybe: {
    label: 'Not Sure',
    stampText: 'ENTERED',
    color: '#C98A3B',
    textClass: 'text-amber',
  },
  missed: {
    label: 'Missed',
    stampText: 'MISSED',
    color: '#B4524A',
    textClass: 'text-rose',
  },
  minted: {
    label: 'Minted',
    stampText: 'MINTED',
    color: '#8892A4',
    textClass: 'text-muted',
  },
}

export const STATUS_ORDER = ['guaranteed', 'fcfs', 'maybe', 'missed', 'minted']

export const CHAINS = [
  'Ethereum',
  'Solana',
  'Base',
  'Polygon',
  'Arbitrum',
  'Bitcoin (Ordinals)',
  'Other',
]

export function emptyWhitelist() {
  return {
    id: crypto.randomUUID(),
    projectName: '',
    chain: 'Ethereum',
    status: 'guaranteed',
    mintDate: '',
    mintPrice: '',
    walletUsed: '',
    mintLink: '',
    twitterHandle: '',
    notes: '',
    createdAt: new Date().toISOString(),
  }
}
