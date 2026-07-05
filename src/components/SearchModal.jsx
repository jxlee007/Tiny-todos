import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../store';
import { db } from '../db';
import { decryptData } from '../crypto';
import MiniSearch from 'minisearch';
import { X } from 'lucide-react';
import { format, parseISO } from 'date-fns';

export default function SearchModal() {
  const setView = useStore((state) => state.setView);
  const cryptoKey = useStore((state) => state.cryptoKey);
  const setSelectedNoteId = useStore((state) => state.setSelectedNoteId);

  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isReady, setIsReady] = useState(false);

  // Keep these strictly in references so we can explicitly nullify them
  const searchIndexRef = useRef(null);
  const decryptedDataRef = useRef([]);

  useEffect(() => {
    // Mount: Build the RAM index
    const buildIndex = async () => {
      // Fetch last 100
      const notes = await db.notes.orderBy('date').reverse().limit(100).toArray();

      const decryptedData = [];
      for (const note of notes) {
        try {
          const pt = await decryptData(note.ciphertext, note.iv, cryptoKey);
          const parsed = JSON.parse(pt);
          const combined = Object.entries(parsed)
            .map(([k, v]) => `${k} ${v}`)
            .join(' ');

          decryptedData.push({
            id: note.id,
            date: note.date,
            tags: note.tags,
            text: combined,
            rawParsed: parsed
          });
        } catch {
          console.error("Failed to decrypt for search", note.id);
        }
      }

      decryptedDataRef.current = decryptedData;

      const miniSearch = new MiniSearch({
        fields: ['text', 'tags'], // fields to index for full-text search
        storeFields: ['id', 'date', 'tags', 'rawParsed'], // fields to return with search results
        searchOptions: {
            prefix: true,
            fuzzy: 0.2
        }
      });

      miniSearch.addAll(decryptedData);
      searchIndexRef.current = miniSearch;
      setIsReady(true);
    };

    buildIndex();

    // Unmount: The Shredder
    return () => {
      searchIndexRef.current = null;
      decryptedDataRef.current = null;
    };
  }, [cryptoKey]);

  useEffect(() => {
    if (!isReady || !searchIndexRef.current) return;

    if (query.trim().length > 1) {
      const searchResults = searchIndexRef.current.search(query);
      setResults(searchResults);
    } else {
      setResults([]);
    }
  }, [query, isReady]);

  const handleClose = () => {
    // Force immediate cleanup before view switch
    setQuery('');
    setResults([]);
    searchIndexRef.current = null;
    decryptedDataRef.current = null;
    setView('TIMELINE');
  };

  const handleSelect = (id) => {
    setSelectedNoteId(id);
    setView('EDITOR');
  };

  // Extract snippet surrounding the match (very basic implementation)
  const getSnippet = (rawParsed, queryStr) => {
     if(!queryStr) return '';
     const q = queryStr.toLowerCase();
     for (const [section, text] of Object.entries(rawParsed)) {
         const lowerText = text.toLowerCase();
         const idx = lowerText.indexOf(q);
         if (idx !== -1) {
             const start = Math.max(0, idx - 20);
             const end = Math.min(text.length, idx + q.length + 20);
             let snippet = text.substring(start, end);
             if(start > 0) snippet = '...' + snippet;
             if(end < text.length) snippet = snippet + '...';
             // Simple highlight
             const highlighted = snippet.replace(new RegExp(queryStr, 'gi'), match => `[${match}]`);
             return { section, highlighted };
         }
     }
     return { section: 'GENERAL', highlighted: 'Match found in metadata' };
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col text-white">
      {/* Search Bar */}
      <div className="flex items-center p-4 border-b border-gray-800 gap-4">
        <div className="flex-1 bg-gray-900 rounded flex items-center px-3">
          <span className="text-gray-500 mr-2">🔍</span>
          <input
            type="text"
            className="w-full bg-transparent p-2 outline-none"
            placeholder={isReady ? "Search Vault in RAM..." : "Decrypting..."}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={!isReady}
            autoFocus
          />
        </div>
        <button onClick={handleClose} className="p-2 text-gray-400 active:text-white">
          <X size={24} />
        </button>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto p-4">
        {query.length > 1 && (
            <div className="text-xs text-gray-500 mb-6">{results.length} Results in Vault</div>
        )}

        <div className="space-y-6">
          {results.map((res) => {
            const { section, highlighted } = getSnippet(res.rawParsed, query);
            const d = parseISO(res.date);
            return (
              <div key={res.id} onClick={() => handleSelect(res.id)} className="cursor-pointer">
                <div className="text-xs text-gray-500 font-bold mb-2 tracking-widest">▼ {format(d, 'MMM d (eee)')} - {section}</div>
                <div className="text-sm text-gray-300">
                  {highlighted}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Security Notice */}
      <div className="p-4 border-t border-gray-900 text-center">
        <span className="text-xs text-yellow-600 bg-yellow-900/20 px-3 py-1 rounded">
          ⚠️ Memory clears on exit
        </span>
      </div>
    </div>
  );
}
