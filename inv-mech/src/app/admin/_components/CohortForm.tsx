"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { CohortOut } from "@/lib/api";
import { ThumbnailInput } from "@/components/ThumbnailInput";

type FormErrors = {
  title?: string;
  seat_limit?: string;
  date_range?: string;
  thumbnail_url?: string;
};

export type CohortPayload = {
  title: string;
  description: string | null;
  price: string | null;
  early_bird_price: string | null;
  early_bird_deadline: string | null;
  seat_limit: number | null;
  start_date: string | null;
  end_date: string | null;
  status: "open" | "closed" | "completed";
  thumbnail_url: string | null;
  target_exam: "jee" | "neet" | null;
  target_year: number | null;
};

export function CohortForm({
  initial,
  submitLabel,
  onSubmit,
  successRedirect = "/admin/cohorts",
}: {
  initial?: CohortOut;
  submitLabel: string;
  onSubmit: (payload: CohortPayload) => Promise<void>;
  successRedirect?: string;
}) {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  function validate(form: FormData): FormErrors {
    const errs: FormErrors = {};
    const title = String(form.get("title") ?? "").trim();
    if (!title) errs.title = "Title is required.";

    const seatLimitRaw = String(form.get("seat_limit") ?? "").trim();
    if (seatLimitRaw && (!Number.isFinite(Number(seatLimitRaw)) || Number(seatLimitRaw) < 1)) {
      errs.seat_limit = "Seat limit must be a positive number.";
    }

    const startRaw = String(form.get("start_date") ?? "");
    const endRaw = String(form.get("end_date") ?? "");
    if (startRaw && endRaw && new Date(endRaw).getTime() < new Date(startRaw).getTime()) {
      errs.date_range = "End date must be on or after start date.";
    }

    const thumb = String(form.get("thumbnail_url") ?? "").trim();
    if (thumb && !/^https?:\/\//i.test(thumb)) {
      errs.thumbnail_url = "Thumbnail must be an http(s) URL.";
    }

    return errs;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitError(null);
    const form = new FormData(e.currentTarget);
    const validationErrors = validate(form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setSubmitting(true);
    try {
      const seatLimit = String(form.get("seat_limit") ?? "").trim();
      const price = String(form.get("price") ?? "").trim();
      const earlyBird = String(form.get("early_bird_price") ?? "").trim();
      const earlyBirdDeadline = String(form.get("early_bird_deadline") ?? "").trim();
      const startDate = String(form.get("start_date") ?? "").trim();
      const endDate = String(form.get("end_date") ?? "").trim();
      const thumbRaw = String(form.get("thumbnail_url") ?? "").trim();
      const targetExamRaw = String(form.get("target_exam") ?? "").trim();
      const targetYearRaw = String(form.get("target_year") ?? "").trim();

      const payload: CohortPayload = {
        title: String(form.get("title")),
        description: String(form.get("description") ?? "") || null,
        price: price || null,
        early_bird_price: earlyBird || null,
        early_bird_deadline: earlyBirdDeadline
          ? new Date(earlyBirdDeadline).toISOString()
          : null,
        seat_limit: seatLimit ? Number(seatLimit) : null,
        start_date: startDate || null,
        end_date: endDate || null,
        status: (form.get("status") as CohortPayload["status"]) || "open",
        thumbnail_url: thumbRaw || null,
        target_exam: (targetExamRaw as "jee" | "neet") || null,
        target_year: targetYearRaw ? Number(targetYearRaw) : null,
      };
      await onSubmit(payload);
      router.push(successRedirect);
      router.refresh();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Could not save cohort.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <Field
        name="title"
        label="Title"
        required
        defaultValue={initial?.title}
        error={errors.title}
      />
      <Field
        name="description"
        label="Description"
        textarea
        defaultValue={initial?.description ?? ""}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Select name="target_exam" label="Target exam" defaultValue={initial?.target_exam ?? ""}>
          <option value="">—</option>
          <option value="jee">JEE</option>
          <option value="neet">NEET</option>
        </Select>
        <Select
          name="target_year"
          label="Target year"
          defaultValue={initial?.target_year ? String(initial.target_year) : ""}
        >
          <option value="">—</option>
          <option value="2027">2027</option>
          <option value="2028">2028</option>
          <option value="2029">2029</option>
        </Select>
      </div>

      <div className="space-y-1 text-sm">
        <span className="text-black/70">Thumbnail</span>
        <ThumbnailInput name="thumbnail_url" defaultValue={initial?.thumbnail_url ?? ""} />
        {errors.thumbnail_url && (
          <span className="text-xs text-red-600">{errors.thumbnail_url}</span>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          name="start_date"
          label="Start date"
          type="date"
          defaultValue={initial?.start_date ?? ""}
        />
        <Field
          name="end_date"
          label="End date"
          type="date"
          defaultValue={initial?.end_date ?? ""}
          error={errors.date_range}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          name="price"
          label="Price (₹)"
          type="number"
          step="0.01"
          min={0}
          defaultValue={initial?.price ?? ""}
        />
        <Field
          name="seat_limit"
          label="Seat limit"
          type="number"
          min={1}
          defaultValue={initial?.seat_limit ? String(initial.seat_limit) : ""}
          error={errors.seat_limit}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          name="early_bird_price"
          label="Early-bird price (₹)"
          type="number"
          step="0.01"
          min={0}
          defaultValue={initial?.early_bird_price ?? ""}
        />
        <Field
          name="early_bird_deadline"
          label="Early-bird deadline"
          type="datetime-local"
          defaultValue={initial?.early_bird_deadline ? toDatetimeLocal(initial.early_bird_deadline) : ""}
        />
      </div>

      <Select name="status" label="Status" defaultValue={initial?.status ?? "open"}>
        <option value="open">Open</option>
        <option value="closed">Closed</option>
        <option value="completed">Completed</option>
      </Select>

      <button disabled={submitting} className="btn-primary px-5 py-2">
        {submitting ? "Saving…" : submitLabel}
      </button>
      {submitError && <p className="text-sm text-red-600">{submitError}</p>}
    </form>
  );
}

function toDatetimeLocal(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`;
}

function Field({
  name,
  label,
  textarea,
  error,
  ...rest
}: {
  name: string;
  label: string;
  textarea?: boolean;
  error?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block space-y-1 text-sm">
      <span className="text-ink/70">{label}</span>
      {textarea ? (
        <textarea
          name={name}
          defaultValue={rest.defaultValue as string | undefined}
          className={`field-input min-h-24 ${error ? "border-red-400" : ""}`}
        />
      ) : (
        <input
          name={name}
          {...rest}
          className={`field-input ${error ? "border-red-400" : ""}`}
        />
      )}
      {error && <span className="text-xs text-red-600">{error}</span>}
    </label>
  );
}

function Select({
  name,
  label,
  children,
  defaultValue,
}: {
  name: string;
  label: string;
  children: React.ReactNode;
  defaultValue?: string;
}) {
  return (
    <label className="block space-y-1 text-sm">
      <span className="text-ink/70">{label}</span>
      <select name={name} defaultValue={defaultValue} className="field-input">
        {children}
      </select>
    </label>
  );
}
