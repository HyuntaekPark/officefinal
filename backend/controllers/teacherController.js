const { getClient, query } = require("../database/db");
const { getCurrentPeriod } = require("../utils/periodCalculator");
const {
  escapeLikePattern,
  normalizeTeacherSearchName,
  sanitizeTeacherInput,
  validateDay,
  validatePeriod
} = require("../utils/security");

const DAY_ORDER = {
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5
};

function groupTeacherRows(rows) {
  const teacherMap = new Map();

  rows.forEach((row) => {
    if (!teacherMap.has(row.id)) {
      teacherMap.set(row.id, {
        id: Number(row.id),
        name: row.name,
        department: row.department,
        subjects: row.subjects,
        office: row.office,
        phone: row.phone,
        officeHours: []
      });
    }

    if (row.office_hour_id) {
      teacherMap.get(row.id).officeHours.push({
        day: row.day,
        period: Number(row.period)
      });
    }
  });

  return Array.from(teacherMap.values())
    .map((teacher) => ({
      ...teacher,
      officeHours: teacher.officeHours.sort((a, b) => DAY_ORDER[a.day] - DAY_ORDER[b.day] || a.period - b.period)
    }))
    .sort((a, b) => a.name.localeCompare(b.name, "ko"));
}

async function fetchTeachers({ name, day, period } = {}) {
  const whereClauses = [];
  const params = [];

  if (name) {
    params.push(`%${escapeLikePattern(normalizeTeacherSearchName(name))}%`);
    whereClauses.push(`t.name ILIKE $${params.length} ESCAPE '\\'`);
  }

  if (day && period) {
    params.push(day);
    params.push(Number(period));
    whereClauses.push(
      `EXISTS (
        SELECT 1
        FROM office_hours match_oh
        WHERE match_oh.teacher_id = t.id
          AND match_oh.day = $${params.length - 1}
          AND match_oh.period = $${params.length}
      )`
    );
  }

  const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

  const result = await query(
    `
      SELECT
        t.id,
        t.name,
        t.department,
        t.subjects,
        t.office,
        t.phone,
        oh.id AS office_hour_id,
        oh.day,
        oh.period
      FROM teachers t
      LEFT JOIN office_hours oh ON oh.teacher_id = t.id
      ${whereSql}
      ORDER BY
        LOWER(t.name) ASC,
        CASE oh.day
          WHEN 'Mon' THEN 1
          WHEN 'Tue' THEN 2
          WHEN 'Wed' THEN 3
          WHEN 'Thu' THEN 4
          WHEN 'Fri' THEN 5
          ELSE 99
        END ASC,
        oh.period ASC
    `,
    params
  );

  return groupTeacherRows(result.rows);
}

function validateTeacherPayload(body) {
  const { name, department, subjects, office, phone, officeHours } = body;
  const normalizedFields = [
    sanitizeTeacherInput(name, 50),
    sanitizeTeacherInput(department, 50),
    sanitizeTeacherInput(subjects, 120),
    sanitizeTeacherInput(office, 30),
    sanitizeTeacherInput(phone, 30)
  ];

  if (normalizedFields.some((value) => !value)) {
    return "교사 정보의 모든 항목을 입력해야 합니다.";
  }

  if (!Array.isArray(officeHours)) {
    return "Office Hour 정보 형식이 올바르지 않습니다.";
  }

  const isValidOfficeHour = officeHours.every((entry) => entry && validateDay(entry.day) && validatePeriod(entry.period));

  if (!isValidOfficeHour) {
    return "Office Hour 항목에 잘못된 값이 있습니다.";
  }

  const uniqueKeys = new Set(officeHours.map((entry) => `${entry.day}-${entry.period}`));

  if (uniqueKeys.size !== officeHours.length) {
    return "중복된 Office Hour 항목이 있습니다.";
  }

  return null;
}

async function replaceOfficeHours(client, teacherId, officeHours) {
  await client.query("DELETE FROM office_hours WHERE teacher_id = $1", [teacherId]);

  for (const entry of officeHours) {
    await client.query("INSERT INTO office_hours (teacher_id, day, period) VALUES ($1, $2, $3)", [
      teacherId,
      entry.day,
      Number(entry.period)
    ]);
  }
}

async function getAllTeachers(req, res, next) {
  try {
    const teachers = await fetchTeachers();
    res.json(teachers);
  } catch (error) {
    next(error);
  }
}

