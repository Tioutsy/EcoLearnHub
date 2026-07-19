import app from "./app";
import { logger } from "./lib/logger";
import { ensureFoundationsCourse } from "./lib/ensureFoundationsCourse";
import { ensureWasteSortingCourse } from "./lib/ensureWasteSortingCourse";
import { seedInitialSectors } from "./routes/platformAdmin";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

async function start(): Promise<void> {
  // Ensure required course content exists before accepting traffic so the first
  // requests after a deploy deterministically see the seeded course.
  await ensureFoundationsCourse();
  await ensureWasteSortingCourse();
  await seedInitialSectors();


  app.listen(port, (err) => {
    if (err) {
      logger.error({ err }, "Error listening on port");
      process.exit(1);
    }

    logger.info({ port }, "Server listening");
  });
}

void start();
