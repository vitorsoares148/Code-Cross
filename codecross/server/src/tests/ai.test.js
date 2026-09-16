jest.mock("openai", () => {
  const mockCreate = jest.fn();

  return jest.fn().mockImplementation(() => ({
    responses: {
      create: mockCreate,
    },
  }));
});

const OpenAI = require("openai");
const { analyzeCode } = require("../services/ai.service");

const mockCreate = OpenAI().responses.create;

describe("AI Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should return a valid code review", async () => {
    mockCreate.mockResolvedValue({
      output_text: JSON.stringify({
        summary: "O código contém problemas de segurança.",
        issues: [
          {
            severity: "high",
            category: "security",
            line_start: 1,
            line_end: 1,
            title: "SQL Injection",
            explanation:
              "O valor fornecido pelo usuário é inserido diretamente na consulta SQL.",
            suggestion:
              "Utilize consultas parametrizadas para evitar SQL Injection.",
            corrected_code: "const query = 'SELECT * FROM users WHERE id = ?';",
          },
        ],
      }),
    });

    const result = await analyzeCode(
      "javascript",
      "const query = `SELECT * FROM users WHERE id = ${id}`;",
      ["security"],
    );

    expect(result).toHaveProperty("summary");
    expect(result).toHaveProperty("issues");
    expect(result.issues).toHaveLength(1);

    expect(result.issues[0]).toMatchObject({
      severity: "high",
      category: "security",
      title: "SQL Injection",
    });

    expect(mockCreate).toHaveBeenCalledTimes(1);
  });

  test("should throw when OpenAI returns an empty response", async () => {
    mockCreate.mockResolvedValue({
      output_text: "",
    });

    await expect(
      analyzeCode("javascript", "const x = 10;", ["quality"]),
    ).rejects.toThrow("OPENAI_EMPTY_RESPONSE");

    expect(mockCreate).toHaveBeenCalledTimes(1);
  });

  test("should throw when OpenAI returns invalid JSON", async () => {
    mockCreate.mockResolvedValue({
      output_text: "invalid json",
    });

    await expect(
      analyzeCode("javascript", "const x = 10;", ["quality"]),
    ).rejects.toThrow("OPENAI_INVALID_JSON");

    expect(mockCreate).toHaveBeenCalledTimes(1);
  });

  test("should propagate OpenAI request errors", async () => {
    mockCreate.mockRejectedValue(new Error("OPENAI_REQUEST_FAILED"));

    await expect(
      analyzeCode("javascript", "const x = 10;", ["quality"]),
    ).rejects.toThrow("OPENAI_REQUEST_FAILED");

    expect(mockCreate).toHaveBeenCalledTimes(1);
  });
});
