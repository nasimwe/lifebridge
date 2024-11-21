import express from "express";
import cors from "cors";
import routes from "../routes/index.js";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";

// Create an Express application
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Swagger Documentation
const swaggerDocument = YAML.load("./prisma/docs/swagger.yaml");
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Routes
app.use("/api", routes);

// Root endpoint for testing
app.get("/", (req, res) => {
  res.send("Welcome to the LifeBridge API!");
});

// Vercel serverless handler
export default (req, res) => {
  app(req, res);
};

// Start the server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// import express from "express";
// import cors from "cors";
// import serverless from "serverless-http";
// import routes from "../routes/index.js";
// import swaggerUi from "swagger-ui-express";
// import YAML from "yamljs";

// const app = express();

// app.use(cors());
// app.use(express.json());

// const swaggerDocument = YAML.load("../prisma/docs/swagger.yaml");
// app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// app.use("/api", routes);

// app.get("/", (req, res) => {
//   res.send("Welcome to the LifeBridge API!");
// });

// export default serverless(app);
