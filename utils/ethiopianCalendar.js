const AMHARIC_MONTHS = [
  'መስከረም', 'ጥቅምት', 'ህዳር', 'ታህሳስ', 'ጥር', 'የካቲት',
  'መጋቢት', 'ሚያዝያ', 'ግንቦት', 'ሰኔ', 'ሐምሌ', 'ነሐሴ', 'ጳጉሜ'
];

const AMHARIC_DAYS = [
  'እሑድ', 'ሰኞ', 'ማክሰኞ', 'ረቡዕ', 'ሐሙስ', 'አርብ', 'ቅዳሜ'
];

const ETHIOPIAN_EPOCH = 1723856;

/**
 * Convert Gregorian Date → Ethiopian Date
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

  // Optimized Beyene-Kudlek algorithm for etYear
  const etYear = Math.floor((4 * r + 1463) / 1461) - 1;
  const t = r - (365 * etYear + Math.floor(etYear / 4));

  const etMonth = Math.floor(t / 30) + 1;
  const etDay = (t % 30) + 1;

  // Note: The etYear calculated above is correct for contemporary dates 
  // (e.g., 2024 Gregorian is 2016/2017 Ethiopian).
  
  return {
    year: etYear,
    month: etMonth,
    day: etDay,
    monthName: AMHARIC_MONTHS[etMonth - 1] || '',
    dayName: AMHARIC_DAYS[date.getDay()]
  };
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