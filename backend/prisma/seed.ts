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
      {
        userId: user.id,
        savedType: "chord",
        name: "E minor 7",
        key: "E",
        mode: "minor",
        notes: ["E", "G", "B", "D"],
        chord: [],
        voicingIndex: 3
      },
      {
        userId: user.id,
        savedType: "chord",
        name: "C major 7",
        key: "C",
        mode: "major",
        notes: ["C", "E", "G", "B"],
        chord: [],
        voicingIndex: 0
      },
      {
        userId: user.id,
        savedType: "scale",
        name: "A minor pentatonic",
        key: "A",
        mode: "minor",
        notes: ["A", "C", "D", "E", "G"],
        chord: [],
      },
      {
        userId: user.id,
        savedType: "scale",
        name: "G major scale",
        key: "G",
        mode: "major",
        notes: ["G", "A", "B", "C", "D", "E", "F#"],
        chord: [],
      },
      {
        userId: user.id,
        savedType: "progression",
        name: "Pop progression in C",
        key: "C",
        mode: "major",
        notes: [],
        chord: ["C", "G", "Am", "F"],
      },
      {
        userId: user.id,
        savedType: "progression",
        name: "Minor verse idea",
        key: "A",
        mode: "minor",
        notes: [],
        chord: ["Am", "F", "C", "G"],
      },
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
