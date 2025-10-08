import { useState, useEffect, useRef, useCallback } from 'react';
import { LowBandwidthWebRTC, WebRTCConfig, CallStats } from '../utils/webrtc';

interface UseWebRTCOptions {
  sessionId: string;
  userId: string;
  remoteUserId: string;
  config?: WebRTCConfig;
  isInitiator: boolean;
}

interface UseWebRTCReturn {
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  connectionQuality: 'excellent' | 'good' | 'poor';
  startCall: () => Promise<void>;
  endCall: () => Promise<void>;
  toggleVideo: (enabled: boolean) => Promise<void>;
  toggleAudio: (enabled: boolean) => Promise<void>;
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
}

export const useWebRTC = ({
  sessionId,
  userId,
  remoteUserId,
  config = { lowBandwidth: true, audioOnly: false },
  isInitiator,
}: UseWebRTCOptions): UseWebRTCReturn => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectionQuality, setConnectionQuality] = useState<'excellent' | 'good' | 'poor'>('good');
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);

  const webrtcRef = useRef<LowBandwidthWebRTC | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  const startCall = useCallback(async () => {
    try {
      setIsConnecting(true);
      setError(null);

      webrtcRef.current = new LowBandwidthWebRTC(
        sessionId,
        userId,
        remoteUserId,
        config
      );

      const stream = await webrtcRef.current.initializeLocalStream();
      setLocalStream(stream);

      await webrtcRef.current.createPeerConnection();

      const handleOffer = async (offer: RTCSessionDescriptionInit) => {
        if (!webrtcRef.current) return;

        try {
          await webrtcRef.current.createAnswer(offer);

          const remote = webrtcRef.current.getRemoteStream();
          if (remote) {
            setRemoteStream(remote);
            setIsConnected(true);
            setIsConnecting(false);
          }
        } catch (err) {
          console.error('Error handling offer:', err);
          setError('Failed to establish connection');
          setIsConnecting(false);
        }
      };

      const handleAnswer = async (answer: RTCSessionDescriptionInit) => {
        if (!webrtcRef.current) return;

        try {
          await webrtcRef.current.handleAnswer(answer);

          const remote = webrtcRef.current.getRemoteStream();
          if (remote) {
            setRemoteStream(remote);
            setIsConnected(true);
            setIsConnecting(false);
          }
        } catch (err) {
          console.error('Error handling answer:', err);
          setError('Failed to establish connection');
          setIsConnecting(false);
        }
      };

      const handleIceCandidate = async (candidate: RTCIceCandidateInit) => {
        if (!webrtcRef.current) return;

        try {
          await webrtcRef.current.handleIceCandidate(candidate);
        } catch (err) {
          console.error('Error handling ICE candidate:', err);
        }
      };

      unsubscribeRef.current = webrtcRef.current.subscribeToSignaling(
        handleOffer,
        handleAnswer,
        handleIceCandidate
      );

      if (isInitiator) {
        await webrtcRef.current.createOffer();
      }
    } catch (err) {
      console.error('Error starting call:', err);
      setError('Failed to start call. Please check your camera and microphone permissions.');
      setIsConnecting(false);
    }
  }, [sessionId, userId, remoteUserId, config, isInitiator]);

  const endCall = useCallback(async () => {
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }

    if (webrtcRef.current) {
      await webrtcRef.current.close();
      webrtcRef.current = null;
    }

    setLocalStream(null);
    setRemoteStream(null);
    setIsConnected(false);
    setIsConnecting(false);
  }, []);

  const toggleVideo = useCallback(async (enabled: boolean) => {
    if (webrtcRef.current) {
      await webrtcRef.current.toggleVideo(enabled);
      setIsVideoEnabled(enabled);
    }
  }, []);

  const toggleAudio = useCallback(async (enabled: boolean) => {
    if (webrtcRef.current) {
      await webrtcRef.current.toggleAudio(enabled);
      setIsAudioEnabled(enabled);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }

      if (webrtcRef.current) {
        webrtcRef.current.close();
      }
    };
  }, []);

  return {
    localStream,
    remoteStream,
    isConnected,
    isConnecting,
    error,
    connectionQuality,
    startCall,
    endCall,
    toggleVideo,
    toggleAudio,
    isVideoEnabled,
    isAudioEnabled,
  };
};
