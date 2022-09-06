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

  if (objectResult) {
    let result: ObjectOutput = {
      "1": "0",
      "2": "1",
    };

    let last = 0n;
    let sum = 1n;

    let count = 0;

    for (let i = 2; i <= index; i++) {
      [last, sum] = [sum, sum + last];
      result[i] = last.toString();
      count++;
      if (count >= BULK_ELEMENTS_LIMIT) {
        await client.MSET(result);
        result = {};
      }
    }
		return;
  }

	let last = 0n;
	let sum = 1n;

  for (let i = 2; i <= index; i++) {
		[last, sum] = [sum, sum + last];
  }

	await client.SET(`${ticket}`, last.toString());
  await client.disconnect();

}

export default fib;
