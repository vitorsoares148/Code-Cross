const db = require("../../db");
const { analyzeCode } = require("./ai.service");

// ======================================================
// CRIAR REVISÃO
// ======================================================
async function createReview(
  userId,
  title,
  language,
  content,
  filename,
  analysisTypes,
) {
  const connection = await db.getConnection();

  let reviewId;

  try {
    await connection.beginTransaction();

    const [reviewResult] = await connection.query(
      `
        INSERT INTO reviews (
          user_id,
          title,
          language,
          status
        )
        VALUES (?, ?, ?, ?)
      `,
      [userId, title.trim(), language.trim(), "processing"],
    );

    reviewId = reviewResult.insertId;

    await connection.query(
      `
        INSERT INTO review_files (
          review_id,
          filename,
          language,
          content
        )
        VALUES (?, ?, ?, ?)
      `,
      [reviewId, filename.trim(), language.trim(), content],
    );

    if (analysisTypes?.length) {
      const [types] = await connection.query(
        `
          SELECT id, name
          FROM analysis_types
          WHERE name IN (?)
        `,
        [analysisTypes],
      );

      if (types.length !== analysisTypes.length) {
        throw new Error("INVALID_ANALYSIS_TYPE");
      }

      for (const type of types) {
        await connection.query(
          `
            INSERT INTO review_analysis_types (
              review_id,
              analysis_type_id
            )
            VALUES (?, ?)
          `,
          [reviewId, type.id],
        );
      }
    }

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }

  processReview(reviewId, language, content, analysisTypes);

  return {
    reviewId,
    status: "processing",
  };
}

// ======================================================
// PROCESSAR REVISÃO
// ======================================================
async function processReview(reviewId, language, content, analysisTypes) {
  try {
    const result = await analyzeCode(language, content, analysisTypes);

    const connection = await db.getConnection();

    try {
      await connection.beginTransaction();

      await connection.query(
        `
          UPDATE reviews
          SET
            summary = ?,
            status = ?
          WHERE id = ?
        `,
        [result.summary, "completed", reviewId],
      );

      for (const issue of result.issues) {
        await connection.query(
          `
            INSERT INTO review_issues (
              review_id,
              severity,
              category,
              line_start,
              line_end,
              title,
              explanation,
              suggestion,
              corrected_code
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          `,
          [
            reviewId,
            issue.severity,
            issue.category,
            issue.line_start,
            issue.line_end,
            issue.title,
            issue.explanation,
            issue.suggestion,
            issue.corrected_code,
          ],
        );
      }

      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Process review error:", error);

    try {
      await db.query(
        `
          UPDATE reviews
          SET status = ?
          WHERE id = ?
        `,
        ["failed", reviewId],
      );
    } catch (updateError) {
      console.error("Failed to update review status:", updateError);
    }
  }
}

// ======================================================
// CONSEGUIR REVISÕES
// ======================================================
async function getReviews(userId) {
  const [reviews] = await db.query(
    `
      SELECT
        id,
        title,
        language,
        status,
        created_at,
        updated_at
      FROM reviews
      WHERE user_id = ?
      ORDER BY created_at DESC, id DESC
    `,
    [userId],
  );

  return reviews;
}

// ======================================================
// CONSEGUIR REVISÃO
// ======================================================
async function getReview(reviewId, userId) {
  const [reviews] = await db.query(
    `
      SELECT
        id,
        title,
        language,
        summary,
        status,
        created_at,
        updated_at
      FROM reviews
      WHERE id = ?
        AND user_id = ?
    `,
    [reviewId, userId],
  );

  if (reviews.length === 0) {
    return "NOT_FOUND";
  }

  const review = reviews[0];

  const [files] = await db.query(
    `
      SELECT
        id,
        filename,
        language,
        content
      FROM review_files
      WHERE review_id = ?
    `,
    [reviewId],
  );

  const [issues] = await db.query(
    `
      SELECT
        id,
        file_id,
        severity,
        category,
        line_start,
        line_end,
        title,
        explanation,
        suggestion,
        corrected_code,
        created_at
      FROM review_issues
      WHERE review_id = ?
      ORDER BY line_start ASC, id ASC
    `,
    [reviewId],
  );

  return {
    ...review,
    files,
    issues,
  };
}

// ======================================================
// DELETAR REVISÃO
// ======================================================
async function deleteReview(reviewId, userId) {
  const [result] = await db.query(
    `
      DELETE FROM reviews
      WHERE id = ?
        AND user_id = ?
    `,
    [reviewId, userId],
  );

  if (result.affectedRows === 0) {
    return "NOT_FOUND";
  }

  return "SUCCESS";
}

module.exports = {
  createReview,
  getReviews,
  getReview,
  deleteReview,
};
