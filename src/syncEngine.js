import { db } from './db.js';
import { supabase } from './supabaseClient.js';

export async function processSyncQueue() {
  if (!navigator.onLine) return;

  const session = await supabase.auth.getSession();
  if (!session.data.session) return; // Need to be authenticated to sync

  const queue = await db.syncQueue.orderBy('timestamp').toArray();

  if (queue.length === 0) return;

  for (const item of queue) {
    try {
      if (item.action === 'CREATE' || item.action === 'UPDATE') {
        const note = await db.notes.get(item.id);
        if (note) {
          // Last-Write-Wins: check if server has a newer version first
          const { data: serverNote, error: fetchError } = await supabase
            .from('notes')
            .select('updated_at')
            .eq('id', item.id)
            .maybeSingle(); // maybeSingle returns null instead of PGRST116 when 0 rows

          if (fetchError) {
             console.error('Error fetching server note', fetchError);
             break; // Break the loop on network failure to avoid freezing
          }

          if (serverNote && new Date(serverNote.updated_at) > new Date(note.updated_at)) {
             // Server has a newer version, we shouldn't overwrite it.
             // We'll let a downward sync handle this later.
             await db.syncQueue.delete(item.id);
             continue;
          }

          const { error } = await supabase.from('notes').upsert({
            id: note.id,
            date: note.date,
            updated_at: note.updated_at,
            tags: note.tags,
            ciphertext: note.ciphertext,
            iv: note.iv
          });

          if (!error) {
            await db.syncQueue.delete(item.id);
          } else {
             console.error('Failed to sync note:', item.id, error);
             break; // Break loop on upsert error to prevent infinite retries
          }
        } else {
            // Note is missing from Dexie, likely deleted before it could sync. Remove from queue.
            await db.syncQueue.delete(item.id);
        }
      } else if (item.action === 'DELETE') {
        const { error } = await supabase.from('notes').delete().eq('id', item.id);
        if (!error) {
          await db.syncQueue.delete(item.id);
        } else {
            console.error('Failed to sync delete for note:', item.id, error);
            break; // Break loop on delete error
        }
      }
    } catch (e) {
      console.error('Sync error:', e);
      break; // Critical error, break the sync queue loop
    }
  }
}

// Add an event listener to run sync when we come online
window.addEventListener('online', processSyncQueue);
