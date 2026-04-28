/**
 * types/enums.ts — TypeScript enums mirroring backend Python enums.
 * Use these everywhere in the frontend instead of raw strings.
 */

export enum TransactionType {
  INCOME  = 'income',
  EXPENSE = 'expense',
}

export enum TransactionCategory {
  FOOD         = 'food',
  TRANSPORT    = 'transport',
  SHOPPING     = 'shopping',
  UTILITIES    = 'utilities',
  HEALTH       = 'health',
  EDUCATION    = 'education',
  SAVINGS      = 'savings',
  INCOME       = 'income',
  MOBILE_MONEY = 'mobile_money',
  OTHER        = 'other',
}

export enum TransactionSource {
  MANUAL       = 'manual',
  SMS_SCAN     = 'sms_scan',
  RECEIPT_SCAN = 'receipt_scan',
}

export enum MoneyPersonality {
  SAVER    = 'saver',
  SPENDER  = 'spender',
  INVESTOR = 'investor',
  AVOIDER  = 'avoider',
  PLANNER  = 'planner',
}

export enum BadgeTier {
  BRONZE  = 'bronze',
  SILVER  = 'silver',
  GOLD    = 'gold',
  DIAMOND = 'diamond',
}

export enum InsightType {
  TIP         = 'tip',
  WARNING     = 'warning',
  CELEBRATION = 'celebration',
  NUDGE       = 'nudge',
}
