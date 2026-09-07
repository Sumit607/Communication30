import { eq } from 'drizzle-orm';
import { createTestConnection } from '../fixtures/sqlite-connection';
import { initializeDatabase } from '@/db/initialize';
import { createDatabaseClient } from '@/db/client';
import { days } from '@/db/schema';
import { startProgramme,programmeDays } from '@/db/repositories/programme';
import { completeInput,loadPrep,saveOutline,saveThinking } from '@/db/repositories/prep';
import { saveDiary,loadDiary } from '@/db/repositories/diary';
import { saveWriting,loadWriting } from '@/db/repositories/writing';
import { saveConfidenceBefore,reserveTake,failTake,finishTake,dayTakes } from '@/db/repositories/recording';
let connection:ReturnType<typeof createTestConnection>,db:ReturnType<typeof createDatabaseClient>;
beforeEach(async()=>{connection=createTestConnection();await initializeDatabase(connection.connection);db=createDatabaseClient(connection.connection);});
afterEach(()=>connection.sqlite.close());
function dayOne(){startProgramme(db);return programmeDays(db)[0].id;}
test('starting is idempotent, seeds all curriculum days but no fake progress',()=>{
const first=startProgramme(db);expect(startProgramme(db)).toBe(first);expect(programmeDays(db)).toHaveLength(30);expect(programmeDays(db).every(day=>day.completedAt===null)).toBe(true);
});
test('direct calls cannot bypass locked days or blank-first submission',()=>{
const first=dayOne(),second=programmeDays(db)[1].id;
expect(()=>completeInput(db,second,'Source','Text','Fact')).toThrow(/previous/);
expect(()=>saveThinking(db,first,{what:'a',why:'b',soWhat:'c',myView:'d'},true)).toThrow(/input/);
completeInput(db,first,'Synthetic source','Synthetic reading','Synthetic fact');
expect(()=>saveThinking(db,first,{what:'a',why:'b',soWhat:'c',myView:''},true)).toThrow(/four/);
expect(()=>saveOutline(db,first,['a','b','c','d'])).toThrow(/thinking/);
});
test('drafts persist and submitted thinking cannot be overwritten by a later response',()=>{
const first=dayOne();completeInput(db,first,'Source','Reading','Fact');const draft={what:'An idea',why:'A cause',soWhat:'An effect',myView:'My own view'};
saveThinking(db,first,draft);expect(loadPrep(db,first).thinking?.myView).toBe('My own view');expect(loadPrep(db,first).thinking?.submittedAt).toBeNull();
saveThinking(db,first,draft,true);expect(()=>saveThinking(db,first,{...draft,myView:'Replacement'})).toThrow(/preserved/);
saveOutline(db,first,['My point','My reason','One example','My conclusion']);
expect(loadPrep(db,first).outline?.line4).toBe('My conclusion');
expect(()=>saveOutline(db,first,['one two three four five six seven eight nine','a','b','c'])).toThrow(/eight/);
});
test('failed captures consume slots, survive reopening, and never permit a fourth',()=>{
const first=dayOne();saveConfidenceBefore(db,first,3);
for(let i=0;i<3;i++){const id=reserveTake(db,first,id=>'file:///synthetic/'+id+'.mp4');failTake(db,id);}
expect(dayTakes(createDatabaseClient(connection.connection),first)).toHaveLength(3);expect(()=>reserveTake(db,first,()=>'' )).toThrow(/fourth/);
});
test('second take requires critique and duplicate capture cannot start',()=>{
const first=dayOne();saveConfidenceBefore(db,first,3);const id=reserveTake(db,first,()=> 'file:///synthetic/take.mp4');
expect(()=>reserveTake(db,first,()=> '')).toThrow(/recovery/);
finishTake(db,id,{filePath:'file:///synthetic/take.mp4',bytes:1000,durationS:30});
expect(()=>reserveTake(db,first,()=> '')).toThrow(/critique/);expect(()=>saveConfidenceBefore(db,first,5)).toThrow(/already/);
});
test('diary is optional, local and independent from programme completion; submitted writing is preserved',()=>{
const first=dayOne();saveDiary(db,first,{did:'Practised',learned:'Pause',tomorrow:'Try again',mood:4});
expect(loadDiary(db,first)?.learned).toBe('Pause');expect(programmeDays(db)[0].completedAt).toBeNull();
saveWriting(db,first,'My original writing',true);expect(loadWriting(db,first)?.body).toBe('My original writing');
expect(()=>saveWriting(db,first,'AI replacement')).toThrow(/preserved/);
});
test('prepared days require a completed outline before recording',()=>{
dayOne();const all=programmeDays(db);db.update(days).set({completedAt:new Date()}).where(eq(days.id,all[0].id)).run();
saveConfidenceBefore(db,all[1].id,3);expect(()=>reserveTake(db,all[1].id,()=> '')).toThrow(/outline/);
});
