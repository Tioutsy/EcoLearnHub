import { db, blogPostsTable, mauritiusResourcesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { logger } from "./logger";

export async function ensureInsightsMigrated() {
  logger.info("Checking and executing insights content migration...");

  // 1. Seed migrated Articles (Blog Posts)
  const articlesToSeed = [
    {
      title: "Guide to Mauritian Waste Streams & Bin System",
      slug: "mauritius-bin-system-guide",
      excerpt: "Learn how the standard four-bin waste-sorting system operates in Mauritian workplaces and why separating organic waste at the source is vital.",
      content: `### Understanding the Four-Bin System

To minimize waste sent to the Mare Chicose landfill, Mauritian workplaces adopt a standardized four-bin sorting system. Each color corresponds to a specific stream:

#### 1. Green Bin: Organic & Garden Waste
Includes leaves, grass cuttings, and raw food scraps. 
* **Action**: Ensure this waste is kept clean and sent to composting platforms (such as Roches Noires) rather than the general landfill.

#### 2. Blue Bin: Paper & Cardboard
Includes office paper, envelopes, newspapers, and clean cardboard packaging.
* **Action**: Flatten all boxes to conserve space. Do not place food-contaminated paper (like pizza boxes) here.

#### 3. Yellow Bin: Plastics & Cans
Includes PET plastic bottles, clean containers, and aluminum beverage cans.
* **Action**: Rinse containers before disposal. These feed into the local plastic recovery and baling chains for recycling.

#### 4. Black Bin: General Waste
Includes non-recyclable residual waste, dirty packaging, and contaminated items.
* **Action**: Treat the black bin as a last resort. The target of every sustainability module is to reduce this general waste stream.`,
      authorName: "EcoLearnHub Editorial",
      authorTitle: "Sustainability Education Team",
      thumbnailUrl: "https://images.unsplash.com/photo-1532996127006-2b2f1bfb8eb9",
      tags: ["workplace", "recycling", "mauritius", "bin-sorting"],
      status: "published",
      readingTimeMinutes: 5,
    },
    {
      title: "Recycling Infrastructure & Partners in Mauritius",
      slug: "recycling-partners-mauritius",
      excerpt: "An overview of recycling operators, drop-off networks, and organic waste platforms handling waste across the island.",
      content: `### Mauritius Recycling Network

Recycling on an island requires dedicated partners. Here are the key operators and sites managing waste recovery:

#### Mission Verte
A voluntary, non-profit recycling drop-off network. They operate collection bins across Mauritius for paper, plastic, cardboard, glass, and electronic waste (e-waste).

#### We Recycle / BEM Recycling
Local commercial operators that collect, sort, bale, and process recyclables. They export sorted materials for specialized reprocessing or manage local recovery chains.

#### Mare Chicose Landfill
The single national landfill of Mauritius, located in the south-east. Mare Chicose has neared its capacity limits. Diverting waste through recycling directly extends the landfill's lifespan.

#### Composting at Roches Noires
Organic waste treatment platforms that turn green garden waste and food scraps into high-quality compost, keeping organic materials out of Mare Chicose.`,
      authorName: "EcoLearnHub Editorial",
      authorTitle: "Local Infrastructure Team",
      thumbnailUrl: "https://images.unsplash.com/photo-1591197172021-c8077a8f16a8",
      tags: ["infrastructure", "recycling", "landfill", "mauritius"],
      status: "published",
      readingTimeMinutes: 4,
    },
    {
      title: "Circular Economy Case Studies in Mauritius",
      slug: "circular-economy-mauritius-cases",
      excerpt: "Real-world examples of hospitality resorts, sugar estates, and retail chains adopting circular practices in Mauritius.",
      content: `### Local Circular Economy Success Stories

Mauritian companies are actively adopting circular economy principles to reduce waste and utilize renewable resources:

#### Hospitality: Coastal Resort Groups
Beachfront resorts across Mauritius have eliminated single-use plastics in guest rooms and dining areas. By introducing glass bottling plants and refillable water stations, they have saved millions of plastic bottles from entering local waste streams.

#### Agriculture: Sugar Cane Estates & Bagasse
A historic Mauritian circular-economy story: bagasse (the fibrous byproduct of sugar cane processing) is burned in co-generation plants to produce a meaningful share of the island's electricity during the crop season, recycling agricultural residue into clean grid energy.

#### Retail and FMCG: Supermarket Chains
Local supermarkets replaced thin plastic bags with reusable bags made from woven textiles and polypropylene. They also introduced in-store drop-off bins for batteries and PET bottles, facilitating consumer participation in recovery schemes.`,
      authorName: "EcoLearnHub Editorial",
      authorTitle: "Corporate Case Studies",
      thumbnailUrl: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09",
      tags: ["circular-economy", "case-study", "mauritius", "business"],
      status: "published",
      readingTimeMinutes: 5,
    }
  ];

  for (const art of articlesToSeed) {
    const [existing] = await db
      .select()
      .from(blogPostsTable)
      .where(eq(blogPostsTable.slug, art.slug))
      .limit(1);

    if (!existing) {
      await db.insert(blogPostsTable).values({
        ...art,
        sourceReferences: [],
        isPublished: true,
        publishedAt: new Date(),
      });
      logger.info({ slug: art.slug }, "- Migrated Article seeded successfully");
    } else {
      logger.debug({ slug: art.slug }, "- Article already exists, skipping");
    }
  }

  // 2. Seed migrated Mauritius Rules & Resources
  const resourcesToSeed = [
    {
      title: "Single-Use Plastic Ban Regulations",
      slug: "single-use-plastic-ban",
      resourceType: "Regulation",
      shortSummary: "National bans prohibiting the import, manufacture, sale, and use of single-use plastic items and non-biodegradable bags.",
      mainExplanation: "Mauritius banned non-biodegradable plastic bags in 2016 and extended bans to single-use plastics in 2021. Teams learn what is allowed and what is not.",
      officialName: "Environment Protection (Banning of Single-use Plastic Products) Regulations 2020",
      resourceNumber: "GN No. 316 of 2020",
      responsibleAuthority: "Ministry of Environment, Solid Waste Management and Climate Change",
      relevantSector: "Waste",
      dateIssued: new Date("2020-08-01"),
      effectiveDate: new Date("2021-01-15"),
      officialSourceLink: "https://environment.govmu.org",
      complianceRelevance: "Organizations must eliminate single-use plastic cutlery, plates, straws, and cups from office cafeterias, resort facilities, and events.",
      practicalImplications: "Replace plastic items with certified compostable alternatives or switch to reusable glass and ceramic options. Ensure procurement policies reject non-compliant suppliers.",
      status: "published",
      isFeatured: true,
    },
    {
      title: "Environment Protection Act (EPA)",
      slug: "environment-protection-act",
      resourceType: "Act",
      shortSummary: "The primary legislative framework for environmental protection, licensing, and compliance in Mauritius.",
      mainExplanation: "The legal backbone for Environmental Impact Assessment (EIA) licenses, effluent standards, and polluter responsibilities that local businesses must meet.",
      officialName: "Environment Protection Act 2002",
      resourceNumber: "Act No. 19 of 2002",
      responsibleAuthority: "Ministry of Environment, Solid Waste Management and Climate Change",
      relevantSector: "General environmental compliance",
      dateIssued: new Date("2002-09-01"),
      effectiveDate: new Date("2002-09-01"),
      officialSourceLink: "https://environment.govmu.org",
      complianceRelevance: "Local businesses must comply with waste, emission, and water disposal standards, and obtain appropriate EIA/PER licenses for new developments.",
      practicalImplications: "Ensure regular environmental audits, implement proper waste management plans, and verify that liquid effluents are treated to standard before disposal.",
      status: "published",
      isFeatured: true,
    },
    {
      title: "Extended Producer Responsibility (EPR) on PET",
      slug: "epr-pet-bottles",
      resourceType: "Regulation",
      shortSummary: "Obligations on beverage producers and bottle importers to take responsibility for post-consumer PET plastic waste.",
      mainExplanation: "Producers and importers carry responsibility for the waste their products create, including PET bottle recovery and recycling schemes.",
      officialName: "Environment Protection (Polyethylene Terephthalate Bottle Collaborative Agreement) Regulations 2001",
      resourceNumber: "GN No. 159 of 2001",
      responsibleAuthority: "Ministry of Environment / Solid Waste Management Division",
      relevantSector: "Waste",
      dateIssued: new Date("2001-10-01"),
      officialSourceLink: "https://environment.govmu.org",
      complianceRelevance: "Manufacturers and importers of bottled beverages must pay a levy or participate in recognized bottle collection schemes.",
      practicalImplications: "Join and fund recognized packaging recovery initiatives (such as PET Recycle Ltd) to track and return recovery quotas.",
      status: "published",
      isFeatured: false,
    },
    {
      title: "Maurice Ile Durable (MID) Policy Framework",
      slug: "maurice-ile-durable",
      resourceType: "Policy",
      shortSummary: "The national sustainable development policy directing energy, waste, and resource conservation targets.",
      mainExplanation: "The national sustainable development direction that frames renewable energy, water, and waste targets for the island.",
      officialName: "Maurice Ile Durable Policy Framework and Action Plan",
      responsibleAuthority: "Ministry of Energy and Public Utilities",
      relevantSector: "General environmental compliance",
      officialSourceLink: "https://publicutilities.govmu.org",
      complianceRelevance: "Guides corporate social responsibility (CSR) initiatives and frames organizational sustainability reporting benchmarks.",
      practicalImplications: "Integrate carbon, energy, and water saving targets directly into company operational guidelines to align with national sustainable goals.",
      status: "published",
      isFeatured: false,
    }
  ];

  for (const res of resourcesToSeed) {
    const [existing] = await db
      .select()
      .from(mauritiusResourcesTable)
      .where(eq(mauritiusResourcesTable.slug, res.slug))
      .limit(1);

    if (!existing) {
      await db.insert(mauritiusResourcesTable).values({
        ...res,
        disclaimer: undefined, // defaults to schema value
        relatedResources: [],
      });
      logger.info({ slug: res.slug }, "- Migrated Rules & Resources seeded successfully");
    } else {
      logger.debug({ slug: res.slug }, "- Resource already exists, skipping");
    }
  }

  logger.info("Insights content migration completed!");
}
