import React, { useEffect, useState } from 'react'
import { Contract, BrowserProvider } from 'ethers'
import { Wallet, RefreshCw, Award, Lock, Unlock, AlertCircle } from 'lucide-react'
import votingAbi from './abis/Voting.json'
import Header from './components/Header'
import CandidateCard from './components/CandidateCard'
import Footer from './components/Footer'
import NetworkBadge from './components/NetworkBadge'


// Read contract address from Vite environment variable. Vite exposes vars prefixed with VITE_ via import.meta.env
const DEFAULT_CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;

export default function App() {
  const [provider, setProvider] = useState(null)
  const [signer, setSigner] = useState(null)
  const [account, setAccount] = useState(null)
  const [contract, setContract] = useState(null)
  const contractAddress = DEFAULT_CONTRACT_ADDRESS
  const [candidates, setCandidates] = useState([])
  const [votingOpen, setVotingOpen] = useState(false)
  const [owner, setOwner] = useState(null)
  const [loadingIndex, setLoadingIndex] = useState(null)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'error' | 'success' | 'info'>('info')
  const [winner, setWinner] = useState(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)

  const showMessage = (msg: string, type: 'error' | 'success' | 'info' = 'info') => {
    setMessage(msg)
    setMessageType(type)
  }

  useEffect(() => {
    if (!signer) return
    let mounted = true
    ;(async () => {
      try {
        const prov = signer.provider || provider
        let code = null
        if (prov && prov.getCode) {
          code = await prov.getCode(contractAddress)
        } else if (window.ethereum) {
          code = await prov.send ? await prov.send('eth_getCode', [contractAddress, 'latest']) : null
        }
        if (!mounted) return
        if (!code || code === '0x' || code === '0x0') {
          console.warn('No contract code found at', contractAddress, code)
          showMessage('No contract found at configured address. Check contract address or network.', 'error')
          setContract(null)
          return
        }
        console.log('Contract code found:', contractAddress);
        const ct = new Contract(contractAddress, votingAbi.abi || votingAbi, signer)
        setContract(ct)
        setMessage('')
      } catch (err) {
        console.error('contract create failed', err)
        setContract(null)
        showMessage('Failed to initialize contract: ' + (err?.message || String(err)), 'error')
      }
    })()
    return () => { mounted = false }
  }, [signer, contractAddress])

  useEffect(() => {
    if (contract) fetchCandidates()
  }, [contract])

  useEffect(() => {
    if (contract) fetchCandidates()
  }, [account])

  useEffect(() => {
    if (!contract) return
    let mounted = true
    ;(async () => {
      try {
        const w = await contract.getWinner()
        if (!mounted) return
        setWinner({ name: w.winnerName, votes: w.winnerVotes.toString() })
      } catch (err) {
        // ignore
      }
    })()
    return () => { mounted = false }
  }, [contract, votingOpen])

  useEffect(() => {
    if (!contract) return
    let mounted = true
    ;(async () => {
      try {
        const o = await contract.owner()
        if (!mounted) return
        setOwner(o)
      } catch (err) {
        console.error('owner() read failed', err)
      }
    })()
    return () => { mounted = false }
  }, [contract])

  useEffect(() => {
    if (!message) return
    const id = setTimeout(() => setMessage(''), 5000)
    return () => clearTimeout(id)
  }, [message])

  async function connect() {
    if (!window.ethereum) {
      showMessage('MetaMask not detected. Please install MetaMask to continue.', 'error')
      return
    }
    setIsConnecting(true)
    const prov = new BrowserProvider(window.ethereum)
    setProvider(prov)
    try {
      await prov.send('eth_requestAccounts', [])
      const s = await prov.getSigner()
      setSigner(s)
      const addr = await s.getAddress()
      setAccount(addr)
      showMessage('Wallet connected successfully!', 'success')

      try {
        const code = await prov.getCode(contractAddress)
        if (!code || code === '0x' || code === '0x0') {
          showMessage('Connected but no contract found at configured address on this network.', 'error')
        }
      } catch (err) {
        // ignore
      }
    } catch (err) {
      showMessage('Failed to connect wallet. Please try again.', 'error')
    } finally {
      setIsConnecting(false)
    }
  }

  async function fetchCandidates() {
    try {
      if (!contract) return
      setIsRefreshing(true)
      const list = await contract.getCandidates()
      const hv = account ? await contract.hasVoted(account) : false
      setCandidates(list.map(c => ({ name: c.name, votes: c.voteCount.toString(), voted: !!hv })))
      const open = await contract.votingOpen()
      setVotingOpen(open)
    } catch (err) {
      console.error('fetchCandidates error', err)
      showMessage('Failed to load candidates: ' + (err?.message || String(err)), 'error')
    } finally {
      setIsRefreshing(false)
    }
  }

  async function vote(index) {
    try {
      setLoadingIndex(index)
      showMessage('Please confirm the transaction in your wallet...', 'info')
      const tx = await contract.vote(index)
      showMessage('Transaction submitted. Waiting for confirmation...', 'info')
      await tx.wait()
      showMessage('Vote cast successfully!', 'success')
      setLoadingIndex(null)
      fetchCandidates()
    } catch (err) {
      setLoadingIndex(null)
      showMessage('Vote failed: ' + (err?.message || String(err)), 'error')
    }
  }

  async function endVoting() {
    try {
      if (!contract) throw new Error('Contract not initialized')
      if (account?.toLowerCase() !== owner?.toLowerCase()) {
        showMessage('Only the owner can end voting.', 'error')
        return
      }
      showMessage('Ending voting — please confirm in your wallet', 'info')
      const tx = await contract.endVoting()
      await tx.wait()
      showMessage('Voting ended successfully!', 'success')
      fetchCandidates()
    } catch (err) {
      console.error('endVoting error', err)
      showMessage('Error ending voting: ' + (err?.message || String(err)), 'error')
    }
  }

  const isOwner = account && owner && account.toLowerCase() === owner.toLowerCase()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          <NetworkBadge provider={provider} expectedChainId={1337} />

          <div className="flex items-center gap-3">
            {!account ? (
              <button
                onClick={connect}
                disabled={isConnecting}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-700 disabled:text-slate-500 text-white font-medium rounded-lg transition-all duration-200"
              >
                <Wallet className="w-4 h-4" />
                <span>{isConnecting ? 'Connecting...' : 'Connect Wallet'}</span>
              </button>
            ) : (
              <div className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg">
                <p className="text-sm text-slate-400">Connected</p>
                <p className="text-xs text-slate-500 font-mono">{account.slice(0, 6)}...{account.slice(-4)}</p>
              </div>
            )}

            <button
              onClick={fetchCandidates}
              disabled={isRefreshing}
              className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-lg transition-all duration-200"
            >
              <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-800/50 to-slate-800/30 border border-slate-700 rounded-2xl p-8 mb-8 backdrop-blur-sm">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="inline-block px-3 py-1 bg-blue-500/10 border border-blue-500/30 rounded-full text-blue-400 text-sm font-medium mb-3">
                On-Chain Voting System
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">Secure, Transparent Voting</h2>
              <p className="text-slate-400 max-w-2xl">
                Use your wallet to cast a verifiable vote. All votes are recorded on-chain and visible to anyone.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-blue-400" />
                How it works
              </h3>
              <ul className="space-y-2 text-sm text-slate-400">
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-0.5">•</span>
                  <span>Connect your wallet (MetaMask or compatible)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-0.5">•</span>
                  <span>Load candidates from the deployed contract</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-0.5">•</span>
                  <span>Submit a vote — confirm the transaction in your wallet</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-0.5">•</span>
                  <span>Results are computed on-chain and can be verified</span>
                </li>
              </ul>
            </div>

            <div className="bg-slate-900/50 rounded-xl p-5 border border-slate-700">
              <h3 className="text-lg font-semibold text-white mb-4">System Status</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Connection</span>
                  <span className={`font-medium ${contract ? 'text-green-400' : 'text-slate-500'}`}>
                    {contract ? 'Connected' : 'Not connected'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Candidates</span>
                  <span className="font-medium text-white">{candidates.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Voting Status</span>
                  <span className={`flex items-center gap-1.5 font-medium ${votingOpen ? 'text-green-400' : 'text-amber-400'}`}>
                    {votingOpen ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                    {votingOpen ? 'Open' : 'Closed'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 backdrop-blur-sm">
              <h3 className="text-xl font-bold text-white mb-6">Candidates</h3>
              {candidates.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-slate-400">No candidates loaded</p>
                  <p className="text-sm text-slate-500 mt-2">Connect your wallet and refresh to see candidates</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {candidates.map((c, i) => (
                    <CandidateCard
                      key={i}
                      candidate={c}
                      index={i}
                      onVote={vote}
                      disabled={!account || !votingOpen}
                      loading={loadingIndex === i}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 backdrop-blur-sm">
              <h3 className="text-xl font-bold text-white mb-4">Voting Status</h3>
              <div className="space-y-4">
                <div className={`p-4 rounded-lg border ${
                  votingOpen
                    ? 'bg-green-500/10 border-green-500/30'
                    : 'bg-amber-500/10 border-amber-500/30'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    {votingOpen ? (
                      <Unlock className="w-5 h-5 text-green-400" />
                    ) : (
                      <Lock className="w-5 h-5 text-amber-400" />
                    )}
                    <span className={`font-semibold ${votingOpen ? 'text-green-400' : 'text-amber-400'}`}>
                      Voting is {votingOpen ? 'OPEN' : 'CLOSED'}
                    </span>
                  </div>
                  <p className="text-sm text-slate-400">
                    {votingOpen
                      ? 'Cast your vote for your preferred candidate'
                      : 'Voting has ended. Results are final.'}
                  </p>
                </div>

                {winner && !votingOpen && (
                  <div className="bg-gradient-to-br from-yellow-500/10 to-amber-500/10 border border-yellow-500/30 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Award className="w-5 h-5 text-yellow-400" />
                      <h4 className="font-semibold text-white">Winner</h4>
                    </div>
                    <p className="text-2xl font-bold text-white mb-1">{winner.name}</p>
                    <p className="text-sm text-slate-400">{winner.votes} votes</p>
                  </div>
                )}

                {isOwner && votingOpen && (
                  <button
                    onClick={endVoting}
                    className="w-full py-2.5 px-4 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <Lock className="w-4 h-4" />
                    <span>End Voting</span>
                  </button>
                )}
              </div>
            </div>

            {owner && (
              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 backdrop-blur-sm">
                <h3 className="text-lg font-semibold text-white mb-3">Contract Info</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <p className="text-slate-400 mb-1">Owner</p>
                    <p className="text-slate-300 font-mono text-xs break-all">{owner}</p>
                  </div>
                  {isOwner && (
                    <div className="pt-2 mt-2 border-t border-slate-700">
                      <span className="inline-block px-2 py-1 bg-blue-500/10 border border-blue-500/30 rounded text-blue-400 text-xs">
                        You are the owner
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />

      {message && (
        <div className={`fixed bottom-6 right-6 max-w-md p-4 rounded-lg shadow-xl border backdrop-blur-sm animate-in slide-in-from-bottom-5 ${
          messageType === 'error'
            ? 'bg-red-500/10 border-red-500/30 text-red-400'
            : messageType === 'success'
            ? 'bg-green-500/10 border-green-500/30 text-green-400'
            : 'bg-blue-500/10 border-blue-500/30 text-blue-400'
        }`}>
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p className="text-sm">{message}</p>
          </div>
        </div>
      )}
    </div>
  )
}
