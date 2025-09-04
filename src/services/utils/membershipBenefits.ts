import { MembershipBenefit } from "@/services/api/types";

export const membershipBenefits: Record<string, MembershipBenefit> = {
  CLASSIC: {
    level: 'CLASSIC',
    tagline: 'Essential benefits for the road and beyond',
    roadsideAssistance: [
      'Tows up to 3 miles',
      '$60 toward locksmith parts and labor',
      'Free emergency fuel delivery; member pays for fuel',
      'Battery service and jump start',
      'Flat tire service',
      'Referral to AAA Approved Auto Repair facilities'
    ],
    additionalBenefits: [
      'Free Hertz Gold® membership with enrollment',
      'Free ID theft protection',
      'AAA discounts on everyday purchases'
    ]
  },
  PLUS: {
    level: 'PLUS',
    tagline: 'Enhanced coverage with extended benefits',
    popularTag: true,
    roadsideAssistance: [
      '4 service calls, tows up to 100 miles each',
      '$100 toward vehicle lockout services',
      'Free emergency fuel and delivery',
      'Battery service and jump start',
      'Flat tire service',
      'Referral to AAA Approved Auto Repair facilities'
    ],
    additionalBenefits: [
      'All Classic benefits included',
      'Discount on passport photos',
      'Discount on notary services',
      'Free international AAA maps',
      '20% CARFAX report discount'
    ]
  },
  PREMIER: {
    level: 'PREMIER',
    tagline: 'Premium protection with maximum coverage',
    roadsideAssistance: [
      '1 tow per household up to 200 miles, remaining tows up to 100 miles',
      '$150 toward vehicle lockout services',
      'Free emergency fuel and delivery',
      'Battery service and jump start',
      'Flat tire service',
      'Priority service and extended hours'
    ],
    additionalBenefits: [
      'All Plus benefits included',
      '1 free set of printed + digital passport photos per membership year',
      'Free notary services',
      '1-day complimentary standard rental car with in-territory tow',
      '1 free CARFAX report per year and 40% discount on additional reports',
      'Enhanced trip interruption coverage'
    ]
  }
};

export function getMembershipBenefit(level: string): MembershipBenefit | null {
  return membershipBenefits[level.toUpperCase()] || null;
}