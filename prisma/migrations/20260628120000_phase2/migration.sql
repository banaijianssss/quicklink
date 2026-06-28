-- CustomDomain
CREATE TABLE "CustomDomain" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "hostname" TEXT NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "verificationToken" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "CustomDomain_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CustomDomain_hostname_key" ON "CustomDomain"("hostname");
CREATE INDEX "CustomDomain_userId_idx" ON "CustomDomain"("userId");

-- BioPage
CREATE TABLE "BioPage" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT,
    "bio" TEXT,
    "avatarUrl" TEXT,
    "theme" TEXT NOT NULL DEFAULT 'default',
    "links" JSONB NOT NULL DEFAULT '[]',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "BioPage_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "BioPage_slug_key" ON "BioPage"("slug");
CREATE INDEX "BioPage_userId_idx" ON "BioPage"("userId");

-- BioView
CREATE TABLE "BioView" (
    "id" TEXT NOT NULL,
    "bioPageId" TEXT NOT NULL,
    "country" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BioView_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "BioView_bioPageId_idx" ON "BioView"("bioPageId");

-- Webhook
CREATE TABLE "Webhook" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "secret" TEXT NOT NULL,
    "events" TEXT[] DEFAULT ARRAY['click']::TEXT[],
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Webhook_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Webhook_userId_idx" ON "Webhook"("userId");

-- Link targeting + domain
ALTER TABLE "Link" ADD COLUMN "iosDestination" TEXT;
ALTER TABLE "Link" ADD COLUMN "androidDestination" TEXT;
ALTER TABLE "Link" ADD COLUMN "geoRules" JSONB;
ALTER TABLE "Link" ADD COLUMN "deviceRules" JSONB;
ALTER TABLE "Link" ADD COLUMN "domainId" TEXT;

CREATE INDEX "Link_domainId_idx" ON "Link"("domainId");

-- Foreign keys
ALTER TABLE "CustomDomain" ADD CONSTRAINT "CustomDomain_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BioPage" ADD CONSTRAINT "BioPage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BioView" ADD CONSTRAINT "BioView_bioPageId_fkey" FOREIGN KEY ("bioPageId") REFERENCES "BioPage"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Webhook" ADD CONSTRAINT "Webhook_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Link" ADD CONSTRAINT "Link_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "CustomDomain"("id") ON DELETE SET NULL ON UPDATE CASCADE;