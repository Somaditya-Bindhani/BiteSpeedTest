const config = {
  origin: "*",
  allowedHeaders: [
    "Authorization",
    "X-Requested-With",
    "Content-Type",
    "x-auth-token",
  ],
  methods: ["GET", "POST", "DELETE", "PUT", "OPTIONS"],
  optionsSuccessStatus: 200,
};
module.exports = config;
