'use client';

import { motion, useScroll, useSpring } from 'framer-motion';
import { usePresentationStore } from '@/stores/presentation';

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  const { currentSlideIndex, slides, isPresentationMode } = usePresentationStore();
  const currentSlide = slides[currentSlideIndex];

  if (isPresentationMode) return null;

  return (
    <>
      {/* Progress bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-primary-500 origin-left z-50"
        style={{ scaleX }}
      />

      {/* Slide indicator */}
      <div className="fixed bottom-6 left-6 z-50 flex items-center gap-3 bg-black/50 backdrop-blur-sm rounded-full px-4 py-2">
        <span className="text-sm text-gray-400">
          {currentSlideIndex + 1} / {slides.length}
        </span>
        {currentSlide && (
          <span className="text-sm text-white font-medium">
            {currentSlide.title}
          </span>
        )}
      </div>
    </>
  );
}

export function SlideNav() {
  const { slides, currentSlideIndex, goToIndex, isPresentationMode } =
    usePresentationStore();

  if (isPresentationMode) return null;

  // Group slides by section
  const sections = slides.reduce(
    (acc, slide) => {
      if (!acc[slide.section]) {
        acc[slide.section] = [];
      }
      acc[slide.section].push(slide);
      return acc;
    },
    {} as Record<string, typeof slides>
  );

  return (
    <nav className="fixed right-6 top-1/2 -translate-y-1/2 z-50 hidden lg:block">
      <div className="flex flex-col gap-2">
        {Object.entries(sections).map(([section, sectionSlides]) => (
          <div key={section} className="flex flex-col gap-1">
            <span className="text-xs text-gray-500 mb-1">{section}</span>
            {sectionSlides.map((slide) => {
              const globalIndex = slides.findIndex((s) => s.id === slide.id);
              const isActive = globalIndex === currentSlideIndex;

              return (
                <button
                  key={slide.id}
                  onClick={() => goToIndex(globalIndex)}
                  className={`
                    w-3 h-3 rounded-full transition-all
                    ${
                      isActive
                        ? 'bg-primary-500 scale-125'
                        : 'bg-white/20 hover:bg-white/40'
                    }
                  `}
                  title={slide.title}
                />
              );
            })}
          </div>
        ))}
      </div>
    </nav>
  );
}
