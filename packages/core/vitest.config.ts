import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['**/*.{test,spec}.?(c|m)[jt]s?(x)', '../../scripts/*.test.mjs', '../../site/*.test.mjs'],
    environmentMatchGlobs: [
      ['tests/modal.test.ts', 'jsdom'],
      ['tests/voice-input.test.ts', 'jsdom'],
      ['../../site/kit.icon.test.mjs', 'jsdom'],
      ['../../site/attr.test.mjs', 'jsdom'],
      ['src/mask-numbers.test.ts', 'jsdom'],
    ],
    // Fixed origin for jsdom-environment tests that need a stable location.hostname (attr.test.mjs
    // relies on this to exercise the self-referral-is-ignored path deterministically).
    environmentOptions: {
      jsdom: { url: 'https://klavity.in/' },
    },
  },
})
