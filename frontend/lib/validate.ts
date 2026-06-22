import { PredictRequest } from "@/types"
import { buildEventDateTime } from "@/components/prediction/EventDateTimePicker"

export function validatePredictRequest(
  form: PredictRequest,
  opts?: { dateTimeConfirmed?: boolean },
): string | null {
  if (!opts?.dateTimeConfirmed) {
    return "Please select date and time (required)"
  }

  const eventAt = buildEventDateTime({
    month: form.month,
    day: form.day,
    start_hour: form.start_hour,
    start_minute: form.start_minute ?? 0,
    day_of_week: form.day_of_week,
  })
  if (eventAt.getTime() < Date.now()) {
    return "Event date & time must be now or in the future"
  }
  if (!Number.isFinite(form.latitude) || form.latitude < 12 || form.latitude > 14) {
    return "Latitude must be between 12 and 14 (Bengaluru area)"
  }
  if (!Number.isFinite(form.longitude) || form.longitude < 77 || form.longitude > 78.5) {
    return "Longitude must be between 77 and 78.5 (Bengaluru area)"
  }
  if (form.start_hour < 0 || form.start_hour > 23) {
    return "Hour must be between 0 and 23"
  }
  if (form.month < 1 || form.month > 12) {
    return "Month must be between 1 and 12"
  }
  if (form.day < 1 || form.day > 31) {
    return "Day must be between 1 and 31"
  }
  if (form.day_of_week < 0 || form.day_of_week > 6) {
    return "Day of week must be between 0 (Mon) and 6 (Sun)"
  }
  if (form.duration_mins != null && form.duration_mins < 0) {
    return "Duration cannot be negative"
  }
  return null
}
