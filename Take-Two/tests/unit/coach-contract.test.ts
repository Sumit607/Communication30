import { inspectPcmWave } from '@/services/audio/wave';
import { validateCoachResult,visibleCoach,overallScore,type CoachResult } from '@/services/gemini/coachSchema';
function result():CoachResult{return {scores:{structure:6,clarity:6,word_choice:6,pace_pausing:6,flow:6,presence:6},transcript:'I think public libraries matter because they make learning accessible.',strength:'Your position is clear.',corrections:[{id:'fix-1',category:'structure',at_s:2,quote:'make learning accessible',issue:'The reason needs a concrete example.',fix:'Add one example after the reason.'}],say_this_instead:null,word_for_today:null,angle_you_missed:null,hidden_follow_up:'How would you choose between library opening hours and a larger collection?',reshoot_brief:[{correction_id:'fix-1',instruction:'Add one example after the reason.'}]};}
test('visible Coach data contains no hidden question and computes overall locally',()=>{const valid=validateCoachResult(result(),30);expect(overallScore(valid)).toBe(6);expect(visibleCoach(valid)).not.toHaveProperty('hidden_follow_up');expect(JSON.stringify(visibleCoach(valid))).not.toContain(valid.hidden_follow_up);});
test('rejects invented quotes, invalid timestamps, extra fixes and inconsistent briefs',()=>{
const quote=result();quote.corrections[0].quote='Invented words';expect(()=>validateCoachResult(quote,30)).toThrow(/evidence/);
const time=result();time.corrections[0].at_s=31;expect(()=>validateCoachResult(time,30)).toThrow(/evidence/);
const excess=result();excess.corrections=Array(4).fill(excess.corrections[0]);expect(()=>validateCoachResult(excess,30)).toThrow();
const brief=result();brief.reshoot_brief[0].instruction='An unrelated fourth task';expect(()=>validateCoachResult(brief,30)).toThrow(/original fixes/);
});
test('rejects hidden question leakage and AI confidence fields',()=>{
const leak=result();leak.strength=leak.hidden_follow_up;expect(()=>validateCoachResult(leak,30)).toThrow(/leaked/);
expect(()=>validateCoachResult({...result(),confidence:9},30)).toThrow();
});
function wave(){const data=new Uint8Array(44+32000),view=new DataView(data.buffer);const put=(offset:number,text:string)=>[...text].forEach((c,i)=>data[offset+i]=c.charCodeAt(0));put(0,'RIFF');view.setUint32(4,data.length-8,true);put(8,'WAVE');put(12,'fmt ');view.setUint32(16,16,true);view.setUint16(20,1,true);view.setUint16(22,1,true);view.setUint32(24,16000,true);view.setUint32(28,32000,true);view.setUint16(32,2,true);view.setUint16(34,16,true);put(36,'data');view.setUint32(40,32000,true);return data;}
test('accepts a complete audio-only PCM WAV and measures its duration',()=>{expect(inspectPcmWave(wave())).toMatchObject({durationS:1,sampleRate:16000,channels:1});});
test('rejects video containers, renamed media, truncated audio and forged metadata',()=>{
expect(()=>inspectPcmWave(new TextEncoder().encode('fake.mp4'))).toThrow();
const renamed=wave();renamed[8]=65;expect(()=>inspectPcmWave(renamed)).toThrow(/container/);
expect(()=>inspectPcmWave(wave().subarray(0,100))).toThrow(/container/);
const forged=wave();new DataView(forged.buffer).setUint32(28,1,true);expect(()=>inspectPcmWave(forged)).toThrow(/format/);
});
