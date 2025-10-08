import { supabase } from './supabaseClient';

export interface WebRTCConfig {
  lowBandwidth: boolean;
  audioOnly: boolean;
  maxBitrate?: number;
  videoResolution?: 'low' | 'medium' | 'high';
}

export interface CallStats {
  bandwidth: number;
  packetLoss: number;
  latency: number;
  resolution: string;
  frameRate: number;
}

export class LowBandwidthWebRTC {
  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private sessionId: string;
  private userId: string;
  private remoteUserId: string;
  private config: WebRTCConfig;
  private statsInterval: NodeJS.Timeout | null = null;

  constructor(
    sessionId: string,
    userId: string,
    remoteUserId: string,
    config: WebRTCConfig = { lowBandwidth: true, audioOnly: false }
  ) {
    this.sessionId = sessionId;
    this.userId = userId;
    this.remoteUserId = remoteUserId;
    this.config = config;
  }

  private getIceServers(): RTCIceServer[] {
    return [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
    ];
  }

  private getMediaConstraints(): MediaStreamConstraints {
    if (this.config.audioOnly) {
      return {
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        video: false,
      };
    }

    const videoConstraints = this.config.lowBandwidth
      ? {
          width: { ideal: 320, max: 640 },
          height: { ideal: 240, max: 480 },
          frameRate: { ideal: 15, max: 24 },
          facingMode: 'user',
        }
      : {
          width: { ideal: 640, max: 1280 },
          height: { ideal: 480, max: 720 },
          frameRate: { ideal: 24, max: 30 },
          facingMode: 'user',
        };

    return {
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
      video: videoConstraints,
    };
  }

  async initializeLocalStream(): Promise<MediaStream> {
    try {
      const constraints = this.getMediaConstraints();
      this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
      return this.localStream;
    } catch (error) {
      console.error('Error accessing media devices:', error);
      throw error;
    }
  }

