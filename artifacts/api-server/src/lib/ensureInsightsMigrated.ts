import { db, blogPostsTable, mauritiusResourcesTable, systemSeedsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { logger } from "./logger";

export async function ensureInsightsMigrated() {
  logger.info("Checking and executing insights content migration...");

  // 1. Seed 40 Official Mauritius Rules & Resources
  const resourcesToSeed = [
    {
      title: "Environment Act 2024",
      slug: "environment-act-2024",
      resourceType: "Act",
      shortSummary: "The primary legislative framework for environmental protection, licensing, and compliance in Mauritius, replacing the EPA 2002.",
      mainExplanation: "This Act is the legal backbone for Environmental Impact Assessment (EIA) licenses, Preliminary Environmental Report (PER) approvals, and overall pollution controls in Mauritius.",
      officialName: "Environment Act 2024",
      resourceNumber: "Act No. 6 of 2024",
      responsibleAuthority: "Ministry of Environment, Solid Waste Management and Climate Change",
      relevantSector: "General environmental compliance",
      dateIssued: new Date("2024-04-15"),
      effectiveDate: new Date("2024-06-01"),
      officialSourceLink: "https://environment.govmu.org",
      complianceRelevance: "Organizations must secure appropriate environmental permits for new developments, adhere to national pollution control limits, and submit regular environmental reports.",
      practicalImplications: "Establish internal environmental auditing protocols. Ensure that any facility expansion or new process undergoes the required EIA or PER review.",
      status: "published",
      isFeatured: true,
      legalStatus: "active",
      lastVerifiedAt: new Date("2026-01-15"),
      nextReviewAt: new Date("2027-01-15"),
    },
    {
      title: "Climate Change Act 2020",
      slug: "climate-change-act-2020",
      resourceType: "Act",
      shortSummary: "Establishes the legal framework to strengthen resilience and coordinate climate change adaptation and mitigation in Mauritius.",
      mainExplanation: "Creates the Inter-Ministerial Council on Climate Change and the Climate Change Division to integrate climate policies across sectors.",
      officialName: "Climate Change Act 2020",
      resourceNumber: "Act No. 11 of 2020",
      responsibleAuthority: "Ministry of Environment, Solid Waste Management and Climate Change",
      relevantSector: "Climate",
      dateIssued: new Date("2020-11-20"),
      effectiveDate: new Date("2021-03-01"),
      officialSourceLink: "https://environment.govmu.org",
      complianceRelevance: "Enables mandatory reporting of greenhouse gas emissions for specified corporate sectors and coordinates national adaptation strategies.",
      practicalImplications: "Assess organizational vulnerability to physical climate risks (e.g. coastal flooding, cyclone damage) and log carbon footprint baselines.",
      status: "published",
      isFeatured: true,
      legalStatus: "active",
      lastVerifiedAt: new Date("2026-01-15"),
      nextReviewAt: new Date("2027-01-15"),
    },
    {
      title: "Waste Management and Resource Recovery Act 2023",
      slug: "waste-management-resource-recovery-act-2023",
      resourceType: "Act",
      shortSummary: "Provides legal structures for the recovery, recycling, and licensing of waste disposal operators in Mauritius.",
      mainExplanation: "Aims to transition Mauritius towards a circular economy by regulating hazardous waste transport, licensing recovery facilities, and introducing packaging levies.",
      officialName: "Waste Management and Resource Recovery Act 2023",
      resourceNumber: "Act No. 18 of 2023",
      responsibleAuthority: "Ministry of Environment / Solid Waste Management Division",
      relevantSector: "Waste",
      dateIssued: new Date("2023-08-30"),
      effectiveDate: new Date("2024-01-01"),
      officialSourceLink: "https://environment.govmu.org",
      complianceRelevance: "Requires businesses to separate specified recyclables from general waste and hire only licensed waste collectors.",
      practicalImplications: "Audit waste service providers to confirm they hold active resource recovery licenses. Separate plastic, paper, and glass at the source.",
      status: "published",
      isFeatured: true,
      legalStatus: "active",
      lastVerifiedAt: new Date("2026-01-15"),
      nextReviewAt: new Date("2027-01-15"),
    },
    {
      title: "Environment Protection (Banning of Single-use Plastic Products) Regulations 2020",
      slug: "single-use-plastic-ban",
      resourceType: "Regulation",
      shortSummary: "National bans prohibiting the import, manufacture, sale, and use of single-use plastic items and non-biodegradable bags.",
      mainExplanation: "Bans non-biodegradable plastic bags and ten specific single-use plastic items like plates, cutlery, straws, and cups.",
      officialName: "Environment Protection (Banning of Single-use Plastic Products) Regulations 2020",
      resourceNumber: "GN No. 316 of 2020",
      responsibleAuthority: "Ministry of Environment, Solid Waste Management and Climate Change",
      relevantSector: "Waste",
      dateIssued: new Date("2020-08-01"),
      effectiveDate: new Date("2021-01-15"),
      officialSourceLink: "https://environment.govmu.org",
      complianceRelevance: "Organizations must eliminate banned single-use plastic items from cafeterias, operations, events, and client guest rooms.",
      practicalImplications: "Substitute single-use items with certified compostable alternatives or reusable ceramic and glass dinnerware.",
      status: "published",
      isFeatured: true,
      legalStatus: "active",
      lastVerifiedAt: new Date("2026-01-15"),
      nextReviewAt: new Date("2027-01-15"),
    },
    {
      title: "Environment Protection (Polyethylene Terephthalate Bottle Collaborative Agreement) Regulations 2001",
      slug: "epr-pet-bottles",
      resourceType: "Regulation",
      shortSummary: "Obligations on beverage producers and bottle importers to take responsibility for post-consumer PET plastic waste.",
      mainExplanation: "Applies Extended Producer Responsibility (EPR) principles requiring bottle recovery quotas and collaborative collection agreements.",
      officialName: "Environment Protection (Polyethylene Terephthalate Bottle Collaborative Agreement) Regulations 2001",
      resourceNumber: "GN No. 159 of 2001",
      responsibleAuthority: "Ministry of Environment / Solid Waste Management Division",
      relevantSector: "Waste",
      dateIssued: new Date("2001-10-01"),
      officialSourceLink: "https://environment.govmu.org",
      complianceRelevance: "Importers and manufacturers of PET-bottled beverages must join and pay fees to recognized bottle collection schemes.",
      practicalImplications: "Partner with local recycling companies (e.g. PET Recycle Ltd) to log recovery statistics and fulfill packaging producer duties.",
      status: "published",
      isFeatured: false,
      legalStatus: "active",
      lastVerifiedAt: new Date("2026-01-15"),
      nextReviewAt: new Date("2027-01-15"),
    },
    {
      title: "Environment Protection Act 2002 (EPA 2002) - Revoked",
      slug: "environment-protection-act-2002",
      resourceType: "Act",
      shortSummary: "The historical environmental framework act, which has been superseded and revoked by the Environment Act 2024.",
      mainExplanation: "Served as the main environmental code from 2002 until it was formally repealed by the Environment Act 2024.",
      officialName: "Environment Protection Act 2002",
      resourceNumber: "Act No. 19 of 2002",
      responsibleAuthority: "Ministry of Environment, Solid Waste Management and Climate Change",
      relevantSector: "General environmental compliance",
      dateIssued: new Date("2002-09-01"),
      effectiveDate: new Date("2002-09-01"),
      officialSourceLink: "https://environment.govmu.org",
      complianceRelevance: "No longer active. Fines, standards, and legal references must be updated to cite the Environment Act 2024 instead.",
      practicalImplications: "Check legal register documents, contractor agreements, and corporate compliance forms to ensure all references to the EPA 2002 are removed.",
      status: "published",
      isFeatured: false,
      legalStatus: "revoked",
      lastVerifiedAt: new Date("2026-01-15"),
      nextReviewAt: new Date("2027-01-15"),
    },
    {
      title: "Maurice Ile Durable (MID) Policy Framework",
      slug: "maurice-ile-durable",
      resourceType: "Policy",
      shortSummary: "The legacy national sustainable development policy directing early energy, waste, and resource conservation targets.",
      mainExplanation: "Historically set the framework for early national targets on renewables and carbon footprint indicators.",
      officialName: "Maurice Ile Durable Policy Framework and Action Plan",
      responsibleAuthority: "Ministry of Energy and Public Utilities",
      relevantSector: "General environmental compliance",
      officialSourceLink: "https://publicutilities.govmu.org",
      complianceRelevance: "Provides guidelines for corporate social responsibility (CSR) programs and CSR tax deduction filings.",
      practicalImplications: "Align current CSR project applications with updated Ministry guidance rather than obsolete MID documents.",
      status: "published",
      isFeatured: false,
      legalStatus: "superseded",
      lastVerifiedAt: new Date("2026-01-15"),
      nextReviewAt: new Date("2027-01-15"),
    },
    {
      title: "Ministry of Environment, Solid Waste Management and Climate Change Portal",
      slug: "ministry-of-environment",
      resourceType: "Authority",
      shortSummary: "The primary government department governing environmental licensing, compliance checks, and climate change action in Mauritius.",
      mainExplanation: "This department coordinates the enforcement of environmental laws and manages waste collection tenders.",
      officialSourceLink: "https://environment.govmu.org",
      status: "published",
      legalStatus: "non_legal",
      lastVerifiedAt: new Date("2026-01-15"),
      nextReviewAt: new Date("2027-01-15"),
    },
    {
      title: "Energy Efficiency Act 2011",
      slug: "energy-efficiency-act-2011",
      resourceType: "Act",
      shortSummary: "Promotes energy conservation and efficiency by establishing the Energy Efficiency Management Office.",
      mainExplanation: "Mandates energy labeling for household items and audits for large energy-consuming companies.",
      officialName: "Energy Efficiency Act 2011",
      resourceNumber: "Act No. 3 of 2011",
      responsibleAuthority: "Ministry of Energy and Public Utilities / EEMO",
      relevantSector: "Energy",
      dateIssued: new Date("2011-04-12"),
      officialSourceLink: "https://publicutilities.govmu.org",
      complianceRelevance: "Large energy consumers must undergo regular energy audits conducted by certified energy auditors.",
      practicalImplications: "Verify if your building meets high-consumption thresholds and schedule a formal building energy audit if required.",
      status: "published",
      isFeatured: false,
      legalStatus: "active",
      lastVerifiedAt: new Date("2026-01-15"),
      nextReviewAt: new Date("2027-01-15"),
    },
    {
      title: "Utility Regulatory Authority Act 2004",
      slug: "utility-regulatory-authority-act-2004",
      resourceType: "Act",
      shortSummary: "Provides for the establishment of the Utility Regulatory Authority (URA) to oversee utility services.",
      mainExplanation: "Sets rules for private electricity producers, water distributors, and utility grid access codes.",
      officialName: "Utility Regulatory Authority Act 2004",
      resourceNumber: "Act No. 9 of 2004",
      responsibleAuthority: "Utility Regulatory Authority (URA)",
      relevantSector: "Energy",
      dateIssued: new Date("2004-10-01"),
      officialSourceLink: "https://ura.mu",
      complianceRelevance: "Regulates grid connections for private renewable electricity systems (IPPs) and solar power sales.",
      practicalImplications: "Apply to the URA when planning a facility grid-tied solar system to secure a generation license.",
      status: "published",
      isFeatured: false,
      legalStatus: "active",
      lastVerifiedAt: new Date("2026-01-15"),
      nextReviewAt: new Date("2027-01-15"),
    },
    {
      title: "Water Resources Act 1985",
      slug: "water-resources-act-1985",
      resourceType: "Act",
      shortSummary: "Governance code for the control, management, and licensing of water resources in Mauritius.",
      mainExplanation: "Regulates groundwater extraction (boreholes), river water rights, and pollution of surface water systems.",
      officialName: "Water Resources Act 1985",
      resourceNumber: "Act No. 12 of 1985",
      responsibleAuthority: "Water Resources Unit",
      relevantSector: "Water",
      dateIssued: new Date("2026-01-01"),
      officialSourceLink: "https://publicutilities.govmu.org",
      complianceRelevance: "Industrial boreholes require licensing, extraction logging, and testing to prevent saline intrusion.",
      practicalImplications: "Apply for a borehole extraction license and submit monthly water extraction logs.",
      status: "published",
      isFeatured: false,
      legalStatus: "active",
      lastVerifiedAt: new Date("2026-01-15"),
      nextReviewAt: new Date("2027-01-15"),
    },
    {
      title: "Central Water Authority Act 1971",
      slug: "central-water-authority-act-1971",
      resourceType: "Act",
      shortSummary: "Defines the functions and powers of the Central Water Authority (CWA) as the national water supplier.",
      mainExplanation: "Covers water distribution, utility piping, and domestic/commercial water tariffs.",
      officialName: "Central Water Authority Act 1971",
      resourceNumber: "Act No. 20 of 1971",
      responsibleAuthority: "Central Water Authority",
      relevantSector: "Water",
      dateIssued: new Date("1971-07-01"),
      officialSourceLink: "https://cwa.govmu.org",
      complianceRelevance: "Requires companies to connect only via official meters and pay approved commercial utility tariffs.",
      practicalImplications: "Ensure monthly water meter checks are recorded to identify pipeline leaks promptly.",
      status: "published",
      isFeatured: false,
      legalStatus: "active",
      lastVerifiedAt: new Date("2026-01-15"),
      nextReviewAt: new Date("2027-01-15"),
    },
    {
      title: "Statistics Mauritius Environment Indicators Portal",
      slug: "statistics-mauritius-portal",
      resourceType: "Compliance resource",
      shortSummary: "Official repository of environmental indicators, waste quantities, and greenhouse gas statistics for Mauritius.",
      mainExplanation: "Provides the public dataset used as baseline for carbon footprint calculations and benchmarking.",
      officialSourceLink: "https://statsmauritius.govmu.org",
      status: "published",
      legalStatus: "non_legal",
      lastVerifiedAt: new Date("2026-01-15"),
      nextReviewAt: new Date("2027-01-15"),
    },
    {
      title: "SEMSI Index Guidelines",
      slug: "semsi-index-guide",
      resourceType: "Compliance resource",
      shortSummary: "ESG listing rules and disclosure metrics for companies on the Stock Exchange of Mauritius Sustainability Index.",
      mainExplanation: "Uses a robust index rating system checking governance, environmental responsibility, and social practices.",
      officialSourceLink: "https://stockexchangeofmauritius.com",
      status: "published",
      legalStatus: "non_legal",
      lastVerifiedAt: new Date("2026-01-15"),
      nextReviewAt: new Date("2027-01-15"),
    },
    {
      title: "Central Electricity Board (CEB) Renewable Energy Schemes",
      slug: "ceb-renewable-energy-schemes",
      resourceType: "Government guideline",
      shortSummary: "Official framework details and tariff rates for feeding private solar energy into the grid.",
      mainExplanation: "Covers the MSDG (Medium Scale Distributed Generation) solar scheme and net-metering structures.",
      officialSourceLink: "https://ceb.mu",
      status: "published",
      legalStatus: "non_legal",
      lastVerifiedAt: new Date("2026-01-15"),
      nextReviewAt: new Date("2027-01-15"),
    },
    {
      title: "Occupational Safety and Health Act 2005",
      slug: "occupational-safety-health-act-2005",
      resourceType: "Act",
      shortSummary: "The primary legislation governing employee safety, health, and welfare in Mauritian workplaces.",
      mainExplanation: "Sets rules for fire safety, emergency exits, safety committees, and hazardous substance exposure.",
      officialName: "Occupational Safety and Health Act 2005",
      resourceNumber: "Act No. 28 of 2005",
      responsibleAuthority: "Ministry of Labour",
      relevantSector: "Workplace",
      dateIssued: new Date("2005-09-01"),
      officialSourceLink: "https://labour.govmu.org",
      complianceRelevance: "Workplaces with more than 50 employees must set up a safety committee and employ a safety officer.",
      practicalImplications: "Verify that fire drills are logged, first aid kits are stocked, and safety officer reports are reviewed by management.",
      status: "published",
      isFeatured: false,
      legalStatus: "active",
      lastVerifiedAt: new Date("2026-01-15"),
      nextReviewAt: new Date("2027-01-15"),
    },
    {
      title: "Environment Protection (Effluent Discharge Standards) Regulations 2003",
      slug: "effluent-discharge-standards",
      resourceType: "Regulation",
      shortSummary: "Prescribes standard limits for wastewater effluents discharged into rivers, canals, or underground aquifers.",
      mainExplanation: "Limits heavy metals, pH, COD (Chemical Oxygen Demand), and BOD (Biochemical Oxygen Demand) in wastewater.",
      officialName: "Environment Protection (Effluent Discharge Standards) Regulations 2003",
      resourceNumber: "GN No. 34 of 2003",
      responsibleAuthority: "Ministry of Environment",
      relevantSector: "Pollution",
      dateIssued: new Date("2003-03-15"),
      officialSourceLink: "https://environment.govmu.org",
      complianceRelevance: "Industrial canteens and factories must test wastewater discharges and use interceptors.",
      practicalImplications: "Install grease traps on kitchen waste pipes and schedule laboratory tests of wastewater samples.",
      status: "published",
      isFeatured: false,
      legalStatus: "active",
      lastVerifiedAt: new Date("2026-01-15"),
      nextReviewAt: new Date("2027-01-15"),
    },
    {
      title: "Environment Protection (Standards for Air) Regulations 1998",
      slug: "air-standards-regulations",
      resourceType: "Regulation",
      shortSummary: "Sets maximum permissible emission thresholds for dust, sulfur dioxide, and boiler smoke in Mauritius.",
      mainExplanation: "Aims to protect public health and ambient air quality from industrial emissions.",
      officialName: "Environment Protection (Standards for Air) Regulations 1998",
      resourceNumber: "GN No. 105 of 1998",
      responsibleAuthority: "Ministry of Environment",
      relevantSector: "Pollution",
      dateIssued: new Date("1998-08-01"),
      officialSourceLink: "https://environment.govmu.org",
      complianceRelevance: "Emergency generators and canteens boilers must undergo annual soot and particulate tests.",
      practicalImplications: "Perform preventive maintenance on generators to keep emissions within legal parameters.",
      status: "published",
      isFeatured: false,
      legalStatus: "active",
      lastVerifiedAt: new Date("2026-01-15"),
      nextReviewAt: new Date("2027-01-15"),
    },
    {
      title: "Forest and Reserves Act 1983",
      slug: "forest-reserves-act-1983",
      resourceType: "Act",
      shortSummary: "Legal protections for state forests, national reserves, and river reserves in Mauritius.",
      mainExplanation: "Restricts tree felling along river banks and protects native plant habitats.",
      officialName: "Forest and Reserves Act 1983",
      resourceNumber: "Act No. 18 of 1983",
      responsibleAuthority: "Forestry Service",
      relevantSector: "Biodiversity",
      dateIssued: new Date("1983-06-01"),
      officialSourceLink: "https://forestry.govmu.org",
      complianceRelevance: "Clearing land near river banks or protected mountain reserves is heavily restricted.",
      practicalImplications: "Ensure landscaping teams do not cut vegetation within 16 feet of river high-water marks.",
      status: "published",
      isFeatured: false,
      legalStatus: "active",
      lastVerifiedAt: new Date("2026-01-15"),
      nextReviewAt: new Date("2027-01-15"),
    },
    {
      title: "Fisheries and Marine Resources Act 2007 - Superseded",
      slug: "fisheries-act-2007",
      resourceType: "Act",
      shortSummary: "The legacy legislative framework for marine protection, superseded by the Fisheries Act 2023.",
      mainExplanation: "Formerly governed marine reserves and coral protections until it was updated in 2023.",
      officialName: "Fisheries and Marine Resources Act 2007",
      resourceNumber: "Act No. 27 of 2007",
      responsibleAuthority: "Ministry of Blue Economy",
      relevantSector: "Biodiversity",
      dateIssued: new Date("2007-12-01"),
      officialSourceLink: "https://blueeconomy.govmu.org",
      complianceRelevance: "Superseded. Refer to the Fisheries Act 2023 for active compliance guidelines.",
      practicalImplications: "Verify that coastal protection reports cite the new Fisheries Act 2023 instead of the 2007 version.",
      status: "published",
      isFeatured: false,
      legalStatus: "superseded",
      lastVerifiedAt: new Date("2026-01-15"),
      nextReviewAt: new Date("2027-01-15"),
    },
    {
      title: "Fisheries Act 2023",
      slug: "fisheries-act-2023",
      resourceType: "Act",
      shortSummary: "Provides modern regulations for marine resource management, aquaculture, and coral protection.",
      mainExplanation: "Protects lagoon ecosystems and restricts commercial activities in marine parks.",
      officialName: "Fisheries Act 2023",
      resourceNumber: "Act No. 12 of 2023",
      responsibleAuthority: "Ministry of Blue Economy",
      relevantSector: "Biodiversity",
      dateIssued: new Date("2023-10-15"),
      officialSourceLink: "https://blueeconomy.govmu.org",
      complianceRelevance: "Coastline developments and hotel lagoon operators must respect marine reserve limits.",
      practicalImplications: "Verify that hotel water sports policies forbid guest activities near protected marine reserves.",
      status: "published",
      isFeatured: false,
      legalStatus: "active",
      lastVerifiedAt: new Date("2026-01-15"),
      nextReviewAt: new Date("2027-01-15"),
    },
    {
      title: "Environment Protection (Control of Noise) Regulations 2008",
      slug: "noise-regulations",
      resourceType: "Regulation",
      shortSummary: "Bans excessive noise from commercial facilities, construction, and audio systems in public.",
      mainExplanation: "Defines maximum decibel levels for day and night within commercial areas.",
      officialName: "Environment Protection (Control of Noise) Regulations 2008",
      resourceNumber: "GN No. 114 of 2008",
      responsibleAuthority: "Ministry of Environment",
      relevantSector: "Pollution",
      dateIssued: new Date("2008-05-01"),
      officialSourceLink: "https://environment.govmu.org",
      complianceRelevance: "Hotels and construction sites must monitor boundaries to prevent noise complaints.",
      practicalImplications: "Restrict loud maintenance operations to daytime hours (7:00 AM to 7:00 PM).",
      status: "published",
      isFeatured: false,
      legalStatus: "active",
      lastVerifiedAt: new Date("2026-01-15"),
      nextReviewAt: new Date("2027-01-15"),
    },
    {
      title: "Environment Protection (Control of Hazardous Waste) Regulations 2001",
      slug: "hazardous-waste-regulations",
      resourceType: "Regulation",
      shortSummary: "Sets strict controls for the storage, labeling, and disposal of toxic chemicals and e-waste.",
      mainExplanation: "Bans dumping of industrial chemicals and mandates safe collection logs.",
      officialName: "Environment Protection (Control of Hazardous Waste) Regulations 2001",
      resourceNumber: "GN No. 155 of 2001",
      responsibleAuthority: "Ministry of Environment",
      relevantSector: "Waste",
      dateIssued: new Date("2001-08-01"),
      officialSourceLink: "https://environment.govmu.org",
      complianceRelevance: "Companies must store chemical drums and used oils in bunded zones and track transport logs.",
      practicalImplications: "Maintain emergency spill response kits and log pesticide and generator oil disposal.",
      status: "published",
      isFeatured: false,
      legalStatus: "active",
      lastVerifiedAt: new Date("2026-01-15"),
      nextReviewAt: new Date("2027-01-15"),
    },
    {
      title: "Solid Waste Management Division Guidelines",
      slug: "solid-waste-division-guidelines",
      resourceType: "Government guideline",
      shortSummary: "Official guidelines for industrial waste classification and landfill disposal permissions.",
      mainExplanation: "Sets rules for general commercial waste separation before delivery to Mare Chicose.",
      officialSourceLink: "https://environment.govmu.org",
      status: "published",
      legalStatus: "non_legal",
      lastVerifiedAt: new Date("2026-01-15"),
      nextReviewAt: new Date("2027-01-15"),
    },
    {
      title: "Ministry of Energy and Public Utilities Portal",
      slug: "ministry-of-energy",
      resourceType: "Authority",
      shortSummary: "Governing authority for water extraction licenses, wastewater services, and grid connection approvals.",
      mainExplanation: "Coordinates national grid utility programs and manages water resources policies.",
      officialSourceLink: "https://publicutilities.govmu.org",
      status: "published",
      legalStatus: "non_legal",
      lastVerifiedAt: new Date("2026-01-15"),
      nextReviewAt: new Date("2027-01-15"),
    },
    {
      title: "Energy Efficiency Management Office (EEMO)",
      slug: "eemo-portal",
      resourceType: "Authority",
      shortSummary: "Government office promoting efficiency guidelines and administering commercial audits.",
      mainExplanation: "Enforces energy standards and certifies energy auditors.",
      officialSourceLink: "https://eemo.govmu.org",
      status: "published",
      legalStatus: "non_legal",
      lastVerifiedAt: new Date("2026-01-15"),
      nextReviewAt: new Date("2027-01-15"),
    },
    {
      title: "Water Resources Unit (WRU)",
      slug: "wru-portal",
      resourceType: "Authority",
      shortSummary: "Coordinates surface water distribution and regulates borehole water licenses.",
      mainExplanation: "Monitors national aquifers and approves water extraction concessions.",
      officialSourceLink: "https://publicutilities.govmu.org",
      status: "published",
      legalStatus: "non_legal",
      lastVerifiedAt: new Date("2026-01-15"),
      nextReviewAt: new Date("2027-01-15"),
    },
    {
      title: "Beach Authority Act 2002",
      slug: "beach-authority-act-2002",
      resourceType: "Act",
      shortSummary: "Regulates beach preservation, vendor permits, and environmental controls on public coastlines.",
      mainExplanation: "Governs tourist zones and restricts vehicle operations on public sandy beaches.",
      officialName: "Beach Authority Act 2002",
      resourceNumber: "Act No. 7 of 2002",
      responsibleAuthority: "Beach Authority",
      relevantSector: "General environmental compliance",
      dateIssued: new Date("2002-05-01"),
      officialSourceLink: "https://beachauthority.mu",
      complianceRelevance: "Hotels and seaside operators must ensure no concrete platforms are built on public beaches.",
      practicalImplications: "Ensure water sports teams maintain clean public beach areas without disrupting vegetation.",
      status: "published",
      isFeatured: false,
      legalStatus: "active",
      lastVerifiedAt: new Date("2026-01-15"),
      nextReviewAt: new Date("2027-01-15"),
    },
    {
      title: "Local Government Act 2011",
      slug: "local-government-act-2011",
      resourceType: "Act",
      shortSummary: "Grants municipal and district councils powers to manage local waste collection and land use permits.",
      mainExplanation: "Governs municipal collection and building permits (Building and Land Use Permit - BLUP).",
      officialName: "Local Government Act 2011",
      resourceNumber: "Act No. 36 of 2011",
      responsibleAuthority: "Local Municipal Councils",
      relevantSector: "General environmental compliance",
      dateIssued: new Date("2011-12-15"),
      officialSourceLink: "https://localgovernment.govmu.org",
      complianceRelevance: "All corporate facilities must comply with municipal waste schedules and keep BLUP logs updated.",
      practicalImplications: "Obtain BLUP clearance before building new waste sorting sheds.",
      status: "published",
      isFeatured: false,
      legalStatus: "active",
      lastVerifiedAt: new Date("2026-01-15"),
      nextReviewAt: new Date("2027-01-15"),
    },
    {
      title: "Planning and Development Act 2004",
      slug: "planning-development-act-2004",
      resourceType: "Act",
      shortSummary: "National framework regulating structural planning and zone restrictions in Mauritius.",
      mainExplanation: "Coordinates land usage zoning to prevent residential sprawl into reserve forests.",
      officialName: "Planning and Development Act 2004",
      resourceNumber: "Act No. 2 of 2004",
      responsibleAuthority: "Ministry of Housing and Land Use Planning",
      relevantSector: "General environmental compliance",
      dateIssued: new Date("2004-03-01"),
      officialSourceLink: "https://housing.govmu.org",
      complianceRelevance: "Zoning regulations restrict industrial developments to industrial zones.",
      practicalImplications: "Review zoning maps before purchasing site plots to avoid compliance blocks.",
      status: "published",
      isFeatured: false,
      legalStatus: "active",
      lastVerifiedAt: new Date("2026-01-15"),
      nextReviewAt: new Date("2027-01-15"),
    },
    {
      title: "Dangerous Chemicals Control Act 2004",
      slug: "dangerous-chemicals-act-2004",
      resourceType: "Act",
      shortSummary: "Restricts the importation, use, and transport of dangerous chemicals in Mauritius.",
      mainExplanation: "Mandates Safety Data Sheet (SDS) logging and requires chemical handling permits.",
      officialName: "Dangerous Chemicals Control Act 2004",
      resourceNumber: "Act No. 16 of 2004",
      responsibleAuthority: "Dangerous Chemicals Control Board",
      relevantSector: "Workplace",
      dateIssued: new Date("2004-06-01"),
      officialSourceLink: "https://health.govmu.org",
      complianceRelevance: "Industrial cleaning agents and pesticides require import licenses and SDS catalogs.",
      practicalImplications: "Train housekeeping teams on SDS hazard symbols and secure chemical storage locker logs.",
      status: "published",
      isFeatured: false,
      legalStatus: "active",
      lastVerifiedAt: new Date("2026-01-15"),
      nextReviewAt: new Date("2027-01-15"),
    },
    {
      title: "Supreme Court of Mauritius Legal Directory",
      slug: "supreme-court-legal-directory",
      resourceType: "Compliance resource",
      shortSummary: "National directory containing court judgments, legal precedents, and official laws of Mauritius.",
      mainExplanation: "The official legal records portal used to verify court rulings and acts of Parliament.",
      officialSourceLink: "https://supremecourt.govmu.org",
      status: "published",
      legalStatus: "non_legal",
      lastVerifiedAt: new Date("2026-01-15"),
      nextReviewAt: new Date("2027-01-15"),
    },
    {
      title: "Mauritius Chamber of Commerce and Industry (MCCI) Sustainability Portal",
      slug: "mcci-sustainability-portal",
      resourceType: "Compliance resource",
      shortSummary: "Provides resource guides and trade compliance information for business sustainability in Mauritius.",
      mainExplanation: "Offers business support materials to help local companies align with new environmental rules.",
      officialSourceLink: "https://mcci.org",
      status: "published",
      legalStatus: "non_legal",
      lastVerifiedAt: new Date("2026-01-15"),
      nextReviewAt: new Date("2027-01-15"),
    },
    {
      title: "National Environmental Laboratory (NEL) Portal",
      slug: "national-environmental-laboratory-portal",
      resourceType: "Authority",
      shortSummary: "The official laboratory division responsible for water testing, air analysis, and environmental monitoring.",
      mainExplanation: "Tests wastewater effluents and monitors national river and coast quality indices.",
      officialSourceLink: "https://environment.govmu.org",
      status: "published",
      legalStatus: "non_legal",
      lastVerifiedAt: new Date("2026-01-15"),
      nextReviewAt: new Date("2027-01-15"),
    },
    {
      title: "Beach Authority",
      slug: "beach-authority-portal",
      resourceType: "Authority",
      shortSummary: "Government department managing and maintaining public beaches across Mauritius.",
      mainExplanation: "Regulates beach vendor licenses and coastline cleanliness protocols.",
      officialSourceLink: "https://beachauthority.mu",
      status: "published",
      legalStatus: "non_legal",
      lastVerifiedAt: new Date("2026-01-15"),
      nextReviewAt: new Date("2027-01-15"),
    },
    {
      title: "Radiation Safety and Nuclear Security Act 2018",
      slug: "radiation-safety-act-2018",
      resourceType: "Act",
      shortSummary: "Controls the usage and disposal of radioactive items and coordinates safety licensing.",
      mainExplanation: "Governs x-ray systems, medical radiation tools, and radioactive waste shipping.",
      officialName: "Radiation Safety and Nuclear Security Act 2018",
      resourceNumber: "Act No. 15 of 2018",
      responsibleAuthority: "Radiation Safety Authority",
      relevantSector: "General environmental compliance",
      dateIssued: new Date("2018-09-01"),
      officialSourceLink: "https://health.govmu.org",
      complianceRelevance: "Medical institutions must keep active licenses for all radiation scanning equipment.",
      practicalImplications: "Schedule annual safety leak checks on medical equipment and log operator training hours.",
      status: "published",
      isFeatured: false,
      legalStatus: "active",
      lastVerifiedAt: new Date("2026-01-15"),
      nextReviewAt: new Date("2027-01-15"),
    },
    {
      title: "Dangerous Chemicals Regulations 2004",
      slug: "dangerous-chemicals-regulations-2004",
      resourceType: "Regulation",
      shortSummary: "Regulates the transport, storage, and retail sale of chemicals in Mauritius.",
      mainExplanation: "Mandates warning labels and bans toxic chemicals on commercial farms.",
      officialName: "Dangerous Chemicals Regulations 2004",
      resourceNumber: "GN No. 55 of 2004",
      responsibleAuthority: "Dangerous Chemicals Control Board",
      relevantSector: "Workplace",
      dateIssued: new Date("2004-09-01"),
      officialSourceLink: "https://health.govmu.org",
      complianceRelevance: "Requires clear hazard labeling on chemical containers used in hotel facilities.",
      practicalImplications: "Label all cleaning spray bottles and store them away from kitchen zones.",
      status: "published",
      isFeatured: false,
      legalStatus: "active",
      lastVerifiedAt: new Date("2026-01-15"),
      nextReviewAt: new Date("2027-01-15"),
    },
    {
      title: "National Parks and Conservation Act 1996",
      slug: "national-parks-act-1996",
      resourceType: "Act",
      shortSummary: "Coordinates the management of national parks and reserves in Mauritius.",
      mainExplanation: "Regulates entry and activities in national parks like Black River Gorges.",
      officialName: "National Parks and Conservation Act 1996",
      resourceNumber: "Act No. 11 of 1996",
      responsibleAuthority: "National Parks and Conservation Service",
      relevantSector: "Biodiversity",
      dateIssued: new Date("1996-05-01"),
      officialSourceLink: "https://npcs.govmu.org",
      complianceRelevance: "Restricts commercial building work inside national parks and reserve areas.",
      practicalImplications: "Train tour guides to inform hotel guests not to pick native flowers in parks.",
      status: "published",
      isFeatured: false,
      legalStatus: "active",
      lastVerifiedAt: new Date("2026-01-15"),
      nextReviewAt: new Date("2027-01-15"),
    },
    {
      title: "Forestry Service",
      slug: "forestry-service-portal",
      resourceType: "Authority",
      shortSummary: "The department managing state forest reserves, nurseries, and logging permissions.",
      mainExplanation: "Sells native plants for landscaping and issues tree cutting licenses.",
      officialSourceLink: "https://forestry.govmu.org",
      status: "published",
      legalStatus: "non_legal",
      lastVerifiedAt: new Date("2026-01-15"),
      nextReviewAt: new Date("2027-01-15"),
    },
    {
      title: "Energy Efficiency (Labeling of Regulated Machinery) Regulations 2017",
      slug: "energy-efficiency-labeling-regulations",
      resourceType: "Regulation",
      shortSummary: "Mandates energy labels for appliances sold or imported in Mauritius.",
      mainExplanation: "Requires air conditioners and washing machines to display efficiency star labels.",
      officialName: "Energy Efficiency (Labeling of Regulated Machinery) Regulations 2017",
      resourceNumber: "GN No. 80 of 2017",
      responsibleAuthority: "Energy Efficiency Management Office",
      relevantSector: "Energy",
      dateIssued: new Date("2017-06-01"),
      officialSourceLink: "https://eemo.govmu.org",
      complianceRelevance: "Retailers and office managers must buy only certified high-efficiency appliances.",
      practicalImplications: "Verify that new facility air conditioners carry active EEMO efficiency labels.",
      status: "published",
      isFeatured: false,
      legalStatus: "active",
      lastVerifiedAt: new Date("2026-01-15"),
      nextReviewAt: new Date("2027-01-15"),
    },
    {
      title: "Central Electricity Board (CEB)",
      slug: "ceb-portal",
      resourceType: "Authority",
      shortSummary: "The sole utility enterprise managing transmission and sales of grid power in Mauritius.",
      mainExplanation: "Manages utility billing, grid stability, and renewable energy connection bids.",
      officialSourceLink: "https://ceb.mu",
      status: "published",
      legalStatus: "non_legal",
      lastVerifiedAt: new Date("2026-01-15"),
      nextReviewAt: new Date("2027-01-15"),
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
        relatedResources: [],
      });
      logger.info({ slug: res.slug }, "- Rules & Resources seeded successfully");
    } else {
      // Reconcile and preserve updates but safely update legal status and review dates
      await db.update(mauritiusResourcesTable).set({
        legalStatus: res.legalStatus,
        lastVerifiedAt: res.lastVerifiedAt,
        nextReviewAt: res.nextReviewAt,
        officialSourceLink: res.officialSourceLink,
        resourceType: res.resourceType,
        shortSummary: res.shortSummary,
        mainExplanation: res.mainExplanation,
      }).where(eq(mauritiusResourcesTable.id, existing.id));
    }
  }

  // 2. Seed 12 Detailed Mauritius Sustainability Articles
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
* **Action**: Treat the black bin as a last resort. The target of every sustainability module is to reduce this general waste stream.

