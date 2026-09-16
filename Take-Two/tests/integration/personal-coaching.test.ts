import { createTestConnection } from '../fixtures/sqlite-connection';
import { initializeDatabase } from '@/db/initialize';
import { createDatabaseClient } from '@/db/client';
import { programmeDays, startProgramme } from '@/db/repositories/programme';
import {
  dayTakes,
  finishTake,
  reserveTake,
  saveConfidenceBefore,
} from '@/db/repositories/recording';
import { originalCoach } from '@/db/repositories/coaching';
import { acknowledgeFreeTier, analyseTake } from '@/services/coaching-service';
import { getCredential } from '@/services/security/credentials';
import { extractAudio } from '@/services/audio/native';
import { requestJson } from '@/services/gemini/client';
import { DEFAULT_MODEL } from '@/services/gemini/model';

jest.mock('@/services/security/credentials', () => ({ getCredential: jest.fn() }));
jest.mock('@/services/audio/native', () => ({ extractAudio: jest.fn() }));
jest.mock('@/services/gemini/client', () => ({
  requestJson: jest.fn(),
  publicAiError: () => 'Synthetic provider failure',
}));

let connection: ReturnType<typeof createTestConnection>;
let db: ReturnType<typeof createDatabaseClient>;
beforeEach(async () => {
  connection = createTestConnection();
  await initializeDatabase(connection.connection);
  db = createDatabaseClient(connection.connection);
  jest.mocked(getCredential).mockResolvedValue('synthetic-preconfigured-key');
  jest.mocked(extractAudio).mockResolvedValue({
    base64: 'synthetic-audio-only',
    mimeType: 'audio/aac',
    durationS: 30,
    bytes: 128,
  });
  jest.mocked(requestJson).mockResolvedValue({
    scores: { structure: 6, clarity: 6, word_choice: 6, pace_pausing: 6, flow: 6, presence: 6 },
    transcript: 'Public libraries make learning accessible.',
    strength: 'You stated a clear point.',
    corrections: [],
    say_this_instead: null,
    word_for_today: null,
    angle_you_missed: null,
    hidden_follow_up: 'How would you fund longer opening hours?',
    reshoot_brief: [],
  });
});
afterEach(() => connection.sqlite.close());

function recordedTake() {
  startProgramme(db);
  const dayId = programmeDays(db)[0].id;
  saveConfidenceBefore(db, dayId, 3);
  const filePath = 'file:///private/synthetic-take.mp4';
  const takeId = reserveTake(db, dayId, () => filePath);
  finishTake(db, takeId, { filePath, durationS: 30, bytes: 1000 });
  return { dayId, takeId, filePath };
}

test('preconfigured key supports Coach after acknowledgment without manually saving model settings', async () => {
  const { dayId, takeId, filePath } = recordedTake();
  acknowledgeFreeTier(db);
  await analyseTake(db, dayId, takeId);
  expect(extractAudio).toHaveBeenCalledWith(filePath);
  expect(requestJson).toHaveBeenCalledWith(
    expect.objectContaining({
      apiKey: 'synthetic-preconfigured-key',
      model: DEFAULT_MODEL,
      audio: expect.objectContaining({ mimeType: 'audio/aac' }),
    }),
  );
  expect(JSON.stringify(jest.mocked(requestJson).mock.calls[0])).not.toContain(filePath);
  expect(originalCoach(db, dayId)?.row.model).toBe(DEFAULT_MODEL);
});

test('bundled credentials never bypass free-tier acknowledgment', async () => {
  const { dayId, takeId } = recordedTake();
  await expect(analyseTake(db, dayId, takeId)).rejects.toThrow(/free-tier data policy/);
  expect(extractAudio).not.toHaveBeenCalled();
  expect(requestJson).not.toHaveBeenCalled();
});

test('a busy provider preserves the take and permits retry without a new recording', async () => {
  const { dayId, takeId, filePath } = recordedTake();
  acknowledgeFreeTier(db);
  jest.mocked(requestJson).mockRejectedValueOnce({ status: 503 });
  await expect(analyseTake(db, dayId, takeId)).rejects.toThrow('Synthetic provider failure');
  expect(originalCoach(db, dayId)).toBeNull();
  expect(dayTakes(db, dayId)).toEqual([
    expect.objectContaining({ id: takeId, state: 'saved', filePath }),
  ]);
  await analyseTake(db, dayId, takeId);
  expect(originalCoach(db, dayId)?.row.takeId).toBe(takeId);
  expect(requestJson).toHaveBeenCalledTimes(2);
});
