const path = require("path");

module.exports = {
  stories: ["../src/**/__stories__/**/*.ts", "../src/**/__stories__/**/*.tsx"],
  webpackFinal: async (config, { configType }) => {
    // `configType` has a value of 'DEVELOPMENT' or 'PRODUCTION'
    // You can change the configuration based on that.
    // 'PRODUCTION' is used when building the static version of storybook.

    // Make whatever fine-grained changes you need

    // Return the altered config
    return config;
  },
};
