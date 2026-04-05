const AMHARIC_MONTHS = [
  'መስከረም', 'ጥቅምት', 'ህዳር', 'ታህሳስ', 'ጥር', 'የካቲት',
  'መጋቢት', 'ሚያዝያ', 'ግንቦት', 'ሰኔ', 'ሐምሌ', 'ነሐሴ', 'ጳጉሜ'
];

const AMHARIC_DAYS = [
  'እሑድ', 'ሰኞ', 'ማክሰኞ', 'ረቡዕ', 'ሐሙስ', 'አርብ', 'ቅዳሜ'
];

const ETHIOPIAN_EPOCH = 1723856;

function toEthiopian(date) {
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

  const etYear = Math.floor((4 * r + 1463) / 1461);
  const t = r - (365 * (etYear - 1) + Math.floor((etYear - 1) / 4));
  
  // Wait, if t is calculated relative to (etYear - 1), then:
  // r = 365 * (etYear - 1) + floor((etYear - 1) / 4) + t
  // t = r - (365 * (etYear - 1) + Math.floor((etYear - 1) / 4))
  
  console.log(`Debug: g=${gYear}-${gMonth}-${gDay}, jdn=${jdn}, r=${r}, etYear=${etYear}`);

  const t_corrected = r - (365 * (etYear - 1) + Math.floor((etYear - 1) / 4));
  const etMonth = Math.floor(t_corrected / 30) + 1;
  const etDay = (t_corrected % 30) + 1;

  console.log(`Debug: t_corrected=${t_corrected}, m=${etMonth}, d=${etDay}`);

  return {
    year: etYear,
    month: etMonth,
    day: etDay,
    monthName: AMHARIC_MONTHS[etMonth - 1] || '',
    dayName: AMHARIC_DAYS[date.getDay()]
  };
}

const d = new Date(2024, 8, 11);
console.log(toEthiopian(d));
