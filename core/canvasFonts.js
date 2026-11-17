
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";
import { GlobalFonts } from "@napi-rs/canvas";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FONT_DIR = path.join(__dirname, "..", "assets", "fonts");

let registered = false;

export async function registerCanvasFonts() {
  if (registered) return true;

  await fs.ensureDir(FONT_DIR);

  const fonts = [
    {
      file: "NotoSansBengali-Regular.ttf",
      family: "Noto Bengali"
    },
    {
      file: "NotoSansBengali-Bold.ttf",
      family: "Noto Bengali"
    }
  ];

  for (const font of fonts) {
    const fontPath = path.join(FONT_DIR, font.file);

    if (await fs.pathExists(fontPath)) {
      try {
        GlobalFonts.registerFromPath(fontPath, font.family);
      } catch (error) {
        console.error("[CANVAS FONT]", error.message);
      }
    }
  }

  registered = true;
  return true;
}

export function getCanvasFont(size = 30, weight = "normal") {
  return `${weight} ${size}px "Noto Bengali", Arial, sans-serif`;
}
