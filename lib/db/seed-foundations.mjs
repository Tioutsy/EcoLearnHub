// Idempotent bootstrap for the "Sustainability Foundations" interactive course.
// Safe to run repeatedly: it keys off the course slug and only creates rows
// that are missing. The rich interactive content (scenarios, knowledge checks,
// commitments) lives in the web app at
// artifacts/ecolearn/src/pages/learn/foundations/content.ts and is matched to
// these lesson rows by order. Run with: pnpm --filter @workspace/db run seed:foundations
import pg from "pg";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set to seed the Foundations course.");
}

const COURSE_SLUG = "sustainability-foundations";
const COURSE_TITLE = "Sustainability Foundations";
const BADGE_SLUG = "sustainability-starter";

const COURSE = {
  description:
    "A short, practical introduction to sustainability for every employee. In about 20 minutes you will learn what sustainability really means, why it matters for Mauritius, and the simple actions you can take at work every day. No jargon, just clear ideas and real local examples.",
  categoryId: 1,
  durationMinutes: 20,
  priceUsd: "1400.00",
  level: "beginner",
  isFeatured: true,
  thumbnailUrl: "/images/courses/sustainability-foundations.png",
  learningObjectives: [
    "Understand what sustainability means in everyday terms",
    "See why sustainability matters for people, business, and Mauritius",
    "Recognise local environmental realities and your part in them",
    "Choose practical actions you can take at work",
    "Make a personal sustainability commitment you can act on",
  ],
  includesCertificate: true,
  passingScore: 80,
  isPublished: true,
};

const LESSONS = [
  { order: 0, title: "Welcome to Sustainability", minutes: 3, content: "Sustainability means meeting our needs today without taking away from future generations. This lesson introduces the idea in plain terms." },
  { order: 1, title: "Why Sustainability Matters", minutes: 4, content: "Sustainability rests on three connected ideas: caring for the environment, supporting people, and keeping business healthy." },
  { order: 2, title: "Sustainability in Mauritius", minutes: 4, content: "Mauritius has limited land for waste, growing plastic pollution, and pressure on fresh water. Local realities shape why this matters here." },
  { order: 3, title: "Your Role as an Employee", minutes: 3, content: "Every role can help, from office staff and receptionists to housekeepers and technicians. Small actions add up." },
  { order: 4, title: "Everyday Sustainability Actions", minutes: 3, content: "Small daily choices around energy, water, waste, paper, and travel make a real difference at work." },
  { order: 5, title: "Your Sustainability Commitment", minutes: 3, content: "Knowledge becomes change when you commit to act. In this final lesson you choose practical commitments to carry forward." },
];

const QUIZ = [
  { order: 0, question: "What does sustainability mean in simple terms?", options: ["Using resources today in a way that still leaves enough for future generations", "Spending as much as possible right now", "A concern only for large factories", "A rule that applies only to government offices"], correct: 0 },
  { order: 1, question: "Which statement best describes the pillars of sustainability?", options: ["Only making more profit", "Balancing environmental, social, and economic needs", "Ignoring community needs", "Using more energy every year"], correct: 1 },
  { order: 2, question: "Why does sustainability matter for a business in Mauritius?", options: ["It has no effect on costs", "It only matters for tourists", "It protects the island resources, lowers costs, and builds reputation", "It slows down every company"], correct: 2 },
  { order: 3, question: "Where does most household waste in Mauritius end up?", options: ["The Mare Chicose landfill", "The sea near Port Louis", "A recycling plant in every village", "Reunion Island"], correct: 0 },
  { order: 4, question: "Which is a real environmental challenge for Mauritius?", options: ["Too much unused farmland", "No coastline to protect", "Unlimited landfill space", "Limited land for waste and pressure on fresh water"], correct: 3 },
  { order: 5, question: "As an office employee, a simple sustainable action is to:", options: ["Leave the air conditioning on overnight", "Switch off lights and screens when leaving a room", "Print every email", "Keep taps running while working"], correct: 1 },
  { order: 6, question: "How can a housekeeper or technician support sustainability?", options: ["Report leaks quickly and use cleaning products carefully", "Ignore dripping taps", "Throw all waste into one bin", "Leave equipment running when not needed"], correct: 0 },
  { order: 7, question: "You find a plastic bottle in the general waste bin. What is best?", options: ["Leave it, it does not matter", "Throw more waste on top", "Move it to the recycling stream where available", "Take it home only"], correct: 2 },
  { order: 8, question: "Which everyday habit saves water at work?", options: ["Let taps run during breaks", "Turn off the tap when it is not in use and report leaks", "Wash single items under running water for a long time", "Ignore a running toilet"], correct: 1 },
  { order: 9, question: "What is the most useful first step after this course?", options: ["Wait for someone else to start", "Do nothing until next year", "Assume sustainability is not your job", "Choose one or two practical commitments and act on them"], correct: 3 },
];

