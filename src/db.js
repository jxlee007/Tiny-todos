import Dexie from 'dexie';

export const db = new Dexie('RoutineVault');

db.version(1).stores({
  notes: 'id, date, updated_at, *tags', // ciphertext and iv are stored but not indexed
  config: 'key', // Stores salt, dummyString, etc.
  syncQueue: 'id, action, timestamp' // action: 'CREATE' | 'UPDATE' | 'DELETE'
});
