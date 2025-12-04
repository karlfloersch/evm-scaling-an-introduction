'use client';

import { useEffect } from 'react';
import { usePresentationStore } from '@/stores/presentation';

export function KeyboardControls() {
  const {
    nextSlide,
    prevSlide,
    togglePresentationMode,
    keyboardEnabled,
    isPresentationMode,
    exitPresentationMode,
  } = usePresentationStore();

  useEffect(() => {
    if (!keyboardEnabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
        case ' ':
        case 'PageDown':
          e.preventDefault();
          nextSlide();
          break;

        case 'ArrowLeft':
        case 'ArrowUp':
        case 'PageUp':
          e.preventDefault();
          prevSlide();
          break;

        case 'f':
        case 'F':
          if (!e.metaKey && !e.ctrlKey) {
            e.preventDefault();
            togglePresentationMode();
          }
          break;

        case 'Escape':
          if (isPresentationMode) {
            e.preventDefault();
            exitPresentationMode();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    keyboardEnabled,
    nextSlide,
    prevSlide,
    togglePresentationMode,
    isPresentationMode,
    exitPresentationMode,
  ]);

  return null;
}

export function KeyboardHints() {
  const { isPresentationMode } = usePresentationStore();

  if (isPresentationMode) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 text-xs text-gray-500 bg-black/50 backdrop-blur-sm rounded-lg px-3 py-2">
      <div className="flex gap-4">
        <span>
          <kbd className="bg-white/10 px-1.5 py-0.5 rounded">←</kbd>
          <kbd className="bg-white/10 px-1.5 py-0.5 rounded ml-1">→</kbd>
          {' '}navigate
        </span>
        <span>
          <kbd className="bg-white/10 px-1.5 py-0.5 rounded">F</kbd>
          {' '}fullscreen
        </span>
      </div>
    </div>
  );
}
