module.exports = {
  preset: '@vue/cli-plugin-unit-jest/presets/typescript-and-babel',
  transform: {
    '^.+\\.vue$': 'vue-jest'
  },
  setupFilesAfterEnv: ['<rootDir>/jest-setup-after-env.ts'],
  setupFiles: ['<rootDir>/jest-setup-before-env.ts'],
  automock: false,
}
