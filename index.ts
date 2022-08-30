import crypto from "crypto";
import express, { Request, Response } from "express";
import { createClient } from "redis";

import calculateFibonacci from "./fibonacci";

const client = createClient({
  socket: {
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
  },
  password: process.env.REDIS_PASSWORD,
});

const app = express();

async function start() {
  await client.connect();
	await client.set("fe8b716c", await calculateFibonacci(10));

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  const port = 4000;

  app.get("/", async (req: Request, res: Response) => {
    res.send({
      status: "OK",
    });
  });

  app.post("/input", async (req: Request, res: Response) => {
    try {
			console.log("/input");
      const { number } = req.body;
      const calcFibonacci = await calculateFibonacci(number);
      const ticket = crypto.randomBytes(4).toString("hex");
      await client.set(`${ticket}`, calcFibonacci);

      res.send({
        ticket,
      });
    } catch (error) {
      res.send(error);
    }
  });

  app.get("/output/:ticket", async (req: Request, res: Response) => {
    try {
      const { ticket } = req.params;
			console.log(ticket);
      const value = await client.get(`${ticket}`);

      if (value) {
        res.send({ Fibonacci: value });
        return;
      }

      res.status(404).send({
        message: "Not found",
      });
    } catch (error) {
      res.send(error);
    }
  });

  app.listen(port, () => {
    console.log(`[server]: Server is running at https://localhost:${port}`);
  });
}

start();
