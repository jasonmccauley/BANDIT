import express from "express";
const app = express();
import configRoutes from "./routes/index.js";
import exphbs from "express-handlebars";
import session from "express-session";

const rewriteUnsupportedBrowserMethods = (req, res, next) => {
  // If the user posts to the server with a property called _method, rewrite the request's method
  // To be that method; so if they post _method=PUT you can now allow browsers to POST to a route that gets
  // rewritten in this middleware to a PUT route
  if (req.body && req.body._method) {
    req.method = req.body._method;
    delete req.body._method;
  }

  // let the next middleware run:
  next();
};

app.use("/public", express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(rewriteUnsupportedBrowserMethods);

app.use(
  session({
    name: "BANDIT",
    secret: "super duper secret, change this later",
    saveUninitialized: false,
    resave: false,
    cookie: { maxAge: 60000 },
  })
);

app.use("/", (req, res, next) => {
  console.log(req.session.id);
  console.log(req.session.user);

  if (!req.session.user && req.path === "/") {
    return res.redirect("/users/login");
  }
  next();
});

app.engine(
  "handlebars",
  exphbs.engine({
    defaultLayout: "main",
  })
);
app.set("view engine", "handlebars");

configRoutes(app);

// remove this block in the future
/*import { dbConnection, closeConnection } from "./config/mongoConnection.js";
import { tests } from "./config/mongoCollections.js";
const db = await dbConnection();
const testCollection = await tests();
const insertInfo = await testCollection.insertOne({ test: 2 });
await closeConnection();*/

app.listen(3000, () => {
  console.log("We've now got a server!");
  console.log("Your routes will be running on http://localhost:3000");
});
