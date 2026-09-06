CREATE TABLE `days` (
	`id` text PRIMARY KEY NOT NULL,
	`programme_id` text NOT NULL,
	`day_no` integer NOT NULL,
	`brief` text NOT NULL,
	`structure_expected` text,
	`interaction_mode` text,
	`writing_mode` text NOT NULL,
	`target_overall` real,
	`started_at` integer,
	`completed_at` integer,
	`created_at` integer DEFAULT (cast(strftime('%s', 'now') as integer) * 1000) NOT NULL,
	FOREIGN KEY (`programme_id`) REFERENCES `programmes`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "days_number_range" CHECK(typeof("days"."day_no") = 'integer' and "days"."day_no" between 1 and 30),
	CONSTRAINT "days_writing_mode" CHECK("days"."writing_mode" in ('long', 'compression')),
	CONSTRAINT "days_target_range" CHECK("days"."target_overall" between 1 and 10)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `days_programme_number` ON `days` (`programme_id`,`day_no`);--> statement-breakpoint
CREATE TABLE `outlines` (
	`id` text PRIMARY KEY NOT NULL,
	`day_id` text NOT NULL,
	`task_id` text NOT NULL,
	`structure` text,
	`line1` text DEFAULT '' NOT NULL,
	`line2` text DEFAULT '' NOT NULL,
	`line3` text DEFAULT '' NOT NULL,
	`line4` text DEFAULT '' NOT NULL,
	`created_at` integer DEFAULT (cast(strftime('%s', 'now') as integer) * 1000) NOT NULL,
	FOREIGN KEY (`day_id`) REFERENCES `days`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`task_id`,`day_id`) REFERENCES `task_instances`(`id`,`day_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `outlines_day` ON `outlines` (`day_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `outlines_task` ON `outlines` (`task_id`);--> statement-breakpoint
CREATE TABLE `programmes` (
	`id` text PRIMARY KEY NOT NULL,
	`curriculum_version` text NOT NULL,
	`timezone` text NOT NULL,
	`created_at` integer DEFAULT (cast(strftime('%s', 'now') as integer) * 1000) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `task_instances` (
	`id` text PRIMARY KEY NOT NULL,
	`day_id` text NOT NULL,
	`ordinal` integer NOT NULL,
	`kind` text NOT NULL,
	`topic` text NOT NULL,
	`policy_version` text NOT NULL,
	`created_at` integer DEFAULT (cast(strftime('%s', 'now') as integer) * 1000) NOT NULL,
	FOREIGN KEY (`day_id`) REFERENCES `days`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "tasks_positive_ordinal" CHECK("task_instances"."ordinal" >= 1),
	CONSTRAINT "tasks_kind" CHECK("task_instances"."kind" in ('core', 'drill', 'followup'))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `tasks_id_day` ON `task_instances` (`id`,`day_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `tasks_day_ordinal` ON `task_instances` (`day_id`,`ordinal`);--> statement-breakpoint
CREATE TABLE `thinking` (
	`id` text PRIMARY KEY NOT NULL,
	`day_id` text NOT NULL,
	`task_id` text NOT NULL,
	`what` text DEFAULT '' NOT NULL,
	`why` text DEFAULT '' NOT NULL,
	`so_what` text DEFAULT '' NOT NULL,
	`my_view` text DEFAULT '' NOT NULL,
	`submitted_at` integer,
	`created_at` integer DEFAULT (cast(strftime('%s', 'now') as integer) * 1000) NOT NULL,
	FOREIGN KEY (`day_id`) REFERENCES `days`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`task_id`,`day_id`) REFERENCES `task_instances`(`id`,`day_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `thinking_day` ON `thinking` (`day_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `thinking_task` ON `thinking` (`task_id`);--> statement-breakpoint
CREATE TABLE `inputs` (
	`id` text PRIMARY KEY NOT NULL,
	`day_id` text NOT NULL,
	`source_id` text,
	`kind` text NOT NULL,
	`title` text NOT NULL,
	`url` text,
	`content_snapshot` text,
	`memory_fact` text,
	`shown_at` integer,
	`completed_at` integer,
	`created_at` integer DEFAULT (cast(strftime('%s', 'now') as integer) * 1000) NOT NULL,
	FOREIGN KEY (`day_id`) REFERENCES `days`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`source_id`) REFERENCES `sources`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "inputs_kind" CHECK("inputs"."kind" in ('article', 'video'))
);
--> statement-breakpoint
CREATE INDEX `inputs_day` ON `inputs` (`day_id`);--> statement-breakpoint
CREATE INDEX `inputs_source` ON `inputs` (`source_id`);--> statement-breakpoint
CREATE TABLE `settings` (
	`id` integer PRIMARY KEY DEFAULT 1 NOT NULL,
	`reminder_hour` integer DEFAULT 18 NOT NULL,
	`reminder_minute` integer DEFAULT 0 NOT NULL,
	`recording_quality` text DEFAULT '720p' NOT NULL,
	`gemini_model` text,
	`diary_lock_enabled` integer DEFAULT false NOT NULL,
	`privacy_acknowledged_at` integer,
	CONSTRAINT "settings_singleton" CHECK("settings"."id" = 1),
	CONSTRAINT "settings_hour" CHECK("settings"."reminder_hour" between 0 and 23),
	CONSTRAINT "settings_minute" CHECK("settings"."reminder_minute" between 0 and 59),
	CONSTRAINT "settings_lock" CHECK("settings"."diary_lock_enabled" in (0, 1))
);
--> statement-breakpoint
CREATE TABLE `sources` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`kind` text NOT NULL,
	`domain` text NOT NULL,
	`feed_url` text,
	`enabled` integer DEFAULT true NOT NULL,
	`created_at` integer DEFAULT (cast(strftime('%s', 'now') as integer) * 1000) NOT NULL,
	CONSTRAINT "sources_kind" CHECK("sources"."kind" in ('article', 'video')),
	CONSTRAINT "sources_enabled" CHECK("sources"."enabled" in (0, 1))
);
--> statement-breakpoint
CREATE TABLE `topics` (
	`id` text PRIMARY KEY NOT NULL,
	`text` text NOT NULL,
	`domain` text NOT NULL,
	`interaction_fit` text,
	`last_drawn_at` integer,
	`created_at` integer DEFAULT (cast(strftime('%s', 'now') as integer) * 1000) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `vocab` (
	`id` text PRIMARY KEY NOT NULL,
	`day_id` text NOT NULL,
	`word` text NOT NULL,
	`meaning` text,
	`example_sentence` text,
	`source_understood_at` integer,
	`writing_used_at` integer,
	`speaking_used_at` integer,
	`landed_at` integer,
	`created_at` integer DEFAULT (cast(strftime('%s', 'now') as integer) * 1000) NOT NULL,
	FOREIGN KEY (`day_id`) REFERENCES `days`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `vocab_day` ON `vocab` (`day_id`);--> statement-breakpoint
CREATE TABLE `corrections` (
	`id` text PRIMARY KEY NOT NULL,
	`day_id` text NOT NULL,
	`feedback_id` text NOT NULL,
	`priority` integer NOT NULL,
	`category` text NOT NULL,
	`at_time_s` real,
	`issue` text NOT NULL,
	`fix` text NOT NULL,
	`created_at` integer DEFAULT (cast(strftime('%s', 'now') as integer) * 1000) NOT NULL,
	FOREIGN KEY (`day_id`) REFERENCES `days`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`feedback_id`,`day_id`) REFERENCES `feedback`(`id`,`day_id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "corrections_max_three" CHECK(typeof("corrections"."priority") = 'integer' and "corrections"."priority" between 1 and 3),
	CONSTRAINT "corrections_timestamp" CHECK("corrections"."at_time_s" >= 0)
);
--> statement-breakpoint
CREATE INDEX `corrections_day` ON `corrections` (`day_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `corrections_feedback_priority` ON `corrections` (`feedback_id`,`priority`);--> statement-breakpoint
CREATE TABLE `feedback` (
	`id` text PRIMARY KEY NOT NULL,
	`day_id` text NOT NULL,
	`take_id` text NOT NULL,
	`kind` text NOT NULL,
	`model` text NOT NULL,
	`prompt_version` text NOT NULL,
	`schema_version` text NOT NULL,
	`rubric_version` text NOT NULL,
	`transcript` text,
	`overall` real,
	`structure` real,
	`clarity` real,
	`word_choice` real,
	`pace_pausing` real,
	`flow` real,
	`presence` real,
	`pace_wpm` real,
	`fillers_per_min` real,
	`result_json` text NOT NULL,
	`created_at` integer DEFAULT (cast(strftime('%s', 'now') as integer) * 1000) NOT NULL,
	FOREIGN KEY (`day_id`) REFERENCES `days`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`take_id`,`day_id`) REFERENCES `takes`(`id`,`day_id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "feedback_kind" CHECK("feedback"."kind" in ('coach', 'delta', 'followup')),
	CONSTRAINT "feedback_scores" CHECK(("feedback"."overall" is null or "feedback"."overall" between 1 and 10)
    and ("feedback"."structure" is null or "feedback"."structure" between 1 and 10)
    and ("feedback"."clarity" is null or "feedback"."clarity" between 1 and 10)
    and ("feedback"."word_choice" is null or "feedback"."word_choice" between 1 and 10)
    and ("feedback"."pace_pausing" is null or "feedback"."pace_pausing" between 1 and 10)
    and ("feedback"."flow" is null or "feedback"."flow" between 1 and 10)
    and ("feedback"."presence" is null or "feedback"."presence" between 1 and 10)),
	CONSTRAINT "feedback_rates" CHECK(("feedback"."pace_wpm" is null or "feedback"."pace_wpm" >= 0)
    and ("feedback"."fillers_per_min" is null or "feedback"."fillers_per_min" >= 0)),
	CONSTRAINT "feedback_json" CHECK(json_valid("feedback"."result_json"))
);
--> statement-breakpoint
CREATE INDEX `feedback_day` ON `feedback` (`day_id`);--> statement-breakpoint
CREATE INDEX `feedback_take` ON `feedback` (`take_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `feedback_id_day` ON `feedback` (`id`,`day_id`);--> statement-breakpoint
CREATE TABLE `followup_attempts` (
	`id` text PRIMARY KEY NOT NULL,
	`day_id` text NOT NULL,
	`task_id` text NOT NULL,
	`take_id` text NOT NULL,
	`followup_id` text NOT NULL,
	`question` text NOT NULL,
	`answer_transcript` text,
	`thinking_time_s` real,
	`self_answered` text,
	`structure_verdict` text,
	`clarity_verdict` text,
	`next_improvement` text,
	`score` real,
	`score_rubric_version` text,
	`analysis_state` text DEFAULT 'not_requested' NOT NULL,
	`feedback_id` text,
	`answered_at` integer,
	`created_at` integer DEFAULT (cast(strftime('%s', 'now') as integer) * 1000) NOT NULL,
	FOREIGN KEY (`day_id`) REFERENCES `days`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`take_id`,`day_id`,`task_id`) REFERENCES `takes`(`id`,`day_id`,`task_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`followup_id`,`day_id`) REFERENCES `followups`(`id`,`day_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`feedback_id`,`day_id`) REFERENCES `feedback`(`id`,`day_id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "followup_thinking_time" CHECK("followup_attempts"."thinking_time_s" >= 0),
	CONSTRAINT "followup_self_check" CHECK("followup_attempts"."self_answered" in ('yes', 'partly', 'no')),
	CONSTRAINT "followup_score_provenance" CHECK("followup_attempts"."score" is null or length(trim("followup_attempts"."score_rubric_version")) > 0 and "followup_attempts"."score_rubric_version" is not null),
	CONSTRAINT "followup_analysis_state" CHECK("followup_attempts"."analysis_state" in ('not_requested', 'pending', 'complete', 'failed'))
);
--> statement-breakpoint
CREATE INDEX `followup_attempts_day` ON `followup_attempts` (`day_id`);--> statement-breakpoint
CREATE INDEX `followup_attempts_parent` ON `followup_attempts` (`followup_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `followup_attempts_take` ON `followup_attempts` (`take_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `followup_attempts_id_day` ON `followup_attempts` (`id`,`day_id`);--> statement-breakpoint
CREATE TABLE `followups` (
	`id` text PRIMARY KEY NOT NULL,
	`day_id` text NOT NULL,
	`source_take_id` text NOT NULL,
	`mode` text NOT NULL,
	`question` text NOT NULL,
	`prompt_version` text NOT NULL,
	`revealed_at` integer,
	`created_at` integer DEFAULT (cast(strftime('%s', 'now') as integer) * 1000) NOT NULL,
	FOREIGN KEY (`day_id`) REFERENCES `days`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`source_take_id`,`day_id`) REFERENCES `takes`(`id`,`day_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `followups_day` ON `followups` (`day_id`);--> statement-breakpoint
CREATE INDEX `followups_source_take` ON `followups` (`source_take_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `followups_id_day` ON `followups` (`id`,`day_id`);--> statement-breakpoint
CREATE TABLE `measurements` (
	`id` text PRIMARY KEY NOT NULL,
	`day_id` text NOT NULL,
	`take_id` text NOT NULL,
	`algorithm_version` text NOT NULL,
	`result_json` text NOT NULL,
	`created_at` integer DEFAULT (cast(strftime('%s', 'now') as integer) * 1000) NOT NULL,
	FOREIGN KEY (`day_id`) REFERENCES `days`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`take_id`,`day_id`) REFERENCES `takes`(`id`,`day_id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "measurements_json" CHECK(json_valid("measurements"."result_json"))
);
--> statement-breakpoint
CREATE INDEX `measurements_day` ON `measurements` (`day_id`);--> statement-breakpoint
CREATE INDEX `measurements_take` ON `measurements` (`take_id`);--> statement-breakpoint
CREATE TABLE `takes` (
	`id` text PRIMARY KEY NOT NULL,
	`day_id` text NOT NULL,
	`task_id` text NOT NULL,
	`take_no` integer NOT NULL,
	`state` text DEFAULT 'reserved' NOT NULL,
	`file_path` text,
	`duration_s` real,
	`bytes` integer,
	`recorded_at` integer,
	`created_at` integer DEFAULT (cast(strftime('%s', 'now') as integer) * 1000) NOT NULL,
	FOREIGN KEY (`day_id`) REFERENCES `days`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`task_id`,`day_id`) REFERENCES `task_instances`(`id`,`day_id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "takes_slot_range" CHECK(typeof("takes"."take_no") = 'integer' and "takes"."take_no" between 1 and 3),
	CONSTRAINT "takes_state" CHECK("takes"."state" in ('reserved', 'recording', 'saved', 'aborted', 'failed')),
	CONSTRAINT "takes_duration" CHECK("takes"."duration_s" >= 0),
	CONSTRAINT "takes_bytes" CHECK("takes"."bytes" >= 0)
);
--> statement-breakpoint
CREATE INDEX `takes_day` ON `takes` (`day_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `takes_task_slot` ON `takes` (`task_id`,`take_no`);--> statement-breakpoint
CREATE UNIQUE INDEX `takes_id_day` ON `takes` (`id`,`day_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `takes_id_day_task` ON `takes` (`id`,`day_id`,`task_id`);--> statement-breakpoint
CREATE TABLE `essay_feedback` (
	`id` text PRIMARY KEY NOT NULL,
	`day_id` text NOT NULL,
	`essay_id` text NOT NULL,
	`model` text NOT NULL,
	`prompt_version` text NOT NULL,
	`schema_version` text NOT NULL,
	`score` real,
	`result_json` text NOT NULL,
	`created_at` integer DEFAULT (cast(strftime('%s', 'now') as integer) * 1000) NOT NULL,
	FOREIGN KEY (`day_id`) REFERENCES `days`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`essay_id`,`day_id`) REFERENCES `essays`(`id`,`day_id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "essay_feedback_score" CHECK("essay_feedback"."score" between 1 and 10),
	CONSTRAINT "essay_feedback_json" CHECK(json_valid("essay_feedback"."result_json"))
);
--> statement-breakpoint
CREATE INDEX `essay_feedback_day` ON `essay_feedback` (`day_id`);--> statement-breakpoint
CREATE INDEX `essay_feedback_essay` ON `essay_feedback` (`essay_id`);--> statement-breakpoint
CREATE TABLE `essays` (
	`id` text PRIMARY KEY NOT NULL,
	`day_id` text NOT NULL,
	`mode` text NOT NULL,
	`revision` integer DEFAULT 1 NOT NULL,
	`topic` text NOT NULL,
	`body` text DEFAULT '' NOT NULL,
	`word_count` integer DEFAULT 0 NOT NULL,
	`submitted_at` integer,
	`created_at` integer DEFAULT (cast(strftime('%s', 'now') as integer) * 1000) NOT NULL,
	FOREIGN KEY (`day_id`) REFERENCES `days`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "essays_mode" CHECK("essays"."mode" in ('long', 'compression')),
	CONSTRAINT "essays_revision" CHECK("essays"."revision" >= 1),
	CONSTRAINT "essays_word_count" CHECK("essays"."word_count" >= 0)
);
--> statement-breakpoint
CREATE INDEX `essays_day` ON `essays` (`day_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `essays_id_day` ON `essays` (`id`,`day_id`);--> statement-breakpoint
CREATE TABLE `confidence_ratings` (
	`id` text PRIMARY KEY NOT NULL,
	`day_id` text NOT NULL,
	`task_id` text NOT NULL,
	`take_id` text,
	`after_take_id` text,
	`followup_attempt_id` text,
	`before_confidence` integer,
	`after_confidence` integer,
	`after_live_q_confidence` integer,
	`before_rated_at` integer,
	`after_rated_at` integer,
	`after_live_q_rated_at` integer,
	`created_at` integer DEFAULT (cast(strftime('%s', 'now') as integer) * 1000) NOT NULL,
	`updated_at` integer,
	FOREIGN KEY (`day_id`) REFERENCES `days`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`task_id`,`day_id`) REFERENCES `task_instances`(`id`,`day_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`take_id`,`day_id`,`task_id`) REFERENCES `takes`(`id`,`day_id`,`task_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`after_take_id`,`day_id`,`task_id`) REFERENCES `takes`(`id`,`day_id`,`task_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`followup_attempt_id`,`day_id`) REFERENCES `followup_attempts`(`id`,`day_id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "confidence_before_range" CHECK("confidence_ratings"."before_confidence" is null or (typeof("confidence_ratings"."before_confidence") = 'integer' and "confidence_ratings"."before_confidence" between 1 and 5)),
	CONSTRAINT "confidence_after_range" CHECK("confidence_ratings"."after_confidence" is null or (typeof("confidence_ratings"."after_confidence") = 'integer' and "confidence_ratings"."after_confidence" between 1 and 5)),
	CONSTRAINT "confidence_live_q_range" CHECK("confidence_ratings"."after_live_q_confidence" is null or (typeof("confidence_ratings"."after_live_q_confidence") = 'integer' and "confidence_ratings"."after_live_q_confidence" between 1 and 5)),
	CONSTRAINT "confidence_before_time" CHECK(("confidence_ratings"."before_confidence" is null) = ("confidence_ratings"."before_rated_at" is null)),
	CONSTRAINT "confidence_after_time" CHECK(("confidence_ratings"."after_confidence" is null) = ("confidence_ratings"."after_rated_at" is null)),
	CONSTRAINT "confidence_live_q_time" CHECK(("confidence_ratings"."after_live_q_confidence" is null) = ("confidence_ratings"."after_live_q_rated_at" is null)),
	CONSTRAINT "confidence_after_take" CHECK("confidence_ratings"."after_confidence" is null or "confidence_ratings"."after_take_id" is not null),
	CONSTRAINT "confidence_live_q_attempt" CHECK("confidence_ratings"."after_live_q_confidence" is null or "confidence_ratings"."followup_attempt_id" is not null)
);
--> statement-breakpoint
CREATE INDEX `confidence_day` ON `confidence_ratings` (`day_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `confidence_task` ON `confidence_ratings` (`task_id`);--> statement-breakpoint
CREATE TABLE `diary` (
	`id` text PRIMARY KEY NOT NULL,
	`day_id` text NOT NULL,
	`did` text DEFAULT '' NOT NULL,
	`learned` text DEFAULT '' NOT NULL,
	`tomorrow` text DEFAULT '' NOT NULL,
	`mood` integer,
	`created_at` integer DEFAULT (cast(strftime('%s', 'now') as integer) * 1000) NOT NULL,
	FOREIGN KEY (`day_id`) REFERENCES `days`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "diary_mood" CHECK("diary"."mood" is null or (typeof("diary"."mood") = 'integer' and "diary"."mood" between 1 and 5))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `diary_day` ON `diary` (`day_id`);