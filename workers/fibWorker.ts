import client from "../redis";
interface FibInput {
  index: number;
  objectResult?: boolean;
  ticket?: number;
}

type ObjectOutput = { [key: string]: string };

const BULK_ELEMENTS_LIMIT = 10000;

async function fib(input: FibInput): Promise<void> {
  const { index, objectResult, ticket } = input;

  await client.connect();

  let last = 0n;
  let sum = 1n;

  let result: ObjectOutput = {
    "1": "0",
    "2": "1",
  };

  for (let i = 2; i <= index; i++) {
    [last, sum] = [sum, sum + last];
    if (objectResult) {
      result[index] = last.toString();
      if (
        i >= BULK_ELEMENTS_LIMIT ||
        (i < BULK_ELEMENTS_LIMIT && i === index)
      ) {
        await client.MSET(result);
        console.log("result");
        result = {};
      }
    }

    if (!objectResult) {
      await client.SET(`${ticket}`, last.toString());
    }
  }

  await client.disconnect();
}

export default fib;
