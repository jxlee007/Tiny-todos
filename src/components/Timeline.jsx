import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
import { db } from '../db';
import { decryptData } from '../crypto';
import { Search, Plus } from 'lucide-react';
import { format, parseISO, startOfWeek, endOfWeek } from 'date-fns';

const TAG_ICONS = {
  fit: '💪',
  tech: '💻',
  write: '✍️',
  audio: '🎵',
  mind: '🧠',
};

export default function Timeline() {
  const [notes, setNotes] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [decryptedPreviews, setDecryptedPreviews] = useState({});
  const [isDecrypting, setIsDecrypting] = useState(false);

  const setView = useStore((state) => state.setView);
  const setSelectedNoteId = useStore((state) => state.setSelectedNoteId);
  const cryptoKey = useStore((state) => state.cryptoKey);

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    // Only load metadata for fast rendering
    const allNotes = await db.notes.orderBy('date').reverse().toArray();
    setNotes(allNotes);
  };

  const handleToggleExpanded = async () => {
    if (!isExpanded) {
      setIsDecrypting(true);
      const previews = {};

      // Decrypt top 14 (roughly two weeks) for performance, or handle pagination later
      const toDecrypt = notes.slice(0, 14);

      for (const note of toDecrypt) {
        try {
          const pt = await decryptData(note.ciphertext, note.iv, cryptoKey);
          // Simple preview extraction
          const parsed = JSON.parse(pt);
          const rawText = Object.values(parsed).join(' ').replace(/@[a-z]+/gi, '').trim();
          previews[note.id] = rawText.length > 50 ? rawText.substring(0, 50) + '...' : rawText;
        } catch {
          previews[note.id] = '[ Decryption Failed ]';
        }
      }
      setDecryptedPreviews(previews);
      setIsDecrypting(false);
    } else {
        // Clear ram
        setDecryptedPreviews({});
    }
    setIsExpanded(!isExpanded);
  };

  const openEditor = (id = null) => {
    setSelectedNoteId(id);
    setView('EDITOR');
  };

  const openSearch = () => {
    setView('SEARCH');
  };

  // Group by week
  const grouped = notes.reduce((acc, note) => {
    const d = parseISO(note.date);
    const weekStart = format(startOfWeek(d), 'MMM d');
    const weekEnd = format(endOfWeek(d), 'MMM d');
    const weekKey = `${weekStart} - ${weekEnd}`;

    if (!acc[weekKey]) acc[weekKey] = [];
    acc[weekKey].push(note);
    return acc;
  }, {});

  return (
    <div className="flex flex-col h-screen bg-black text-white relative">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b border-gray-800">
        <div className="flex items-center gap-4">
            <button className="text-gray-400">☰</button>
            <span className="font-bold tracking-widest text-sm">ROUTINE</span>
        </div>
        <div className="flex items-center gap-4">
            <button onClick={openSearch} className="text-gray-400"><Search size={20}/></button>
            <button onClick={handleToggleExpanded} className="text-gray-400 font-bold border border-gray-700 px-2 rounded">
                {isExpanded ? '⊟' : '⊞'}
            </button>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-8 pb-24">
        {Object.entries(grouped).map(([week, weekNotes]) => (
          <div key={week}>
            <div className="text-xs text-gray-500 font-bold mb-4 tracking-widest">▼ {week}</div>
            <div className="space-y-6">
                {weekNotes.map(note => {
                    const d = parseISO(note.date);
                    const isToday = format(d, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
                    return (
                        <div key={note.id} onClick={() => openEditor(note.id)} className="cursor-pointer active:opacity-50">
                            <div className="text-sm font-semibold mb-2">
                                {format(d, 'MMM d (eee)')} {isToday && <span className="text-gray-400 ml-2">- TODAY</span>}
                            </div>

                            {!isExpanded ? (
                                // Macro View
                                <div className="flex gap-2">
                                    {Object.keys(TAG_ICONS).map(tagKey => {
                                        const hasTag = note.tags && note.tags.includes(tagKey);
                                        return (
                                            <div key={tagKey} className={`w-8 h-8 rounded flex items-center justify-center text-sm ${hasTag ? 'bg-gray-800' : 'border border-gray-800'}`}>
                                                {hasTag ? TAG_ICONS[tagKey] : ''}
                                            </div>
                                        )
                                    })}
                                </div>
                            ) : (
                                // Agenda View
                                <div className="text-sm text-gray-400 bg-gray-900 p-3 rounded">
                                    {isDecrypting && !decryptedPreviews[note.id] ? (
                                        <span className="animate-pulse">Decrypting...</span>
                                    ) : (
                                        decryptedPreviews[note.id] || '[ Empty ]'
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
          </div>
        ))}
      </div>

      {/* FAB */}
      <button
        onClick={() => openEditor()}
        className="absolute bottom-6 right-6 w-14 h-14 bg-white text-black rounded-full flex items-center justify-center shadow-lg active:scale-95"
      >
        <Plus size={24} />
      </button>
    </div>
  );
}
