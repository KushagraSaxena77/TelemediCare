# Low-Bandwidth Video/Audio Teleconsultation Implementation

## Overview
This telemedicine platform now includes a real-time video and audio consultation system optimized for rural areas with poor connectivity, as specified in the HACKTRIX'25 problem statement.

## Key Features Implemented

### 1. WebRTC-Based Video/Audio Calls
- **Peer-to-peer connection** using WebRTC for low-latency communication
- **Adaptive bitrate streaming** that adjusts to network conditions
- **Multiple quality modes**: Low bandwidth (320x240, 15fps), Standard (640x480, 24fps)
- **Audio-only fallback** when bandwidth is insufficient

### 2. Low-Bandwidth Optimization
- **Maximum bitrate constraints**: 300 kbps for low bandwidth mode, 1000 kbps for standard
- **Video resolution scaling**: Dynamically adjusts from 320x240 to 640x480
- **Frame rate control**: 15 fps for low bandwidth, up to 30 fps for good connections
- **Audio optimization**: 32 kbps audio bitrate with echo cancellation and noise suppression
- **Automatic quality degradation**: Switches to audio-only if bandwidth drops below 200 kbps

### 3. Real-Time Signaling
- **Supabase real-time subscriptions** for WebRTC signaling (offer/answer/ICE candidates)
- **Database-backed signaling** eliminates need for separate signaling server
- **Persistent session management** tracks consultation status and quality metrics

### 4. Network Quality Monitoring
- **Real-time bandwidth detection** using Network Information API
- **Latency measurement** with periodic network checks
- **Visual quality indicators**: Excellent (green), Good (yellow), Poor (red)
- **Adaptive recommendations**: Suggests audio-only mode for poor connections
- **Connection type display**: Shows 2G/3G/4G network status

### 5. User Controls
- **Video toggle**: Enable/disable camera during call
- **Audio toggle**: Mute/unmute microphone
- **End call**: Cleanly closes connection and updates session status
- **Mirror view**: Local video shows mirrored view for natural user experience

## Technical Architecture

### Database Schema
Three main tables support the teleconsultation system:

#### consultation_sessions
- Tracks active and historical consultation sessions
- Stores session type (video/audio-only/chat)
- Records connection quality metrics
- Timestamps for session duration tracking

#### signaling_messages
- WebRTC signaling data (SDP offers/answers, ICE candidates)
- Real-time message delivery via Supabase subscriptions
- Automatic cleanup on session end (CASCADE delete)

#### call_quality_metrics
- Periodic quality measurements (every 5 seconds)
- Bandwidth, latency, packet loss tracking
- Video resolution and frame rate logging
- Used for analytics and quality improvement

### WebRTC Implementation

#### LowBandwidthWebRTC Class (`src/utils/webrtc.ts`)
Core WebRTC functionality:
- **initializeLocalStream()**: Captures camera/microphone with optimized constraints
- **createPeerConnection()**: Establishes P2P connection with STUN servers
- **applyBandwidthConstraints()**: Enforces bitrate limits and resolution scaling
- **startStatsMonitoring()**: Collects quality metrics every 5 seconds
- **degradeToAudioOnly()**: Automatic fallback for poor connections
- **subscribeToSignaling()**: Listens for remote peer messages

#### useWebRTC Hook (`src/hooks/useWebRTC.ts`)
React hook for managing call state:
- Handles call lifecycle (start/end/toggle controls)
- Manages local and remote stream references
- Provides connection status and error handling
- Abstracts WebRTC complexity from UI components

### Components

#### VideoCall (`src/components/VideoCall.tsx`)
Main call interface:
- Full-screen remote video display
- Picture-in-picture local video
- Control buttons for video/audio/end call
- Connection quality indicator
- Responsive layout with glassmorphism design

#### NetworkQualityMonitor (`src/components/NetworkQualityMonitor.tsx`)
Real-time network monitoring:
- Displays current connection quality
- Shows bandwidth and latency metrics
- Provides user-friendly recommendations
- Expandable details panel

#### TeleconsultPage (`src/pages/TeleconsultPage.tsx`)
Main consultation page:
- Pre-call settings (low bandwidth mode, audio-only)
- Connection state management
- Integration with Supabase for session tracking
- Error handling and user feedback

## Database Setup

