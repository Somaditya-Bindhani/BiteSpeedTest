const express = require("express");
const app = express();
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const controller = require("./controller/contact");
const path = require("path");
const corsConfig = require("./config/cors");
const cors = require("cors");

require("dotenv").config();

app.use(express.json());
app.use(cors(corsConfig));

swaggerDocument = YAML.load(path.join(__dirname, "swagger.yaml"));
app.use(express.urlencoded({ extended: true }));
const options = {
  customCss: ".swagger-ui .topbar { display: none }",
};
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument, options)
);

app.get("/", (req, res) => {
  return res.status(200).json({ message: "Server is up and running." });
});

app.post("/identify", controller.contactHandler, controller.getContact);

app.listen(5050, () => {
  console.log("Server listening on PORT : 5050");
});
