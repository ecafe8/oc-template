import { index, jsonb, pgEnum, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { sites } from "./sites";

export const auditTaskStatusEnum = pgEnum("audit_task_status", [
  "pending",
  "running",
  "completed",
  "failed",
  "cancelled",
]);

/**
 * Tracks the lifecycle of an async audit task.
 * Created on POST /audit/start; updated by the worker.
 */
export const auditTasks = pgTable(
  "audit_tasks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    siteId: uuid("site_id").references(() => sites.id, { onDelete: "set null" }),
    /** The target URL for this specific audit run. */
    url: varchar("url", { length: 2048 }).notNull(),
    status: auditTaskStatusEnum("status").notNull().default("pending"),
    /** 0-100 overall progress percentage */
    progress: text("progress").notNull().default("0"),
    /** Human-readable current step description */
    currentStep: varchar("current_step", { length: 255 }),
    /** Error details if status=failed */
    errorMessage: text("error_message"),
    /** ID of the resulting audit_results row (set when completed) */
    resultId: uuid("result_id"),
    startedAt: timestamp("started_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("idx_audit_tasks_status").on(t.status),
    index("idx_audit_tasks_site_id").on(t.siteId),
    index("idx_audit_tasks_created_at").on(t.createdAt),
  ],
);
