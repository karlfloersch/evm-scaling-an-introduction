import { create } from 'zustand';

export interface Slide {
  id: string;
  title: string;
  section: string;
  sectionIndex: number;
  slideIndex: number;
}

export interface PresentationStore {
  // Current state
  currentSlideId: string | null;
  currentSlideIndex: number;
  progress: number; // 0-1 progress through current slide

  // Slides
  slides: Slide[];
  setSlides: (slides: Slide[]) => void;

  // Navigation
  goToSlide: (slideId: string) => void;
  goToIndex: (index: number) => void;
  nextSlide: () => void;
  prevSlide: () => void;
  setProgress: (progress: number) => void;

  // Presentation mode
  isPresentationMode: boolean;
  togglePresentationMode: () => void;
  enterPresentationMode: () => void;
  exitPresentationMode: () => void;

  // Keyboard shortcuts enabled
  keyboardEnabled: boolean;
  setKeyboardEnabled: (enabled: boolean) => void;
}

export const usePresentationStore = create<PresentationStore>((set, get) => ({
  currentSlideId: null,
  currentSlideIndex: 0,
  progress: 0,

  slides: [],
  setSlides: (slides) => {
    set({ slides });
    if (slides.length > 0 && !get().currentSlideId) {
      set({ currentSlideId: slides[0].id });
    }
  },

  goToSlide: (slideId) => {
    const { slides } = get();
    const index = slides.findIndex((s) => s.id === slideId);
    if (index !== -1) {
      set({
        currentSlideId: slideId,
        currentSlideIndex: index,
        progress: 0,
      });
    }
  },

  goToIndex: (index) => {
    const { slides } = get();
    if (index >= 0 && index < slides.length) {
      set({
        currentSlideId: slides[index].id,
        currentSlideIndex: index,
        progress: 0,
      });
    }
  },

  nextSlide: () => {
    const { currentSlideIndex, slides } = get();
    if (currentSlideIndex < slides.length - 1) {
      get().goToIndex(currentSlideIndex + 1);
    }
  },

  prevSlide: () => {
    const { currentSlideIndex } = get();
    if (currentSlideIndex > 0) {
      get().goToIndex(currentSlideIndex - 1);
    }
  },

  setProgress: (progress) => set({ progress }),

  isPresentationMode: false,

  togglePresentationMode: () =>
    set((state) => ({ isPresentationMode: !state.isPresentationMode })),

  enterPresentationMode: () => set({ isPresentationMode: true }),

  exitPresentationMode: () => set({ isPresentationMode: false }),

  keyboardEnabled: true,
  setKeyboardEnabled: (enabled) => set({ keyboardEnabled: enabled }),
}));
