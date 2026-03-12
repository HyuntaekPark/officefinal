require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });

const { verifyConnection } = require("./database/db");
const app = require("./app");
const PORT = process.env.PORT || 3001;

verifyConnection()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`KSA Office backend running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to initialize database", error);
    process.exit(1);
  });
