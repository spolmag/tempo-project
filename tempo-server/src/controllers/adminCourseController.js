import prisma from "../lib/prisma.js";

const COURSE_CODE_REGEX = /^[A-Z0-9_-]{2,20}$/;

const CLASS_TYPES = ["PRIVATE", "GROUP"];

const COURSE_SELECT = {
  id: true,
  code: true,
  parentId: true,
  nameTh: true,
  nameEn: true,
  descriptionTh: true,
  descriptionEn: true,
  classType: true,
  totalLessons: true,
  lessonDurationMin: true,
  tuitionFee: true,
  fullTimeTeachingFee: true,
  partTimeTeachingFee: true,
  isHighlighted: true,
  sortOrder: true,
  textbookIds: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
  parent: {
    select: {
      id: true,
      code: true,
      nameTh: true,
      nameEn: true,
    },
  },
  _count: {
    select: { subCourses: true },
  },
};

function clean(value) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function cleanStringArray(value) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean);
}

// Parse optional whole integer >= min (return {value} or {error})
function parseOptionalInt(raw, min, errorCode, defaultIfEmpty = null) {
  if (raw === null || raw === "" || raw === undefined) {
    return { value: defaultIfEmpty };
  }
  const num = Number(raw);
  if (!Number.isInteger(num) || num < min) {
    return { error: { code: errorCode } };
  }
  return { value: num };
}

function readCourseInput(body, { partial = false } = {}) {
  const data = {};
  const has = (key) => body[key] !== undefined;

  // 1. Course code
  if (!partial || has("code")) {
    const rawCode = clean(body.code);
    if (!rawCode) {
      return { error: { code: "MISSING_FIELDS" } };
    }
    const code = rawCode.toUpperCase();
    if (!COURSE_CODE_REGEX.test(code)) {
      return { error: { code: "INVALID_COURSE_CODE" } };
    }
    data.code = code;
  }

  // Bilingual course name
  if (!partial || has("nameTh")) {
    const nameTh = clean(body.nameTh);
    if (!nameTh) {
      return { error: { code: "MISSING_FIELDS" } };
    }
    data.nameTh = nameTh;
  }

  if (!partial || has("nameEn")) {
    const nameEn = clean(body.nameEn);
    if (!nameEn) {
      return { error: { code: "MISSING_FIELDS" } };
    }
    data.nameEn = nameEn;
  }

  // 3. Bullet-point descriptions (String[])
  if (!partial || has("descriptionTh")) {
    data.descriptionTh = cleanStringArray(body.descriptionTh);
  }
  if (!partial || has("descriptionEn")) {
    data.descriptionEn = cleanStringArray(body.descriptionEn);
  }

  // 4. Class type (PRIVATE | GROUP)
  if (!partial || has("classType")) {
    const classType = clean(body.classType) || "PRIVATE";
    if (!CLASS_TYPES.includes(classType)) {
      return { error: { code: "INVALID_CLASS_TYPE" } };
    }
    data.classType = classType;
  }

  // 5. Optional parent course ID (null = Main Course)
  if (!partial || has("parentId")) {
    data.parentId = clean(body.parentId);
  }

  // 6. Optional lesson count & duration (integers >= 1)
  if (!partial || has("totalLessons")) {
    const res = parseOptionalInt(body.totalLessons, 1, "INVALID_TOTAL_LESSONS");
    if (res.error) return res;
    data.totalLessons = res.value;
  }

  if (!partial || has("lessonDurationMin")) {
    const res = parseOptionalInt(
      body.lessonDurationMin,
      1,
      "INVALID_LESSON_DURATION",
    );
    if (res.error) return res;
    data.lessonDurationMin = res.value;
  }

  // 7. Optional Fees (whole numbers >= 0)
  if (!partial || has("tuitionFee")) {
    const res = parseOptionalInt(body.tuitionFee, 0, "INVALID_TUITION_FEE");
    if (res.error) return res;
    data.tuitionFee = res.value;
  }

  if (!partial || has("fullTimeTeachingFee")) {
    const res = parseOptionalInt(
      body.fullTimeTeachingFee,
      0,
      "INVALID_TEACHING_FEE",
    );
    if (res.error) return res;
    data.fullTimeTeachingFee = res.value;
  }

  if (!partial || has("partTimeTeachingFee")) {
    const res = parseOptionalInt(
      body.partTimeTeachingFee,
      0,
      "INVALID_TEACHING_FEE",
    );
    if (res.error) return res;
    data.partTimeTeachingFee = res.value;
  }

  // 8. Highlight flag & Sort Order (default 999)
  if (!partial || has("isHighlighted")) {
    data.isHighlighted = Boolean(body.isHighlighted);
  }

  if (!partial || has("sortOrder")) {
    const res = parseOptionalInt(body.sortOrder, 0, "INVALID_SORT_ORDER", 999);
    if (res.error) return res;
    data.sortOrder = res.value;
  }

  // Textbook IDs
  if (has("textbookIds")) {
    data.textbookIds = cleanStringArray(body.textbookIds);
  }

  return { data };
}

// Verify parent course exists and does not create a circular loop
async function validateParentCourse({ parentId, currentCourseId = null }) {
  if (!parentId) return { ok: true };

  if (currentCourseId && parentId === currentCourseId) {
    return { error: { status: 400, code: "CANNOT_PARENT_SELF" } };
  }

  const parentCourse = await prisma.course.findUnique({
    where: { id: parentId },
    select: { id: true, parentId: true },
  });

  if (!parentCourse) {
    return { error: { status: 400, code: "PARENT_COURSE_NOT_FOUND" } };
  }

  if (currentCourseId) {
    let cursorId = parentCourse.parentId;
    const visited = new Set([parentCourse.id]);

    while (cursorId) {
      if (cursorId === currentCourseId) {
        return { error: { status: 400, code: "CIRCULAR_COURSE_HIERARCHY" } };
      }
      if (visited.has(cursorId)) break;
      visited.add(cursorId);

      const ancestor = await prisma.course.findUnique({
        where: { id: cursorId },
        select: { id: true, parentId: true },
      });
      cursorId = ancestor?.parentId ?? null;
    }
  }

  return { ok: true };
}

