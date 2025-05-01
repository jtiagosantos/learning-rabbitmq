export const calculateFactorial = (n: number): number => {
  if (n === 0) {
    return 1;
  }

  return n * calculateFactorial(n - 1);
};
