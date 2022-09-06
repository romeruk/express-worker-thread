import express, { Request, Response } from "express";
import path from "path";
import Piscina from "piscina";
import client from "./redis";

const app = express();
const port = process.env.APPLICATION_PORT ?? 4000;
const piscina = new Piscina({
  filename: path.resolve(__dirname, "./workers/fibWorker.ts"),
});

//initialize fib number
const initializeFibNumbers = async () => {
  try {
    const initialized = await client.get("initialized");

    if (!initialized) {
			console.log("Start initialization values");

      await piscina.run({
        index: 100000,
        objectResult: true,
      });

			await client.SET("initialized", 1);

      console.log("Finished initialization values");
    } else {
      console.log("already initialized");
    }
  } catch (error) {
    console.log("error initializating fib numbers", error);
  }
};

async function start() {
  await client.connect();

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

      const fibIndex = await client.get(String(number));

			const ticket = number;

      if (fibIndex) {
        return res.send({
          ticket
        });
      }

      res.send({
        ticket,
      });

      await piscina.run({
        index: number,
				ticket
      });

    } catch (error) {
      res.status(500).send({
        message: "Server error",
      });
    }
  });

  app.get("/output", async (req: Request, res: Response) => {
    try {
      const { ticket } = req.query;
      const value = await client.get(`${ticket}`);

      if (value) {
        res.send({ Fibonacci: value });
        return;
      }

      res.status(404).send({
        message: "Not found",
      });
    } catch (error) {
      res.status(500).send({
        message: "Server error",
      });
    }
  });

  app.listen(port, () => {
    console.log(`[server]: Server is running at https://localhost:${port}`);
  });

  await initializeFibNumbers();
}

start();
