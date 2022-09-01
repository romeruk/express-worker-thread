function fib(index: number): BigInt {
  let last = BigInt(0);
  let sum = BigInt(1);

  for (; index >= BigInt(2); index--) {
    [last, sum] = [sum, sum + last];
  }

  return sum;
}

export default fib;