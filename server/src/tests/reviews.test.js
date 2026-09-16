const request = require("supertest");

jest.mock("../services/ai.service", () => ({
  analyzeCode: jest.fn(() => new Promise(() => {})),
}));

const app = require("../app");
const db = require("../../db");

const cleanupDatabase = require("./helpers/cleanup");

async function registerUser(name, email) {
  const response = await request(app).post("/api/auth/register").send({
    name,
    email,
    password: "password123",
  });

  expect(response.statusCode).toBe(201);

  return response.headers["set-cookie"];
}

async function getUserId(name) {
  const [users] = await db.query(
    `
      SELECT id
      FROM users
      WHERE username = ?
    `,
    [name],
  );

  return users[0].id;
}

async function createReview(userId, title = "Test Review") {
  const [result] = await db.query(
    `
      INSERT INTO reviews (
        user_id,
        title,
        language,
        summary,
        status
      )
      VALUES (?, ?, ?, ?, ?)
    `,
    [userId, title, "javascript", "Test summary", "completed"],
  );

  return result.insertId;
}

beforeEach(cleanupDatabase);

afterAll(async () => {
  await db.end();
});

// ======================================================
// CRIAR REVISÃO
// ======================================================

describe("Reviews - Create", () => {
  test("deve criar uma revisão", async () => {
    const cookie = await registerUser("Review User", "reviewuser@example.com");

    const response = await request(app)
      .post("/api/reviews")
      .set("Cookie", cookie)
      .send({
        title: "Minha revisão",
        language: "javascript",
        filename: "test.js",
        content: "const value = 1;",
        analysisTypes: ["bug", "security"],
      });

    expect(response.statusCode).toBe(201);
    expect(response.body.message).toBe("SUCCESS");
    expect(response.body.reviewId).toEqual(expect.any(Number));
    expect(response.body.status).toBe("processing");

    const [reviews] = await db.query(
      `
        SELECT user_id, title, language, status
        FROM reviews
        WHERE id = ?
      `,
      [response.body.reviewId],
    );

    expect(reviews).toHaveLength(1);
    expect(reviews[0].title).toBe("Minha revisão");
    expect(reviews[0].language).toBe("javascript");
    expect(reviews[0].status).toBe("processing");

    const [files] = await db.query(
      `
        SELECT filename, language, content
        FROM review_files
        WHERE review_id = ?
      `,
      [response.body.reviewId],
    );

    expect(files).toEqual([
      {
        filename: "test.js",
        language: "javascript",
        content: "const value = 1;",
      },
    ]);

    const [types] = await db.query(
      `
        SELECT at.name
        FROM review_analysis_types rat
        JOIN analysis_types at ON at.id = rat.analysis_type_id
        WHERE rat.review_id = ?
        ORDER BY at.name ASC
      `,
      [response.body.reviewId],
    );

    expect(types.map((type) => type.name)).toEqual(["bug", "security"]);
  });

  test("deve rejeitar criação sem autenticação", async () => {
    const response = await request(app)
      .post("/api/reviews")
      .send({
        title: "Minha revisão",
        language: "javascript",
        filename: "test.js",
        content: "const value = 1;",
        analysisTypes: ["bug"],
      });

    expect(response.statusCode).toBe(401);
    expect(response.body.error).toBe("NOT_AUTHENTICATED");
  });

  test("deve rejeitar criação com dados inválidos", async () => {
    const cookie = await registerUser("Review User", "reviewuser@example.com");

    const response = await request(app)
      .post("/api/reviews")
      .set("Cookie", cookie)
      .send({
        title: "",
        language: "javascript",
        filename: "test.js",
        content: "const value = 1;",
        analysisTypes: ["bug"],
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe("INVALID_DATA");
  });

  test("deve rejeitar uma análise com tipo inválido", async () => {
    const cookie = await registerUser("Review User", "reviewuser@example.com");

    const response = await request(app)
      .post("/api/reviews")
      .set("Cookie", cookie)
      .send({
        title: "Minha revisão",
        language: "javascript",
        filename: "test.js",
        content: "const value = 1;",
        analysisTypes: ["invalid-type"],
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe("INVALID_ANALYSIS_TYPE");

    const [reviews] = await db.query("SELECT id FROM reviews");
    expect(reviews).toHaveLength(0);
  });
});

// ======================================================
// CONSEGUIR REVISÕES
// ======================================================

describe("Reviews - Get All", () => {
  test("deve retornar apenas as revisões do usuário autenticado", async () => {
    const firstCookie = await registerUser("First User", "first@example.com");
    const secondCookie = await registerUser(
      "Second User",
      "second@example.com",
    );

    const firstUserId = await getUserId("First User");
    const secondUserId = await getUserId("Second User");

    const firstReviewId = await createReview(firstUserId, "First Review");
    await createReview(firstUserId, "Second Review");
    await createReview(secondUserId, "Other User Review");

    const response = await request(app)
      .get("/api/reviews")
      .set("Cookie", firstCookie);

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe("SUCCESS");
    expect(response.body.reviews).toHaveLength(2);
    expect(response.body.reviews.map((review) => review.title)).toEqual([
      "Second Review",
      "First Review",
    ]);
    expect(response.body.reviews.map((review) => review.id)).toContain(
      firstReviewId,
    );

    const otherResponse = await request(app)
      .get("/api/reviews")
      .set("Cookie", secondCookie);

    expect(otherResponse.statusCode).toBe(200);
    expect(otherResponse.body.reviews).toHaveLength(1);
    expect(otherResponse.body.reviews[0].title).toBe("Other User Review");
  });

  test("deve rejeitar acesso sem autenticação", async () => {
    const response = await request(app).get("/api/reviews");

    expect(response.statusCode).toBe(401);
    expect(response.body.error).toBe("NOT_AUTHENTICATED");
  });
});

// ======================================================
// CONSEGUIR REVISÃO
// ======================================================

describe("Reviews - Get One", () => {
  test("deve retornar uma revisão com seus arquivos e problemas", async () => {
    const cookie = await registerUser("Review User", "reviewuser@example.com");
    const userId = await getUserId("Review User");
    const reviewId = await createReview(userId);

    const [fileResult] = await db.query(
      `
        INSERT INTO review_files (
          review_id,
          filename,
          language,
          content
        )
        VALUES (?, ?, ?, ?)
      `,
      [reviewId, "test.js", "javascript", "const value = 1;"],
    );

    await db.query(
      `
        INSERT INTO review_issues (
          review_id,
          file_id,
          severity,
          category,
          line_start,
          line_end,
          title,
          explanation,
          suggestion,
          corrected_code
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        reviewId,
        fileResult.insertId,
        "high",
        "security",
        1,
        1,
        "Problema de segurança",
        "Explicação do problema",
        "Corrija o problema",
        "const value = 2;",
      ],
    );

    const response = await request(app)
      .get(`/api/reviews/${reviewId}`)
      .set("Cookie", cookie);

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe("SUCCESS");
    expect(response.body.review).toEqual(
      expect.objectContaining({
        id: reviewId,
        title: "Test Review",
        language: "javascript",
        summary: "Test summary",
        status: "completed",
      }),
    );

    expect(response.body.review.files).toEqual([
      expect.objectContaining({
        id: fileResult.insertId,
        filename: "test.js",
        language: "javascript",
        content: "const value = 1;",
      }),
    ]);

    expect(response.body.review.issues).toEqual([
      expect.objectContaining({
        file_id: fileResult.insertId,
        severity: "high",
        category: "security",
        line_start: 1,
        line_end: 1,
        title: "Problema de segurança",
      }),
    ]);
  });

  test("deve retornar NOT_FOUND ao tentar acessar revisão de outro usuário", async () => {
    const ownerCookie = await registerUser("Owner User", "owner@example.com");
    const ownerId = await getUserId("Owner User");
    const reviewId = await createReview(ownerId);

    const otherCookie = await registerUser("Other User", "other@example.com");

    const response = await request(app)
      .get(`/api/reviews/${reviewId}`)
      .set("Cookie", otherCookie);

    expect(response.statusCode).toBe(404);
    expect(response.body.error).toBe("NOT_FOUND");

    const ownerResponse = await request(app)
      .get(`/api/reviews/${reviewId}`)
      .set("Cookie", ownerCookie);

    expect(ownerResponse.statusCode).toBe(200);
  });

  test.each(["0", "-1", "abc", "1.5"])(
    "deve rejeitar ID inválido: %s",
    async (reviewId) => {
      const cookie = await registerUser(
        "Review User",
        `review-${reviewId.replace(/[^a-z0-9]/gi, "") || "user"}@example.com`,
      );

      const response = await request(app)
        .get(`/api/reviews/${reviewId}`)
        .set("Cookie", cookie);

      expect(response.statusCode).toBe(400);
      expect(response.body.error).toBe("INVALID_DATA");
    },
  );

  test("deve retornar NOT_FOUND para revisão inexistente", async () => {
    const cookie = await registerUser("Review User", "reviewuser@example.com");

    const response = await request(app)
      .get("/api/reviews/999999")
      .set("Cookie", cookie);

    expect(response.statusCode).toBe(404);
    expect(response.body.error).toBe("NOT_FOUND");
  });

  test("deve rejeitar acesso sem autenticação", async () => {
    const response = await request(app).get("/api/reviews/1");

    expect(response.statusCode).toBe(401);
    expect(response.body.error).toBe("NOT_AUTHENTICATED");
  });
});

// ======================================================
// DELETAR REVISÃO
// ======================================================

describe("Reviews - Delete", () => {
  test("deve deletar uma revisão do usuário autenticado", async () => {
    const cookie = await registerUser("Review User", "reviewuser@example.com");
    const userId = await getUserId("Review User");
    const reviewId = await createReview(userId);

    const [fileResult] = await db.query(
      `
        INSERT INTO review_files (
          review_id,
          filename,
          language,
          content
        )
        VALUES (?, ?, ?, ?)
      `,
      [reviewId, "test.js", "javascript", "const value = 1;"],
    );

    await db.query(
      `
        INSERT INTO review_issues (
          review_id,
          file_id,
          severity,
          category,
          line_start,
          line_end,
          title,
          explanation
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        reviewId,
        fileResult.insertId,
        "medium",
        "quality",
        1,
        1,
        "Problema de qualidade",
        "Explicação",
      ],
    );

    const [[analysisType]] = await db.query(
      `
        SELECT id
        FROM analysis_types
        WHERE name = ?
      `,
      ["bug"],
    );

    await db.query(
      `
        INSERT INTO review_analysis_types (review_id, analysis_type_id)
        VALUES (?, ?)
      `,
      [reviewId, analysisType.id],
    );

    const response = await request(app)
      .delete(`/api/reviews/${reviewId}`)
      .set("Cookie", cookie);

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe("SUCCESS");

    const [reviews] = await db.query("SELECT id FROM reviews WHERE id = ?", [
      reviewId,
    ]);
    const [files] = await db.query(
      "SELECT id FROM review_files WHERE review_id = ?",
      [reviewId],
    );
    const [issues] = await db.query(
      "SELECT id FROM review_issues WHERE review_id = ?",
      [reviewId],
    );
    const [reviewTypes] = await db.query(
      "SELECT review_id FROM review_analysis_types WHERE review_id = ?",
      [reviewId],
    );

    expect(reviews).toHaveLength(0);
    expect(files).toHaveLength(0);
    expect(issues).toHaveLength(0);
    expect(reviewTypes).toHaveLength(0);
  });

  test("deve retornar NOT_FOUND ao tentar deletar revisão de outro usuário", async () => {
    const ownerCookie = await registerUser("Owner User", "owner@example.com");
    const ownerId = await getUserId("Owner User");
    const reviewId = await createReview(ownerId);

    const otherCookie = await registerUser("Other User", "other@example.com");

    const response = await request(app)
      .delete(`/api/reviews/${reviewId}`)
      .set("Cookie", otherCookie);

    expect(response.statusCode).toBe(404);
    expect(response.body.error).toBe("NOT_FOUND");

    const ownerResponse = await request(app)
      .get(`/api/reviews/${reviewId}`)
      .set("Cookie", ownerCookie);

    expect(ownerResponse.statusCode).toBe(200);
  });

  test("deve retornar NOT_FOUND para revisão inexistente", async () => {
    const cookie = await registerUser("Review User", "reviewuser@example.com");

    const response = await request(app)
      .delete("/api/reviews/999999")
      .set("Cookie", cookie);

    expect(response.statusCode).toBe(404);
    expect(response.body.error).toBe("NOT_FOUND");
  });

  test.each(["0", "-1", "abc", "1.5"])(
    "deve rejeitar ID inválido: %s",
    async (reviewId) => {
      const cookie = await registerUser(
        "Review User",
        `delete-${reviewId.replace(/[^a-z0-9]/gi, "") || "user"}@example.com`,
      );

      const response = await request(app)
        .delete(`/api/reviews/${reviewId}`)
        .set("Cookie", cookie);

      expect(response.statusCode).toBe(400);
      expect(response.body.error).toBe("INVALID_DATA");
    },
  );

  test("deve rejeitar acesso sem autenticação", async () => {
    const response = await request(app).delete("/api/reviews/1");

    expect(response.statusCode).toBe(401);
    expect(response.body.error).toBe("NOT_AUTHENTICATED");
  });
});
