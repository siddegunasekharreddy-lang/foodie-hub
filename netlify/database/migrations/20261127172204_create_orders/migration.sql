CREATE TABLE "orders" (
	"order_id" text PRIMARY KEY,
	"customer" jsonb NOT NULL,
	"items" jsonb NOT NULL,
	"bill" jsonb NOT NULL,
	"status" text NOT NULL,
	"created_at" timestamp with time zone NOT NULL
);
