import { PrismaClient } from "@/app/generated/prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.user.create({
    data: {
      name: "Aditya",
      email: "aditya@example.com",
      password: "password123",
    },
  });

  await prisma.user.create({
    data: {
      name: "Bholanath",
      email: "bhola@example.com",
      password: "password123",
    },
  });
}

main();
