'use client';

import { motion } from 'framer-motion';

const GITHUB_REPO = 'karlfloersch/evm-scaling-an-introduction';

interface FeedbackButtonProps {
  /** Context about what section/slide the user is viewing */
  context?: string;
}

export function FeedbackButton({ context }: FeedbackButtonProps) {
  const handleClick = () => {
    const title = encodeURIComponent("You're wrong about...");
    const body = encodeURIComponent(
      `## What's wrong?\n\n[Describe what you think is incorrect]\n\n## What should it say instead?\n\n[Your correction or suggestion]\n\n---\n*Context: ${context || 'General feedback'}*`
    );
    const url = `https://github.com/${GITHUB_REPO}/issues/new?title=${title}&body=${body}&labels=feedback,content-correction`;
    window.open(url, '_blank');
  };

  return (
    <motion.button
      onClick={handleClick}
      className="
        fixed bottom-6 left-1/2 -translate-x-1/2 z-50
        flex items-center gap-2
        bg-red-500/10 hover:bg-red-500/20
        border border-red-500/30 hover:border-red-500/50
        text-red-400 hover:text-red-300
        px-4 py-2 rounded-full
        text-sm font-medium
        transition-all duration-200
        backdrop-blur-sm
      "
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <GitHubIcon className="w-4 h-4" />
      <span>You&apos;re wrong!</span>
    </motion.button>
  );
}

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z"
      />
    </svg>
  );
}

/**
 * Compact version for embedding in slides
 */
export function InlineFeedbackLink({ context }: FeedbackButtonProps) {
  const handleClick = () => {
    const title = encodeURIComponent("Feedback on: " + (context || 'content'));
    const body = encodeURIComponent(
      `## Feedback\n\n[Your feedback here]\n\n---\n*Context: ${context || 'General'}*`
    );
    const url = `https://github.com/${GITHUB_REPO}/issues/new?title=${title}&body=${body}&labels=feedback`;
    window.open(url, '_blank');
  };

  return (
    <button
      onClick={handleClick}
      className="
        inline-flex items-center gap-1.5
        text-gray-500 hover:text-gray-300
        text-xs
        transition-colors
      "
    >
      <GitHubIcon className="w-3 h-3" />
      <span>Suggest edit</span>
    </button>
  );
}
