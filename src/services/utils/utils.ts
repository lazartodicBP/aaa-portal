export function generateRandomNineDigitNumber(): number {
  return Math.floor(100000000 + Math.random() * 900000000);
}

export function generateMemberID(): string {
  return 'AAA-' + Array.from({length: 5}, () => Math.floor(Math.random() * 10)).join('');
}