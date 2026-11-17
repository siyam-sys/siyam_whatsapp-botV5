
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";
import { GlobalFonts } from "@napi-rs/canvas";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FONT_DIR = path.join(__dirname, "..", "assets", "fonts");

let registered = false;

export async function registerCanvasFonts() {
  if (registered) return;

  await fs.ensureDir(FONT_DIR);

  const fonts = [
    "NotoSansBengali-Regular.ttf",
    "NotoSansBengali-Bold.ttf"
  ];

  for (const file of fonts) {
    const fontPath = path.join(FONT_DIR, file);

    if (!(await fs.pathExists(fontPath))) {
      console.warn(`[CANVAS FONT] Missing: ${file}`);
      continue;
    }

    try {
      GlobalFonts.registerFromPath(fontPath, "Noto Bengali");
      console.log(`[CANVAS FONT] Loaded: ${file}`);
    } catch (error) {
      console.error(`[CANVAS FONT] ${file}:`, error.message);
    }
  }

  registered = true;
}

export function getCanvasFont(size = 30, weight = "normal") {
  return `${weight} ${size}px "Noto Bengali", Arial, sans-serif`;
  }
