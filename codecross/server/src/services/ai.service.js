const OpenAI = require("openai");

const ai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const reviewSchema = {
  type: "object",
  properties: {
    summary: {
      type: "string",
    },
    issues: {
      type: "array",
      items: {
        type: "object",
        properties: {
          severity: {
            type: "string",
            enum: ["critical", "high", "medium", "low", "suggestion"],
          },
          category: {
            type: "string",
            enum: [
              "bug",
              "security",
              "performance",
              "quality",
              "architecture",
            ],
          },
          line_start: {
            type: "integer",
          },
          line_end: {
            type: "integer",
          },
          title: {
            type: "string",
          },
          explanation: {
            type: "string",
          },
          suggestion: {
            type: ["string", "null"],
          },
          corrected_code: {
            type: ["string", "null"],
          },
        },
        required: [
          "severity",
          "category",
          "line_start",
          "line_end",
          "title",
          "explanation",
          "suggestion",
          "corrected_code",
        ],
        additionalProperties: false,
      },
    },
  },
  required: ["summary", "issues"],
  additionalProperties: false,
};

function buildPrompt(language, content, analysisTypes) {
  return `
You are a software quality assistant helping developers improve
their own source code.

IMPORTANT:
- Respond entirely in Brazilian Portuguese (pt-BR).
- All natural-language fields in the JSON response must be in Brazilian Portuguese,
  including summary, title, explanation, suggestion, and any other text.
- Keep code, variable names, function names, library names, and technical identifiers
  in their original language.
- Do not translate source code.

Perform a defensive static code review of the provided source code.

Analyze only these categories:

${analysisTypes.join(", ")}

Do not execute the code or provide instructions for exploiting
vulnerabilities or attacking systems.

Identify weaknesses, bugs, quality problems, performance problems,
security weaknesses, or architectural problems that are supported
by the provided source code.

For every issue:
- Identify the exact line or lines where the issue occurs.
- Explain why the code is problematic.
- Explain how the developer should fix it.
- Provide corrected code when appropriate.
- Do not invent issues that are not supported by the source code.
- Only report issues belonging to the requested analysis categories.
- Do not report the same underlying problem multiple times unless
  each report identifies a distinct impact or remediation.

IMPORTANT REASONING RULES:
- Distinguish between:
  1. issues directly demonstrated by the provided code,
  2. security risks caused by missing controls that are visibly absent
     from the provided code,
  3. issues that depend on behavior outside the provided code.
- You may report missing security controls when their absence is directly
  visible in the provided code.
- Do not assume that an external control exists unless it is shown
  in the provided source.
- If an issue depends on behavior outside the provided code, explicitly
  state that it cannot be confirmed from the provided source.
- Do not present assumptions as confirmed vulnerabilities.
- Do not report an issue solely because something could theoretically
  be improved. The issue must have a concrete correctness, security,
  performance, maintainability, accessibility, or architectural impact.

SECURITY:
- Check authentication and authorization controls.
- Check whether authenticated users can modify authorization-related
  fields such as roles, permissions, ownership, or account status.
- Check whether sensitive fields such as passwords, password-reset tokens,
  API keys, secrets, or internal data are returned to clients.
- Check password-reset flows for token expiration, single-use enforcement,
  secure delivery, secure storage, and user enumeration.
- Check authentication flows for user enumeration and brute-force protection.
- Check for hardcoded credentials, secrets, API keys, or tokens.
- Check for injection vulnerabilities, including SQL injection.
- For SQL injection, always recommend parameterized queries/prepared statements.
- Do not recommend manually escaping SQL values as the primary solution.
- Never recommend exposing internal error messages, stack traces,
  database errors, credentials, or other sensitive implementation details
  to the client.

REACT AND FRONTEND:
- Check for direct mutation of React state.
- Check for stale state captured by asynchronous callbacks.
- When a state update depends on previous state, check whether a functional
  state update is required.
- Check asynchronous effects for race conditions and lifecycle problems
  when relevant.
- Check whether asynchronous operations can update state after the component
  is no longer relevant and whether cancellation is appropriate.
- Check loading and error state handling.
- Check for unsafe or invalid type conversions.
- Check for missing input validation.
- Check for incorrect effect dependencies when they create a concrete problem.
- Check for unstable or missing list keys when relevant.
- Check for unnecessary repeated expensive computations when they have
  a meaningful performance impact.
- Check whether API communication is unnecessarily mixed into UI components
  when this creates a clear separation-of-concerns problem.

GENERAL CODE QUALITY:
- Check for duplicated logic.
- Check for unnecessarily complex or tightly coupled code.
- Check for incorrect or unsafe data handling.
- Check for unhandled synchronous or asynchronous errors.
- Check for meaningful maintainability problems.
- Do not report subjective coding preferences as problems unless they have
  a concrete impact on the code.
- Do not report subjective UX preferences as problems unless they have a
  concrete usability, accessibility, maintainability, or correctness impact.

PERFORMANCE:
- Check for unnecessarily repeated expensive operations.
- Check for inefficient database queries or missing pagination when relevant.
- Check for inefficient algorithms or data processing when the impact can
  reasonably be established from the provided code.
- Do not report a performance issue merely because an operation could
  theoretically be optimized.

ARCHITECTURE:
- Check separation of responsibilities between UI, business logic,
  API communication, and data access when the provided code makes this
  separation relevant.
- Check for duplicated business logic.
- Check for tightly coupled components or modules.
- Do not require a specific architecture unless the current structure
  creates a concrete maintainability or scalability problem.

SEVERITY:
- Assign severity based only on the impact that can be reasonably established
  from the provided source code.
- Do not automatically classify security issues as critical.
- Use critical only when the provided code clearly supports a severe impact.
- Do not exaggerate severity based on hypothetical scenarios.
- Use lower severity when the impact depends on behavior that cannot be
  confirmed from the provided source.

CORRECTED CODE:
- Corrected code must actually address the identified issue.
- Keep corrected code consistent with the surrounding code and technology.
- Do not provide incomplete placeholders such as "..." unless the omitted
  code is irrelevant to demonstrating the fix.
- Do not introduce unrelated changes.
- Preserve the original behavior whenever possible.
- For security fixes, use established secure practices.

The line numbers must correspond to the source code provided.
Do not invent line numbers.

Source code:

\`\`\`${language}
${content}
\`\`\`
`;
}

async function analyzeCode(language, content, analysisTypes) {
  const prompt = buildPrompt(language, content, analysisTypes);

  try {
    const response = await ai.responses.create({
      model: "gpt-5.6-luna",
      input: prompt,
      text: {
        format: {
          type: "json_schema",
          name: "code_review",
          strict: true,
          schema: reviewSchema,
        },
      },
    });

    if (!response.output_text) {
      throw new Error("OPENAI_EMPTY_RESPONSE");
    }

    try {
      return JSON.parse(response.output_text);
    } catch (error) {
      console.error("OpenAI returned invalid JSON:", response.output_text);
      throw new Error("OPENAI_INVALID_JSON");
    }
  } catch (error) {
    console.error("OpenAI request failed:", error);
    throw error;
  }
}

module.exports = {
  analyzeCode,
};