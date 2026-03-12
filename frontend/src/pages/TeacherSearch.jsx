import { useEffect, useMemo, useRef, useState } from "react";
import TeacherCard from "../components/TeacherCard";
import { getTeachers, getTeachersByTime, searchTeachers } from "../services/api";

const MODES = {
  name: "name",
  subject: "subject",
  time: "time"
};

const DAY_OPTIONS = [
  { value: "", label: "요일 전체" },
  { value: "Mon", label: "월요일" },
  { value: "Tue", label: "화요일" },
  { value: "Wed", label: "수요일" },
  { value: "Thu", label: "목요일" },
  { value: "Fri", label: "금요일" }
];

const PERIOD_OPTIONS = [
  { value: "", label: "교시 전체" },
  { value: "1", label: "1교시" },
  { value: "2", label: "2교시" },
  { value: "3", label: "3교시" },
  { value: "4", label: "4교시" },
  { value: "5", label: "5교시" },
  { value: "6", label: "6교시" },
  { value: "7", label: "7교시" },
  { value: "8", label: "8교시" }
];

const COPY = {
  byName: "이름으로 검색",
  bySubject: "과목으로 검색",
  byTime: "시간으로 검색",
  namePlaceholder: "선생님 이름 검색 (예: 최종배)",
  subjectAll: "과목 전체",
  loading: "불러오는 중입니다...",
  searchByTime: "선생님 시간으로 검색",
  emptyTitle: "검색 결과가 없습니다",
  emptyLine1: "조건에 맞는 선생님을 찾을 수 없습니다.",
  emptyLine2: "검색 조건을 변경해보세요."
};

function extractSubjects(teachers) {
  return Array.from(
    new Set(
      teachers
        .flatMap((teacher) => (teacher.subjects || "").split(","))
        .map((subject) => subject.trim())
        .filter(Boolean)
    )
  ).sort((a, b) => a.localeCompare(b, "ko"));
}

function openNativeSelect(selectRef) {
  const element = selectRef.current;

  if (!element) {
    return;
  }

  element.focus();

  if (typeof element.showPicker === "function") {
    element.showPicker();
    return;
  }

  element.click();
}

