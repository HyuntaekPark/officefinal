const DAY_LABEL = String.fromCharCode(0xc694, 0xc77c);
const PERIOD_LABEL = String.fromCharCode(0xad50, 0xc2dc);

const DAYS = [
  { value: "", label: String.fromCharCode(0xc804, 0xccb4, 0x20, 0xc694, 0xc77c) },
  { value: "Mon", label: String.fromCharCode(0xc6d4, 0xc694, 0xc77c) },
  { value: "Tue", label: String.fromCharCode(0xd654, 0xc694, 0xc77c) },
  { value: "Wed", label: String.fromCharCode(0xc218, 0xc694, 0xc77c) },
  { value: "Thu", label: String.fromCharCode(0xbaa9, 0xc694, 0xc77c) },
  { value: "Fri", label: String.fromCharCode(0xae08, 0xc694, 0xc77c) }
];

const PERIODS = [
  { value: "", label: String.fromCharCode(0xc804, 0xccb4, 0x20, 0xad50, 0xc2dc) },
  { value: "1", label: `1${PERIOD_LABEL}` },
  { value: "2", label: `2${PERIOD_LABEL}` },
  { value: "3", label: `3${PERIOD_LABEL}` },
  { value: "4", label: `4${PERIOD_LABEL}` },
  { value: "5", label: `5${PERIOD_LABEL}` },
  { value: "6", label: `6${PERIOD_LABEL}` },
  { value: "7", label: `7${PERIOD_LABEL}` },
  { value: "8", label: `8${PERIOD_LABEL}` }
];

export default function PeriodSelector({ day, period, onDayChange, onPeriodChange }) {
  return (
    <div className="selector-grid">
      <label className="field">
        <span>{DAY_LABEL}</span>
        <select value={day} onChange={(event) => onDayChange(event.target.value)}>
          {DAYS.map((option) => (
            <option key={option.value || "all-days"} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <label className="field">
        <span>{PERIOD_LABEL}</span>
        <select value={period} onChange={(event) => onPeriodChange(event.target.value)}>
          {PERIODS.map((option) => (
            <option key={option.value || "all-periods"} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