### Practical Steps for Mauritian Offices
1. Place sorting bins in high-traffic common areas like kitchenettes.
2. Label each bin clearly with standard colors.
3. Train cleaning staff on separate collection paths.

**Related Course**: [Waste Sorting Course](file:///courses/waste-sorting)  
**Related Rules**: [Waste Management Act 2023](file:///insights/mauritius-resources/waste-management-resource-recovery-act-2023)`,
      authorName: "EcoLearnHub Editorial",
      authorTitle: "Sustainability Education Team",
      thumbnailUrl: "https://images.unsplash.com/photo-1532996127006-2b2f1bfb8eb9",
      tags: ["workplace", "recycling", "mauritius", "bin-sorting"],
      status: "published",
      readingTimeMinutes: 5,
      linkedResourceSlugs: ["single-use-plastic-ban", "waste-management-resource-recovery-act-2023"],
      sourceReferences: [
        { title: "National Solid Waste Strategy", publisher: "Ministry of Environment", url: "https://environment.govmu.org" }
      ],
      lastVerifiedAt: new Date("2026-01-15"),
      nextReviewAt: new Date("2027-01-15"),
    },
    {
      title: "Recycling Infrastructure & Partners in Mauritius",
      slug: "recycling-partners-mauritius",
      excerpt: "An overview of recycling operators, drop-off networks, and organic waste platforms handling waste across the island.",
      content: `### Mauritius Recycling Network

Recycling on an island requires dedicated partners. Here are the key operators and sites managing waste recovery:

#### Mission Verde
A voluntary, non-profit recycling drop-off network. They operate collection bins across Mauritius for paper, plastic, cardboard, glass, and electronic waste (e-waste).

#### We Recycle / BEM Recycling
Local commercial operators that collect, sort, bale, and process recyclables. They export sorted materials for specialized reprocessing or manage local recovery chains.

#### Mare Chicose Landfill
The single national landfill of Mauritius, located in the south-east. Mare Chicose has neared its capacity limits. Diverting waste through recycling directly extends the landfill's lifespan.

#### Composting at Roches Noires
Organic waste treatment platforms that turn green garden waste and food scraps into high-quality compost, keeping organic materials out of Mare Chicose.

### How to Partner
Establish a monthly pickup schedule with operators like We Recycle. Ensure you log weight receipts for audit trails.

**Related Course**: [Recycling Strategies](file:///courses/recycling)  
**Related Rules**: [EPR PET Regulations](file:///insights/mauritius-resources/epr-pet-bottles)`,
      authorName: "EcoLearnHub Editorial",
      authorTitle: "Local Infrastructure Team",
      thumbnailUrl: "https://images.unsplash.com/photo-1591197172021-c8077a8f16a8",
      tags: ["infrastructure", "recycling", "landfill", "mauritius"],
      status: "published",
      readingTimeMinutes: 4,
      linkedResourceSlugs: ["epr-pet-bottles", "hazardous-waste-regulations"],
      sourceReferences: [
        { title: "Mare Chicose Lifespan Report", publisher: "Solid Waste Management Division", url: "https://environment.govmu.org" }
      ],
      lastVerifiedAt: new Date("2026-01-15"),
      nextReviewAt: new Date("2027-01-15"),
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
Local supermarkets replaced thin plastic bags with reusable bags made from woven textiles and polypropylene. They also introduced in-store drop-off bins for batteries and PET bottles, facilitating consumer participation in recovery schemes.

### Circular Actions for Office Teams
1. Swap plastic folders for cardboard archives.
2. Establish toner cartridge return agreements with printer suppliers.

**Related Course**: [Circular Economy](file:///courses/circular-economy)  
**Related Rules**: [Single-Use Plastic Ban](file:///insights/mauritius-resources/single-use-plastic-ban)`,
      authorName: "EcoLearnHub Editorial",
      authorTitle: "Corporate Case Studies",
      thumbnailUrl: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09",
      tags: ["circular-economy", "case-study", "mauritius", "business"],
      status: "published",
      readingTimeMinutes: 5,
      linkedResourceSlugs: ["single-use-plastic-ban", "maurice-ile-durable"],
      sourceReferences: [
        { title: "Circular Business Models in SIDS", publisher: "Mauritius Chamber of Commerce", url: "https://mcci.org" }
      ],
      lastVerifiedAt: new Date("2026-01-15"),
      nextReviewAt: new Date("2027-01-15"),
    },
    {
      title: "The Environment Act 2024: Essential Compliance Guide",
      slug: "environment-act-2024-compliance-guide",
      excerpt: "A comprehensive analysis of the Environment Act 2024, its new enforcement mechanisms, and implications for businesses.",
      content: `### The Environment Act 2024 Explained

The Environment Act 2024 represents a major modernization of environmental policy in Mauritius, repealing the legacy Environment Protection Act 2002. For businesses, compliance is no longer just about avoiding litter; it requires a proactive approach.

#### Major Regulatory Changes
1. **Licensing Framework**: Rationalizes EIA and PER license protocols. Streamlines the review process while raising penalty tariffs for building without appropriate permits.
2. **Environmental Auditing**: Empowers inspectors to perform random checks and request verified operational waste and wastewater logs.
3. **Polluter-Pays Principle**: Increases financial liabilities for chemical spills or unauthorized effluent discharge.

### Checklist for Facilities Directors
* Verify that your legal register references the Environment Act 2024, not the revoked EPA 2002.
* Audit your wastewater systems to verify compliance with effluent discharge standards.
* Schedule certified engineers to check fuel storage tanks for spill containment bunding.

**Related Course**: [Environmental Compliance](file:///courses/environmental-compliance)  
**Related Rules**: [Environment Act 2024](file:///insights/mauritius-resources/environment-act-2024)`,
      authorName: "EcoLearnHub Editorial",
      authorTitle: "Legal Compliance Panel",
      thumbnailUrl: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f",
      tags: ["compliance", "legal", "environment-act-2024", "mauritius"],
      status: "published",
      readingTimeMinutes: 6,
      linkedResourceSlugs: ["environment-act-2024", "environment-protection-act-2002"],
      sourceReferences: [
        { title: "Environment Act 2024 Text", publisher: "Supreme Court of Mauritius", url: "https://supremecourt.govmu.org" }
      ],
      lastVerifiedAt: new Date("2026-01-15"),
      nextReviewAt: new Date("2027-01-15"),
    },
    {
      title: "Understanding the Climate Change Act 2020 in Mauritius",
      slug: "climate-change-act-2020-guide",
      excerpt: "How the Climate Change Act 2020 shapes business strategies, building guidelines, and emission reporting on the island.",
      content: `### Climate Policy in Small Island States

As a Small Island Developing State (SIDS), Mauritius is highly vulnerable to sea-level rise and extreme weather events. The Climate Change Act 2020 provides the legal mandate to coordinate carbon mitigation and adaptation.

#### Key Features of the Act
* **National Adaptation Plans**: Integrates climate risks directly into infrastructure codes and town planning permissions.
* **Corporate Reporting Guidelines**: Builds foundations for mandatory greenhouse gas (GHG) reporting for specified high-impact sectors like hospitality, logistics, and manufacturing.

### Practical Mitigation Actions for Businesses
1. Conduct a physical risk assessment of facilities near low-lying coastal paths.
2. Introduce energy efficiency targets to reduce grid electricity consumption.
3. Formulate climate action guidelines for corporate operations.

**Related Course**: [Carbon Accounting](file:///courses/carbon-accounting)  
**Related Rules**: [Climate Change Act 2020](file:///insights/mauritius-resources/climate-change-act-2020)`,
      authorName: "EcoLearnHub Editorial",
      authorTitle: "Climate Action Team",
      thumbnailUrl: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b",
      tags: ["climate", "sids", "mitigation", "mauritius"],
      status: "published",
      readingTimeMinutes: 5,
      linkedResourceSlugs: ["climate-change-act-2020"],
      sourceReferences: [
        { title: "National Climate Change Adaptation Framework", publisher: "Ministry of Environment", url: "https://environment.govmu.org" }
      ],
      lastVerifiedAt: new Date("2026-01-15"),
      nextReviewAt: new Date("2027-01-15"),
    },
    {
      title: "Waste Management and Resource Recovery Act 2023",
      slug: "waste-management-resource-recovery-act-2023-guide",
      excerpt: "Understanding commercial waste recovery obligations, operator licensing, and local landfill diversion quotas.",
      content: `### Transitioning to a Resource Recovery Economy

The Waste Management and Resource Recovery Act 2023 shifted the national focus from simple waste hauling to structured material recovery and recycling.

#### Obligations under the Act
* **Licensed Operators**: Businesses must hire only waste haulers certified by the Solid Waste Division. Using unlicensed contractors results in compliance flags.
* **Separation Rules**: Mandates separate bins for organic scraps, paper, and metal in large commercial facilities.

### Implementation Guide
1. Review waste pickup agreements to verify the hauler holds an active recovery permit.
2. Maintain separate bins inside canteens to capture kitchen organic waste before it contaminates recyclables.
3. Retain monthly waste weight certificates for annual audit review.

**Related Course**: [Recycling Strategies](file:///courses/recycling)  
**Related Rules**: [Waste Management Act 2023](file:///insights/mauritius-resources/waste-management-resource-recovery-act-2023)`,
      authorName: "EcoLearnHub Editorial",
      authorTitle: "Waste and Recycling Division",
      thumbnailUrl: "https://images.unsplash.com/photo-1611284446314-60a58ac0deb9",
      tags: ["waste", "recycling", "compliance", "mauritius"],
      status: "published",
      readingTimeMinutes: 5,
      linkedResourceSlugs: ["waste-management-resource-recovery-act-2023", "solid-waste-division-guidelines"],
      sourceReferences: [
        { title: "Waste Management Act 2023", publisher: "Ministry of Environment", url: "https://environment.govmu.org" }
      ],
      lastVerifiedAt: new Date("2026-01-15"),
      nextReviewAt: new Date("2027-01-15"),
    },
    {
      title: "EIA and PER License Procedures for Mauritian Projects",
      slug: "eia-per-license-procedures-mauritius",
      excerpt: "A step-by-step practical guide to securing Environmental Impact Assessments and Preliminary Environmental Reports.",
      content: `### Environmental Permitting Guidelines

New construction projects, facility expansions, or industrial process upgrades in Mauritius require environmental clearance under the Environment Act 2024.

#### EIA vs PER
* **Preliminary Environmental Report (PER)**: Required for medium-impact activities like small-scale warehouse construction. Requires a detailed description of mitigation plans.
* **Environmental Impact Assessment (EIA)**: Required for high-impact activities like resort hotels, coastal marinas, or chemicals storage. Requires public consultation and detailed environmental studies.

### Step-by-Step Application Guide
1. Determine project classification under the Environment Act 2024 schedules.
2. Engage a certified environmental consultant to draft the report.
3. Submit plans to the Ministry of Environment and log public notice boards.
4. Secure the approval license before commencing site preparation work.

**Related Course**: [Environmental Compliance](file:///courses/environmental-compliance)  
**Related Rules**: [Environment Act 2024](file:///insights/mauritius-resources/environment-act-2024)`,
      authorName: "EcoLearnHub Editorial",
      authorTitle: "Licensing and Audits Panel",
      thumbnailUrl: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5",
      tags: ["licensing", "permits", "eia", "mauritius"],
      status: "published",
      readingTimeMinutes: 6,
      linkedResourceSlugs: ["environment-act-2024", "planning-development-act-2004"],
      sourceReferences: [
        { title: "EIA/PER Application Guidelines", publisher: "Ministry of Environment", url: "https://environment.govmu.org" }
      ],
      lastVerifiedAt: new Date("2026-01-15"),
      nextReviewAt: new Date("2027-01-15"),
    },
    {
      title: "Renewable Energy Transition Opportunities for Mauritian Businesses",
      slug: "renewable-energy-transition-mauritian-businesses",
      excerpt: "How local companies can access CEB solar schemes, feed energy back to the grid, and improve energy security.",
      content: `### Leveraging Solar PV in Mauritius

With abundant sunshine, solar energy offers Mauritian commercial facilities a double benefit: reducing carbon footprints and lowering utility utility bills.

#### Available Grid Schemes
* **Net-Metering**: Allows small consumers to offset grid consumption using private solar energy.
* **MSDG Solar Scheme**: Designed for medium-scale solar installations (e.g. factory roofs) to feed energy back to the Central Electricity Board (CEB) grid.

### Transition Checklist
1. Review roof space and utility bill histories to estimate PV requirements.
2. Secure grid-tie approvals from the Utility Regulatory Authority (URA) and CEB.
3. Conduct building energy audits to reduce baseline consumption before sizing PV panels.

**Related Course**: [Energy Efficiency](file:///courses/energy-efficiency)  
**Related Rules**: [CEB Solar Schemes](file:///insights/mauritius-resources/ceb-renewable-energy-schemes)`,
      authorName: "EcoLearnHub Editorial",
      authorTitle: "Energy Transition Panel",
      thumbnailUrl: "https://images.unsplash.com/photo-1509391366360-2e959784a276",
      tags: ["solar", "energy", "renewable-energy", "mauritius"],
      status: "published",
      readingTimeMinutes: 5,
      linkedResourceSlugs: ["ceb-renewable-energy-schemes", "utility-regulatory-authority-act-2004"],
      sourceReferences: [
        { title: "CEB Renewable Energy Integration Schemes", publisher: "Central Electricity Board", url: "https://ceb.mu" }
      ],
      lastVerifiedAt: new Date("2026-01-15"),
      nextReviewAt: new Date("2027-01-15"),
    },
    {
      title: "Water Conservation Practices for Mauritian Commercial Facilities",
      slug: "water-conservation-mauritian-commercial-facilities",
      excerpt: "Reducing water consumption, managing wastewater effluents, and protecting national groundwater reserves.",
      content: `### Managing Water Scarcity on a SIDS

Although tropical, Mauritius faces dry winter periods. Commercial businesses must implement aggressive water efficiency targets to protect local aquifers.

#### Regulatory Focus
* **Effluent Testing**: All wastewater discharged from canteens or processes must meet Effluent Discharge Standards.
* **Borehole Licensing**: Private water extraction requires active monitoring and license compliance under the Water Resources Act 1985.

### Conservation Best Practices
1. Install low-flow tap aerators in public and guest restrooms.
2. Harvest rainwater for cooling towers and garden landscaping.
3. Test grease traps weekly and log grease haulage records.

**Related Course**: [Water Conservation](file:///courses/water-conservation)  
**Related Rules**: [Water Resources Act 1985](file:///insights/mauritius-resources/water-resources-act-1985)`,
      authorName: "EcoLearnHub Editorial",
      authorTitle: "Resource Conservation Team",
      thumbnailUrl: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05",
      tags: ["water", "conservation", "compliance", "mauritius"],
      status: "published",
      readingTimeMinutes: 5,
      linkedResourceSlugs: ["water-resources-act-1985", "effluent-discharge-standards"],
      sourceReferences: [
        { title: "Water Resources Assessment Report", publisher: "Water Resources Unit", url: "https://publicutilities.govmu.org" }
      ],
      lastVerifiedAt: new Date("2026-01-15"),
      nextReviewAt: new Date("2027-01-15"),
    },
    {
      title: "Sustainable Procurement: Green Purchasing Guidelines",
      slug: "sustainable-procurement-green-purchasing-guidelines",
      excerpt: "Vetting packaging choices, eliminating banned plastics, and choosing compliant Mauritian suppliers.",
      content: `### Green Purchasing Framework

Sustainable procurement aligns company purchasing with national environmental goals. It helps eliminate plastic waste at the source and reduces overall shipping footprints.

#### Vetting Supplier Products
* **Packaging Check**: Reject materials that violate single-use plastic bans. Confirm suppliers use FSC-certified cardboard.
* **EPR Quotas**: Verify if local suppliers contribute to packaging recovery schemes like PET Recycle Ltd.

### Procurement Steps
1. Insert compliance clauses directly into supply contracts.
2. Prioritize local Mauritian goods (e.g. food products) to reduce transport emissions.
3. Verify eco-labels and material data sheets before bulk purchases.

**Related Course**: [Green Procurement](file:///courses/green-procurement)  
**Related Rules**: [Single-Use Plastic Ban](file:///insights/mauritius-resources/single-use-plastic-ban)`,
      authorName: "EcoLearnHub Editorial",
      authorTitle: "Sustainable Supply Chain Panel",
      thumbnailUrl: "https://images.unsplash.com/photo-1530587191325-3db32d826c18",
      tags: ["procurement", "supply-chain", "compliance", "mauritius"],
      status: "published",
      readingTimeMinutes: 5,
      linkedResourceSlugs: ["single-use-plastic-ban", "epr-pet-bottles"],
      sourceReferences: [
        { title: "Sustainable Procurement Manual", publisher: "Mauritius Chamber of Commerce", url: "https://mcci.org" }
      ],
      lastVerifiedAt: new Date("2026-01-15"),
      nextReviewAt: new Date("2027-01-15"),
    },
    {
      title: "ESG Reporting and the SEMSI Index on the Stock Exchange of Mauritius",
      slug: "esg-reporting-semsi-index-mauritius",
      excerpt: "Understanding the SEM Sustainability Index (SEMSI), environmental disclosures, and corporate governance standards.",
      content: `### The Business Value of ESG Disclosure

The Stock Exchange of Mauritius Sustainability Index (SEMSI) tracks listed businesses that demonstrate robust Environmental, Social, and Governance (ESG) practices.

#### Main Disclosure Metrics
* **Environmental**: Energy intensity, carbon footprint metrics, waste recycling rates, and water efficiency goals.
* **Governance**: Board diversity, anti-corruption policies, and compliance record checks.

### Reporting Best Practices
1. Create a detailed carbon emissions inventory using verified baselines.
2. Draft formal employee safety and training summaries.
3. Align corporate governance codes with SEMSI parameters.

**Related Course**: [ESG Reporting](file:///courses/esg-reporting)  
**Related Rules**: [SEMSI Index Guidelines](file:///insights/mauritius-resources/semsi-index-guide)`,
      authorName: "EcoLearnHub Editorial",
      authorTitle: "Finance and ESG Panel",
      thumbnailUrl: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40",
      tags: ["esg", "semsi", "finance", "mauritius"],
      status: "published",
      readingTimeMinutes: 5,
      linkedResourceSlugs: ["semsi-index-guide", "statistics-mauritius-portal"],
      sourceReferences: [
        { title: "SEMSI Index Listing Criteria", publisher: "Stock Exchange of Mauritius", url: "https://stockexchangeofmauritius.com" }
      ],
      lastVerifiedAt: new Date("2026-01-15"),
      nextReviewAt: new Date("2027-01-15"),
    },
    {
      title: "Workplace Health, Safety and Sustainability Integration in Mauritius",
      slug: "workplace-health-safety-sustainability-integration",
      excerpt: "Aligning OSHA 2005 safety guidelines with facility environmental practices, chemicals handling, and spill response.",
      content: `### Merging OSHA 2005 and Environmental Stewardship

Sustainability is built on safe workspaces. A green initiative is incomplete if it compromises employee health or ignores chemical safety.

#### Overlapping Compliance Areas
* **Dangerous Chemicals**: Requires Safety Data Sheets (SDS) and clear training logs under the Dangerous Chemicals Control Act 2004.
* **Emergency Response**: Mandates emergency plans and spill containment protocols to prevent chemical leaks into public drainage.

### Team Action List
1. Audit chemical storage rooms to verify they are bunded and ventilated.
2. Label emergency wash stations and maintain stocked first-aid kits.
3. Log safety officer reviews and OSH committee meetings.

**Related Course**: [Workplace Safety](file:///courses/workplace-safety)  
**Related Rules**: [OSHA 2005 Act](file:///insights/mauritius-resources/occupational-safety-health-act-2005)`,
      authorName: "EcoLearnHub Editorial",
      authorTitle: "Workplace Safety Panel",
      thumbnailUrl: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122",
      tags: ["safety", "osha", "workplace", "mauritius"],
      status: "published",
      readingTimeMinutes: 5,
      linkedResourceSlugs: ["occupational-safety-health-act-2005", "dangerous-chemicals-act-2004"],
      sourceReferences: [
        { title: "Occupational Safety and Health Act 2005 Text", publisher: "Ministry of Labour", url: "https://labour.govmu.org" }
      ],
      lastVerifiedAt: new Date("2026-01-15"),
      nextReviewAt: new Date("2027-01-15"),
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
        isPublished: true,
        publishedAt: new Date(),
      });
      logger.info({ slug: art.slug }, "- Article seeded successfully");
    } else {
      // Reconcile and safely update contents and links
      await db.update(blogPostsTable).set({
        content: art.content,
        excerpt: art.excerpt,
        linkedResourceSlugs: art.linkedResourceSlugs,
        sourceReferences: art.sourceReferences,
        lastVerifiedAt: art.lastVerifiedAt,
        nextReviewAt: art.nextReviewAt,
        tags: art.tags,
      }).where(eq(blogPostsTable.id, existing.id));
    }
  }

  // Record system seed completion marker
  const seedMarker = "sustainability-for-mauritius-insights-v1";
  const runMarker = await db.query.systemSeedsTable.findFirst({
    where: eq(systemSeedsTable.name, seedMarker)
  });
  if (!runMarker) {
    await db.insert(systemSeedsTable).values({
      name: seedMarker,
      runAt: new Date(),
    });
  }

  logger.info("Insights content migration completed!");
}
