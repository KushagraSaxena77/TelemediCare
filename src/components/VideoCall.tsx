import React, { useRef, useEffect } from 'react';
import { Video, VideoOff, Mic, MicOff, PhoneOff, Wifi, WifiOff, Signal } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface VideoCallProps {
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  connectionQuality: 'excellent' | 'good' | 'poor';
  onToggleVideo: () => void;
  onToggleAudio: () => void;
  onEndCall: () => void;
  remoteName?: string;
}

const VideoCall: React.FC<VideoCallProps> = ({
  localStream,
  remoteStream,
  isVideoEnabled,
  isAudioEnabled,
  connectionQuality,
  onToggleVideo,
  onToggleAudio,
  onEndCall,
  remoteName = 'Remote User',
}) => {
  const { t } = useTranslation();
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  const getQualityColor = () => {
    switch (connectionQuality) {
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

  const getQualityIcon = () => {
    switch (connectionQuality) {
      case 'excellent':
        return <Signal className="h-5 w-5" />;
      case 'good':
        return <Wifi className="h-5 w-5" />;
      case 'poor':
        return <WifiOff className="h-5 w-5" />;
      default:
        return <Wifi className="h-5 w-5" />;
    }
  };

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-gray-900 to-gray-800">
      {remoteStream ? (
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="glass-dark rounded-3xl p-10 mb-6 mx-auto w-36 h-36 flex items-center justify-center">
              <Video className="h-20 w-20 text-blue-400" />
            </div>
            <p className="text-white text-2xl font-bold mb-2">{remoteName}</p>
            <div className="flex items-center justify-center space-x-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
              <p className="text-yellow-400 font-medium">{t('teleconsult.connecting')}</p>
            </div>
          </div>
        </div>
      )}

      <div className="absolute top-6 left-6 flex items-center space-x-2 glass-dark px-4 py-2 rounded-full">
        <div className={getQualityColor()}>{getQualityIcon()}</div>
        <span className="text-white text-sm font-medium capitalize">{connectionQuality}</span>
      </div>

      <div className="absolute top-6 right-6 w-48 h-36 glass-dark rounded-2xl overflow-hidden">
        {localStream && isVideoEnabled ? (
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover mirror"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <VideoOff className="h-10 w-10 text-gray-400 mb-2 mx-auto" />
              <p className="text-gray-400 text-xs">Camera Off</p>
            </div>
          </div>
        )}
      </div>

      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <div className="flex items-center space-x-4 glass-dark px-6 py-4 rounded-2xl">
          <button
            onClick={onToggleVideo}
            className={`p-4 rounded-xl transition-all duration-300 transform hover:scale-110 ${
              isVideoEnabled
                ? 'bg-white/10 hover:bg-white/20 text-white'
                : 'bg-red-500/80 hover:bg-red-600/80 text-white'
            }`}
            title={isVideoEnabled ? 'Turn off camera' : 'Turn on camera'}
          >
            {isVideoEnabled ? <Video className="h-6 w-6" /> : <VideoOff className="h-6 w-6" />}
          </button>

          <button
            onClick={onToggleAudio}
            className={`p-4 rounded-xl transition-all duration-300 transform hover:scale-110 ${
              isAudioEnabled
                ? 'bg-white/10 hover:bg-white/20 text-white'
                : 'bg-red-500/80 hover:bg-red-600/80 text-white'
            }`}
            title={isAudioEnabled ? 'Mute microphone' : 'Unmute microphone'}
          >
            {isAudioEnabled ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
          </button>

          <button
            onClick={onEndCall}
            className="bg-red-500 hover:bg-red-600 text-white p-4 rounded-xl transition-all duration-300 transform hover:scale-110"
            title="End call"
          >
            <PhoneOff className="h-6 w-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoCall;