async function searchTeachers(req, res, next) {
  try {
    const teachers = await fetchTeachers({ name: req.query.name || "" });
    res.json(teachers);
  } catch (error) {
    next(error);
  }
}

async function getTeachersByTime(req, res, next) {
  try {
    const { day, period } = req.query;

    if (!validateDay(day) || !validatePeriod(period)) {
      return res.status(400).json({
        message: "요일과 교시를 모두 선택해야 합니다."
      });
    }

    const teachers = await fetchTeachers({ day, period });
    res.json(teachers);
  } catch (error) {
    next(error);
  }
}

async function getCurrentOfficeHourTeachers(req, res, next) {
  try {
    const current = getCurrentPeriod();

    if (!current) {
      return res.json({
        currentPeriod: null,
        teachers: []
      });
    }

    const teachers = await fetchTeachers(current);

    res.json({
      currentPeriod: current,
      teachers
    });
  } catch (error) {
    next(error);
  }
}

async function createTeacher(req, res, next) {
  const validationError = validateTeacherPayload(req.body);

  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  const { name, department, subjects, office, phone, officeHours } = req.body;
  const sanitizedTeacher = {
    name: sanitizeTeacherInput(name, 50),
    department: sanitizeTeacherInput(department, 50),
    subjects: sanitizeTeacherInput(subjects, 120),
    office: sanitizeTeacherInput(office, 30),
    phone: sanitizeTeacherInput(phone, 30)
  };

  const client = await getClient();

  try {
    await client.query("BEGIN");

    const insertResult = await client.query(
      "INSERT INTO teachers (name, department, subjects, office, phone) VALUES ($1, $2, $3, $4, $5) RETURNING id",
      [
        sanitizedTeacher.name,
        sanitizedTeacher.department,
        sanitizedTeacher.subjects,
        sanitizedTeacher.office,
        sanitizedTeacher.phone
      ]
    );

    const teacherId = Number(insertResult.rows[0].id);

    await replaceOfficeHours(client, teacherId, officeHours);
    await client.query("COMMIT");

    const teachers = await fetchTeachers();
    const createdTeacher = teachers.find((teacher) => teacher.id === teacherId);
    res.status(201).json(createdTeacher);
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    next(error);
  } finally {
    client.release();
  }
}

async function updateTeacher(req, res, next) {
  const validationError = validateTeacherPayload(req.body);

  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  const teacherId = Number(req.params.id);
  const { name, department, subjects, office, phone, officeHours } = req.body;
  const sanitizedTeacher = {
    name: sanitizeTeacherInput(name, 50),
    department: sanitizeTeacherInput(department, 50),
    subjects: sanitizeTeacherInput(subjects, 120),
    office: sanitizeTeacherInput(office, 30),
    phone: sanitizeTeacherInput(phone, 30)
  };

  const client = await getClient();

  try {
    const existingTeacher = await client.query("SELECT id FROM teachers WHERE id = $1", [teacherId]);

    if (existingTeacher.rowCount === 0) {
      return res.status(404).json({
        message: "교사 정보를 찾을 수 없습니다."
      });
    }

    await client.query("BEGIN");
    await client.query(
      "UPDATE teachers SET name = $1, department = $2, subjects = $3, office = $4, phone = $5 WHERE id = $6",
      [
        sanitizedTeacher.name,
        sanitizedTeacher.department,
        sanitizedTeacher.subjects,
        sanitizedTeacher.office,
        sanitizedTeacher.phone,
        teacherId
      ]
    );
    await replaceOfficeHours(client, teacherId, officeHours);
    await client.query("COMMIT");

    const teachers = await fetchTeachers();
    const updatedTeacher = teachers.find((teacher) => teacher.id === teacherId);
    res.json(updatedTeacher);
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    next(error);
  } finally {
    client.release();
  }
}

async function deleteTeacher(req, res, next) {
  try {
    const teacherId = Number(req.params.id);
    const existingTeacher = await query("SELECT id FROM teachers WHERE id = $1", [teacherId]);

    if (existingTeacher.rowCount === 0) {
      return res.status(404).json({
        message: "교사 정보를 찾을 수 없습니다."
      });
    }

    await query("DELETE FROM teachers WHERE id = $1", [teacherId]);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAllTeachers,
  searchTeachers,
  getTeachersByTime,
  getCurrentOfficeHourTeachers,
  createTeacher,
  updateTeacher,
  deleteTeacher
};
