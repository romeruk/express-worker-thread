interface FibInput {
  index: number;
  objectResult: boolean;
}

type ObjectOutput = { [key: string]: string };

function fib(input: FibInput): BigInt | ObjectOutput {
  const { index, objectResult } = input;

  const result: ObjectOutput = {
    "1": "0",
    "2": "1",
  };

  let last = 0n;
  let sum = 1n;

  for (let i = 2; i <= index; i++) {
    [last, sum] = [sum, sum + last];
    if (objectResult) {
      result[i] = last.toString();
    }
  }

  if (objectResult) {
    return result;
  }

  return last;
}

export default fib;
