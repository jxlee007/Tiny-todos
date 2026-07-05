import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
import { db } from '../db';
import { encryptData, decryptData } from '../crypto';
import { processSyncQueue } from '../syncEngine';
import { format } from 'date-fns';
import { ArrowLeft, Check } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

const SECTIONS = ['MORNING', 'AFTERNOON', 'EVENING', 'NIGHT'];

const TAG_ICONS = {
  fit: '💪',
  tech: '💻',
  write: '✍️',
  audio: '🎵',
  mind: '🧠',
};

export default function MaenEditor() {
  const setView = useStore((state) => state.setView);
  const selectedNoteId = useStore((state) => state.selectedNoteId);
  const cryptoKey = useStore((state) => state.cryptoKey);

  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [content, setContent] = useState({
    MORNING: '',
    AFTERNOON: '',
    EVENING: '',
    NIGHT: ''
  });
  const [activeTags, setActiveTags] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (selectedNoteId) {
      loadNote(selectedNoteId);
    } else {
      setIsLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedNoteId, cryptoKey]);

  const loadNote = async (id) => {
    try {
      const note = await db.notes.get(id);
      if (note) {
        setDate(note.date);
        const pt = await decryptData(note.ciphertext, note.iv, cryptoKey);
        const parsed = JSON.parse(pt);
        setContent({
          MORNING: parsed.MORNING || '',
          AFTERNOON: parsed.AFTERNOON || '',
          EVENING: parsed.EVENING || '',
          NIGHT: parsed.NIGHT || ''
        });
        extractTags(parsed);
      }
    } catch (e) {
      console.error('Failed to decrypt note', e);
    }
    setIsLoading(false);
  };

  const handleInputChange = (section, val) => {
    const newContent = { ...content, [section]: val };
    setContent(newContent);
    extractTags(newContent);
  };

  const extractTags = (contentObj) => {
    const combined = Object.values(contentObj).join(' ');
    const regex = /@([a-z]+)/gi;
    const tags = new Set();
    let match;
    while ((match = regex.exec(combined)) !== null) {
      tags.add(match[1].toLowerCase());
    }
    setActiveTags(Array.from(tags));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const id = selectedNoteId || uuidv4();
      const stringified = JSON.stringify(content);
      const { ciphertext, iv } = await encryptData(stringified, cryptoKey);

      const payload = {
        id,
        date,
        updated_at: new Date().toISOString(),
        tags: activeTags,
        ciphertext,
        iv
      };

      await db.notes.put(payload);

      await db.syncQueue.put({
        id,
        action: selectedNoteId ? 'UPDATE' : 'CREATE',
        timestamp: Date.now()
      });

      // Fire sync immediately
      processSyncQueue();

      setView('TIMELINE');
    } catch (e) {
      console.error('Save failed', e);
      alert('Save failed. See console.');
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="h-screen bg-black flex items-center justify-center text-gray-500">Decrypting...</div>;
  }

  return (
    <div className="flex flex-col h-screen bg-black text-white">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b border-gray-800">
        <button onClick={() => setView('TIMELINE')} className="p-2 text-gray-400 active:text-white">
          <ArrowLeft size={20} />
        </button>
        <div className="font-bold text-sm tracking-widest">{format(new Date(date), 'MMM d')} Log</div>
        <button onClick={handleSave} disabled={isSaving} className="p-2 text-white active:opacity-50">
          <Check size={20} />
        </button>
      </div>

      {/* Live Tags Bar */}
      <div className="p-4 border-b border-gray-900 flex gap-2 overflow-x-auto">
        {Object.keys(TAG_ICONS).map(tagKey => {
          const isActive = activeTags.includes(tagKey);
          return (
             <div key={tagKey} className={`w-10 h-10 shrink-0 rounded flex items-center justify-center text-xl transition-colors ${isActive ? 'bg-gray-800' : 'opacity-20 border border-gray-800'}`}>
                {TAG_ICONS[tagKey]}
             </div>
          )
        })}
        {/* Render unrecognized tags */}
        {activeTags.filter(t => !Object.keys(TAG_ICONS).includes(t)).map(customTag => (
            <div key={customTag} className="h-10 px-3 bg-gray-800 rounded flex items-center justify-center text-sm font-bold text-gray-400 shrink-0">
                @{customTag}
            </div>
        ))}
      </div>

      {/* Editor Areas */}
      <div className="flex-1 overflow-y-auto pb-6">
        {SECTIONS.map((section, idx) => {
          const icon = section === 'MORNING' ? '🌅' : section === 'AFTERNOON' ? '☀️' : section === 'EVENING' ? '🌇' : '🌙';
          return (
            <div key={section} className={`p-4 ${idx !== SECTIONS.length - 1 ? 'border-b border-gray-900' : ''}`}>
              <div className="text-xs text-gray-500 font-bold mb-2 tracking-widest">{icon} {section}</div>
              <textarea
                value={content[section]}
                onChange={(e) => handleInputChange(section, e.target.value)}
                className="w-full bg-transparent outline-none resize-none min-h-[100px] text-sm leading-relaxed"
                placeholder="..."
              />
            </div>
          )
        })}
      </div>
    </div>
  );
}
