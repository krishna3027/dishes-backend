const app = require("./app");

const PORT = process.env.port || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

process.on("SIGINT", () => {
  console.info("SIGINT received. Shutting down server...");
  server.close(() => process.exit(0));
});

process.on("SIGTERM", () => {
  console.info("SIGTERM received. Shutting down server...");
  server.close(() => process.exit(0));
});
