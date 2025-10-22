import { useEffect, useState } from 'react'
import { Wifi, WifiOff } from 'lucide-react'

interface NetworkBadgeProps {
  provider: any
  expectedChainId?: number
}

export default function NetworkBadge({ provider, expectedChainId }: NetworkBadgeProps) {
  const [chainId, setChainId] = useState<number | null>(null)
  const [networkName, setNetworkName] = useState<string>('Unknown')

  useEffect(() => {
    if (!provider) {
      setChainId(null)
      return
    }

    let mounted = true

    const fetchNetwork = async () => {
      try {
        const network = await provider.getNetwork()
        if (!mounted) return
        setChainId(Number(network.chainId))

        const names: Record<number, string> = {
          1: 'Ethereum',
          1337: 'Localhost',
          5: 'Goerli',
          11155111: 'Sepolia',
        }
        setNetworkName(names[Number(network.chainId)] || `Chain ${network.chainId}`)
      } catch (err) {
        console.error('Failed to fetch network', err)
      }
    }

    fetchNetwork()
    return () => { mounted = false }
  }, [provider])

  if (!provider) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg">
        <WifiOff className="w-4 h-4 text-slate-400" />
        <span className="text-sm text-slate-400">Not Connected</span>
      </div>
    )
  }

  const isCorrectNetwork = expectedChainId ? chainId === expectedChainId : true

  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${
      isCorrectNetwork
        ? 'bg-green-500/10 border-green-500/30'
        : 'bg-amber-500/10 border-amber-500/30'
    }`}>
      <Wifi className={`w-4 h-4 ${isCorrectNetwork ? 'text-green-400' : 'text-amber-400'}`} />
      <span className={`text-sm font-medium ${isCorrectNetwork ? 'text-green-400' : 'text-amber-400'}`}>
        {networkName}
      </span>
    </div>
  )
}
