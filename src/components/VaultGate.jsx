import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useStore } from '../store';
import { deriveKey, encryptData, decryptData } from '../crypto';
import { db } from '../db';
import { motion } from 'framer-motion';

export default function VaultGate() {
  const [stage, setStage] = useState('LOADING'); // 'LOADING', 'STAGE_1', 'STAGE_2'

  // Stage 1 State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // Stage 2 State
  const [pin, setPin] = useState('');
  const [isShaking, setIsShaking] = useState(false);
  const [isPinLoading, setIsPinLoading] = useState(false);

  const setView = useStore((state) => state.setView);
  const setCryptoKey = useStore((state) => state.setCryptoKey);
  const setUser = useStore((state) => state.setUser);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
        setStage('STAGE_2');
      } else {
        setStage('STAGE_1');
      }
    };
    checkSession();
  }, [setUser]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      setAuthError(error.message);
    } else if (data.session) {
      setUser(data.session.user);
      setStage('STAGE_2');
    }
  };

  const handlePinInput = async (digit) => {
    if (pin.length < 4 && !isPinLoading) {
      const newPin = pin + digit;
      setPin(newPin);

      if (newPin.length === 4) {
        setIsPinLoading(true);
        await processPin(newPin);
      }
    }
  };

  const processPin = async (enteredPin) => {
    try {
      let configSalt = await db.config.get('salt');
      let dummyString = await db.config.get('dummyString');

      let saltBytes;

      if (!configSalt) {
        // First time setup
        saltBytes = window.crypto.getRandomValues(new Uint8Array(16));
        await db.config.put({ key: 'salt', value: saltBytes });

        const newKey = await deriveKey(enteredPin, saltBytes);
        const encryptedDummy = await encryptData('MAEN_VAULT_VERIFIED', newKey);
        await db.config.put({ key: 'dummyString', value: encryptedDummy });

        setCryptoKey(newKey);
        setView('TIMELINE');
        return;
      }

      // Verify existing PIN
      saltBytes = configSalt.value;
      const testKey = await deriveKey(enteredPin, saltBytes);

      if (!dummyString) {
          throw new Error("Corrupted state. No dummy string found.");
      }

      // If decryptData succeeds without throwing, the PIN is correct
      const decrypted = await decryptData(dummyString.value.ciphertext, dummyString.value.iv, testKey);

      if (decrypted === 'MAEN_VAULT_VERIFIED') {
        setCryptoKey(testKey);
        setView('TIMELINE');
      } else {
          throw new Error("Invalid PIN payload");
      }

    } catch (e) {
      console.error(e);
      // Fail
      if (navigator.vibrate) navigator.vibrate(200);
      setIsShaking(true);
      setTimeout(() => {
        setIsShaking(false);
        setPin('');
        setIsPinLoading(false);
      }, 500);
    }
  };

  if (stage === 'LOADING') {
    return <div className="flex h-screen items-center justify-center bg-black"><span className="text-gray-500">...</span></div>;
  }

  if (stage === 'STAGE_1') {
    return (
      <div className="flex flex-col h-screen items-center justify-center p-6 bg-black text-white">
        <h1 className="text-2xl font-bold mb-8 uppercase tracking-widest text-gray-400">[ CLOUD LOCK ]</h1>
        <form onSubmit={handleLogin} className="w-full max-w-sm flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            className="p-3 bg-gray-900 border border-gray-800 rounded outline-none focus:border-gray-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="p-3 bg-gray-900 border border-gray-800 rounded outline-none focus:border-gray-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {authError && <p className="text-red-500 text-sm">{authError}</p>}
          <button type="submit" className="mt-4 p-3 bg-white text-black font-bold rounded uppercase">
            Login
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen items-center justify-center bg-black text-white">
      <div className="mb-12 flex flex-col items-center">
        <div className="text-sm text-gray-500 mb-8 tracking-widest">[ VAULT LOCKED ]</div>
        <motion.div
          className="flex gap-4"
          animate={isShaking ? { x: [-10, 10, -10, 10, 0] } : {}}
          transition={{ duration: 0.4 }}
        >
          {[...Array(4)].map((_, i) => (
            <div key={i} className="w-4 h-4 rounded-full flex items-center justify-center">
                {pin.length > i ? '*' : '_'}
            </div>
          ))}
        </motion.div>
      </div>

      <div className="grid grid-cols-3 gap-6 opacity-80 pointer-events-auto">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <button
            key={num}
            onClick={() => handlePinInput(num.toString())}
            className="w-16 h-16 flex items-center justify-center text-2xl font-light rounded-full active:bg-gray-800"
            disabled={isPinLoading}
          >
            {num}
          </button>
        ))}
        <div className="w-16 h-16"></div>
        <button
          onClick={() => handlePinInput('0')}
          className="w-16 h-16 flex items-center justify-center text-2xl font-light rounded-full active:bg-gray-800"
          disabled={isPinLoading}
        >
          0
        </button>
        <button
          onClick={() => {
              if(!isPinLoading) setPin(pin.slice(0, -1));
          }}
          className="w-16 h-16 flex items-center justify-center text-2xl font-light rounded-full active:bg-gray-800"
          disabled={isPinLoading}
        >
          ⌫
        </button>
      </div>
    </div>
  );
}
