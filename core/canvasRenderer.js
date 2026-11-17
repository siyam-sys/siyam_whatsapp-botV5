
import { createCanvas, loadImage } from "@napi-rs/canvas";
import { registerCanvasFonts, getCanvasFont } from "./canvasFonts.js";

export async function createCard(width, height) {
  await registerCanvasFonts();

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  return { canvas, ctx };
}

export function drawText(ctx, text, options = {}) {
  const {
    x = 0,
    y = 0,
    maxWidth = 800,
    fontSize = 30,
    minFontSize = 12,
    weight = "normal",
    color = "#ffffff",
    align = "center",
    baseline = "middle",
    font = null,
    shadow = false
  } = options;

  const value = String(text ?? "");

  ctx.save();

  let size = fontSize;
  let selectedFont = font || getCanvasFont(size, weight);

  ctx.textAlign = align;
  ctx.textBaseline = baseline;

  while (size > minFontSize) {
    selectedFont = font || getCanvasFont(size, weight);
    ctx.font = selectedFont;

    if (ctx.measureText(value).width <= maxWidth) break;

    size -= 1;
  }

  ctx.font = font || getCanvasFont(size, weight);
  ctx.fillStyle = color;

  if (shadow) {
    ctx.shadowColor = "rgba(0,0,0,0.8)";
    ctx.shadowBlur = 8;
  }

  ctx.fillText(value, x, y, maxWidth);

  ctx.restore();
}

export function drawWrappedText(ctx, text, options = {}) {
  const {
    x = 0,
    y = 0,
    maxWidth = 800,
    lineHeight = 40,
    maxLines = 3,
    fontSize = 30,
    weight = "normal",
    color = "#ffffff",
    align = "center"
  } = options;

  ctx.save();

  ctx.font = getCanvasFont(fontSize, weight);
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = "middle";

  const words = String(text ?? "").split(/\s+/);
  const lines = [];
  let line = "";

  for (const word of words) {
    const test = line ? `${line} ${word}` : word;

    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }

  if (line) lines.push(line);

  const visibleLines = lines.slice(0, maxLines);

  if (lines.length > maxLines) {
    visibleLines[maxLines - 1] += "...";
  }

  visibleLines.forEach((item, index) => {
    ctx.fillText(
      item,
      x,
      y + index * lineHeight,
      maxWidth
    );
  });

  ctx.restore();
  return visibleLines.length;
}

export async function drawImage(ctx, source, x, y, width, height) {
  try {
    const image = typeof source === "string"
      ? await loadImage(source)
      : source;

    if (!image) return false;

    ctx.drawImage(image, x, y, width, height);
    return true;
  } catch (error) {
    console.error("[CANVAS IMAGE]", error.message);
    return false;
  }
}

export function exportPNG(canvas) {
  if (!canvas || typeof canvas.toBuffer !== "function") {
    throw new Error("Invalid Canvas instance");
  }

  const buffer = canvas.toBuffer("image/png");

  if (!buffer || !buffer.length) {
    throw new Error("Canvas PNG generation failed");
  }

  return buffer;
    }
    
