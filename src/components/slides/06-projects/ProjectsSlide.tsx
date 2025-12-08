'use client';

import { motion } from 'framer-motion';
import { SlideContainer, SlideHeader, AnimatedText } from '@/components/ui/SlideContainer';

export function ProjectsSlide() {
  return (
    <SlideContainer id="projects-comparison" variant="default">
      <SlideHeader
        section="What's Next"
        title="Let's Build Together"
        subtitle="Now we have a shared mental model"
      />

      <div className="mt-8 space-y-8 max-w-3xl mx-auto">
        {/* Shared Mental Model */}
        <AnimatedText delay={0.1}>
          <div className="interactive-panel">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center text-2xl flex-shrink-0">
                🧠
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Shared Mental Model</h3>
                <p className="text-gray-400 leading-relaxed">
                  Now that we understand the <span className="text-white font-medium">8 resources</span>,{' '}
                  <span className="text-white font-medium">scaling tradeoffs</span>, and{' '}
                  <span className="text-white font-medium">fee market dynamics</span>, we can{' '}
                  <span className="text-primary-400 font-medium">prioritize and divide & conquer</span>!
                </p>
              </div>
            </div>
          </div>
        </AnimatedText>

        {/* Call to Action */}
        <AnimatedText delay={0.2}>
          <div className="interactive-panel bg-primary-500/5 border-primary-500/30">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center text-2xl flex-shrink-0">
                💬
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Let&apos;s Talk!</h3>
                <p className="text-gray-400 leading-relaxed mb-4">
                  I&apos;d love to discuss this stuff with you. Whether you&apos;re working on client implementations,
                  L2 scaling, or fee market research — please reach out!
                </p>
                <div className="flex items-center gap-4">
                  <motion.a
                    href="https://twitter.com/karl_dot_tech"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-2.5 rounded-lg bg-primary-500 hover:bg-primary-400 text-white font-medium transition-all inline-flex items-center gap-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                    @karl_dot_tech
                  </motion.a>
                  <span className="text-gray-500">— Karl Floersch</span>
                </div>
              </div>
            </div>
          </div>
        </AnimatedText>

        {/* Special Interest */}
        <AnimatedText delay={0.3}>
          <div className="interactive-panel border-amber-500/30 bg-amber-500/5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center text-2xl flex-shrink-0">
                ⚡
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Especially Interested In...</h3>
                <p className="text-gray-400 leading-relaxed">
                  How can we fix the fee markets so that{' '}
                  <span className="text-amber-400 font-medium">client software improvements</span> are
                  reflected in the <span className="text-amber-400 font-medium">transaction fees</span> of
                  the network?
                </p>
                <p className="text-gray-500 text-sm mt-3">
                  If we can properly price each resource, client teams would be directly rewarded for
                  their optimization work.
                </p>
              </div>
            </div>
          </div>
        </AnimatedText>

        {/* Footer */}
        <AnimatedText delay={0.4}>
          <div className="text-center pt-4">
            <p className="text-gray-500 text-sm">
              Built with 💜 for the Ethereum community
            </p>
            <motion.a
              href="https://github.com/karlfloersch/evm-scaling-an-introduction"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm mt-2 transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.341-3.369-1.341-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
              </svg>
              View source on GitHub
            </motion.a>
          </div>
        </AnimatedText>
      </div>
    </SlideContainer>
  );
}
