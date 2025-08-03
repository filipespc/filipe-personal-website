-- Create all tables for the portfolio application
-- Run this script in Railway's PostgreSQL console

CREATE TABLE IF NOT EXISTS "admin_users" (
	"id" varchar PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "admin_users_username_unique" UNIQUE("username")
);

CREATE TABLE IF NOT EXISTS "case_studies" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"description" text NOT NULL,
	"content" text NOT NULL,
	"featured_image" text,
	"tags" text[] DEFAULT '{}',
	"is_published" boolean DEFAULT false NOT NULL,
	"is_featured" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "case_studies_slug_unique" UNIQUE("slug")
);

CREATE TABLE IF NOT EXISTS "education" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"category" text NOT NULL,
	"link" text,
	"date" text,
	"sort_order" integer DEFAULT 0
);

CREATE TABLE IF NOT EXISTS "experiences" (
	"id" serial PRIMARY KEY NOT NULL,
	"job_title" text NOT NULL,
	"company" text NOT NULL,
	"industry" text NOT NULL,
	"start_date" text NOT NULL,
	"end_date" text,
	"is_current_job" boolean DEFAULT false NOT NULL,
	"description" text NOT NULL,
	"accomplishments" text NOT NULL,
	"tools" text[] DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS "profile" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text DEFAULT 'Your Name' NOT NULL,
	"brief_intro" text DEFAULT 'Professional with extensive experience in building scalable digital products and leading cross-functional teams across various industries. Passionate about creating innovative solutions that drive business growth.' NOT NULL,
	"education_categories" text[] DEFAULT '{"Product Management","Data Analytics","Machine Learning","AI","Software Development","Business Strategy","UX/UI Design","Marketing","Finance","Other"}',
	"tools_order" text[] DEFAULT '{}',
	"industries_order" text[] DEFAULT '{}',
	"updated_at" timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "sessions" (
	"sid" varchar PRIMARY KEY NOT NULL,
	"sess" jsonb NOT NULL,
	"expire" timestamp NOT NULL
);

CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "sessions" USING btree ("expire");