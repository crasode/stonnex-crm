/**
 * Seed the DB with existing leads from the Stonnex Master Lead CRM.
 * This is a frozen snapshot taken when the CRM was built (Apr 2026).
 * Run once on first deploy with:
 *   npm run db:seed
 *
 * After this, the Make.com webhook will feed new leads in live.
 * For a full re-sync from the Google Sheet, use scripts/import-sheet.ts.
 */
import { PrismaClient } from '@prisma/client';
import type { LeadStatus } from '../src/lib/status';

const prisma = new PrismaClient();

type SeedLead = {
  externalId: string;
  receivedAt: string; // ISO date
  source: string;
  fullName: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  service?: string;
  estSqFt?: number;
  quote?: number;
  status: LeadStatus;
  assignedTo?: string;
};

const LEADS: SeedLead[] = [
  // ---- Meta Ads ----
  { externalId: 'STX-001', receivedAt: '2026-04-07', source: 'Meta Ads', fullName: 'Jozo Galiot', phone: '604-805-4376', email: 'jozopgaliot@gmail.com', address: '3631 Sable Ave', city: 'Richmond', service: 'Roof Replacement', status: 'BAD_LEAD', assignedTo: 'Calvin' },
  { externalId: 'STX-002', receivedAt: '2026-04-07', source: 'Meta Ads', fullName: 'Maninder Cheema', phone: '778-320-3100', email: 'manindercheema80@hotmail.com', address: '11715 93 Ave', city: 'Surrey', service: 'Roof Replacement', status: 'ATTEMPTED_CONTACT', assignedTo: 'Calvin' },
  { externalId: 'STX-003', receivedAt: '2026-04-06', source: 'Meta Ads', fullName: 'Van Alfred', phone: '250-974-4886', email: 'vanxler8@msn.com', address: '98 West Saanich Rd', city: 'Other', service: 'Roof Replacement', status: 'BAD_LEAD', assignedTo: 'Calvin' },
  { externalId: 'STX-004', receivedAt: '2026-04-06', source: 'Meta Ads', fullName: 'Joseph Choi', phone: '778-957-1191', email: 'choi_gt@yahoo.com', city: 'Surrey', service: 'Roof Replacement', status: 'BAD_LEAD', assignedTo: 'Calvin' },
  { externalId: 'STX-005', receivedAt: '2026-04-06', source: 'Meta Ads', fullName: 'Samuel Ayidan', phone: '236-333-8610', email: 'kingsolosteel62.saa@mail.com', address: '10718 127 St', city: 'Surrey', service: 'Roof Replacement', status: 'BAD_LEAD', assignedTo: 'Calvin' },
  { externalId: 'STX-006', receivedAt: '2026-04-06', source: 'Meta Ads', fullName: 'Parvaneha Shekar', phone: '778-839-3666', email: 'mshekarchi@gmail.com', address: '3741 Marine Dr', city: 'W. Vancouver', service: 'Roof Replacement', status: 'BAD_LEAD', assignedTo: 'Calvin' },
  { externalId: 'STX-007', receivedAt: '2026-04-06', source: 'Meta Ads', fullName: 'Brian McMurtry', phone: '778-996-9046', email: 'brianmcmu@gmail.com', address: '1280 Mountain Hwy', city: 'N. Vancouver', service: 'Roof Replacement', status: 'APPOINTMENT_SET', assignedTo: 'Calvin' },
  { externalId: 'STX-008', receivedAt: '2026-04-04', source: 'Meta Ads', fullName: 'Pawandeep Munjal', phone: '778-245-2003', email: 'munjalpawandeep@gmail.com', address: '31437 Blue Ridge Dr', city: 'Abbotsford', service: 'Roof Replacement', status: 'APPOINTMENT_SET', assignedTo: 'Calvin' },
  { externalId: 'STX-009', receivedAt: '2026-03-31', source: 'Meta Ads', fullName: 'Sam Shum', phone: '604-868-3927', email: 'samshum38@gmail.com', address: '5611 McRae St', city: 'Vancouver', service: 'Roof Replacement', status: 'SPAM', assignedTo: 'Calvin' },
  { externalId: 'STX-010', receivedAt: '2026-03-23', source: 'Meta Ads', fullName: 'Gail Parry', phone: '705-930-5235', email: 'gparry55@outlook.com', address: '668 Cameron St', city: 'Other', service: 'Roof Replacement', status: 'BAD_LEAD', assignedTo: 'Calvin' },
  { externalId: 'STX-011', receivedAt: '2026-04-07', source: 'Meta Ads', fullName: 'Ranbeer Dhillon', phone: '604-785-4091', email: 'ranbeer_dhillon@hotmail.com', address: '2216E 54th Ave', city: 'Vancouver', service: 'Roof Replacement', status: 'APPOINTMENT_SET', assignedTo: 'Calvin' },
  { externalId: 'STX-012', receivedAt: '2026-04-02', source: 'Meta Ads', fullName: 'Mike Unrau', phone: '604-835-2476', email: 'mike@eliteclosets.com', address: '42419 Highland Dr', city: 'Chilliwack', service: 'Roof Replacement', status: 'QUOTE_SENT', assignedTo: 'Calvin' },
  { externalId: 'STX-013', receivedAt: '2026-03-22', source: 'Meta Ads', fullName: 'Michael Fandrey', phone: '604-341-1491', email: 'mfandrey@shaw.ca', service: 'Roof Replacement', status: 'QUOTE_SENT', assignedTo: 'Calvin' },
  { externalId: 'STX-014', receivedAt: '2026-03-21', source: 'Meta Ads', fullName: 'Jay Fredrickson', phone: '604-473-2512', email: 'jay@westerninlet.ca', service: 'Roof Replacement', status: 'QUOTE_SENT', assignedTo: 'Calvin' },

  // ---- Roofle ----
  { externalId: 'STX-015', receivedAt: '2026-04-06', source: 'Roofle', fullName: 'Howie Wong', phone: '236-688-9750', email: 'wongsnuts_44@icloud.com', address: '7838 Woodhurst Dr', city: 'Burnaby', service: 'Roof Replacement', estSqFt: 3309, status: 'QUOTE_SENT', assignedTo: 'Calvin' },
  { externalId: 'STX-016', receivedAt: '2026-04-03', source: 'Roofle', fullName: 'Lee Rego', phone: '604-288-1565', email: 'leerego@gmail.com', address: '8311 Melburn Dr', city: 'Mission', service: 'Roof Replacement', estSqFt: 1989, status: 'ATTEMPTED_CONTACT', assignedTo: 'Calvin' },
  { externalId: 'STX-017', receivedAt: '2026-04-03', source: 'Roofle', fullName: 'Dawn Kroesen', phone: '694-889-7374', email: 'dkroesen@shaw.ca', address: '10245 144 St', city: 'Surrey', service: 'Roof Replacement', estSqFt: 2303, status: 'NOT_INTERESTED', assignedTo: 'Calvin' },
  { externalId: 'STX-018', receivedAt: '2026-04-02', source: 'Roofle', fullName: 'Camilo Ruiz', phone: '778-867-8626', email: 'caruro54@gmail.com', address: '790 East Keith Rd', city: 'N. Vancouver', service: 'Roof Replacement', estSqFt: 2537, status: 'QUOTE_SENT', assignedTo: 'Calvin' },
  { externalId: 'STX-019', receivedAt: '2026-03-22', source: 'Roofle', fullName: 'Sukhi Bhatti', phone: '604-349-1826', email: 'sukhi33@hotmail.com', address: '8920 146A St', city: 'Surrey', service: 'Roof Replacement', estSqFt: 3512, status: 'NOT_INTERESTED', assignedTo: 'Calvin' },
  { externalId: 'STX-020', receivedAt: '2026-03-20', source: 'Roofle', fullName: 'Richard Spenard', phone: '604-728-5456', email: 'rspenard@hotmail.com', address: '9494 204B St', city: 'Langley', service: 'Roof Replacement', estSqFt: 2009, status: 'CLOSED_WON', assignedTo: 'Calvin' },
  { externalId: 'STX-026', receivedAt: '2026-04-07', source: 'Roofle', fullName: 'joe swanson', email: 'inquiry@marineroofing.com', address: '31141 Wheel Ave', city: 'Abbotsford', service: 'Roof Replacement', estSqFt: 47246, status: 'SPAM' },
  { externalId: 'STX-027', receivedAt: '2026-04-07', source: 'Roofle', fullName: 'joe swanson', email: 'inquiry@marineroofing.com', address: '46187 Yale Rd', city: 'Chilliwack', service: 'Roof Replacement', estSqFt: 17070, status: 'SPAM' },
  { externalId: 'STX-031', receivedAt: '2026-03-13', source: 'Roofle', fullName: 'Evan Dosanjh', phone: '778-388-6155', email: 'EvanDosanjh@Outlook.com', address: '8486 Harvie Road', city: 'Surrey', service: 'Roof Replacement', status: 'NEW_LEAD', assignedTo: 'Calvin' },
  { externalId: 'STX-032', receivedAt: '2026-04-10', source: 'Roofle', fullName: 'Todd Kong', phone: '604-317-8358', email: 'toddkong607@gmail.com', address: '10343 167A Street', city: 'Surrey', service: 'Roof Replacement', estSqFt: 2549, status: 'NEW_LEAD', assignedTo: 'Calvin' },
  { externalId: 'STX-033', receivedAt: '2026-04-13', source: 'Roofle', phone: '604-596-3101', email: 'garryandfamily@gmail.com', fullName: 'Garry (family)', address: '15526 85 Avenue', city: 'Surrey', service: 'Roof Replacement', estSqFt: 2239, status: 'NEW_LEAD', assignedTo: 'Calvin' },
  { externalId: 'STX-034', receivedAt: '2026-04-13', source: 'Roofle', phone: '604-910-7141', email: 'Colterreid@hotmail.com', fullName: 'Colter Reid', address: '19681 116A Avenue', city: 'Pitt Meadows', service: 'Roof Replacement', estSqFt: 2385, status: 'NEW_LEAD', assignedTo: 'Calvin' },
  { externalId: 'STX-035', receivedAt: '2026-04-16', source: 'Roofle', phone: '778-859-7266', email: 'dragosmv@gmail.com', fullName: 'Dragos M', address: '2331 Hyannis Drive', city: 'North Vancouver', service: 'Roof Replacement', estSqFt: 2560, status: 'NEW_LEAD', assignedTo: 'Calvin' },

  // ---- Meta Ads (new backfill) ----
  { externalId: 'STX-028', receivedAt: '2026-04-09', source: 'Meta Ads', fullName: 'Herald Chan', phone: '+16725141080', email: 'du_lait@hotmail.com', city: 'Coquitlam', service: 'Roof Replacement', status: 'NEW_LEAD', assignedTo: 'Calvin' },
  { externalId: 'STX-029', receivedAt: '2026-04-08', source: 'Meta Ads', fullName: 'Jean Choo', phone: '+16043880812', email: 'jean.choo@gmail.com', address: '6851 Hamber St', city: 'Richmond', service: 'Roof Replacement', status: 'NEW_LEAD', assignedTo: 'Calvin' },
  { externalId: 'STX-030', receivedAt: '2026-04-08', source: 'Meta Ads', fullName: 'Gordon Gruber', phone: '+16042705211', email: 'gekkofxjnk1@gmail.com', address: '9149 Hudson Street', city: 'Richmond', service: 'Roof Replacement', status: 'NEW_LEAD', assignedTo: 'Calvin' },

  // ---- Website Form ----
  { externalId: 'STX-021', receivedAt: '2026-04-07', source: 'Website Form', fullName: 'Stephen Lau', phone: '604-670-3820', email: 'stephenylau@gmail.com', city: 'Langley', service: 'Roof Replacement', status: 'APPOINTMENT_SET', assignedTo: 'Calvin' },
  { externalId: 'STX-022', receivedAt: '2026-04-07', source: 'Website Form', fullName: 'Gurpreet Sandhu', phone: '778-835-5006', email: 'sandhu8713@gmail.com', city: 'Surrey', service: 'Roof Replacement', status: 'APPOINTMENT_SET', assignedTo: 'Calvin' },
  { externalId: 'STX-023', receivedAt: '2026-04-02', source: 'Website Form', fullName: 'Mandeep Singh', phone: '604-750-7442', email: 'athwalmandeep99@gmail.com', city: 'Surrey', service: 'Roof Replacement', status: 'NOT_INTERESTED', assignedTo: 'Calvin' },
  { externalId: 'STX-024', receivedAt: '2026-03-31', source: 'Website Form', fullName: 'Vindy', phone: '604-754-0002', email: 'sold@premierpropertygroup.ca', service: 'Roof Repair', status: 'NOT_INTERESTED', assignedTo: 'Calvin' },

  // ---- Google Ads ----
  { externalId: 'STX-025', receivedAt: '2026-03-31', source: 'Google Ads', fullName: 'Carmen Svendsen', phone: '604-467-3982', email: 'crivera844@hotmail.com', service: 'Roof Replacement', status: 'NEW_LEAD', assignedTo: 'Calvin' },
];

async function main() {
  console.log(`Seeding ${LEADS.length} leads…`);
  let created = 0;
  let updated = 0;
  for (const lead of LEADS) {
    const res = await prisma.lead.upsert({
      where: { externalId: lead.externalId },
      update: {
        source: lead.source,
        fullName: lead.fullName,
        phone: lead.phone,
        email: lead.email,
        address: lead.address,
        city: lead.city,
        service: lead.service,
        estSqFt: lead.estSqFt,
        quote: lead.quote,
        status: lead.status,
        assignedTo: lead.assignedTo ?? null,
        receivedAt: new Date(lead.receivedAt),
      },
      create: {
        externalId: lead.externalId,
        source: lead.source,
        fullName: lead.fullName,
        phone: lead.phone,
        email: lead.email,
        address: lead.address,
        city: lead.city,
        service: lead.service,
        estSqFt: lead.estSqFt,
        quote: lead.quote,
        status: lead.status,
        assignedTo: lead.assignedTo ?? null,
        receivedAt: new Date(lead.receivedAt),
      },
    });
    if (res.createdAt.getTime() === res.updatedAt.getTime()) created++;
    else updated++;
  }
  console.log(`✓ created ${created}, updated ${updated}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
