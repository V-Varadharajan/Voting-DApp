import React from 'react'
import { Shield, ExternalLink } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-slate-800 bg-slate-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-400">
            <Shield className="w-5 h-5" />
            <span className="text-sm">Secured by Ethereum Smart Contracts</span>
          </div>
          <div className="flex items-center gap-6">
            <a
              href="https://ethereum.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-slate-400 hover:text-blue-400 transition-colors flex items-center gap-1"
            >
              Learn about Ethereum
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
