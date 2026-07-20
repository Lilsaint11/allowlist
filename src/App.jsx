// import { useMemo, useState, useEffect } from 'react'
// import { PlusCircle } from 'lucide-react'
// import Header from './components/Header'
// import StatsBar from './components/StatsBar'
// import FilterBar from './components/FilterBar'
// import WhitelistCard from './components/WhitelistCard'
// import WhitelistModal from './components/WhitelistModal'
// import ConfirmDialog from './components/ConfirmDialog'
// import EmptyState from './components/EmptyState'
// import { useWhitelists } from './utils/useWhitelists'
// import { emptyWhitelist } from './utils/constants'

// export default function App() {
//   const { entries, addEntry, updateEntry, deleteEntry } = useWhitelists()

//   const [modalEntry, setModalEntry] = useState(null)
//   const [pendingDelete, setPendingDelete] = useState(null)
//   const [query, setQuery] = useState('')
//   const [statusFilter, setStatusFilter] = useState('all')
//   const [sortAsc, setSortAsc] = useState(true)
//   const [, forceTick] = useState(0)

//   // re-render every 60s so countdowns stay live without a full data refresh
//   useEffect(() => {
//     const id = setInterval(() => forceTick((n) => n + 1), 60000)
//     return () => clearInterval(id)
//   }, [])

//   const visible = useMemo(() => {
//     let list = entries

//     if (statusFilter !== 'all') {
//       list = list.filter((e) => e.status === statusFilter)
//     }
//     if (query.trim()) {
//       const q = query.trim().toLowerCase()
//       list = list.filter((e) => e.projectName.toLowerCase().includes(q))
//     }

//     list = [...list].sort((a, b) => {
//       const ad = a.mintDate ? new Date(a.mintDate).getTime() : Infinity
//       const bd = b.mintDate ? new Date(b.mintDate).getTime() : Infinity
//       return sortAsc ? ad - bd : bd - ad
//     })

//     return list
//   }, [entries, statusFilter, query, sortAsc])

//   function handleNew() {
//     setModalEntry(emptyWhitelist())
//   }

//   function handleSave(form) {
//     const exists = entries.some((e) => e.id === form.id)
//     if (exists) {
//       updateEntry(form.id, form)
//     } else {
//       addEntry(form)
//     }
//     setModalEntry(null)
//   }

//   function handleDeleteConfirmed() {
//     deleteEntry(pendingDelete.id)
//     setPendingDelete(null)
//   }

//   const isFiltering = statusFilter !== 'all' || query.trim().length > 0

//   return (
//     <div className="min-h-screen">
//       <Header onNew={handleNew} />
//       <StatsBar entries={entries} />

//       <div className="pb-4 max-sm:px-6">
//         <FilterBar
//           query={query}
//           onQuery={setQuery}
//           statusFilter={statusFilter}
//           onStatusFilter={setStatusFilter}
//           sortAsc={sortAsc}
//           onToggleSort={() => setSortAsc((s) => !s)}
//         />
//       </div>

//       <main className="max-w-5xl mx-auto pb-24 max-sm:px-6">
//         {visible.length === 0 ? (
//           <EmptyState onNew={handleNew} filtered={isFiltering} />
//         ) : (
//           <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
//             {visible.map((entry) => (
//               <WhitelistCard
//                 key={entry.id}
//                 entry={entry}
//                 onEdit={setModalEntry}
//                 onDelete={setPendingDelete}
//               />
//             ))}
//           </div>
//         )}
//       </main>

//       <button
//         onClick={handleNew}
//         className="sm:hidden fixed bottom-6 right-6 z-40 inline-flex items-center gap-2 bg-gold text-ink font-medium text-sm px-5 py-3 rounded-full shadow-lg shadow-black/40"
//       >
//         <PlusCircle size={18} />
//         New entry
//       </button>

//       {modalEntry && (
//         <WhitelistModal
//           initial={modalEntry}
//           onSave={handleSave}
//           onClose={() => setModalEntry(null)}
//         />
//       )}

//       <ConfirmDialog
//         entry={pendingDelete}
//         onConfirm={handleDeleteConfirmed}
//         onCancel={() => setPendingDelete(null)}
//       />
//     </div>
//   )
// }

import EligibilityMatrix from './EligibilityMatrix';

function App() {
  return <EligibilityMatrix />;
}

export default App;