"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ClassOut, CohortOut } from "@/lib/api";
import { ThumbnailInput } from "@/components/ThumbnailInput";

type FormErrors = {
  title?: string;
  scheduled_start?: string;
  duration_min?: string;
  thumbnail_url?: string;
  price_single?: string;
  cohort_id?: string;
};

type ClassPayload = {
  title: string;
  description: string | null;
  subject: string | null;
  topic: string | null;
  scheduled_start: string;
  duration_min: number;
  access_type: "free" | "paid";
  price_single: number | null;
  cohort_id: string;
  thumbnail_url: string | null;
  target_exam: "jee" | "neet" | null;
  target_year: number | null;
};

/** Convert UTC ISO from API into the local datetime-local input format. */
function isoToDatetimeLocal(iso: string | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`;
}

export function ClassForm({
  initial,
  submitLabel,
  onSubmit,
  successRedirect = "/admin",
  cohorts = [],
  initialCohortId,
}: {
  initial?: ClassOut;
  submitLabel: string;
  onSubmit: (payload: ClassPayload) => Promise<void>;
  successRedirect?: string;
  cohorts?: CohortOut[];
  initialCohortId?: string;
}) {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [accessType, setAccessType] = useState<"free" | "paid">(
    initial?.access_type ?? "free",
  );
  const isCreate = !initial;

  function validate(form: FormData): FormErrors {
    const errs: FormErrors = {};
    const title = String(form.get("title") ?? "").trim();
    if (!title) errs.title = "Title is required.";

    const cohortRaw = String(form.get("cohort_id") ?? "").trim();
    if (!cohortRaw) errs.cohort_id = "Pick a cohort.";

    const startRaw = String(form.get("scheduled_start") ?? "");
    if (!startRaw) {
      errs.scheduled_start = "Scheduled start is required.";
    } else {
      const start = new Date(startRaw);
      if (Number.isNaN(start.getTime())) {
        errs.scheduled_start = "Not a valid date.";
      } else if (isCreate && start.getTime() < Date.now()) {
        errs.scheduled_start = "Start time must be in the future.";
      }
    }

    const duration = Number(form.get("duration_min") ?? 60);
    if (!Number.isFinite(duration) || duration < 15 || duration > 240) {
      errs.duration_min = "Duration must be between 15 and 240 minutes.";
    }

    const thumb = String(form.get("thumbnail_url") ?? "").trim();
    if (thumb && !/^https?:\/\//i.test(thumb)) {
      errs.thumbnail_url = "Thumbnail must be an http(s) URL.";
    }

    if (form.get("access_type") === "paid") {
      const price = Number(form.get("price_single") ?? "");
      if (!Number.isFinite(price) || price <= 0) {
        errs.price_single = "Set a price (greater than 0) for paid lectures.";
      }
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
      const targetYearRaw = String(form.get("target_year") ?? "");
      const targetExamRaw = String(form.get("target_exam") ?? "");
      const thumbRaw = String(form.get("thumbnail_url") ?? "").trim();
      const cohortRaw = String(form.get("cohort_id") ?? "").trim();
      const access = (form.get("access_type") as "free" | "paid") || "free";
      const priceRaw = String(form.get("price_single") ?? "").trim();
      const payload: ClassPayload = {
        title: String(form.get("title")),
        description: String(form.get("description") ?? "") || null,
        subject: String(form.get("subject") ?? "") || null,
        topic: String(form.get("topic") ?? "") || null,
        scheduled_start: new Date(String(form.get("scheduled_start"))).toISOString(),
        duration_min: Number(form.get("duration_min") || 60),
        access_type: access,
        price_single: access === "paid" && priceRaw ? Number(priceRaw) : null,
        cohort_id: cohortRaw,
        thumbnail_url: thumbRaw || null,
        target_exam: (targetExamRaw as "jee" | "neet") || null,
        target_year: targetYearRaw ? Number(targetYearRaw) : null,
      };
      await onSubmit(payload);
      router.push(successRedirect);
      router.refresh();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Could not save lecture.");
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
        name="topic"
        label="Topic"
        placeholder="Kinematics, Optics, …"
        defaultValue={initial?.topic ?? ""}
      />
      <Field
        name="subject"
        label="Subject"
        placeholder="physics"
        defaultValue={initial?.subject ?? "physics"}
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

      <Field
        name="scheduled_start"
        label="Scheduled start"
        type="datetime-local"
        required
        defaultValue={isoToDatetimeLocal(initial?.scheduled_start)}
        error={errors.scheduled_start}
      />
      <Field
        name="duration_min"
        label="Duration (minutes)"
        type="number"
        defaultValue={String(initial?.duration_min ?? 60)}
        min={15}
        max={240}
        error={errors.duration_min}
      />

      <Select
        name="access_type"
        label="Access"
        value={accessType}
        onChange={(e) => setAccessType(e.target.value as "free" | "paid")}
      >
        <option value="free">Free</option>
        <option value="paid">Paid (requires entitlement)</option>
      </Select>

      {accessType === "paid" && (
        <Field
          name="price_single"
          label="Price (₹)"
          type="number"
          min={1}
          step="0.01"
          placeholder="499"
          defaultValue={initial?.price_single ?? ""}
          error={errors.price_single}
        />
      )}

      <Select
        name="cohort_id"
        label="Cohort"
        defaultValue={initial?.cohort_id ?? initialCohortId ?? ""}
      >
        <option value="" disabled>
          — Choose a cohort —
        </option>
        {cohorts.map((c) => (
          <option key={c.id} value={c.id}>
            {c.title}
          </option>
        ))}
      </Select>
      {errors.cohort_id && (
        <p className="-mt-3 text-xs text-red-600">{errors.cohort_id}</p>
      )}

      <button disabled={submitting} className="btn-primary px-5 py-2">
        {submitting ? "Saving…" : submitLabel}
      </button>
      {submitError && <p className="text-sm text-red-600">{submitError}</p>}
    </form>
  );
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
  value,
  onChange,
}: {
  name: string;
  label: string;
  children: React.ReactNode;
  defaultValue?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}) {
  return (
    <label className="block space-y-1 text-sm">
      <span className="text-ink/70">{label}</span>
      <select
        name={name}
        defaultValue={value === undefined ? defaultValue : undefined}
        value={value}
        onChange={onChange}
        className="field-input"
      >
        {children}
      </select>
    </label>
  );
}
