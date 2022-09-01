import crypto from "crypto";
import express, { Request, Response } from "express";
import path from "path";
import Piscina from "piscina";

import client from "./redis";

const app = express();
const port = process.env.APPLICATION_PORT ?? 4000;

const piscina = new Piscina({
  filename: path.resolve(__dirname, './workers/fibWorker.ts')
});

async function start() {
  await client.connect();
	await client.set("fe8b716c", Number(await piscina.run(10)));

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));


  app.get("/", async (req: Request, res: Response) => {
    res.send({
      status: "OK",
    });
  });

  app.post("/input", async (req: Request, res: Response) => {
    try {
      const { number } = req.body;
      const calcFibonacci = await piscina.run(number);
      const ticket = crypto.randomBytes(4).toString("hex");
      await client.set(`${ticket}`, calcFibonacci.toString());

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
