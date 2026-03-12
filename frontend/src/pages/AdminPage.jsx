import { useEffect, useMemo, useState } from "react";
import {
  clearAdminToken,
  createTeacher,
  deleteTeacher,
  getTeachers,
  loginAdmin,
  saveAdminToken,
  updateTeacher
} from "../services/api";

const DAYS = [
  { value: "Mon", label: "\uc6d4" },
  { value: "Tue", label: "\ud654" },
  { value: "Wed", label: "\uc218" },
  { value: "Thu", label: "\ubaa9" },
  { value: "Fri", label: "\uae08" }
];

const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8];

const COPY = {
  loginTitle: "\uad00\ub9ac\uc790 \ub85c\uadf8\uc778",
  loginSubtitle: "KSA Office Hour \uad00\ub9ac\uc790 \ud398\uc774\uc9c0",
  id: "\uc544\uc774\ub514",
  password: "\ube44\ubc00\ubc88\ud638",
  idPlaceholder: "\uc544\uc774\ub514 \uc785\ub825",
  passwordPlaceholder: "\ube44\ubc00\ubc88\ud638 \uc785\ub825",
  login: "\ub85c\uadf8\uc778",
  loginLoading: "\ub85c\uadf8\uc778 \uc911...",
  title: "\uad00\ub9ac\uc790 : \uc120\uc0dd\ub2d8 \ub370\uc774\ud130 \uad00\ub9ac",
  addTeacher: "+ \uc120\uc0dd\ub2d8 \ucd94\uac00",
  teacher: "\uc120\uc0dd\ub2d8",
  deptSubjects: "\ubd80\uc11c / \uacfc\ubaa9",
  contactLocation: "\uc5f0\ub77d\ucc98 / \uc704\uce58",
  officeHourDay: "OFFICE HOUR \uc694\uc77c",
  manage: "\uad00\ub9ac",
  emptyTable:
    "\ub4f1\ub85d\ub41c \uc120\uc0dd\ub2d8\uc774 \uc5c6\uc2b5\ub2c8\ub2e4. \uc6b0\uce21 \uc0c1\ub2e8\uc758 \ucd94\uac00 \ubc84\ud2bc\uc744 \ub20c\ub7ec\uc8fc\uc138\uc694.",
  loading: "\ubd88\ub7ec\uc624\ub294 \uc911\uc785\ub2c8\ub2e4...",
  edit: "\uc218\uc815",
  remove: "\uc0ad\uc81c",
  removeConfirm: "\uc774 \uc120\uc0dd\ub2d8 \uc815\ubcf4\ub97c \uc0ad\uc81c\ud558\uc2dc\uaca0\uc2b5\ub2c8\uae4c?",
  name: "\uc774\ub984 *",
  department: "\ubd80\uc11c *",
  subjects: "\ub2f4\ub2f9 \uacfc\ubaa9 (\uc27c\ud45c\ub85c \uad6c\ubd84) *",
  office: "\uad50\ubb34\uc2e4 \uc704\uce58 *",
  phone: "\uc804\ud654\ubc88\ud638",
  officeHourSetting: "Office Hour \uc124\uc815",
  weekday: "\uc694\uc77c",
  cancel: "\ucde8\uc18c",
  create: "\ub4f1\ub85d\ud558\uae30",
  update: "\uc218\uc815\ud558\uae30",
  saving: "\uc800\uc7a5 \uc911..."
};

const EMPTY_FORM = {
  name: "",
  department: "",
  subjects: "",
  office: "",
  phone: "",
  officeHours: []
};

function officeHourKey(day, period) {
  return `${day}-${period}`;
}

function formatOfficeHourDays(officeHours) {
  if (!officeHours.length) {
    return "-";
  }

  const dayMap = { Mon: "\uc6d4", Tue: "\ud654", Wed: "\uc218", Thu: "\ubaa9", Fri: "\uae08" };
  const grouped = new Map();

  officeHours.forEach((item) => {
    const current = grouped.get(item.day) || [];
    current.push(item.period);
    grouped.set(item.day, current);
  });

  return Array.from(grouped.entries())
    .map(([day, periods]) => `${dayMap[day]} ${periods.sort((a, b) => a - b).join(",")}`)
    .join(" / ");
}

