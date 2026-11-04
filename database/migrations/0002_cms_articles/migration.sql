CREATE TYPE "CmsArticleStatus" AS ENUM ('DRAFT', 'PENDING_REVIEW', 'APPROVED', 'PUBLISHED', 'ARCHIVED');
CREATE TYPE "ContentAudienceType" AS ENUM ('COMPANY', 'DEPARTMENT');

CREATE TABLE "cms_articles" (
    "id" UUID NOT NULL,
    "title" VARCHAR(180) NOT NULL,
    "slug" VARCHAR(200) NOT NULL,
    "summary" VARCHAR(500) NOT NULL,
    "body" TEXT NOT NULL,
    "status" "CmsArticleStatus" NOT NULL DEFAULT 'DRAFT',
    "audience_type" "ContentAudienceType" NOT NULL DEFAULT 'COMPANY',
    "department_id" UUID,
    "author_id" UUID NOT NULL,
    "published_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cms_articles_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "cms_articles_slug_key" ON "cms_articles"("slug");
CREATE INDEX "cms_articles_status_published_at_idx" ON "cms_articles"("status", "published_at");
CREATE INDEX "cms_articles_audience_type_department_id_status_idx" ON "cms_articles"("audience_type", "department_id", "status");

ALTER TABLE "cms_articles" ADD CONSTRAINT "cms_articles_department_id_fkey"
    FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "cms_articles" ADD CONSTRAINT "cms_articles_author_id_fkey"
    FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
