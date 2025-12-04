'use client';

import { useRef, useEffect } from 'react';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import { usePresentationStore } from '@/stores/presentation';

interface SlideContainerProps {
  id: string;
  children: React.ReactNode;
  className?: string;
  /** Background variant */
  variant?: 'default' | 'dark' | 'gradient' | 'accent';
  /** Whether to center content vertically */
  centered?: boolean;
  /** Callback when slide enters view */
  onEnter?: () => void;
  /** Callback when slide exits view */
  onExit?: () => void;
}

const variantStyles = {
  default: 'bg-transparent',
  dark: 'bg-black/50',
  gradient: 'bg-gradient-to-b from-primary-900/20 to-transparent',
  accent: 'bg-gradient-to-br from-accent-purple/10 via-transparent to-accent-blue/10',
};

export function SlideContainer({
  id,
  children,
  className = '',
  variant = 'default',
  centered = true,
  onEnter,
  onExit,
}: SlideContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { amount: 0.5 });
  const { goToSlide, currentSlideId } = usePresentationStore();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  // Progress within this slide (0 when entering, 1 when leaving)
  const slideProgress = useTransform(scrollYProgress, [0, 0.5, 1], [0, 0.5, 1]);

  useEffect(() => {
    if (isInView) {
      goToSlide(id);
      onEnter?.();
    } else if (currentSlideId === id) {
      onExit?.();
    }
  }, [isInView, id, goToSlide, currentSlideId, onEnter, onExit]);

  return (
    <motion.section
      ref={containerRef}
      id={id}
      className={`
        slide min-h-screen w-full relative
        ${variantStyles[variant]}
        ${centered ? 'flex items-center justify-center' : ''}
        ${className}
      `}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: false, amount: 0.3 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="slide-content w-full max-w-6xl mx-auto px-6 py-16"
        style={{ opacity: useTransform(slideProgress, [0, 0.2, 0.8, 1], [0.5, 1, 1, 0.5]) }}
      >
        {children}
      </motion.div>
    </motion.section>
  );
}

interface SlideHeaderProps {
  title: string;
  subtitle?: string;
  section?: string;
}

export function SlideHeader({ title, subtitle, section }: SlideHeaderProps) {
  return (
    <motion.header
      className="mb-12 text-center"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {section && (
        <span className="text-sm font-medium text-primary-400 uppercase tracking-wider mb-2 block">
          {section}
        </span>
      )}
      <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">{title}</h2>
      {subtitle && (
        <p className="text-xl text-gray-400 max-w-2xl mx-auto">{subtitle}</p>
      )}
    </motion.header>
  );
}

interface SlideContentProps {
  children: React.ReactNode;
  className?: string;
  columns?: 1 | 2 | 3;
}

export function SlideContent({
  children,
  className = '',
  columns = 1,
}: SlideContentProps) {
  const gridClass = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  };

  return (
    <div className={`grid ${gridClass[columns]} gap-8 ${className}`}>
      {children}
    </div>
  );
}

interface AnimatedTextProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

export function AnimatedText({
  children,
  delay = 0,
  className = '',
}: AnimatedTextProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      viewport={{ once: false }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