export default function TeacherSearch() {
  const subjectSelectRef = useRef(null);
  const daySelectRef = useRef(null);
  const periodSelectRef = useRef(null);

  const [mode, setMode] = useState(MODES.name);
  const [teachers, setTeachers] = useState([]);
  const [allTeachers, setAllTeachers] = useState([]);
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [day, setDay] = useState("");
  const [period, setPeriod] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const subjects = useMemo(() => extractSubjects(allTeachers), [allTeachers]);

  useEffect(() => {
    loadAllTeachers();
  }, []);

  useEffect(() => {
    if (mode !== MODES.name) {
      return;
    }

    const timeoutId = window.setTimeout(async () => {
      setLoading(true);
      setError("");

      try {
        const trimmed = name.trim();
        const result = trimmed ? await searchTeachers(trimmed) : allTeachers;
        setTeachers(result);
      } catch (requestError) {
        setTeachers([]);
        setError(requestError.message);
      } finally {
        setLoading(false);
      }
    }, 180);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [mode, name, allTeachers]);

  useEffect(() => {
    if (mode !== MODES.subject) {
      return;
    }

    setLoading(true);
    setError("");

    const timeoutId = window.setTimeout(() => {
      try {
        const filteredTeachers = subject
          ? allTeachers.filter((teacher) =>
              (teacher.subjects || "")
                .split(",")
                .map((item) => item.trim())
                .includes(subject)
            )
          : allTeachers;

        setTeachers(filteredTeachers);
      } catch (requestError) {
        setTeachers([]);
        setError(requestError.message);
      } finally {
        setLoading(false);
      }
    }, 120);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [mode, subject, allTeachers]);

  async function loadAllTeachers() {
    setLoading(true);
    setError("");

    try {
      const result = await getTeachers();
      setAllTeachers(result);
      setTeachers(result);
    } catch (requestError) {
      setTeachers([]);
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleTimeSearch() {
    setLoading(true);
    setError("");

    try {
      const result = day && period
        ? await getTeachersByTime(day, period)
        : allTeachers.filter((teacher) => {
            const matchesDay = day ? teacher.officeHours.some((entry) => entry.day === day) : true;
            const matchesPeriod = period
              ? teacher.officeHours.some((entry) => entry.period === Number(period))
              : true;

            return matchesDay && matchesPeriod;
          });

      setTeachers(result);
    } catch (requestError) {
      setTeachers([]);
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  function handleModeChange(nextMode) {
    setMode(nextMode);

    if (nextMode === MODES.name && name.trim() === "") {
      setTeachers(allTeachers);
    }

    if (nextMode === MODES.subject && !subject) {
      setTeachers(allTeachers);
    }
  }

  const showEmpty = !loading && !error && teachers.length === 0;

  return (
    <section className="search-layout">
      <div className="search-card">
        <div className={`search-mode-tabs mode-${mode}`}>
          <button
            type="button"
            className={`search-mode-button ${mode === MODES.name ? "active" : ""}`}
            onClick={() => handleModeChange(MODES.name)}
          >
            {COPY.byName}
          </button>
          <button
            type="button"
            className={`search-mode-button ${mode === MODES.subject ? "active" : ""}`}
            onClick={() => handleModeChange(MODES.subject)}
          >
            {COPY.bySubject}
          </button>
          <button
            type="button"
            className={`search-mode-button ${mode === MODES.time ? "active" : ""}`}
            onClick={() => handleModeChange(MODES.time)}
          >
            {COPY.byTime}
          </button>
        </div>

        <div className="search-panel">
          {mode === MODES.name ? (
            <label className="search-input-shell name-search-shell">
              <span className="search-icon">⌕</span>
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder={COPY.namePlaceholder}
              />
            </label>
          ) : null}

          {mode === MODES.subject ? (
            <label
              className="search-input-shell compact select-shell subject-search-shell"
              onMouseDown={(event) => {
                event.preventDefault();
                openNativeSelect(subjectSelectRef);
              }}
            >
              <span className="search-icon">▤</span>
              <select
                ref={subjectSelectRef}
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
                onMouseDown={(event) => event.stopPropagation()}
              >
                <option value="">{COPY.subjectAll}</option>
                {subjects.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          {mode === MODES.time ? (
            <div className="time-search-grid">
              <label
                className="search-input-shell compact select-shell"
                onMouseDown={(event) => {
                  event.preventDefault();
                  openNativeSelect(daySelectRef);
                }}
              >
                <span className="search-icon">◫</span>
                <select
                  ref={daySelectRef}
                  value={day}
                  onChange={(event) => setDay(event.target.value)}
                  onMouseDown={(event) => event.stopPropagation()}
                >
                  {DAY_OPTIONS.map((option) => (
                    <option key={option.value || "all-day"} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label
                className="search-input-shell compact select-shell"
                onMouseDown={(event) => {
                  event.preventDefault();
                  openNativeSelect(periodSelectRef);
                }}
              >
                <span className="search-icon">◷</span>
                <select
                  ref={periodSelectRef}
                  value={period}
                  onChange={(event) => setPeriod(event.target.value)}
                  onMouseDown={(event) => event.stopPropagation()}
                >
                  {PERIOD_OPTIONS.map((option) => (
                    <option key={option.value || "all-period"} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <button type="button" className="time-search-button" onClick={handleTimeSearch}>
                {COPY.searchByTime}
              </button>
            </div>
          ) : null}
        </div>
      </div>

      {loading ? <p className="status centered">{COPY.loading}</p> : null}
      {error ? <p className="status error centered">{error}</p> : null}

      {showEmpty ? (
        <div className="empty-state">
          <div className="empty-icon">×</div>
          <h3>{COPY.emptyTitle}</h3>
          <p>{COPY.emptyLine1}</p>
          <p>{COPY.emptyLine2}</p>
        </div>
      ) : null}

      {!loading && !error && teachers.length > 0 ? (
        <div className="search-results">
          {teachers.map((teacher) => (
            <TeacherCard key={teacher.id} teacher={teacher} />
          ))}
        </div>
      ) : null}
    </section>
  );
}
