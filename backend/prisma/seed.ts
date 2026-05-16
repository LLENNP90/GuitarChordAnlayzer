import "dotenv/config";
import bcrypt from "bcrypt";
import { PrismaClient } from "../generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

type SavedSeed = {
  userId: string;
  savedType: "chord" | "scale" | "progression";
  name: string;
  key: string;
  mode: string;
  notes: string[];
  chord: string[];
  voicingIndex?: number | null;
};

function getSavedFingerprint(saved: SavedSeed) {
  return JSON.stringify({
    key: saved.key,
    mode: saved.mode,
    notes: [...saved.notes].sort(),
    chord: saved.chord,
    voicingIndex: saved.voicingIndex ?? null,
  });
}

function withFingerprint(saved: SavedSeed) {
  return {
    ...saved,
    voicingIndex: saved.voicingIndex ?? null,
    fingerprint: getSavedFingerprint(saved),
  };
}

async function main() {
  const passwordHash = await bcrypt.hash("password123", 10);

  const user = await prisma.user.upsert({
    where: { email: "demo@guitar.dev" },
    update: {},
    create: {
      username: "demo_player",
      email: "demo@guitar.dev",
      passwordHash,
      name: "Demo Player",
    },
  });

  await prisma.saved.deleteMany({
    where: { userId: user.id },
  });

  await prisma.saved.createMany({
    data: [
      withFingerprint({
        userId: user.id,
        savedType: "chord",
        name: "E minor 7",
        key: "E",
        mode: "minor7",
        notes: ["E", "G", "B", "D"],
        chord: ["E minor7"],
        voicingIndex: 3,
      }),
      withFingerprint({
        userId: user.id,
        savedType: "chord",
        name: "C major 7",
        key: "C",
        mode: "major7",
        notes: ["C", "E", "G", "B"],
        chord: ["C major7"],
        voicingIndex: 0,
      }),
      withFingerprint({
        userId: user.id,
        savedType: "scale",
        name: "A minor pentatonic",
        key: "A",
        mode: "Minor Pentatonic",
        notes: ["A", "C", "D", "E", "G"],
        chord: [],
      }),
      withFingerprint({
        userId: user.id,
        savedType: "scale",
        name: "G major scale",
        key: "G",
        mode: "Major",
        notes: ["G", "A", "B", "C", "D", "E", "F#"],
        chord: [],
      }),
      withFingerprint({
        userId: user.id,
        savedType: "progression",
        name: "Pop progression in C",
        key: "C",
        mode: "Major",
        notes: [],
        chord: ["C major", "G major", "A minor", "F major"],
      }),
      withFingerprint({
        userId: user.id,
        savedType: "progression",
        name: "Minor verse idea",
        key: "A",
        mode: "Minor",
        notes: [],
        chord: ["A minor", "F major", "C major", "G major"],
      }),
    ],
  });

  console.log("Seed data created.");
  console.log("Login email: demo@guitar.dev");
  console.log("Login password: password123");
//   console.log({
//     users:
//   })


}

main()
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  })
  .finally(async() => {
    await prisma.$disconnect();
  });
