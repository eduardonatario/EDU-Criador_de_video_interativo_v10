export function secondsToTimecode(totalSeconds: number): string {
  if (isNaN(totalSeconds) || totalSeconds < 0) return '00:00';
  const mins = Math.floor(totalSeconds / 60);
  const secs = Math.floor(totalSeconds % 60);
  const mStr = mins < 10 ? `0${mins}` : `${mins}`;
  const sStr = secs < 10 ? `0${secs}` : `${secs}`;
  return `${mStr}:${sStr}`;
}

export function timecodeToSeconds(timecodeStr: string): number {
  if (!timecodeStr) return 0;
  const clean = timecodeStr.trim();
  const parts = clean.split(':').map((p) => parseFloat(p) || 0);
  
  if (parts.length === 1) {
    return parts[0];
  } else if (parts.length === 2) {
    return (parts[0] * 60) + parts[1];
  } else if (parts.length >= 3) {
    return (parts[0] * 3600) + (parts[1] * 60) + parts[2];
  }
  return 0;
}
