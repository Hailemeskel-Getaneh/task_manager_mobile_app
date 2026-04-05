const AMHARIC_MONTHS = [
  'መስከረም', 'ጥቅምት', 'ህዳር', 'ታህሳስ', 'ጥር', 'የካቲት',
  'መጋቢት', 'ሚያዝያ', 'ግንቦት', 'ሰኔ', 'ሐምሌ', 'ነሐሴ', 'ጳጉሜን'
];

const AMHARIC_DAYS = [
  'እሑድ', 'ሰኞ', 'ማክሰኞ', 'ረቡዕ', 'ሐሙስ', 'አርብ', 'ቅዳሜ'
];

const ETHIOPIAN_EPOCH = 1723856;

/**
 * Determine if an Ethiopian year is a leap year (6-day Pagumen).
 */
export function isLeapYear(etYear) {
  return (etYear + 1) % 4 === 0;
}

/**
 * Get number of days in an Ethiopian month.
 */
export function getDaysInEthiopianMonth(etYear, etMonth) {
  if (etMonth < 13) return 30;
  return isLeapYear(etYear) ? 6 : 5;
}

/**
 * Convert Gregorian Date → Ethiopian Date segments.
 */
export function toEthiopian(date) {
  if (!(date instanceof Date)) return null;

  const gYear = date.getFullYear();
  const gMonth = date.getMonth() + 1;
  const gDay = date.getDate();

  // Gregorian → JDN
  const a = Math.floor((14 - gMonth) / 12);
  const y = gYear + 4800 - a;
  const m = gMonth + 12 * a - 3;

  const jdn =
    gDay +
    Math.floor((153 * m + 2) / 5) +
    365 * y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) -
    32045;

  // JDN → Ethiopian
  const r = jdn - ETHIOPIAN_EPOCH;
  const numCycles = Math.floor(r / 1461);
  const rem = r % 1461;
  let yearInCycle = Math.floor(rem / 365);
  if (yearInCycle === 4) yearInCycle = 3;
  
  const etYear = numCycles * 4 + yearInCycle;
  const t = rem - (yearInCycle * 365);

  const etMonth = Math.floor(t / 30) + 1;
  const etDay = (t % 30) + 1;
  
  return {
    year: etYear,
    month: etMonth,
    day: etDay,
    monthName: AMHARIC_MONTHS[etMonth - 1] || '',
    dayName: AMHARIC_DAYS[date.getDay()]
  };
}

/**
 * Convert Ethiopian Date segments → Gregorian JS Date object.
 */
export function toGregorian(etYear, etMonth, etDay) {
  // Ethiopian → JDN
  // JDN = (365 * etYear) + floor(etYear / 4) + (30 * (etMonth - 1)) + etDay - 1 + ETHIOPIAN_EPOCH
  const jdn = (365 * etYear) + Math.floor(etYear / 4) + (30 * (etMonth - 1)) + etDay - 1 + ETHIOPIAN_EPOCH;

  // JDN → Gregorian
  const L = jdn + 68569;
  const n = Math.floor((4 * L) / 146097);
  const L1 = L - Math.floor((146097 * n + 3) / 4);
  const I = Math.floor((4000 * (L1 + 1)) / 1461001);
  const L2 = L1 - Math.floor((1461 * I) / 4) + 31;
  const j = Math.floor((80 * L2) / 2447);
  const d = L2 - Math.floor((2447 * j) / 80);
  const L3 = Math.floor(j / 11);
  const m = j + 2 - 12 * L3;
  const y = 100 * (n - 49) + I + L3;

  return new Date(y, m - 1, d);
}

/**
 * Formats a Date object into an Ethiopian date string.
 */
export function formatEthiopian(date) {
  const d = toEthiopian(date);
  if (!d) return "Invalid date";
  return `${d.dayName} ${d.monthName} ${d.day}, ${d.year}`;
}

/**
 * Formats a Date object according to the selected calendar mode.
 */
export function formatDate(date, useEthiopian) {
  if (useEthiopian) {
    return formatEthiopian(date);
  } else {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  }
}