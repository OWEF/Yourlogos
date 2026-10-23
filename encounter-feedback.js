// YourLogos Encounter sound — tiny, local, user-gesture-only Web Audio tones.
// No downloads, media assets or automatic playback.
const PREF_KEY="yourlogos-encounter-sound-v1";
let enabled = true;
try { enabled=localStorage.getItem(PREF_KEY)!=="off"; } catch {}
let ctx=null;
export function encounterSoundEnabled(){return enabled}
export function setEncounterSoundEnabled(value){
  enabled=Boolean(value);
  try {localStorage.setItem(PREF_KEY,enabled?"on":"off")} catch {}
  return enabled;
}
export function playEncounterTone(kind="choose"){
  if(!enabled)return false;
  try{
    const AudioContext=window.AudioContext||window.webkitAudioContext;
    if(!AudioContext)return false;
    if(!ctx||ctx.state==="closed")ctx=new AudioContext();
    if(ctx.state==="suspended")void ctx.resume().catch(()=>{});
    const now=ctx.currentTime;
    // Two quiet sine partials create a small, warm glass-like chime.
    // Deliberately non-triumphant: an interpretation is not a correct answer.
    const notes=kind==="open"?[392,587.33]:[523.25,783.99];
    const peak=kind==="open"?.013:.024;
    const durations=kind==="open"?.16:.29;
    notes.forEach((frequency,i)=>{
      const start=now+i*.036;
      const oscillator=ctx.createOscillator();
      const gain=ctx.createGain();
      oscillator.type="sine";
      oscillator.frequency.setValueAtTime(frequency,start);
      gain.gain.setValueAtTime(.0001,start);
      gain.gain.exponentialRampToValueAtTime(peak*(i===0?1:.43),start+.018);
      gain.gain.exponentialRampToValueAtTime(.0001,start+durations);
      oscillator.connect(gain);gain.connect(ctx.destination);
      oscillator.onended=()=>{oscillator.disconnect();gain.disconnect()};
      oscillator.start(start);oscillator.stop(start+durations+.015);
    });
    return true;
  }catch{return false}
}
