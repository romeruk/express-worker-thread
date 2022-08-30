import { Worker } from "worker_threads";

const calculateFibonacci = (fibNumber: number): Promise<number> => {
  return new Promise((resolve, reject) => {
		const workerData = { fibNumber };

    const worker = new Worker("./worker.ts", { workerData });
    worker.on("message", resolve);
    worker.on("error", reject);
    worker.on("exit", (code: number) => {
      if (code !== 0) reject(new Error(`stopped with  ${code} exit code`));
    });
  });
};

export default calculateFibonacci;