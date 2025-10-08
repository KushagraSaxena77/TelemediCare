import React, { useEffect, useState } from 'react';
import { Wifi, WifiOff, Signal, AlertTriangle } from 'lucide-react';

interface NetworkStats {
  bandwidth: number;
  latency: number;
  packetLoss: number;
  effectiveType: string;
}

interface NetworkQualityMonitorProps {
  onQualityChange?: (quality: 'excellent' | 'good' | 'poor') => void;
}

const NetworkQualityMonitor: React.FC<NetworkQualityMonitorProps> = ({ onQualityChange }) => {
  const [stats, setStats] = useState<NetworkStats>({
    bandwidth: 0,
    latency: 0,
    packetLoss: 0,
    effectiveType: 'unknown',
  });
  const [quality, setQuality] = useState<'excellent' | 'good' | 'poor'>('good');
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const checkNetworkQuality = async () => {
      try {
        if ('connection' in navigator) {
          const connection = (navigator as any).connection;
          const effectiveType = connection?.effectiveType || 'unknown';
          const downlink = connection?.downlink || 0;

          const startTime = performance.now();
          try {
            await fetch('https://www.google.com/favicon.ico', { mode: 'no-cors' });
          } catch {
            // Ignore fetch errors
          }
          const latency = performance.now() - startTime;

          const newStats: NetworkStats = {
            bandwidth: downlink * 1000,
            latency: Math.round(latency),
            packetLoss: 0,
            effectiveType,
          };

          setStats(newStats);

          let newQuality: 'excellent' | 'good' | 'poor' = 'good';

          if (effectiveType === '4g' && downlink > 5) {
            newQuality = 'excellent';
          } else if (effectiveType === '3g' || (effectiveType === '4g' && downlink <= 5)) {
            newQuality = 'good';
          } else if (effectiveType === '2g' || effectiveType === 'slow-2g') {
            newQuality = 'poor';
          } else if (downlink < 1) {
            newQuality = 'poor';
          }

          if (latency > 500) {
            newQuality = 'poor';
          } else if (latency > 200 && newQuality === 'excellent') {
            newQuality = 'good';
          }

          setQuality(newQuality);
          onQualityChange?.(newQuality);
        }
      } catch (error) {
        console.error('Error checking network quality:', error);
      }
    };

    checkNetworkQuality();
    const interval = setInterval(checkNetworkQuality, 10000);

    return () => clearInterval(interval);
  }, [onQualityChange]);

  const getQualityColor = () => {
    switch (quality) {
      case 'excellent':
        return 'text-green-500';
      case 'good':
        return 'text-yellow-500';
      case 'poor':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const getQualityBgColor = () => {
    switch (quality) {
      case 'excellent':
        return 'bg-green-500/20 border-green-500/30';
      case 'good':
        return 'bg-yellow-500/20 border-yellow-500/30';
      case 'poor':
        return 'bg-red-500/20 border-red-500/30';
      default:
        return 'bg-gray-500/20 border-gray-500/30';
    }
  };

  const getQualityIcon = () => {
    switch (quality) {
      case 'excellent':
        return <Signal className="h-4 w-4" />;
      case 'good':
        return <Wifi className="h-4 w-4" />;
      case 'poor':
        return <WifiOff className="h-4 w-4" />;
      default:
        return <Wifi className="h-4 w-4" />;
    }
  };

  const getRecommendation = () => {
    switch (quality) {
      case 'excellent':
        return 'Your connection is excellent. HD video quality available.';
      case 'good':
        return 'Your connection is stable. Standard video quality recommended.';
      case 'poor':
        return 'Poor connection detected. Consider switching to audio-only mode.';
      default:
        return 'Checking your connection...';
    }
  };

  return (
    <div className="fixed top-24 right-6 z-50">
      <div
        className={`glass-dark rounded-2xl p-4 border ${getQualityBgColor()} cursor-pointer transition-all duration-300 hover:scale-105`}
        onClick={() => setShowDetails(!showDetails)}
      >
        <div className="flex items-center space-x-3">
          <div className={getQualityColor()}>{getQualityIcon()}</div>
          <div>
            <p className="text-white text-sm font-semibold capitalize">{quality}</p>
            <p className="text-gray-400 text-xs">{stats.effectiveType.toUpperCase()}</p>
          </div>
        </div>

        {showDetails && (
          <div className="mt-4 pt-4 border-t border-gray-700/30 space-y-3">
            <div>
              <p className="text-gray-400 text-xs mb-1">Bandwidth</p>
              <p className="text-white text-sm font-medium">
                {stats.bandwidth > 0 ? `${stats.bandwidth.toFixed(1)} Mbps` : 'Measuring...'}
              </p>
            </div>

            <div>
              <p className="text-gray-400 text-xs mb-1">Latency</p>
              <p className="text-white text-sm font-medium">
                {stats.latency > 0 ? `${stats.latency} ms` : 'Measuring...'}
              </p>
            </div>

            <div className="pt-2 border-t border-gray-700/30">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="h-4 w-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                <p className="text-gray-300 text-xs leading-relaxed">{getRecommendation()}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NetworkQualityMonitor;
