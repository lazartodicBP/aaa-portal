export function generateRandomNineDigitNumber(): number {
  return Math.floor(100000000 + Math.random() * 900000000);
}

export function generateMemberID(): string {
  return 'AAA-' + Array.from({length: 5}, () => Math.floor(Math.random() * 10)).join('');
}

/**
 * Determines BenefitSet based on membership level
 * @param membershipLevel - CLASSIC, PLUS, or PREMIER
 * @returns 1 for Basic/Classic, 2 for Plus, 3 for Premier
 */
export function getBenefitSet(membershipLevel: string): number {
  switch (membershipLevel.toUpperCase()) {
    case 'CLASSIC':
    case 'BASIC':
      return 1;
    case 'PLUS':
      return 2;
    case 'PREMIER':
      return 3;
    default:
      console.warn(`Unknown membership level: ${membershipLevel}, defaulting to Basic`);
      return 1;
  }
}

/**
 * Formats a date to YYYY-MM-DD string
 * @param date - Date object to format
 * @returns Date string in YYYY-MM-DD format
 */
export function getFormattedDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parsePrice(rate: string): number {
  // Remove $ and parse to float
  return parseFloat(rate?.replace('$', '') || '0') || 0;
}

export function determineMembershipLevel(productName: string): 'CLASSIC' | 'PLUS' | 'PREMIER' {
  const name = productName?.toLowerCase() || '';
  if (name.includes('premier')) return 'PREMIER';
  if (name.includes('plus')) return 'PLUS';
  return 'CLASSIC';
}

// Method to determine billing cycle from product name
export function determineBillingCycle(productName: string): 'MONTHLY' | 'YEARLY' {
  const name = productName?.toLowerCase() || '';
  return name.includes('annual') ? 'YEARLY' : 'MONTHLY';
}