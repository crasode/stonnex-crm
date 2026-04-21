import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const SERVICES = ["Roof Replacement", "Roof Repair", "Inspection", "Storm Damage", "Gutter Installation", "Flat Roof"];
const SOURCES = ["website", "referral", "google", "facebook", "make.com", "yelp"];
const STATUSES = ["new", "contacted", "quoted", "closed", "lost"];
const CITIES = [
  ["Dallas", "TX"], ["Austin", "TX"], ["Houston", "TX"], ["San Antonio", "TX"],
  ["Fort Worth", "TX"], ["Plano", "TX"], ["Irving", "TX"], ["Frisco", "TX"],
  ["McKinney", "TX"], ["Garland", "TX"], ["Arlington", "TX"], ["Denton", "TX"],
];

const LEADS = [
  { name: "James Harlow", email: "james.harlow@gmail.com", phone: "214-555-0101" },
  { name: "Maria Santos", email: "msantos@outlook.com", phone: "512-555-0234" },
  { name: "Derek Collins", email: "derek.c@yahoo.com", phone: "817-555-0178" },
  { name: "Linda Park", email: "linda.park@gmail.com", phone: "972-555-0312" },
  { name: "Tom Nguyen", email: "tom.n@gmail.com", phone: "469-555-0456" },
  { name: "Rachel Kim", email: "rkim@icloud.com", phone: "214-555-0567" },
  { name: "Steve Wallace", email: "swallace@hotmail.com", phone: "972-555-0623" },
  { name: "Angela Davis", email: "adavis88@gmail.com", phone: "512-555-0789" },
  { name: "Brian Foster", email: "bfoster@outlook.com", phone: "817-555-0834" },
  { name: "Karen Mitchell", email: "kmitchell@gmail.com", phone: "469-555-0901" },
  { name: "Paul Turner", email: "pturner@yahoo.com", phone: "214-555-1023" },
  { name: "Sandra Lee", email: "slee.tx@gmail.com", phone: "972-555-1145" },
  { name: "Mark Johnson", email: "mjohnson@gmail.com", phone: "817-555-1267" },
  { name: "Nancy White", email: "nwhite@outlook.com", phone: "512-555-1389" },
  { name: "Chris Brown", email: "cbrown.dfw@gmail.com", phone: "469-555-1412" },
  { name: "Patricia Evans", email: "pevans@icloud.com", phone: "214-555-1534" },
  { name: "Kevin Martinez", email: "kmartinez@gmail.com", phone: "972-555-1656" },
  { name: "Dorothy Harris", email: "dharris@yahoo.com", phone: "817-555-1778" },
  { name: "Gary Thompson", email: "gthompson@outlook.com", phone: "512-555-1890" },
  { name: "Barbara Moore", email: "bmoore.tx@gmail.com", phone: "469-555-1923" },
  { name: "Jason Reed", email: "jreed@gmail.com", phone: "214-555-2045" },
  { name: "Donna Scott", email: "dscott@outlook.com", phone: "972-555-2167" },
  { name: "Anthony Hill", email: "ahill@gmail.com", phone: "817-555-2289" },
  { name: "Ruth Green", email: "rgreen.dfw@gmail.com", phone: "512-555-2311" },
  { name: "Daniel Adams", email: "dadams@yahoo.com", phone: "469-555-2434" },
  { name: "Sharon Baker", email: "sbaker@icloud.com", phone: "214-555-2556" },
  { name: "Joshua Carter", email: "jcarter@gmail.com", phone: "972-555-2678" },
  { name: "Helen Nelson", email: "hnelson@outlook.com", phone: "817-555-2790" },
  { name: "Ryan Mitchell", email: "rmitchell@gmail.com", phone: "512-555-2812" },
  { name: "Amanda Roberts", email: "aroberts@gmail.com", phone: "469-555-2934" },
  { name: "Eric Walker", email: "ewalker.tx@gmail.com", phone: "214-555-3056" },
  { name: "Christine Hall", email: "chall@yahoo.com", phone: "972-555-3178" },
  { name: "Scott Allen", email: "sallen@outlook.com", phone: "817-555-3290" },
  { name: "Megan Young", email: "myoung@gmail.com", phone: "512-555-3312" },
  { name: "Patrick King", email: "pking.dfw@gmail.com", phone: "469-555-3434" },
];

async function main() {
  console.log("Seeding 35 leads...");

  for (let i = 0; i < LEADS.length; i++) {
    const [city, state] = CITIES[i % CITIES.length];
    const daysAgo = Math.floor(Math.random() * 90);
    const createdAt = new Date(Date.now() - daysAgo * 86400000);

    await prisma.lead.create({
      data: {
        ...LEADS[i],
        city,
        state,
        zip: `7${String(5000 + i).padStart(4, "0")}`,
        service: SERVICES[i % SERVICES.length],
        source: SOURCES[i % SOURCES.length],
        status: STATUSES[Math.floor(Math.random() * STATUSES.length)],
        message: i % 3 === 0 ? `Interested in ${SERVICES[i % SERVICES.length].toLowerCase()} services. Please call at your earliest convenience.` : null,
        createdAt,
      },
    });
  }

  console.log("Done. 35 leads seeded.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
