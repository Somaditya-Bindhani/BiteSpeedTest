const express = require("express");
const app = express();
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const controller = require("./controller/contact");

app.use(express.json());
swaggerDocument = YAML.load("./swagger.yaml");
app.use(express.urlencoded({ extended: true }));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get("/", (req, res) => {
  return res.status(200).json({ message: "Server is up and running." });
});

app.post("/identify", controller);

app.listen(5050, () => {
  console.log("Server listening on PORT : 5050");
});
