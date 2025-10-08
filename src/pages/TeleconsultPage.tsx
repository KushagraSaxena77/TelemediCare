import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Phone, ArrowLeft, AlertCircle } from 'lucide-react';
import LanguageSelector from '../components/LanguageSelector';
import VideoCall from '../components/VideoCall';
import NetworkQualityMonitor from '../components/NetworkQualityMonitor';
import { useWebRTC } from '../hooks/useWebRTC';
import { supabase } from '../utils/supabaseClient';

const TeleconsultPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const sessionId = searchParams.get('sessionId') || 'demo-session-' + Date.now();
  const userId = searchParams.get('userId') || 'demo-user-1';
  const remoteUserId = searchParams.get('remoteUserId') || 'demo-user-2';
  const isInitiator = searchParams.get('initiator') === 'true';
  const remoteName = searchParams.get('remoteName') || 'Doctor';

  const [sessionCreated, setSessionCreated] = useState(false);
  const [lowBandwidthMode, setLowBandwidthMode] = useState(true);
  const [audioOnlyMode, setAudioOnlyMode] = useState(false);

  const {
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
  } = useWebRTC({
    sessionId,
    userId,
    remoteUserId,
    config: {
      lowBandwidth: lowBandwidthMode,
      audioOnly: audioOnlyMode,
      maxBitrate: lowBandwidthMode ? 300000 : 1000000,
    },
    isInitiator,
  });

  useEffect(() => {
    const createSession = async () => {
      if (!supabase) {
        setSessionCreated(true);
        return;
      }
      try {
        const { error } = await supabase.from('consultation_sessions').insert({
          id: sessionId,
          patient_id: userId,
          doctor_id: remoteUserId,
          session_type: audioOnlyMode ? 'audio-only' : 'video',
          status: 'waiting',
        });

        if (!error || error.code === '23505') {
          setSessionCreated(true);
        }
      } catch (err) {
        console.error('Error creating session:', err);
        setSessionCreated(true);
      }
    };

    createSession();
  }, [sessionId, userId, remoteUserId, audioOnlyMode]);

  const handleJoinCall = async () => {
    try {
      if (supabase) {
        await supabase.from('consultation_sessions').update({
          status: 'active',
          started_at: new Date().toISOString(),
        }).eq('id', sessionId);
      }

      await startCall();
    } catch (err) {
      console.error('Error joining call:', err);
    }
  };

  const handleEndCall = async () => {
    try {
      if (supabase) {
        await supabase.from('consultation_sessions').update({
          status: 'ended',
          ended_at: new Date().toISOString(),
        }).eq('id', sessionId);
      }

      await endCall();
      navigate(-1);
    } catch (err) {
      console.error('Error ending call:', err);
    }
  };

  const handleToggleVideo = async () => {
    await toggleVideo(!isVideoEnabled);
  };

  const handleToggleAudio = async () => {
    await toggleAudio(!isAudioEnabled);
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900"></div>
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="glass-dark border-b border-gray-700/20">
          <div className="container mx-auto px-4 py-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleBack}
                  className="text-gray-300 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10"
                >
                  <ArrowLeft className="h-6 w-6" />
                </button>
                <h1 className="text-2xl font-bold text-white">
                  {t('teleconsult.title')}
                </h1>
              </div>
              <LanguageSelector />
            </div>
          </div>
        </div>

        {(isConnected || isConnecting) && <NetworkQualityMonitor />}

        <div className="flex-1 flex flex-col h-screen">
          {!isConnected && !isConnecting ? (
            <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
              <div className="text-center max-w-2xl mx-auto px-6">
                <div className="glass-dark rounded-3xl p-12 mb-8 mx-auto w-40 h-40 flex items-center justify-center">
                  <Phone className="h-20 w-20 text-blue-400" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-4">
                  {t('teleconsult.title')}
                </h2>
                <p className="text-gray-300 mb-8 text-lg">
                  {t('teleconsult.waitingForDoctor')}
                </p>

                <div className="glass-dark rounded-2xl p-6 mb-8">
                  <h3 className="text-white font-semibold mb-4">Connection Settings</h3>
                  <div className="space-y-4">
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="text-gray-300">Low Bandwidth Mode</span>
                      <input
                        type="checkbox"
                        checked={lowBandwidthMode}
                        onChange={(e) => setLowBandwidthMode(e.target.checked)}
                        className="w-5 h-5 rounded"
                      />
                    </label>
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="text-gray-300">Audio Only</span>
                      <input
                        type="checkbox"
                        checked={audioOnlyMode}
                        onChange={(e) => setAudioOnlyMode(e.target.checked)}
                        className="w-5 h-5 rounded"
                      />
                    </label>
                  </div>
                  <p className="text-sm text-gray-400 mt-4">
                    Low bandwidth mode optimizes video quality for rural areas with poor connectivity.
                  </p>
                </div>

                {error && (
                  <div className="glass-dark border border-red-500/30 rounded-2xl p-4 mb-6 flex items-start space-x-3">
                    <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-red-400 text-sm text-left">{error}</p>
                  </div>
                )}

                <button
                  onClick={handleJoinCall}
                  disabled={!sessionCreated}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-10 py-4 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl flex items-center space-x-3 mx-auto disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Phone className="h-6 w-6" />
                  <span className="text-lg font-semibold">{t('teleconsult.joinCall')}</span>
                </button>
              </div>
            </div>
          ) : isConnecting ? (
            <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
              <div className="text-center">
                <div className="glass-dark rounded-3xl p-12 mb-6 mx-auto w-40 h-40 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-20 w-20 border-b-2 border-blue-400"></div>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Connecting...</h2>
                <p className="text-gray-400">Setting up your consultation</p>
              </div>
            </div>
          ) : (
            <VideoCall
              localStream={localStream}
              remoteStream={remoteStream}
              isVideoEnabled={isVideoEnabled}
              isAudioEnabled={isAudioEnabled}
              connectionQuality={connectionQuality}
              onToggleVideo={handleToggleVideo}
              onToggleAudio={handleToggleAudio}
              onEndCall={handleEndCall}
              remoteName={remoteName}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default TeleconsultPage;