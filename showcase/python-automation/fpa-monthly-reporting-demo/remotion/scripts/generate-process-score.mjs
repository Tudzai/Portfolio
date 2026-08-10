import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";

const sampleRate = 48000;
const durationSeconds = 82;
const samples = sampleRate * durationSeconds;
const dataSize = samples * 2;
const buffer = Buffer.alloc(44 + dataSize);

buffer.write("RIFF", 0);
buffer.writeUInt32LE(36 + dataSize, 4);
buffer.write("WAVE", 8);
buffer.write("fmt ", 12);
buffer.writeUInt32LE(16, 16);
buffer.writeUInt16LE(1, 20);
buffer.writeUInt16LE(1, 22);
buffer.writeUInt32LE(sampleRate, 24);
buffer.writeUInt32LE(sampleRate * 2, 28);
buffer.writeUInt16LE(2, 32);
buffer.writeUInt16LE(16, 34);
buffer.write("data", 36);
buffer.writeUInt32LE(dataSize, 40);

const smooth = (value) => value * value * (3 - 2 * value);
const clamp01 = (value) => Math.max(0, Math.min(1, value));

for (let index = 0; index < samples; index += 1) {
  const time = index / sampleRate;
  const fadeIn = smooth(clamp01(time / 2.4));
  const fadeOut = smooth(clamp01((durationSeconds - time) / 3.2));
  const pulse = Math.pow(Math.max(0, Math.sin(Math.PI * 2 * 1.2 * time)), 7);
  const sceneLift = 0.72 + 0.28 * Math.sin(Math.PI * 2 * time / 15);
  const bed =
    Math.sin(Math.PI * 2 * 55 * time) * 0.32 +
    Math.sin(Math.PI * 2 * 82.5 * time) * 0.2 +
    Math.sin(Math.PI * 2 * 110 * time) * 0.12;
  const shimmer =
    Math.sin(Math.PI * 2 * 440 * time) * 0.035 +
    Math.sin(Math.PI * 2 * 660 * time) * 0.02;
  const signal =
    (bed * (0.16 + pulse * 0.18) + shimmer * pulse) *
    fadeIn *
    fadeOut *
    sceneLift;
  buffer.writeInt16LE(
    Math.round(Math.max(-1, Math.min(1, signal)) * 32767),
    44 + index * 2,
  );
}

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const outputPath = path.resolve(
  currentDirectory,
  "../../assets/remotion-sfx/process-score.wav",
);
fs.mkdirSync(path.dirname(outputPath), {recursive: true});
fs.writeFileSync(outputPath, buffer);
console.log(`Generated ${outputPath}`);
