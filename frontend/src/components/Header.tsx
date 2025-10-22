import React from 'react'
import { Vote } from 'lucide-react'

export default function Header() {
  return (
    <header className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <Vote className="w-8 h-8 text-blue-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">
              Blockchain Voting
            </h1>
            <p className="text-slate-400 text-sm mt-1">Decentralized & Transparent Governance</p>
          </div>
        </div>
      </div>
    </header>
  )
}
