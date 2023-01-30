import { Request, Response } from "express";
import { Collection, Db } from "mongodb";
import { stringify } from "querystring";
import { v4 as uuidv4 } from 'uuid';
import { setFlagsFromString } from "v8";

type printBooking ={
  date:string,
  seatNumber:string
}

export const checkLogin = (collection: Collection, token: string) => {
  if (token === null) {
    return false;
  } else return collection.findOne({ token: token }) !== null;
}

const checkDate = (day: string, month: string, year: string) => {
  const date = new Date(`${month} ${day}, ${year}`);
  const actualDate = new Date();
  if (date.toString() === "Invalid Date") return 2;
  else if (date < actualDate) return 1;
  else return 0;
}

export const signin = async (req: Request, res: Response) => {
  if (!req.body.email || !req.body.password) {
    res.status(500).send("Missing Params");
  }
  const { email, password } = req.body;
  const db: Db = req.app.get("db");
  const collection: Collection = db.collection("Registered_Users");
  const user = await collection.findOne({ user: email });
  if (!user) {
    const char = await collection.insertOne({
      email: email,
      password: password,
      token: null,
    });
    res.status(200).send("Register succesful.")
  } else {
    res.status(409).send("Username already in use.")
  }
}

export const login = async (req: Request, res: Response) => {
  if (!req.body.email || !req.body.password) {
    res.status(500).send("Missing Params");
  }
  const { username, password } = req.body;
  const db: Db = req.app.get("db");
  const collection: Collection = db.collection("Registered_Users");
  const user = await collection.findOne({ user: username, password: password });
  if (user) {
    const token = uuidv4();
    await collection.findOneAndUpdate({ user: username }, { '$set': { token: token } });
    res.status(200).json({ token: token })
  } else {
    res.status(409).send("Wrong user or password.")
  }
}

export const logout = async (req: Request, res: Response) => {
  const token = req.headers.token;
  const db: Db = req.app.get("db");
  const collection: Collection = db.collection("Registered_Users");
  const user = await collection.findOne({ token: token });
  if (user) {
    await collection.findOneAndUpdate({ token: token }, { '$set': { token: null } });
    res.status(200).send("SignOut succesful")
  } else {
    res.status(200).send("User not found")
  }
}

export const freeSeats = async (req: Request, res: Response) => {
  if (req.query.day && req.query.month && req.query.year) {
    const { day, month, year } = req.query as {
      day: string,
      month: string,
      year: string
    }
    const checkValidity = checkDate(day, month, year);
    if (checkValidity === 0) {
      const db: Db = req.app.get("db");
      const collection: Collection = db.collection("reservedSeats");
      let puesto = 1;
      let puestos_libres: Array<number> = new Array<number>();
      const seats = await collection.find({ day: day, month: month, year: year }).toArray();
      while (puesto <= 20) {
        if (!seats.find((reservation) => { return parseInt(reservation.seat) === puesto; })) {
          puestos_libres.push(puesto);
        }
        puesto++;
      }
      res.status(200).json({ Free_Seats: puestos_libres });
    } else if (checkValidity === 1) {
      res.status(500).send("The date needs to be at least today.");
    } else {
      res.status(500).send("Invalid Date.");
    }
  } else {
    res.status(500).send("Missing Params.");
  }
};

export const book = async (req: Request, res: Response) => {
  if (req.query.day && req.query.month && req.query.year && req.query.seatNumber) {
    const { day, month, year } = req.query as {
      day: string,
      month: string,
      year: string
    }
    const checkValidity = checkDate(day, month, year);
    if (checkValidity === 0) {
      const db: Db = req.app.get("db");
      const collection: Collection = db.collection("reservedSeats")
      const seatNumber = req.query.seatNumber
      const seat = await db.collection("reservedSeats").findOne({ day: day, month: month, year: year, seat: seatNumber })
      if (seat) {
        res.status(404).send("The seat is already reserved.");
      } else {
        const user = await db.collection("Registered_Users").findOne({ token: req.headers.token })
        if (user) {
          const email = user["email"];
          await db.collection("reservedSeats").insertOne({ day: day, month: month, year: year, seat: seatNumber, email: email })
          const date = new Date();
          res.status(200).json({ seat: seatNumber, date: `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}` })
        } else {
          res.status(404).send("User not found");
        }
      }
    } else if (checkValidity === 1) {
      res.status(500).send("The date needs to be at least today.");
    } else {
      res.status(500).send("Invalid Date.");
    }
  } else {
    res.status(500).send("Missing Params.");
  }
};

export const free = async (req: Request, res: Response) => {
  if (req.body.day && req.body.month && req.body.year && req.body.seatNumber) {
    const db: Db = req.app.get("db");
    const { day, month, year } = req.body;
    const user = await db.collection("Registered_Users").findOne({ token: req.headers.token })
    if (user) {
      const email = user["email"];
      const checkValidity = checkDate(day, month, year);
      if (checkValidity === 0) {
        const character = await db.collection("reservedSeats").findOne({ day: day, month: month, year: year, email: email })
        if (character) {
          await db.collection("reservedSeats").findOneAndDelete({ day: day, month: month, year: year, email: email })
          res.status(200).send("Seat is now free.");
        } else {
          res.status(404).send("Seat is not reserved.");
        }
      } else if (checkValidity === 1) {
        res.status(500).send("The date needs to be at least today.");
      } else {
        res.status(500).send("Invalid Date.");
      }
    } else {
      res.status(404).send("User not found");
    }
  } else {
    res.status(500).send("Missing Params.");
  }
};

export const mybookings = async (req: Request, res: Response) => {
  const db: Db = req.app.get("db");
  const collection: Collection = db.collection("reservedSeats");
  const user = await db.collection("Registered_Users").findOne({ token: req.headers.token })
  if (user) {
    const email = user["email"];
    const bookings = await collection.find({email:email }).toArray();
    let validDateBookings = bookings.filter((reservation)=>{
      let {day,month,year} = reservation;
      return checkDate(day, month ,year) === 0;
    });
    let formatBookings = bookings.map((reservation)=>{
      let {day,month,year} = reservation;
      return {
        seatNumber: reservation.seat,
        date : `${day}/${month}/${year}`,
      }
    })
    res.json({User:email, Bookings:formatBookings});
  }else{
    res.status(404).send("User not found");
  }
};

