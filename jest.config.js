module.exports = {
  roots: ["tests"],
  transform: {
    "^.+\\.ts$": "ts-jest"
  },
  globals: {
    "ts-jest": {
      tsconfig: "./tsconfig.json"
    }
  }
};
