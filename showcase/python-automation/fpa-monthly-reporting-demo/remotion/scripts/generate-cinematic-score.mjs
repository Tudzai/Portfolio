import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";

const sampleRate = 48000;
const duration = 46.1;
const sampleCount = Math.ceil(sampleRate * duration);
const outputPath = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../assets/remotion-sfx/cinematic-score.wav",
);

const transitions = [4.6, 10.7, 17.8, 24.9, 33.1, 39.7];
const chords = [
  [73.42, 110.0, 146.83],
  [65.41, 98.0, 130.81],
  [58.27, 87.31, 116.54],
  [65.41, 98.0, 146.83],
  [73.42, 110.0, 174.61],
  [65.41, 98.0, 164.81],
  [73.42, 110.0, 146.83],
];
const arpeggio = [293.66, 349.23, 440.0, 523.25, 440.0, 349.23, 329.63, 392.0];

const hashNoise = (sample) => {
  let value = (sample + 1) * 1664525 + 1013904223;
  value ^= value >>> 16;
  value = Math.imul(value, 2246822519);
  value ^= value >>> 13;
  return ((value >>> 0) / 4294967295) * 2 - 1;
};

const softClip = (value) => Math.tanh(value * 1.35) / 1.12;
const buffer = Buffer.alloc(44 + sampleCount * 2);

buffer.write("RIFF", 0);
buffer.writeUInt32LE(36 + sampleCount * 2, 4);
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
buffer.writeUInt32LE(sampleCount * 2, 40);

for (let sample = 0; sample < sampleCount; sample++) {
  const time = sample / sampleRate;
  const scene = Math.min(chords.length - 1, Math.floor(time / 6.6));
  const chord = chords[scene];
  const scenePhase = (time % 6.6) / 6.6;
  const intensity = 0.58 + scene * 0.045;

  const pad =
    Math.sin(Math.PI * 2 * chord[0] * time) * 0.18 +
    Math.sin(Math.PI * 2 * chord[1] * time + 0.7) * 0.11 +
    Math.sin(Math.PI * 2 * chord[2] * time + 1.4) * 0.07 +
    Math.sin(Math.PI * 2 * chord[0] * 0.5 * time) * 0.13;

  const pulsePhase = time % 0.5;
  const kickFrequency = 43 + 38 * Math.exp(-pulsePhase * 18);
  const kick =
    Math.sin(Math.PI * 2 * kickFrequency * pulsePhase) *
    Math.exp(-pulsePhase * 13) *
    0.42;

  const arpStep = Math.floor(time / 0.25);
  const arpPhase = time % 0.25;
  const arpFrequency = arpeggio[arpStep % arpeggio.length];
  const arp =
    (Math.sin(Math.PI * 2 * arpFrequency * arpPhase) * 0.65 +
      Math.sin(Math.PI * 4 * arpFrequency * arpPhase) * 0.22) *
    Math.exp(-arpPhase * 13) *
    (0.09 + scene * 0.008);

  const texture =
    Math.sin(Math.PI * 2 * 0.075 * time) *
    Math.sin(Math.PI * 2 * 208.0 * time) *
    0.025;

  let transitionEnergy = 0;
  for (const transition of transitions) {
    const before = transition - time;
    if (before >= 0 && before < 1.15) {
      const progress = 1 - before / 1.15;
      transitionEnergy +=
        hashNoise(sample) *
        progress *
        progress *
        0.12 *
        Math.sin(Math.PI * progress);
    }
    const after = time - transition;
    if (after >= 0 && after < 0.7) {
      transitionEnergy +=
        Math.sin(Math.PI * 2 * (48 - after * 22) * after) *
        Math.exp(-after * 8) *
        0.48;
    }
  }

  const decisionDip =
    time >= 25 && time <= 28.2 ? 0.58 + ((time - 25) / 3.2) * 0.42 : 1;
  const opening = Math.min(1, time / 1.3);
  const ending = Math.min(1, Math.max(0, (duration - time) / 2.2));
  const breathing = 0.88 + Math.sin(Math.PI * scenePhase) * 0.12;

  const mixed =
    (pad * breathing + kick + arp + texture + transitionEnergy) *
    intensity *
    decisionDip *
    opening *
    ending;
  const pcm = Math.round(
    Math.max(-1, Math.min(1, softClip(mixed))) * 32767,
  );
  buffer.writeInt16LE(pcm, 44 + sample * 2);
}

fs.mkdirSync(path.dirname(outputPath), {recursive: true});
fs.writeFileSync(outputPath, buffer);
console.log(`Created ${outputPath} (${duration.toFixed(1)}s, mono PCM).`);
