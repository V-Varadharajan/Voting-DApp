import React from 'react'
import { CheckCircle, Loader2, User } from 'lucide-react'

interface CandidateCardProps {
  candidate: {
    name: string
    votes: string
    voted: boolean
  }
  index: number
  onVote: (index: number) => void
  disabled: boolean
  loading: boolean
}

export default function CandidateCard({ candidate, index, onVote, disabled, loading }: CandidateCardProps) {
  const votePercentage = 0 // Could calculate if we had total votes

  return (
    <div className="group relative bg-slate-800 rounded-xl border border-slate-700 hover:border-blue-500/50 transition-all duration-300 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="relative p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-700 rounded-lg">
              <User className="w-5 h-5 text-slate-300" />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-white">{candidate.name}</h4>
              <p className="text-sm text-slate-400">Candidate #{index + 1}</p>
            </div>
          </div>
          {candidate.voted && (
            <div className="flex items-center gap-1 text-green-400 text-sm">
              <CheckCircle className="w-4 h-4" />
              <span>Voted</span>
            </div>
          )}
        </div>

        <div className="mb-4">
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-3xl font-bold text-white">{candidate.votes}</span>
            <span className="text-slate-400 text-sm">votes</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, parseInt(candidate.votes) * 10)}%` }}
            />
          </div>
        </div>

        <button
          onClick={() => onVote(index)}
          disabled={disabled || loading || candidate.voted}
          className="w-full py-2.5 px-4 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Processing...</span>
            </>
          ) : candidate.voted ? (
            'Already Voted'
          ) : (
            'Cast Vote'
          )}
        </button>
      </div>
    </div>
  )
}
