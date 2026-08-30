const express = require("express");
const ElectionController = require("./controllers/election.controller");

const app = express();
const PORT = process.env.PORT || 8081;

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

ElectionController.startData();

app.get("/", ElectionController.home);
app.get("/api/candidates", ElectionController.candidates);
app.get("/api/voters", ElectionController.voters);
app.get("/api/status", ElectionController.status);
app.post("/api/vote", ElectionController.vote);
app.post("/api/close", ElectionController.close);
app.post("/api/groups/:groupId/decide", ElectionController.decideGroup);

app.listen(PORT, (err) => {
      if (err) throw new Error(err.message);
      console.log("Server listen port " + PORT);
});
