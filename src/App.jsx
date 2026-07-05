import React from 'react';
import { useStore } from './store';
import VaultGate from './components/VaultGate';
import Timeline from './components/Timeline';
import MaenEditor from './components/MaenEditor';
import SearchModal from './components/SearchModal';

function App() {
  const view = useStore((state) => state.view);

  return (
    <>
      {view === 'VAULT_LOCK' && <VaultGate />}
      {view === 'TIMELINE' && <Timeline />}
      {view === 'EDITOR' && <MaenEditor />}
      {view === 'SEARCH' && (
        <>
          {/* Render Timeline underneath the modal so it's there when modal closes */}
          <Timeline />
          <SearchModal />
        </>
      )}
    </>
  );
}

export default App;
