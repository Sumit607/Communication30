import { useVideoPlayer, VideoView } from 'expo-video';
export function Playback({ uri }: { uri: string }) {
  const player = useVideoPlayer(uri);
  return (
    <VideoView
      player={player}
      nativeControls
      contentFit="contain"
      style={{ height: 280, width: '100%', backgroundColor: '#151617', borderRadius: 8 }}
    />
  );
}
