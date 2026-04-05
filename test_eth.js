const { toEthiopian, toGregorian, isLeapYear } = require('./utils/ethiopianCalendar');

function testConversion() {
  console.log("--- Testing Ethiopian Calendar ---");
  
  // Test dates
  const dates = [
    new Date(2023, 8, 10), // Nehasse 2015
    new Date(2023, 8, 11), // Pagumen 1, 2015
    new Date(2023, 8, 16), // Pagumen 6, 2015 (Leap)
    new Date(2023, 8, 17), // Meskerem 1, 2016
    new Date(2024, 8, 10), // Nehasse 2016
    new Date(2024, 8, 11), // Pagumen 1, 2016
    new Date(2024, 8, 15), // Pagumen 5, 2016 (Non-Leap)
    new Date(2024, 8, 16), // Meskerem 1, 2017
  ];

  dates.forEach(gDate => {
    const et = toEthiopian(gDate);
    const roundTrip = toGregorian(et.year, et.month, et.day);
    
    const status = gDate.toDateString() === roundTrip.toDateString() ? "✅ PASS" : "❌ FAIL";
    console.log(`${gDate.toDateString()} -> ${et.monthName} ${et.day}, ${et.year} -> ${roundTrip.toDateString()} [${status}]`);
    
    if (et.month === 13) {
      console.log(`   (Pagumen day ${et.day} of ${isLeapYear(et.year) ? 6 : 5} days)`);
    }
  });
}

testConversion();