const BADGE = {
  name: "Sustainability Starter",
  description: "Awarded for completing the Sustainability Foundations course and making your first workplace commitment.",
  icon: "sprout",
  criteriaType: "all_courses",
  threshold: 0,
  orderIndex: 6,
};

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function ensureCourse(client) {
  const bySlug = await client.query("SELECT id FROM courses WHERE slug = $1", [COURSE_SLUG]);
  if (bySlug.rows.length > 0) return bySlug.rows[0].id;

  // Migrate a legacy row that was created before the slug column existed.
  const byTitle = await client.query("SELECT id FROM courses WHERE title = $1 ORDER BY id LIMIT 1", [COURSE_TITLE]);
  if (byTitle.rows.length > 0) {
    const id = byTitle.rows[0].id;
    await client.query("UPDATE courses SET slug = $1, passing_score = $2 WHERE id = $3", [COURSE_SLUG, COURSE.passingScore, id]);
    return id;
  }

  const inserted = await client.query(
    `INSERT INTO courses
      (title, slug, description, category_id, duration_minutes, price_usd, level, is_featured, thumbnail_url, learning_objectives, includes_certificate, passing_score, is_published)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
     RETURNING id`,
    [
      COURSE_TITLE,
      COURSE_SLUG,
      COURSE.description,
      COURSE.categoryId,
      COURSE.durationMinutes,
      COURSE.priceUsd,
      COURSE.level,
      COURSE.isFeatured,
      COURSE.thumbnailUrl,
      COURSE.learningObjectives,
      COURSE.includesCertificate,
      COURSE.passingScore,
      COURSE.isPublished,
    ],
  );
  return inserted.rows[0].id;
}

async function ensureLessons(client, courseId) {
  for (const lesson of LESSONS) {
    const existing = await client.query("SELECT id FROM lessons WHERE course_id = $1 AND order_index = $2", [courseId, lesson.order]);
    if (existing.rows.length > 0) continue;
    await client.query(
      "INSERT INTO lessons (course_id, title, order_index, duration_minutes, content) VALUES ($1,$2,$3,$4,$5)",
      [courseId, lesson.title, lesson.order, lesson.minutes, lesson.content],
    );
  }
}

async function ensureQuiz(client, courseId) {
  for (const q of QUIZ) {
    const existing = await client.query("SELECT id FROM quiz_questions WHERE course_id = $1 AND order_index = $2", [courseId, q.order]);
    if (existing.rows.length > 0) continue;
    await client.query(
      "INSERT INTO quiz_questions (course_id, question, options, correct_option, order_index) VALUES ($1,$2,$3,$4,$5)",
      [courseId, q.question, q.options, q.correct, q.order],
    );
  }
}

async function ensureBadge(client, courseId) {
  const existing = await client.query("SELECT id, course_ids FROM badge_definitions WHERE slug = $1", [BADGE_SLUG]);
  if (existing.rows.length > 0) {
    await client.query("UPDATE badge_definitions SET course_ids = $1 WHERE slug = $2", [[courseId], BADGE_SLUG]);
    return;
  }
  await client.query(
    "INSERT INTO badge_definitions (slug, name, description, icon, criteria_type, threshold, course_ids, order_index) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)",
    [BADGE_SLUG, BADGE.name, BADGE.description, BADGE.icon, BADGE.criteriaType, BADGE.threshold, [courseId], BADGE.orderIndex],
  );
}

async function main() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const courseId = await ensureCourse(client);
    await ensureLessons(client, courseId);
    await ensureQuiz(client, courseId);
    await ensureBadge(client, courseId);
    await client.query("COMMIT");
    console.log(`Foundations course ready (id=${courseId}, slug=${COURSE_SLUG}): 6 lessons, 10 quiz questions, badge "${BADGE_SLUG}".`);
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error("Failed to seed Foundations course:", err);
  process.exit(1);
});