export default function AdminPage({ onBack }) {
  const [teachers, setTeachers] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginForm, setLoginForm] = useState({ id: "", password: "" });
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    clearAdminToken();
    setIsAuthenticated(false);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadTeachers();
    } else {
      setTeachers([]);
    }
  }, [isAuthenticated]);

  const selectedOfficeHourKeys = useMemo(
    () => new Set(form.officeHours.map((entry) => officeHourKey(entry.day, entry.period))),
    [form.officeHours]
  );
  const totalOfficeHourCount = useMemo(
    () => teachers.reduce((count, teacher) => count + (teacher.officeHours?.length || 0), 0),
    [teachers]
  );

  async function loadTeachers() {
    setLoading(true);
    setError("");

    try {
      const result = await getTeachers();
      setTeachers(result);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  function handleLoginFieldChange(field, value) {
    setLoginForm((current) => ({
      ...current,
      [field]: value
    }));
  }

  async function handleLoginSubmit(event) {
    event.preventDefault();
    setLoginLoading(true);
    setLoginError("");

    try {
      const result = await loginAdmin(loginForm.id, loginForm.password);
      saveAdminToken(result.token);
      setIsAuthenticated(true);
      setLoginForm({ id: "", password: "" });
    } catch (requestError) {
      setLoginError(requestError.message);
    } finally {
      setLoginLoading(false);
    }
  }

  function openCreateModal() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError("");
    setIsModalOpen(true);
  }

  function openEditModal(teacher) {
    setEditingId(teacher.id);
    setForm({
      name: teacher.name,
      department: teacher.department,
      subjects: teacher.subjects,
      office: teacher.office,
      phone: teacher.phone,
      officeHours: teacher.officeHours || []
    });
    setError("");
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError("");
  }

  function handleFieldChange(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value
    }));
  }

  function handleOfficeHourToggle(day, period) {
    setForm((current) => {
      const key = officeHourKey(day, period);
      const exists = current.officeHours.some((entry) => officeHourKey(entry.day, entry.period) === key);

      return {
        ...current,
        officeHours: exists
          ? current.officeHours.filter((entry) => officeHourKey(entry.day, entry.period) !== key)
          : [...current.officeHours, { day, period }]
      };
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      if (editingId) {
        await updateTeacher(editingId, form);
      } else {
        await createTeacher(form);
      }

      await loadTeachers();
      closeModal();
    } catch (requestError) {
      if (requestError.message.includes("\ub85c\uadf8\uc778")) {
        clearAdminToken();
        setIsAuthenticated(false);
        setIsModalOpen(false);
        setLoginError(requestError.message);
      } else {
        setError(requestError.message);
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    const confirmed = window.confirm(COPY.removeConfirm);

    if (!confirmed) {
      return;
    }

    try {
      await deleteTeacher(id);
      await loadTeachers();
    } catch (requestError) {
      if (requestError.message.includes("\ub85c\uadf8\uc778")) {
        clearAdminToken();
        setIsAuthenticated(false);
        setLoginError(requestError.message);
      } else {
        setError(requestError.message);
      }
    }
  }

  if (!isAuthenticated) {
    return (
      <section className="admin-login-view">
        <div className="admin-login-shell">
          <div className="admin-login-panel">
            <div className="admin-login-header">
              <div className="admin-login-icon">A</div>
              <h2>{COPY.loginTitle}</h2>
              <p>{COPY.loginSubtitle}</p>
            </div>

            <div className="admin-login-highlights">
              <div className="admin-highlight-card">
                <strong>교사 정보 관리</strong>
                <span>이름, 부서, 과목, 위치, 연락처를 한 번에 수정합니다.</span>
              </div>
              <div className="admin-highlight-card">
                <strong>Office Hour 설정</strong>
                <span>요일별, 교시별 상담 가능 시간을 체크박스로 관리합니다.</span>
              </div>
            </div>
          </div>

          <form className="admin-login-card" onSubmit={handleLoginSubmit}>
            <div className="admin-login-card-head">
              <h3>관리자 인증</h3>
              <p>로그인 후 선생님 데이터를 추가, 수정, 삭제할 수 있습니다.</p>
            </div>

            <label className="modal-field">
              <span>{COPY.id}</span>
              <input
                value={loginForm.id}
                onChange={(event) => handleLoginFieldChange("id", event.target.value)}
                placeholder={COPY.idPlaceholder}
              />
            </label>

            <label className="modal-field">
              <span>{COPY.password}</span>
              <input
                type="password"
                value={loginForm.password}
                onChange={(event) => handleLoginFieldChange("password", event.target.value)}
                placeholder={COPY.passwordPlaceholder}
              />
            </label>

            {loginError ? <p className="status error">{loginError}</p> : null}

            <button type="submit" className="admin-primary-cta full" disabled={loginLoading}>
              {loginLoading ? COPY.loginLoading : COPY.login}
            </button>
          </form>
        </div>
      </section>
    );
  }

  return (
    <section className="admin-management-view">
      <div className="admin-management-hero">
        <div className="admin-management-topbar">
          <div className="admin-management-title">
            <button type="button" className="back-button" onClick={onBack}>
              ← 메인으로
            </button>
            <h2>{COPY.title}</h2>
          </div>
          <button type="button" className="admin-primary-cta slim" onClick={openCreateModal}>
            {COPY.addTeacher}
          </button>
        </div>

        <div className="admin-summary-grid">
          <div className="admin-summary-card">
            <span>등록된 선생님</span>
            <strong>{teachers.length}</strong>
          </div>
          <div className="admin-summary-card">
            <span>설정된 Office Hour</span>
            <strong>{totalOfficeHourCount}</strong>
          </div>
          <div className="admin-summary-card">
            <span>관리 상태</span>
            <strong>{loading ? "동기화 중" : "정상"}</strong>
          </div>
        </div>
      </div>

      {error ? <p className="status error">{error}</p> : null}

      <div className="admin-table-shell">
        <div className="admin-table-head">
          <span>{COPY.teacher}</span>
          <span>{COPY.deptSubjects}</span>
          <span>{COPY.contactLocation}</span>
          <span>{COPY.officeHourDay}</span>
          <span>{COPY.manage}</span>
        </div>

        {loading ? <div className="admin-empty-row">{COPY.loading}</div> : null}
        {!loading && teachers.length === 0 ? <div className="admin-empty-row">{COPY.emptyTable}</div> : null}

        {!loading &&
          teachers.map((teacher) => (
            <div key={teacher.id} className="admin-table-row">
              <div className="admin-cell strong admin-teacher-cell">
                <strong>{teacher.name}</strong>
                <span>{teacher.officeHours?.length || 0}개 시간 등록</span>
              </div>
              <div className="admin-cell">
                <p>{teacher.department}</p>
                <span>{teacher.subjects}</span>
              </div>
              <div className="admin-cell">
                <p>{teacher.phone}</p>
                <span>{teacher.office}</span>
              </div>
              <div className="admin-cell">{formatOfficeHourDays(teacher.officeHours || [])}</div>
              <div className="admin-actions-cell">
                <button type="button" className="table-action" onClick={() => openEditModal(teacher)}>
                  {COPY.edit}
                </button>
                <button type="button" className="table-action danger" onClick={() => handleDelete(teacher.id)}>
                  {COPY.remove}
                </button>
              </div>
            </div>
          ))}
      </div>

      {isModalOpen ? (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="admin-modal" onClick={(event) => event.stopPropagation()}>
            <form className="admin-modal-form" onSubmit={handleSubmit}>
              <div className="admin-modal-head">
                <div>
                  <h3>{editingId ? "선생님 정보 수정" : "선생님 추가"}</h3>
                  <p>기본 정보와 Office Hour를 함께 저장합니다.</p>
                </div>
              </div>

              <div className="modal-grid two-column">
                <label className="modal-field">
                  <span>{COPY.name}</span>
                  <input
                    value={form.name}
                    onChange={(event) => handleFieldChange("name", event.target.value)}
                    placeholder="\ud64d\uae38\ub3d9"
                  />
                </label>

                <label className="modal-field">
                  <span>{COPY.department}</span>
                  <input
                    value={form.department}
                    onChange={(event) => handleFieldChange("department", event.target.value)}
                    placeholder="\uc218\ud559\ubd80"
                  />
                </label>
              </div>

              <label className="modal-field">
                <span>{COPY.subjects}</span>
                <input
                  value={form.subjects}
                  onChange={(event) => handleFieldChange("subjects", event.target.value)}
                  placeholder="\ubbf8\uc801\ubd84\ud559, \uae30\ud558\ud559"
                />
              </label>

              <div className="modal-grid two-column">
                <label className="modal-field">
                  <span>{COPY.office}</span>
                  <input
                    value={form.office}
                    onChange={(event) => handleFieldChange("office", event.target.value)}
                    placeholder="\ucc3d\uc870\uad00 3\uce35 \uc218\ud559\ubd80"
                  />
                </label>

                <label className="modal-field">
                  <span>{COPY.phone}</span>
                  <input
                    value={form.phone}
                    onChange={(event) => handleFieldChange("phone", event.target.value)}
                    placeholder="051-123-4567"
                  />
                </label>
              </div>

              <div className="office-hour-panel">
                <h3>{COPY.officeHourSetting}</h3>
                <div className="office-hour-table">
                  <div className="office-hour-header">
                    <span>{COPY.weekday}</span>
                    {PERIODS.map((period) => (
                      <span key={`head-${period}`}>{period}</span>
                    ))}
                  </div>

                  {DAYS.map((day) => (
                    <div key={day.value} className="office-hour-row">
                      <span>{day.label}</span>
                      {PERIODS.map((period) => {
                        const key = officeHourKey(day.value, period);
                        return (
                          <label key={key} className="office-hour-check">
                            <input
                              type="checkbox"
                              checked={selectedOfficeHourKeys.has(key)}
                              onChange={() => handleOfficeHourToggle(day.value, period)}
                            />
                            <span />
                          </label>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>

              {error ? <p className="status error">{error}</p> : null}

              <div className="modal-actions">
                <button type="button" className="modal-cancel" onClick={closeModal}>
                  {COPY.cancel}
                </button>
                <button type="submit" className="admin-primary-cta" disabled={submitting}>
                  {submitting ? COPY.saving : editingId ? COPY.update : COPY.create}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </section>
  );
}
