module.exports = function (api) {
  api.cache(true)
  return {
    presets: [
      [
        'babel-preset-expo',
        {
          unstable_transformImportMeta: true,
        },
      ],
    ],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./'],
          extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
          alias: {
            '@': './',
            '@components': './components',
            '@screens': './screens',
            '@utils': './utils',
            '@context': './context',
            '@config': './config',
          },
        },
      ],
      'react-native-reanimated/plugin',
    ],
  }
}
