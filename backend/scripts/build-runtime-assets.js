const fs = require("fs");
const path = require("path");

// This script prepares runtime assets inside `dist/` after the TypeScript build.
//
// Why it exists:
// - `tsc` compiles `.ts` files to `.js`
// - `tsc` does not copy non-TypeScript assets such as `.sql` files
//
// The backend executes migrations and seeds from `dist/db/...` in production
// and in Docker. Without this copy step, the compiled runners would exist but
// the SQL files they load at runtime would be missing.
//
// Supported modes:
// - `clean`: remove the current `dist/` directory before a fresh build
// - `copy` : copy runtime SQL assets into `dist/` (default mode)

const projectRoot = path.resolve(__dirname, "..");
const distRoot = path.join(projectRoot, "dist");
const mode = process.argv[2] || "copy";

// Remove a directory tree if it exists.
const removeDirectory = (directoryPath) => {
  if (fs.existsSync(directoryPath)) {
    fs.rmSync(directoryPath, { recursive: true, force: true });
  }
};

// Ensure the target directory exists before copying files into it.
const ensureDirectory = (directoryPath) => {
  fs.mkdirSync(directoryPath, { recursive: true });
};

// Copy only `.sql` files from a source folder to the matching `dist/` folder.
// This keeps runtime DB assets available for the compiled migration/seed entrypoints.
const copySqlDirectory = (sourceRelativePath, targetRelativePath) => {
  const sourceDirectory = path.join(projectRoot, sourceRelativePath);
  const targetDirectory = path.join(distRoot, targetRelativePath);

  if (!fs.existsSync(sourceDirectory)) {
    return;
  }

  ensureDirectory(targetDirectory);

  for (const fileName of fs.readdirSync(sourceDirectory)) {
    if (!fileName.endsWith(".sql")) {
      continue;
    }

    fs.copyFileSync(
      path.join(sourceDirectory, fileName),
      path.join(targetDirectory, fileName),
    );
  }
};

if (mode === "clean") {
  removeDirectory(distRoot);
  process.exit(0);
}

// Keep the compiled runtime layout aligned with the source layout:
// - `src/db/migrations/*.sql` -> `dist/db/migrations/*.sql`
// - `src/db/seeds/*.sql`      -> `dist/db/seeds/*.sql`
copySqlDirectory(
  path.join("src", "db", "migrations"),
  path.join("db", "migrations"),
);
copySqlDirectory(path.join("src", "db", "seeds"), path.join("db", "seeds"));
