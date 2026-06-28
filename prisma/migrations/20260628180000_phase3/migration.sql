-- LinkFolder
CREATE TABLE "LinkFolder" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#2563eb',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "LinkFolder_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "LinkFolder_userId_idx" ON "LinkFolder"("userId");

-- TeamInvite
CREATE TABLE "TeamInvite" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'editor',
    "token" TEXT NOT NULL,
    "acceptedAt" TIMESTAMP(3),
    "memberId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TeamInvite_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "TeamInvite_token_key" ON "TeamInvite"("token");
CREATE UNIQUE INDEX "TeamInvite_ownerId_email_key" ON "TeamInvite"("ownerId", "email");
CREATE INDEX "TeamInvite_ownerId_idx" ON "TeamInvite"("ownerId");
CREATE INDEX "TeamInvite_memberId_idx" ON "TeamInvite"("memberId");

-- Link Phase 3 fields
ALTER TABLE "Link" ADD COLUMN "folderId" TEXT;
ALTER TABLE "Link" ADD COLUMN "startsAt" TIMESTAMP(3);
ALTER TABLE "Link" ADD COLUMN "abVariants" JSONB;

CREATE INDEX "Link_folderId_idx" ON "Link"("folderId");

-- Click A/B variant tracking
ALTER TABLE "Click" ADD COLUMN "variantIndex" INTEGER;

-- Foreign keys
ALTER TABLE "LinkFolder" ADD CONSTRAINT "LinkFolder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TeamInvite" ADD CONSTRAINT "TeamInvite_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TeamInvite" ADD CONSTRAINT "TeamInvite_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Link" ADD CONSTRAINT "Link_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "LinkFolder"("id") ON DELETE SET NULL ON UPDATE CASCADE;