**IMPORTANT**: Before using the teleconsultation feature with full functionality, you need to set up the database tables.

The system requires three tables:
1. `consultation_sessions` - Tracks video call sessions
2. `signaling_messages` - Handles WebRTC signaling
3. `call_quality_metrics` - Stores call quality data

To set up the database, ask the system to create the teleconsultation database schema. The feature will work in demo mode without the database, but full functionality requires proper database setup.

## Usage

### Starting a Consultation from Patient Dashboard
Click the "Start Video Consultation" button on the patient dashboard to initiate a call with a doctor.

### Starting a Consultation from Doctor Dashboard
Click the "Call" button next to any patient or the "Join Call" button in the appointments section.

### Programmatic Usage
```typescript
// Navigate to teleconsult page with parameters
navigate(`/teleconsult?sessionId=${sessionId}&userId=${userId}&remoteUserId=${doctorId}&initiator=true&remoteName=${doctorName}`);
```

### URL Parameters
- `sessionId`: Unique consultation session identifier
- `userId`: Current user's ID
- `remoteUserId`: Remote participant's ID (doctor or patient)
- `initiator`: true for call initiator, false for receiver
- `remoteName`: Display name of remote participant

### Configuration Options
- **Low Bandwidth Mode**: Reduces video quality for 2G/3G connections
- **Audio Only**: Disables video entirely, uses only audio (lowest bandwidth)
- **Max Bitrate**: Configurable (default: 300 kbps low, 1000 kbps standard)

## Network Requirements

### Minimum Requirements (Audio-Only)
- Bandwidth: 64 kbps
- Latency: < 1000 ms
- Connection: 2G or better

### Recommended Requirements (Video)
- Bandwidth: 500 kbps
- Latency: < 300 ms
- Connection: 3G or better

### Optimal Requirements (HD Video)
- Bandwidth: 2 Mbps+
- Latency: < 100 ms
- Connection: 4G/WiFi

## Security Features

### Row Level Security (RLS)
- Users can only access their own consultation sessions
- Signaling messages restricted to session participants
- Quality metrics protected by session membership

### Data Privacy
- No session recordings by default (configurable)
- Secure WebRTC connection with DTLS encryption
- End-to-end encrypted media streams
- Minimal data collection (only quality metrics)

## Browser Compatibility

### Supported Browsers
- Chrome/Edge 80+
- Firefox 75+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Android)

### Required APIs
- WebRTC (RTCPeerConnection, MediaStream)
- getUserMedia (camera/microphone access)
- Network Information API (optional, for quality monitoring)

## Future Enhancements

### Planned Features
1. **Screen sharing** for medical reports/X-rays
2. **Chat messaging** during video calls
3. **Recording** with patient consent
4. **Multi-party calls** for specialist consultations
5. **Offline queueing** for signaling messages
6. **Background noise suppression** using ML models
7. **Bandwidth prediction** for proactive quality adjustment
8. **Call analytics dashboard** for quality improvement

### Performance Optimizations
- Implement SFU (Selective Forwarding Unit) for group calls
- Add VP9/AV1 codec support for better compression
- Implement simulcast for multiple quality streams
- Add jitter buffer optimization for unstable networks

## Testing

### Manual Testing
1. Open application in two separate browser windows
2. Use different user IDs for patient and doctor
3. Test with network throttling (Chrome DevTools)
4. Verify automatic quality degradation
5. Check audio-only fallback behavior

### Network Simulation
Use Chrome DevTools to simulate poor connectivity:
- Slow 3G: ~400 kbps, 400ms latency
- Fast 3G: ~1.5 Mbps, 150ms latency
- 2G: ~250 kbps, 800ms latency

## Troubleshooting

### Common Issues

**Problem**: Camera/microphone not working
- Solution: Check browser permissions, ensure HTTPS connection

**Problem**: Poor video quality
- Solution: Enable low bandwidth mode, reduce resolution, try audio-only

**Problem**: Connection fails to establish
- Solution: Check firewall settings, verify STUN server access, ensure Supabase is accessible

**Problem**: High latency/lag
- Solution: Close other applications, check network connection, use audio-only mode

## Credits
Developed for HACKTRIX'25 - Team LOLgorithm
Problem Statement: Bridging Healthcare Gaps - Telemedicine for Underserved Rural Communities
