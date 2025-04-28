module.exports = {
  apps: [
    {
      name: "interviewit-backend",
      script: "dist/app.js",
      instances: 1,
      autorestart: true,
      env: {
        NODE_ENV: "production",
      },
      env_development: {
        NODE_ENV: "development",
      },
    },
  ],
};
