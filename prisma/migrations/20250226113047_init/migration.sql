-- CreateTable
CREATE TABLE "User" (
    "Email" TEXT NOT NULL,
    "Password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "height" DOUBLE PRECISION NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "bodytype" TEXT NOT NULL,
    "traininglevel" TEXT NOT NULL,
    "goal" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("Email")
);
