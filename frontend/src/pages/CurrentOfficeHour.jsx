import { useState } from "react";
import TeacherCard from "../components/TeacherCard";
import { getCurrentOfficeHourTeachers } from "../services/api";

const DAY_LABELS = {
  Mon: "\uc6d4\uc694\uc77c",
  Tue: "\ud654\uc694\uc77c",
  Wed: "\uc218\uc694\uc77c",
  Thu: "\ubaa9\uc694\uc77c",
  Fri: "\uae08\uc694\uc77c"
};

const COPY = {
  title: "\ud604\uc7ac \uc0c1\ub2f4 \uc2dc\uac04",
  description:
    "\ud55c\uad6d \uc2dc\uac04 \uae30\uc900\uc73c\ub85c \uc9c0\uae08 \uc0c1\ub2f4 \uac00\ub2a5\ud55c \uc120\uc0dd\ub2d8\uc744 \ubc14\ub85c \ud655\uc778\ud560 \uc218 \uc788\uc2b5\ub2c8\ub2e4.",
  button: "\uc9c0\uae08 \uac00\ub2a5\ud55c \uc120\uc0dd\ub2d8 \ubcf4\uae30",
  loading: "\ud604\uc7ac \uc0c1\ub2f4 \uac00\ub2a5 \uad50\uc0ac\ub97c \ud655\uc778\ud558\ub294 \uc911\uc785\ub2c8\ub2e4...",
  currentLabel: "\ud604\uc7ac \uc2dc\uac04\ub300",
  noClassTime: "\ud604\uc7ac\ub294 \uc218\uc5c5 \uc2dc\uac04\uc774 \uc544\ub2d9\ub2c8\ub2e4.",
  empty: "\ud604\uc7ac \uc0c1\ub2f4 \uac00\ub2a5\ud55c \uc120\uc0dd\ub2d8\uc774 \uc5c6\uc2b5\ub2c8\ub2e4.",
  initial: "\ubc84\ud2bc\uc744 \ub20c\ub7ec \ud604\uc7ac \uc0c1\ub2f4 \uac00\ub2a5\ud55c \uad50\uc0ac\ub97c \uc870\ud68c\ud558\uc138\uc694."
};

export default function CurrentOfficeHour() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLoadCurrentOfficeHour() {
    setLoading(true);
    setError("");

    try {
      const response = await getCurrentOfficeHourTeachers();
      setResult(response);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  const currentLabel = result?.currentPeriod
    ? `${DAY_LABELS[result.currentPeriod.day]} ${result.currentPeriod.period}\uad50\uc2dc`
    : COPY.noClassTime;

  return (
    <section className="stack">
      <div className="section-header">
        <div>
          <h2>{COPY.title}</h2>
          <p>{COPY.description}</p>
        </div>
        <button type="button" className="primary-button" onClick={handleLoadCurrentOfficeHour}>
          {COPY.button}
        </button>
      </div>

      {loading ? <p className="status">{COPY.loading}</p> : null}
      {error ? <p className="status error">{error}</p> : null}

      {result ? (
        <div className="current-panel">
          <p className="current-period">
            {COPY.currentLabel}: {currentLabel}
          </p>
          {result.teachers.length === 0 ? (
            <p className="status">{COPY.empty}</p>
          ) : (
            <div className="card-grid">
              {result.teachers.map((teacher) => (
                <TeacherCard key={teacher.id} teacher={teacher} />
              ))}
            </div>
          )}
        </div>
      ) : (
        <p className="status">{COPY.initial}</p>
      )}
    </section>
  );
}