// GET /api/admin/courses/options
export async function getCourseFormOptions(req, res) {
  try {
    const courses = await prisma.course.findMany({
      where: { isActive: true },
      orderBy: [
        { isHighlighted: "desc" },
        { sortOrder: "asc" },
        { code: "asc" },
      ],
      select: {
        id: true,
        code: true,
        parentId: true,
        nameTh: true,
        nameEn: true,
        isHighlighted: true,
        sortOrder: true,
      },
    });

    res.json({
      classTypes: CLASS_TYPES,
      courses,
    });
  } catch (err) {
    console.error("getCourseFormOptions error:", err);
    res.status(500).json({ code: "SERVER_ERROR" });
  }
}

// GET /api/admin/courses
export async function listCourses(req, res) {
  try {
    const { search, classType, status } = req.query;

    const where = {};
    if (classType && CLASS_TYPES.includes(classType)) {
      where.classType = classType;
    }
    if (status === "active") where.isActive = true;
    if (status === "inactive") where.isActive = false;

    const q = clean(search);
    if (q) {
      where.OR = [
        { code: { contains: q, mode: "insensitive" } },
        { nameTh: { contains: q, mode: "insensitive" } },
        { nameEn: { contains: q, mode: "insensitive" } },
      ];
    }

    const courses = await prisma.course.findMany({
      where,
      orderBy: [
        { isHighlighted: "desc" },
        { sortOrder: "asc" },
        { code: "asc" },
      ],
      select: COURSE_SELECT,
    });

    res.json({ courses });
  } catch (err) {
    console.error("listCourses error:", err);
    res.status(500).json({ code: "SERVER_ERROR" });
  }
}

// GET /api/admin/courses/:id
export async function getCourse(req, res) {
  try {
    const course = await prisma.course.findUnique({
      where: { id: req.params.id },
      select: COURSE_SELECT,
    });

    if (!course) {
      return res.status(404).json({ code: "COURSE_NOT_FOUND" });
    }

    res.json({ course });
  } catch (err) {
    console.error("getCourse error:", err);
    res.status(500).json({ code: "SERVER_ERROR" });
  }
}

// POST /api/admin/courses
export async function createCourse(req, res) {
  try {
    const { data, error } = readCourseInput(req.body);
    if (error) return res.status(400).json(error);

    const parentCheck = await validateParentCourse({
      parentId: data.parentId,
    });
    if (parentCheck.error) {
      return res
        .status(parentCheck.error.status)
        .json({ code: parentCheck.error.code });
    }

    const actorId = req.user.id;

    const course = await prisma.course.create({
      data: {
        ...data,
        createdById: actorId,
        updatedById: actorId,
      },
      select: COURSE_SELECT,
    });

    res.status(201).json({ course });
  } catch (err) {
    if (err.code === "P2002") {
      return res.status(409).json({ code: "COURSE_CODE_TAKEN" });
    }
    console.error("createCourse error:", err);
    res.status(500).json({ code: "SERVER_ERROR" });
  }
}

// PATCH /api/admin/courses/:id
export async function updateCourse(req, res) {
  try {
    const { id } = req.params;

    const target = await prisma.course.findUnique({
      where: { id },
    });
    if (!target) {
      return res.status(404).json({ code: "COURSE_NOT_FOUND" });
    }

    const { data, error } = readCourseInput(req.body, { partial: true });
    if (error) return res.status(400).json(error);

    if (data.parentId !== undefined) {
      const parentCheck = await validateParentCourse({
        parentId: data.parentId,
        currentCourseId: id,
      });
      if (parentCheck.error) {
        return res
          .status(parentCheck.error.status)
          .json({ code: parentCheck.error.code });
      }
    }

    const course = await prisma.course.update({
      where: { id },
      data: {
        ...data,
        updatedById: req.user.id,
      },
      select: COURSE_SELECT,
    });

    res.json({ course });
  } catch (err) {
    if (err.code === "P2002") {
      return res.status(409).json({ code: "COURSE_CODE_TAKEN" });
    }
    console.error("updateCourse error:", err);
    res.status(500).json({ code: "SERVER_ERROR" });
  }
}

// PATCH /api/admin/courses/:id/status
export async function setCourseStatus(req, res) {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== "boolean") {
      return res.status(400).json({ code: "MISSING_FIELDS" });
    }

    const target = await prisma.course.findUnique({
      where: { id },
      include: {
        subCourses: {
          where: { isActive: true },
          select: { id: true },
        },
      },
    });

    if (!target) {
      return res.status(404).json({ code: "COURSE_NOT_FOUND" });
    }

    // Prevent deactivating a main course that still have active sub-course
    if (!isActive && target.subCourses.length > 0) {
      return res.status(400).json({ code: "HAS_ACTIVE_SUBCOURSES" });
    }

    const course = await prisma.course.update({
      where: { id },
      data: {
        isActive,
        updatedById: req.user.id,
      },
      select: COURSE_SELECT,
    });

    res.json({ course });
  } catch (err) {
    console.error("setCourseStatus error:", err);
    res.status(500).json({ code: "SERVER_ERROR" });
  }
}
