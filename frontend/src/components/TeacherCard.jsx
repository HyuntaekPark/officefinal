const DAY_LABELS = {
  Mon: "월",
  Tue: "화",
  Wed: "수",
  Thu: "목",
  Fri: "금"
};

const BUILDING_NUMBERS = {
  본: "1",
  탐: "2",
  형: "3",
  창: "5",
  예: "6"
};

function getGroupedOfficeHours(officeHours = []) {
  const grouped = new Map();

  officeHours.forEach((entry) => {
    const current = grouped.get(entry.day) || [];
    current.push(entry.period);
    grouped.set(entry.day, current);
  });

  return Array.from(grouped.entries()).map(([day, periods]) => ({
    day,
    periods: periods.sort((a, b) => a - b)
  }));
}

function formatOfficeLabel(office) {
  const value = String(office || "").trim();

  if (!value) {
    return "위치 정보 없음";
  }

  const prefix = value.charAt(0);
  const buildingNumber = BUILDING_NUMBERS[prefix];

  if (!buildingNumber) {
    return value;
  }

  const remainder = value.slice(1);

  if (!remainder) {
    return value;
  }

  if (remainder.startsWith(buildingNumber)) {
    return value;
  }

  return `${prefix}${buildingNumber}${remainder}`;
}

export default function TeacherCard({ teacher }) {
  const groupedOfficeHours = getGroupedOfficeHours(teacher.officeHours);
  const subjects = (teacher.subjects || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  return (
    <article className="teacher-card">
      <div className="teacher-card-top">
        <div>
          <div className="teacher-name-row">
            <h3>{teacher.name}</h3>
            <span>선생님</span>
          </div>
          <p className="teacher-department">{teacher.department}</p>
        </div>
      </div>

      <div className="teacher-subject-tags">
        {subjects.length > 0 ? subjects.map((subject) => <span key={subject}>{subject}</span>) : <span>과목 정보 없음</span>}
      </div>

      <div className="teacher-contact-strip">
        <div className="teacher-contact-item">
          <span className="teacher-contact-icon">⌂</span>
          <span>{formatOfficeLabel(teacher.office)}</span>
        </div>
        <div className="teacher-contact-item">
          <span className="teacher-contact-icon">◔</span>
          <span>{teacher.phone}</span>
        </div>
      </div>

      <div className="teacher-hours-section">
        <div className="teacher-hours-title">Office Hours</div>
        {groupedOfficeHours.length > 0 ? (
          <div className="teacher-hours-list">
            {groupedOfficeHours.map((entry) => (
              <div key={entry.day} className="teacher-hours-row">
                <span className="teacher-hours-day">{DAY_LABELS[entry.day]}</span>
                <span className="teacher-hours-periods">
                  {entry.periods.map((period) => `${period}교시`).join(", ")}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="teacher-hours-empty">등록된 상담 시간이 없습니다.</p>
        )}
      </div>
    </article>
  );
}