  async createPeerConnection(): Promise<RTCPeerConnection> {
    const configuration: RTCConfiguration = {
      iceServers: this.getIceServers(),
      iceCandidatePoolSize: 10,
    };

    this.peerConnection = new RTCPeerConnection(configuration);

    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        this.peerConnection!.addTrack(track, this.localStream!);
      });
    }

    this.remoteStream = new MediaStream();

    this.peerConnection.ontrack = (event) => {
      event.streams[0].getTracks().forEach((track) => {
        this.remoteStream!.addTrack(track);
      });
    };

    this.peerConnection.onicecandidate = async (event) => {
      if (event.candidate) {
        await this.sendSignalingMessage('ice-candidate', {
          candidate: event.candidate.toJSON(),
        });
      }
    };

    this.peerConnection.onconnectionstatechange = () => {
      console.log('Connection state:', this.peerConnection?.connectionState);
      if (this.peerConnection?.connectionState === 'connected') {
        this.startStatsMonitoring();
        this.applyBandwidthConstraints();
      }
    };

    return this.peerConnection;
  }

  private async applyBandwidthConstraints() {
    if (!this.peerConnection || !this.config.lowBandwidth) return;

    const senders = this.peerConnection.getSenders();

    for (const sender of senders) {
      if (sender.track?.kind === 'video') {
        const parameters = sender.getParameters();

        if (!parameters.encodings || parameters.encodings.length === 0) {
          parameters.encodings = [{}];
        }

        const maxBitrate = this.config.maxBitrate || 300000;

        parameters.encodings[0].maxBitrate = maxBitrate;
        parameters.encodings[0].scaleResolutionDownBy = 2;
        parameters.encodings[0].maxFramerate = 15;

        try {
          await sender.setParameters(parameters);
          console.log('Applied bandwidth constraints:', maxBitrate);
        } catch (error) {
          console.error('Error setting parameters:', error);
        }
      } else if (sender.track?.kind === 'audio') {
        const parameters = sender.getParameters();

        if (!parameters.encodings || parameters.encodings.length === 0) {
          parameters.encodings = [{}];
        }

        parameters.encodings[0].maxBitrate = 32000;

        try {
          await sender.setParameters(parameters);
        } catch (error) {
          console.error('Error setting audio parameters:', error);
        }
      }
    }
  }

  async createOffer(): Promise<RTCSessionDescriptionInit> {
    if (!this.peerConnection) {
      throw new Error('Peer connection not initialized');
    }

    const offer = await this.peerConnection.createOffer({
      offerToReceiveAudio: true,
      offerToReceiveVideo: !this.config.audioOnly,
    });

    await this.peerConnection.setLocalDescription(offer);

    await this.sendSignalingMessage('offer', {
      sdp: offer.sdp,
      type: offer.type,
    });

    return offer;
  }

  async createAnswer(offer: RTCSessionDescriptionInit): Promise<RTCSessionDescriptionInit> {
    if (!this.peerConnection) {
      throw new Error('Peer connection not initialized');
    }

    await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));

    const answer = await this.peerConnection.createAnswer();
    await this.peerConnection.setLocalDescription(answer);

    await this.sendSignalingMessage('answer', {
      sdp: answer.sdp,
      type: answer.type,
    });

    return answer;
  }

  async handleAnswer(answer: RTCSessionDescriptionInit) {
    if (!this.peerConnection) {
      throw new Error('Peer connection not initialized');
    }

    await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
  }

  async handleIceCandidate(candidate: RTCIceCandidateInit) {
    if (!this.peerConnection) {
      throw new Error('Peer connection not initialized');
    }

    await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
  }

  private async sendSignalingMessage(type: string, payload: any) {
    if (!supabase) {
      console.warn('Supabase not configured, skipping signaling message');
      return;
    }
    try {
      await supabase.from('signaling_messages').insert({
        session_id: this.sessionId,
        sender_id: this.userId,
        receiver_id: this.remoteUserId,
        message_type: type,
        payload,
      });
    } catch (error) {
      console.error('Error sending signaling message:', error);
    }
  }

  subscribeToSignaling(
    onOffer: (offer: RTCSessionDescriptionInit) => void,
    onAnswer: (answer: RTCSessionDescriptionInit) => void,
    onIceCandidate: (candidate: RTCIceCandidateInit) => void
  ) {
    if (!supabase) {
      console.warn('Supabase not configured, signaling subscription unavailable');
      return () => {};
    }

    const channel = supabase
      .channel(`session-${this.sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'signaling_messages',
          filter: `receiver_id=eq.${this.userId}`,
        },
        (payload) => {
          const message = payload.new as any;

          switch (message.message_type) {
            case 'offer':
              onOffer(message.payload);
              break;
            case 'answer':
              onAnswer(message.payload);
              break;
            case 'ice-candidate':
              onIceCandidate(message.payload.candidate);
              break;
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }

  private startStatsMonitoring() {
    if (this.statsInterval) {
      clearInterval(this.statsInterval);
    }

    this.statsInterval = setInterval(async () => {
      if (!this.peerConnection) return;

      try {
        const stats = await this.peerConnection.getStats();
        const callStats = this.parseStats(stats);

        if (supabase) {
          await supabase.from('call_quality_metrics').insert({
            session_id: this.sessionId,
            user_id: this.userId,
            bandwidth_kbps: Math.round(callStats.bandwidth / 1000),
            packet_loss: callStats.packetLoss,
            latency_ms: callStats.latency,
            video_resolution: callStats.resolution,
            frame_rate: callStats.frameRate,
          });
        }

        if (callStats.bandwidth < 200000 && !this.config.audioOnly) {
          await this.degradeToAudioOnly();
        }
      } catch (error) {
        console.error('Error monitoring stats:', error);
      }
    }, 5000);
  }

  private parseStats(stats: RTCStatsReport): CallStats {
    let bandwidth = 0;
    let packetLoss = 0;
    let latency = 0;
    let resolution = 'unknown';
    let frameRate = 0;

    stats.forEach((report) => {
      if (report.type === 'inbound-rtp' && report.kind === 'video') {
        bandwidth = report.bytesReceived || 0;
        packetLoss = report.packetsLost || 0;
        frameRate = report.framesPerSecond || 0;
      }

      if (report.type === 'candidate-pair' && report.state === 'succeeded') {
        latency = report.currentRoundTripTime ? report.currentRoundTripTime * 1000 : 0;
      }

      if (report.type === 'track' && report.kind === 'video') {
        resolution = `${report.frameWidth}x${report.frameHeight}`;
      }
    });

    return { bandwidth, packetLoss, latency, resolution, frameRate };
  }

  async degradeToAudioOnly() {
    if (!this.peerConnection || this.config.audioOnly) return;

    console.log('Degrading to audio-only mode due to low bandwidth');

    const senders = this.peerConnection.getSenders();
    for (const sender of senders) {
      if (sender.track?.kind === 'video') {
        sender.track.enabled = false;
      }
    }

    this.config.audioOnly = true;
  }

  async toggleVideo(enabled: boolean) {
    if (!this.localStream) return;

    const videoTrack = this.localStream.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = enabled;
    }
  }

  async toggleAudio(enabled: boolean) {
    if (!this.localStream) return;

    const audioTrack = this.localStream.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = enabled;
    }
  }

  getRemoteStream(): MediaStream | null {
    return this.remoteStream;
  }

  getLocalStream(): MediaStream | null {
    return this.localStream;
  }

  async close() {
    if (this.statsInterval) {
      clearInterval(this.statsInterval);
    }

    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop());
    }

    if (this.peerConnection) {
      this.peerConnection.close();
    }

    this.peerConnection = null;
    this.localStream = null;
    this.remoteStream = null;
  }
}
