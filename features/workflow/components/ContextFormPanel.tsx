"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type {
  ContextSummaryItem,
  WorkflowContextFormValues,
} from "@/features/workflow/client/types";

interface ContextFormPanelProps {
  values: WorkflowContextFormValues | null;
  summary: ContextSummaryItem[];
  onFieldChange: (
    field: keyof WorkflowContextFormValues,
    value: WorkflowContextFormValues[keyof WorkflowContextFormValues],
  ) => void;
  onSubmit: () => void;
  disabled: boolean;
  hasSubmittedSearch: boolean;
}

function SelectField({
  id,
  label,
  value,
  onChange,
  options,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ label: string; value: string }>;
}) {
  return (
    <label className="space-y-2">
      <Label htmlFor={id} className="text-[var(--ov-text)]">
        {label}
      </Label>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 w-full rounded-xl border border-[var(--ov-border-medium)] bg-[var(--ov-surface-deep)] px-3 text-sm text-[var(--ov-text)] outline-none transition focus:border-[var(--ov-signal-border)] focus:ring-2 focus:ring-[var(--ov-signal-border)]"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value} className="bg-[var(--ov-bg-1)]">
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function TextAreaField({
  id,
  label,
  value,
  onChange,
  placeholder,
  rows = 4,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <label className="space-y-2">
      <Label htmlFor={id} className="text-[var(--ov-text)]">
        {label}
      </Label>
      <textarea
        id={id}
        rows={rows}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-[var(--ov-border-medium)] bg-[var(--ov-surface-deep)] px-3 py-2 text-sm text-[var(--ov-text)] outline-none transition placeholder:text-[var(--ov-text-muted)] focus:border-[var(--ov-signal-border)] focus:ring-2 focus:ring-[var(--ov-signal-border)]"
      />
    </label>
  );
}

export function ContextFormPanel({
  values,
  summary,
  onFieldChange,
  onSubmit,
  disabled,
  hasSubmittedSearch,
}: ContextFormPanelProps) {
  if (!values) {
    return (
      <Card className="border-[var(--ov-border-medium)] bg-[var(--ov-surface-card)] shadow-[0_20px_50px_var(--ov-shadow)]">
        <CardHeader>
          <CardTitle className="font-display text-xl text-[var(--ov-text)]">
            Context brief
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-7 text-[var(--ov-text-muted)]">
            Submit a request from the landing page or workspace composer to
            draft the context brief.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-[var(--ov-border-medium)] bg-[var(--ov-surface-card)] shadow-[0_20px_50px_var(--ov-shadow)]">
      <CardHeader className="gap-3">
        <div>
          <p className="ov-kicker">Step 2</p>
          <CardTitle className="mt-2 font-display text-xl text-[var(--ov-text)]">
            Context brief
          </CardTitle>
        </div>
        {summary.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {summary.map((item) => (
              <span key={`${item.label}-${item.value}`} className="ov-chip rounded-full px-3 py-1 text-xs">
                {item.label}: {item.value}
              </span>
            ))}
          </div>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2">
            <Label htmlFor="jobType" className="text-[var(--ov-text)]">
              Service category
            </Label>
            <Input
              id="jobType"
              value={values.jobType}
              onChange={(event) => onFieldChange("jobType", event.target.value)}
              className="border-[var(--ov-border-medium)] bg-[var(--ov-surface-deep)] text-[var(--ov-text)]"
            />
          </label>

          <label className="space-y-2">
            <Label htmlFor="location" className="text-[var(--ov-text)]">
              Location
            </Label>
            <Input
              id="location"
              value={values.location}
              onChange={(event) => onFieldChange("location", event.target.value)}
              placeholder="City, neighborhood, or service area"
              className="border-[var(--ov-border-medium)] bg-[var(--ov-surface-deep)] text-[var(--ov-text)]"
            />
          </label>
        </div>

        <TextAreaField
          id="description"
          label="Scope description"
          value={values.description}
          onChange={(value) => onFieldChange("description", value)}
          placeholder="Describe the work, constraints, and what success looks like."
        />

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <SelectField
            id="priority"
            label="Buyer priority"
            value={values.priority}
            onChange={(value) => onFieldChange("priority", value)}
            options={[
              { label: "Choose later", value: "" },
              { label: "Cost discipline", value: "cost" },
              { label: "Quality first", value: "quality" },
              { label: "Fast turnaround", value: "speed" },
              { label: "Top-rated", value: "rating" },
            ]}
          />
          <SelectField
            id="urgency"
            label="Urgency"
            value={values.urgency}
            onChange={(value) => onFieldChange("urgency", value)}
            options={[
              { label: "Not specified", value: "" },
              { label: "ASAP", value: "asap" },
              { label: "Flexible", value: "flexible" },
              { label: "Scheduled", value: "scheduled" },
            ]}
          />
          <SelectField
            id="availability"
            label="Availability"
            value={values.availability}
            onChange={(value) => onFieldChange("availability", value)}
            options={[
              { label: "Any", value: "" },
              { label: "Any day", value: "any" },
              { label: "Weekdays", value: "weekdays" },
              { label: "Weekends", value: "weekends" },
            ]}
          />
          <label className="space-y-2">
            <Label htmlFor="budget" className="text-[var(--ov-text)]">
              Budget cap
            </Label>
            <Input
              id="budget"
              type="number"
              min="0"
              value={values.budget}
              onChange={(event) => onFieldChange("budget", event.target.value)}
              placeholder="500"
              className="border-[var(--ov-border-medium)] bg-[var(--ov-surface-deep)] text-[var(--ov-text)]"
            />
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <label className="space-y-2">
            <Label htmlFor="minRating" className="text-[var(--ov-text)]">
              Minimum rating
            </Label>
            <Input
              id="minRating"
              type="number"
              min="0"
              max="5"
              step="0.1"
              value={values.minRating}
              onChange={(event) => onFieldChange("minRating", event.target.value)}
              placeholder="4.5"
              className="border-[var(--ov-border-medium)] bg-[var(--ov-surface-deep)] text-[var(--ov-text)]"
            />
          </label>
          <label className="space-y-2">
            <Label htmlFor="rooms" className="text-[var(--ov-text)]">
              Rooms
            </Label>
            <Input
              id="rooms"
              type="number"
              min="0"
              value={values.rooms}
              onChange={(event) => onFieldChange("rooms", event.target.value)}
              placeholder="2"
              className="border-[var(--ov-border-medium)] bg-[var(--ov-surface-deep)] text-[var(--ov-text)]"
            />
          </label>
          <label className="space-y-2">
            <Label htmlFor="estimatedDuration" className="text-[var(--ov-text)]">
              Expected duration
            </Label>
            <Input
              id="estimatedDuration"
              value={values.estimatedDuration}
              onChange={(event) => onFieldChange("estimatedDuration", event.target.value)}
              placeholder="Half day, 2 days, recurring"
              className="border-[var(--ov-border-medium)] bg-[var(--ov-surface-deep)] text-[var(--ov-text)]"
            />
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <TextAreaField
            id="dealBreakers"
            label="Deal breakers"
            value={values.dealBreakers}
            onChange={(value) => onFieldChange("dealBreakers", value)}
            placeholder="Comma-separated: uninsured, weekend only, no permits"
            rows={3}
          />
          <TextAreaField
            id="preferredQualifications"
            label="Preferred qualifications"
            value={values.preferredQualifications}
            onChange={(value) => onFieldChange("preferredQualifications", value)}
            placeholder="Comma-separated: licensed, insured, commercial experience"
            rows={3}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2">
            <Label htmlFor="availabilityRequired" className="text-[var(--ov-text)]">
              Required availability note
            </Label>
            <Input
              id="availabilityRequired"
              value={values.availabilityRequired}
              onChange={(event) =>
                onFieldChange("availabilityRequired", event.target.value)
              }
              placeholder="Need an on-site walkthrough before Friday"
              className="border-[var(--ov-border-medium)] bg-[var(--ov-surface-deep)] text-[var(--ov-text)]"
            />
          </label>
          <TextAreaField
            id="additionalRequirements"
            label="Additional requirements"
            value={values.additionalRequirements}
            onChange={(value) => onFieldChange("additionalRequirements", value)}
            placeholder="Anything the market should optimize for during search or negotiation."
            rows={3}
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm leading-7 text-[var(--ov-text-muted)]">
            The form is the frontend-to-backend contract boundary. Nothing runs
            until you explicitly submit it.
          </p>
          <Button
            type="button"
            size="lg"
            onClick={onSubmit}
            disabled={disabled}
            className="bg-[var(--ov-signal)] text-[var(--ov-text-on-accent)] hover:bg-[var(--ov-signal-strong)]"
          >
            {disabled
              ? "Running market..."
              : hasSubmittedSearch
                ? "Rerun market"
                : "Run market"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
