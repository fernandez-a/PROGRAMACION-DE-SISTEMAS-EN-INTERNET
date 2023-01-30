import { Collection, Db } from "mongodb";
import { connectDB } from "./DBconnection";
import express from "express";
import { book, free, freeSeats, checkLogin, signin, login, logout, mybookings } from "./resolvers";
import moment from "moment";

const run = async () => {
  const db: Db = await connectDB();
  const app = express();
  app.set("db", db);
  app.use(express.json());

  app.use(`/freeSeats`, async(req, res, next) =>{
    if(checkLogin(db.collection("Registered_Users"),req.headers.token as string))
      next();
    else
      res.status(404).send("Token is missing or does not correspond to a logged in account account.");
  });
  app.use(`/book`, async(req, res, next) =>{
    if(checkLogin(db.collection("Registered_Users"),req.headers.token as string))
      next();
    else
      res.status(404).send("Token is missing or does not correspond to a logged in account account.");
  });
  app.use(`/free`, async(req, res, next) =>{
    if(checkLogin(db.collection("Registered_Users"),req.headers.token as string))
      next();
    else
      res.status(404).send("Token is missing or does not correspond to a logged in account account.");
  });

  app.get("/status", async (req, res) => {
    const date = new Date();
    res.status(200).send(`${date.getDate()}/${date.getMonth()+1}/${date.getFullYear()}`);
  });
  app.get("/freeSeats", freeSeats);
  app.post("/book", book);
  app.post("/free", free);
  app.post("/signin", signin);
  app.post("/login", login);
  app.get("/logout", logout);
  app.get("/mybookings", mybookings);

  await app.listen(3000);
};

try {
  run();
} catch (e) {
  console.error(e);
}


