CREATE TABLE "cms_categories" (
    "id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "slug" VARCHAR(120) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "cms_categories_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "cms_tags" (
    "id" UUID NOT NULL,
    "name" VARCHAR(80) NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "cms_tags_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "cms_article_categories" (
    "article_id" UUID NOT NULL,
    "category_id" UUID NOT NULL,
    CONSTRAINT "cms_article_categories_pkey" PRIMARY KEY ("article_id", "category_id")
);

CREATE TABLE "cms_article_tags" (
    "article_id" UUID NOT NULL,
    "tag_id" UUID NOT NULL,
    CONSTRAINT "cms_article_tags_pkey" PRIMARY KEY ("article_id", "tag_id")
);

CREATE UNIQUE INDEX "cms_categories_name_key" ON "cms_categories"("name");
CREATE UNIQUE INDEX "cms_categories_slug_key" ON "cms_categories"("slug");
CREATE UNIQUE INDEX "cms_tags_name_key" ON "cms_tags"("name");
CREATE UNIQUE INDEX "cms_tags_slug_key" ON "cms_tags"("slug");
CREATE INDEX "cms_article_categories_category_id_article_id_idx" ON "cms_article_categories"("category_id", "article_id");
CREATE INDEX "cms_article_tags_tag_id_article_id_idx" ON "cms_article_tags"("tag_id", "article_id");

ALTER TABLE "cms_article_categories" ADD CONSTRAINT "cms_article_categories_article_id_fkey"
    FOREIGN KEY ("article_id") REFERENCES "cms_articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "cms_article_categories" ADD CONSTRAINT "cms_article_categories_category_id_fkey"
    FOREIGN KEY ("category_id") REFERENCES "cms_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "cms_article_tags" ADD CONSTRAINT "cms_article_tags_article_id_fkey"
    FOREIGN KEY ("article_id") REFERENCES "cms_articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "cms_article_tags" ADD CONSTRAINT "cms_article_tags_tag_id_fkey"
    FOREIGN KEY ("tag_id") REFERENCES "cms_tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;
