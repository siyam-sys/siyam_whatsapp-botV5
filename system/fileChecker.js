// AUTHOR: 𝐑𝐉 𝐬𝐢𝐲𝐚𝐦

import fs from "fs-extra";
import path from "path";

import { CONFIG, AUTHOR } from "../config.js";

const SOURCE_DIRS = [
  "core",
  "database",
  "system",
  "scripts"
];

const ROOT_FILES = [
  "index.js",
  "config.js",
  "configCommands.js"
];

const IGNORED_DIRS = [
  "node_modules",
  "session",
  "data",
  ".git"
];

async function scanDirectory(directory, results = []) {
  if (!(await fs.pathExists(directory))) {
    return results;
  }

  const entries = await fs.readdir(directory, {
    withFileTypes: true
  });

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      if (IGNORED_DIRS.includes(entry.name)) {
        continue;
      }

      await scanDirectory(fullPath, results);
    } else if (
      entry.isFile() &&
      entry.name.endsWith(".js")
    ) {
      results.push(fullPath);
    }
  }

  return results;
}

export async function checkFiles() {
  const files = [];

  for (const dir of SOURCE_DIRS) {
    await scanDirectory(
      path.join(CONFIG.ROOT_DIR, dir),
      files
    );
  }

  for (const file of ROOT_FILES) {
    const fullPath = path.join(CONFIG.ROOT_DIR, file);

    if (await fs.pathExists(fullPath)) {
      files.push(fullPath);
    }
  }

  const uniqueFiles = [...new Set(files)];
  const results = [];

  for (const file of uniqueFiles) {
    try {
      const source = await fs.readFile(file, "utf8");

      const valid = source.includes(`AUTHOR: ${AUTHOR}`);

      results.push({
        file: path.relative(CONFIG.ROOT_DIR, file),
        valid,
        author: AUTHOR
      });
    } catch (error) {
      results.push({
        file: path.relative(CONFIG.ROOT_DIR, file),
        valid: false,
        error: error.message
      });
    }
  }

  return {
    total: results.length,
    valid: results.filter(item => item.valid).length,
    invalid: results.filter(item => !item.valid),
    results
  };
}

export default {
  checkFiles
};
