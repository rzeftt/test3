module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    transform: {
      '^.+\\.(ts|tsx)$': 'ts-jest',  // מתמודדים עם קבצי ts ו-tsx
    },
    moduleFileExtensions: ['ts', 'tsx', 'js', 'json'], // הרחבות קבצים ש-Jest יזהה
    transformIgnorePatterns: [
      'node_modules/(?!supertest)',  // לעבד גם חבילות מתוך node_modules כמו supertest
    ],
  };
  