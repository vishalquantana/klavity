// OpenAPI 3.1 spec for the Klavity public REST API (/api/v1/*).
// Served unauthenticated at GET /openapi.json so AI agents & tooling can discover
// the contract. Kept in sync with the real routes by server.openapi.test.ts, which
// asserts every path here is actually registered in server.ts (and vice-versa).

export const V1_PATHS = [
  "/api/v1/authored-runs",
  "/api/v1/authored-runs/{id}",
  "/api/v1/authored-runs/{id}/cancel",
  "/api/v1/runs",
  "/api/v1/runs/{id}",
  "/api/v1/runs/{id}/report",
  "/api/v1/runs/{id}/cancel",
  "/api/v1/tickets",
  "/api/v1/tickets/{id}",
  "/api/v1/tickets/{id}/comments",
  "/api/v1/tickets/{id}/activity",
  "/api/v1/tickets/{id}/replay",
] as const

const bearer = [{ kciBearer: [] as string[] }]

const errorResponse = {
  description: "Error",
  content: {
    "application/json": {
      schema: {
        type: "object",
        properties: {
          error: {
            type: "object",
            properties: {
              code: { type: "string" },
              message: { type: "string" },
              request_id: { type: "string" },
            },
            required: ["code", "message"],
          },
        },
      },
    },
  },
}

const projectQuery = {
  name: "project",
  in: "query",
  required: true,
  description: "Project id — must match the token's bound project.",
  schema: { type: "string" },
}

const idPath = {
  name: "id",
  in: "path",
  required: true,
  schema: { type: "string" },
}

export function buildOpenApiSpec(baseUrl = "https://klavity.in"): Record<string, unknown> {
  return {
    openapi: "3.1.0",
    info: {
      title: "Klavity AutoSim API",
      version: "1",
      description:
        "Trigger AI AutoSim QA walks of a web app, poll for completion, and pull structured findings. " +
        "All endpoints use a project-scoped `kci_` bearer token (Klavity dashboard → Settings → API tokens). " +
        "Human/agent docs: " + baseUrl + "/llms.txt",
    },
    servers: [{ url: baseUrl }],
    security: bearer,
    components: {
      securitySchemes: {
        kciBearer: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "kci_<token>",
          description: "Project-scoped token. Header: `Authorization: Bearer kci_...`",
        },
      },
      schemas: {
        RunStatus: {
          type: "object",
          properties: {
            run_id: { type: "string" },
            trail_id: { type: "string" },
            status: { type: "string", enum: ["queued", "running", "completed", "failed", "cancelled"] },
            verdict: { type: ["string", "null"], enum: ["green", "amber", "red", "skip", null] },
            summary: {
              type: "object",
              properties: { counts_by_severity: { type: "object", additionalProperties: { type: "integer" } } },
            },
            started_at: { type: ["integer", "null"] },
            finished_at: { type: ["integer", "null"] },
            git: { type: ["object", "null"] },
          },
        },
        Issue: {
          type: "object",
          properties: {
            id: { type: "string" },
            severity: { type: "string", enum: ["C1", "C2", "C3"] },
            title: { type: "string" },
            description: { type: "string" },
            target: {
              type: "object",
              properties: { url: { type: "string" }, selector: { type: "string" } },
            },
            evidence: {
              type: "object",
              properties: { screenshot_url: { type: "string" }, replay_url: { type: "string" } },
            },
            ground_quote: { type: "string" },
          },
        },
        Report: {
          type: "object",
          properties: {
            run_id: { type: "string" },
            verdict: { type: ["string", "null"] },
            issues: { type: "array", items: { $ref: "#/components/schemas/Issue" } },
            next_cursor: { type: ["string", "null"] },
          },
        },
        AuthoredRunStatus: {
          type: "object",
          properties: {
            authored_run_id: { type: "string" },
            status: { type: "string", enum: ["authoring", "completed", "failed", "needs_auth", "cancelled"] },
            trail_id: { type: ["string", "null"] },
            verification_run_id: { type: ["string", "null"] },
            verdict: { type: ["string", "null"] },
            objective_verified: { type: "boolean" },
            stall_reason: { type: ["string", "null"] },
            created_at: { type: "integer" },
            updated_at: { type: "integer" },
          },
        },
        Label: {
          type: "object",
          properties: {
            id: { type: "string" },
            name: { type: "string" },
            color: { type: "string" },
          },
        },
        Ticket: {
          type: "object",
          properties: {
            id: { type: "string" },
            seq_num: { type: ["integer", "null"] },
            title: { type: "string" },
            description: { type: ["string", "null"] },
            status: { type: "string", enum: ["new", "open", "in_progress", "done", "dismissed"] },
            priority: { type: ["string", "null"], enum: ["urgent", "high", "medium", "low", null] },
            assignee: { type: ["string", "null"] },
            source: { type: "string", enum: ["sim", "manual", "human"] },
            labels: { type: "array", items: { $ref: "#/components/schemas/Label" } },
            recurrence: { type: "integer" },
            created_at: { type: "integer" },
            updated_at: { type: ["integer", "null"] },
          },
        },
        TicketDetail: {
          allOf: [
            { $ref: "#/components/schemas/Ticket" },
            {
              type: "object",
              properties: {
                comments_count: { type: "integer" },
                attachments: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      name: { type: ["string", "null"] },
                      url: { type: ["string", "null"] },
                      content_type: { type: ["string", "null"] },
                    },
                  },
                },
                replay_url: { type: ["string", "null"] },
              },
            },
          ],
        },
        Comment: {
          type: "object",
          properties: {
            id: { type: "string" },
            author: { type: ["string", "null"] },
            body: { type: "string" },
            created_at: { type: "integer" },
          },
        },
      },
    },
    paths: {
      "/api/v1/authored-runs": {
        post: {
          summary: "Author + run an objective-driven AutoSim",
          description: "Give a URL and a plain-English objective; the engine authors a Trail and runs a verification walk. Rate limit: 10/min/project.",
          parameters: [{ name: "Idempotency-Key", in: "header", required: false, schema: { type: "string" } }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["project_id", "target_url", "objective"],
                  properties: {
                    project_id: { type: "string" },
                    target_url: { type: "string", format: "uri", maxLength: 500 },
                    objective: { type: "string", minLength: 10, maxLength: 4000 },
                    name: { type: "string" },
                    test_account: { type: "object" },
                  },
                },
              },
            },
          },
          responses: {
            "202": {
              description: "Accepted — authoring started",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      authored_run_id: { type: "string" },
                      status: { type: "string" },
                      status_url: { type: "string" },
                    },
                  },
                },
              },
            },
            "400": errorResponse, "402": errorResponse, "403": errorResponse, "409": errorResponse, "500": errorResponse,
          },
        },
      },
      "/api/v1/authored-runs/{id}": {
        get: {
          summary: "Get authored-run status",
          parameters: [idPath, projectQuery],
          responses: {
            "200": { description: "OK", content: { "application/json": { schema: { $ref: "#/components/schemas/AuthoredRunStatus" } } } },
            "403": errorResponse, "404": errorResponse,
          },
        },
      },
      "/api/v1/authored-runs/{id}/cancel": {
        post: {
          summary: "Cancel an authored run (best-effort)",
          parameters: [idPath, projectQuery],
          responses: {
            "200": { description: "OK", content: { "application/json": { schema: { $ref: "#/components/schemas/AuthoredRunStatus" } } } },
            "404": errorResponse,
          },
        },
      },
      "/api/v1/runs": {
        post: {
          summary: "Trigger a walk of an existing Trail",
          description: "Rate limit: 30/min/project.",
          parameters: [{ name: "Idempotency-Key", in: "header", required: false, schema: { type: "string" } }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["project_id", "trail_id"],
                  properties: {
                    project_id: { type: "string" },
                    trail_id: { type: "string" },
                    git: {
                      type: "object",
                      properties: { sha: { type: "string" }, pr: { type: "string" }, branch: { type: "string" } },
                    },
                  },
                },
              },
            },
          },
          responses: {
            "202": {
              description: "Accepted — run queued",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      run_id: { type: "string" },
                      status: { type: "string" },
                      status_url: { type: "string" },
                      report_url: { type: "string" },
                    },
                  },
                },
              },
            },
            "400": errorResponse, "403": errorResponse, "404": errorResponse, "409": errorResponse, "500": errorResponse,
          },
        },
        get: {
          summary: "List recent runs",
          parameters: [
            projectQuery,
            { name: "limit", in: "query", required: false, schema: { type: "integer", minimum: 1, maximum: 100, default: 20 } },
          ],
          responses: {
            "200": {
              description: "OK",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: { runs: { type: "array", items: { $ref: "#/components/schemas/RunStatus" } } },
                  },
                },
              },
            },
            "403": errorResponse,
          },
        },
      },
      "/api/v1/runs/{id}": {
        get: {
          summary: "Get run status + severity summary",
          parameters: [idPath, projectQuery],
          responses: {
            "200": { description: "OK", content: { "application/json": { schema: { $ref: "#/components/schemas/RunStatus" } } } },
            "403": errorResponse, "404": errorResponse,
          },
        },
      },
      "/api/v1/runs/{id}/report": {
        get: {
          summary: "Get cursor-paginated findings",
          parameters: [
            idPath,
            projectQuery,
            { name: "limit", in: "query", required: false, schema: { type: "integer", minimum: 1, maximum: 200, default: 50 } },
            { name: "cursor", in: "query", required: false, schema: { type: "string" } },
          ],
          responses: {
            "200": { description: "OK", content: { "application/json": { schema: { $ref: "#/components/schemas/Report" } } } },
            "403": errorResponse, "404": errorResponse,
          },
        },
      },
      "/api/v1/runs/{id}/cancel": {
        post: {
          summary: "Cancel a run (best-effort)",
          parameters: [idPath, projectQuery],
          responses: {
            "200": {
              description: "OK",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: { run_id: { type: "string" }, status: { type: "string" }, cancel_requested: { type: "boolean" } },
                  },
                },
              },
            },
            "404": errorResponse,
          },
        },
      },
      "/api/v1/tickets": {
        get: {
          summary: "List tickets (bugs/reports) for the token's project",
          description: "Project comes from the token; do not pass a project param. Filter + paginate.",
          parameters: [
            { name: "status", in: "query", required: false, schema: { type: "string" }, description: "Comma-separated statuses" },
            { name: "priority", in: "query", required: false, schema: { type: "string" }, description: "Comma-separated priorities" },
            { name: "assignee", in: "query", required: false, schema: { type: "string" }, description: "Exact email; empty = unassigned" },
            { name: "source", in: "query", required: false, schema: { type: "string", enum: ["sim", "manual", "human"] } },
            { name: "label", in: "query", required: false, schema: { type: "string" } },
            { name: "q", in: "query", required: false, schema: { type: "string" } },
            { name: "page", in: "query", required: false, schema: { type: "integer", minimum: 1, default: 1 } },
            { name: "limit", in: "query", required: false, schema: { type: "integer", minimum: 1, maximum: 200, default: 50 } },
          ],
          responses: {
            "200": {
              description: "OK",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      tickets: { type: "array", items: { $ref: "#/components/schemas/Ticket" } },
                      total: { type: "integer" }, page: { type: "integer" }, limit: { type: "integer" },
                    },
                  },
                },
              },
            },
            "401": errorResponse, "403": errorResponse,
          },
        },
        post: {
          summary: "Create a ticket",
          description: "assignee (email) is required. Rate limit: 30/min/project.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["title", "assignee"],
                  properties: {
                    title: { type: "string", maxLength: 500 },
                    description: { type: "string", maxLength: 5000 },
                    priority: { type: "string", enum: ["urgent", "high", "medium", "low"], default: "medium" },
                    assignee: { type: "string", format: "email" },
                  },
                },
              },
            },
          },
          responses: {
            "201": {
              description: "Created",
              content: { "application/json": { schema: { type: "object", properties: { ticket_id: { type: "string" } } } } },
            },
            "400": errorResponse, "401": errorResponse, "403": errorResponse, "429": errorResponse, "500": errorResponse,
          },
        },
      },
      "/api/v1/tickets/{id}": {
        get: {
          summary: "Get an enriched single ticket",
          parameters: [idPath],
          responses: {
            "200": { description: "OK", content: { "application/json": { schema: { $ref: "#/components/schemas/TicketDetail" } } } },
            "401": errorResponse, "403": errorResponse, "404": errorResponse,
          },
        },
        patch: {
          summary: "Update a ticket (status/priority/assignee/notes/description)",
          parameters: [idPath],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", enum: ["new", "open", "in_progress", "done", "dismissed"] },
                    priority: { type: "string", enum: ["urgent", "high", "medium", "low"] },
                    assignee: { type: ["string", "null"] },
                    notes: { type: ["string", "null"] },
                    description: { type: ["string", "null"] },
                  },
                },
              },
            },
          },
          responses: {
            "200": {
              description: "OK",
              content: {
                "application/json": {
                  schema: { type: "object", properties: { ok: { type: "boolean" }, ticket: { $ref: "#/components/schemas/Ticket" } } },
                },
              },
            },
            "400": errorResponse, "401": errorResponse, "403": errorResponse, "404": errorResponse, "500": errorResponse,
          },
        },
      },
      "/api/v1/tickets/{id}/comments": {
        get: {
          summary: "List a ticket's comments",
          parameters: [idPath],
          responses: {
            "200": {
              description: "OK",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: { ticket_id: { type: "string" }, comments: { type: "array", items: { $ref: "#/components/schemas/Comment" } } },
                  },
                },
              },
            },
            "401": errorResponse, "403": errorResponse, "404": errorResponse,
          },
        },
        post: {
          summary: "Add a comment to a ticket",
          parameters: [idPath],
          requestBody: {
            required: true,
            content: { "application/json": { schema: { type: "object", required: ["body"], properties: { body: { type: "string", maxLength: 5000 } } } } },
          },
          responses: {
            "201": { description: "Created", content: { "application/json": { schema: { type: "object", properties: { comment: { $ref: "#/components/schemas/Comment" } } } } } },
            "400": errorResponse, "401": errorResponse, "403": errorResponse, "404": errorResponse,
          },
        },
      },
      "/api/v1/tickets/{id}/activity": {
        get: {
          summary: "Get a ticket's activity timeline (comments + activity + connector exports)",
          parameters: [idPath],
          responses: {
            "200": {
              description: "OK",
              content: {
                "application/json": {
                  schema: { type: "object", properties: { ticket_id: { type: "string" }, events: { type: "array", items: { type: "object" } } } },
                },
              },
            },
            "401": errorResponse, "403": errorResponse, "404": errorResponse,
          },
        },
      },
      "/api/v1/tickets/{id}/replay": {
        get: {
          summary: "Stream a ticket's gzipped rrweb session replay",
          description: "Returns the recorded session-replay events for a ticket, gzip-encoded (Content-Encoding: gzip; body is a JSON events array). 404 when the ticket has no recording. This is the URL returned as `replay_url` by the single-ticket GET.",
          parameters: [idPath],
          responses: {
            "200": {
              description: "OK — gzipped JSON events array",
              content: { "application/json": { schema: { type: "array", items: { type: "object" } } } },
            },
            "401": errorResponse, "403": errorResponse, "404": errorResponse,
          },
        },
      },
    },
  }
}
