import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.3",
    info: {
      title: "Compensation Intelligence API",
      version: "1.0.0",
      description:
        "REST API for exploring, comparing and benchmarking compensation data across companies, roles, levels and locations (INR).",
      contact: {
        name: "COMPINT",
      },
    },
    servers: [
      {
        url: "http://localhost:5000/api",
        description: "Local development server",
      },
    ],
    tags: [
      { name: "Compensation", description: "Compensation records, summaries and comparisons" },
      { name: "Companies", description: "Company lookup and level summaries" },
      { name: "Metadata", description: "Roles, levels and locations reference data" },
      { name: "Health", description: "Server health check" },
    ],
    components: {
      schemas: {
        // ---- Shared ----
        Pagination: {
          type: "object",
          properties: {
            page: { type: "integer", example: 1 },
            limit: { type: "integer", example: 20 },
            total: { type: "integer", example: 120 },
            totalPages: { type: "integer", example: 6 },
          },
        },
        Percentiles: {
          type: "object",
          properties: {
            p25: { type: "number", example: 2500000 },
            p50: { type: "number", example: 4000000 },
            p75: { type: "number", example: 6500000 },
            p90: { type: "number", example: 9000000 },
          },
        },
        // ---- Compensation ----
        CompensationRecord: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            companyId: { type: "integer", example: 3 },
            companyName: { type: "string", example: "Google" },
            roleId: { type: "integer", example: 1 },
            roleName: { type: "string", example: "Software Engineer" },
            levelId: { type: "integer", example: 2 },
            levelName: { type: "string", example: "IC3" },
            locationId: { type: "integer", example: 1 },
            locationName: { type: "string", example: "Bengaluru, India" },
            base: { type: "number", example: 3000000 },
            bonus: { type: "number", example: 500000 },
            equity: { type: "number", example: 1000000 },
            totalCompensation: { type: "number", example: 4500000 },
            experience: { type: "integer", example: 3 },
            verified: { type: "boolean", example: true },
          },
        },
        CompensationSummary: {
          type: "object",
          properties: {
            count: { type: "integer", example: 42 },
            base: { $ref: "#/components/schemas/Percentiles" },
            bonus: { $ref: "#/components/schemas/Percentiles" },
            equity: { $ref: "#/components/schemas/Percentiles" },
            totalCompensation: { $ref: "#/components/schemas/Percentiles" },
          },
        },
        ComparisonRow: {
          type: "object",
          properties: {
            companyId: { type: "integer", example: 3 },
            companyName: { type: "string", example: "Google" },
            base: { type: "number", example: 3000000 },
            bonus: { type: "number", example: 500000 },
            equity: { type: "number", example: 1000000 },
            totalCompensation: { type: "number", example: 4500000 },
            sampleCount: { type: "integer", example: 12 },
          },
        },
        // ---- Company ----
        Company: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            name: { type: "string", example: "Google" },
            website: { type: "string", nullable: true, example: null },
          },
        },
        CompanyLevelSummary: {
          type: "object",
          properties: {
            levelId: { type: "integer", example: 2 },
            levelName: { type: "string", example: "IC3" },
            medianTotalCompensation: { type: "number", example: 4500000 },
            sampleCount: { type: "integer", example: 8 },
          },
        },
        // ---- Metadata ----
        Role: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            name: { type: "string", example: "Software Engineer" },
          },
        },
        Level: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            name: { type: "string", example: "IC3" },
            rank: { type: "integer", example: 3 },
          },
        },
        Location: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            name: { type: "string", example: "Bengaluru, India" },
          },
        },
        // ---- Errors ----
        ErrorResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string", example: "Invalid query parameters" },
          },
        },
      },
    },
    paths: {
      // ---- Health ----
      "/health": {
        get: {
          tags: ["Health"],
          summary: "Health check",
          responses: {
            "200": {
              description: "API is running",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: true },
                      message: { type: "string", example: "Compensation Intelligence API is running" },
                    },
                  },
                },
              },
            },
          },
        },
      },
      // ---- Compensation ----
      "/compensation": {
        get: {
          tags: ["Compensation"],
          summary: "List compensation records",
          description: "Returns a paginated list of compensation records with optional filters.",
          parameters: [
            { name: "companyId", in: "query", schema: { type: "integer" } },
            { name: "roleId", in: "query", schema: { type: "integer" } },
            { name: "levelId", in: "query", schema: { type: "integer" } },
            { name: "locationId", in: "query", schema: { type: "integer" } },
            { name: "minTC", in: "query", description: "Minimum total compensation (₹)", schema: { type: "number" } },
            { name: "maxTC", in: "query", description: "Maximum total compensation (₹)", schema: { type: "number" } },
            {
              name: "sort",
              in: "query",
              schema: { type: "string", enum: ["base", "bonus", "equity", "totalCompensation", "experience"], default: "totalCompensation" },
            },
            { name: "order", in: "query", schema: { type: "string", enum: ["asc", "desc"], default: "desc" } },
            { name: "page", in: "query", schema: { type: "integer", minimum: 1, default: 1 } },
            { name: "limit", in: "query", schema: { type: "integer", minimum: 1, maximum: 100, default: 20 } },
          ],
          responses: {
            "200": {
              description: "Paginated compensation records",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      data: { type: "array", items: { $ref: "#/components/schemas/CompensationRecord" } },
                      pagination: { $ref: "#/components/schemas/Pagination" },
                    },
                  },
                },
              },
            },
            "400": { description: "Invalid query parameters", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
            "500": { description: "Internal server error", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
          },
        },
        post: {
          tags: ["Compensation"],
          summary: "Create a compensation record",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["companyId", "roleId", "levelId", "locationId", "experienceYears", "baseSalary", "compensationYear"],
                  properties: {
                    companyId: { type: "integer" },
                    roleId: { type: "integer" },
                    levelId: { type: "integer" },
                    locationId: { type: "integer" },
                    experienceYears: { type: "integer", minimum: 0, maximum: 50 },
                    baseSalary: { type: "number", minimum: 1 },
                    bonus: { type: "number", minimum: 0, default: 0 },
                    equity: { type: "number", minimum: 0, default: 0 },
                    compensationYear: { type: "integer", minimum: 2000, maximum: 2100 },
                    verified: { type: "boolean", default: false },
                  },
                },
              },
            },
          },
          responses: {
            "201": { description: "Record created" },
            "400": { description: "Validation error" },
            "404": { description: "Referenced entity not found" },
            "409": { description: "Duplicate record" },
            "500": { description: "Internal server error" },
          },
        },
      },
      "/compensation/summary": {
        get: {
          tags: ["Compensation"],
          summary: "Market benchmark — percentiles for a role/level/location",
          parameters: [
            { name: "roleId", in: "query", required: true, schema: { type: "integer" } },
            { name: "levelId", in: "query", required: true, schema: { type: "integer" } },
            { name: "locationId", in: "query", required: true, schema: { type: "integer" } },
            { name: "companyId", in: "query", schema: { type: "integer" } },
          ],
          responses: {
            "200": {
              description: "Compensation percentile summary",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean" },
                      data: { $ref: "#/components/schemas/CompensationSummary" },
                    },
                  },
                },
              },
            },
            "400": { description: "roleId, levelId or locationId missing" },
            "500": { description: "Internal server error" },
          },
        },
      },
      "/compensation/compare": {
        get: {
          tags: ["Compensation"],
          summary: "Compare median compensation across companies",
          parameters: [
            { name: "roleId", in: "query", required: true, schema: { type: "integer" } },
            { name: "levelId", in: "query", required: true, schema: { type: "integer" } },
            { name: "locationId", in: "query", required: true, schema: { type: "integer" } },
            {
              name: "companyIds",
              in: "query",
              description: "Comma-separated list of company IDs, e.g. 1,2,3",
              schema: { type: "string" },
            },
          ],
          responses: {
            "200": {
              description: "Comparison rows sorted by total compensation descending",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean" },
                      data: { type: "array", items: { $ref: "#/components/schemas/ComparisonRow" } },
                    },
                  },
                },
              },
            },
            "400": { description: "Required params missing" },
            "500": { description: "Internal server error" },
          },
        },
      },
      "/compensation/{id}": {
        get: {
          tags: ["Compensation"],
          summary: "Get a single compensation record by ID",
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
          responses: {
            "200": { description: "Compensation record" },
            "404": { description: "Record not found" },
            "500": { description: "Internal server error" },
          },
        },
      },
      // ---- Companies ----
      "/companies": {
        get: {
          tags: ["Companies"],
          summary: "List all companies (alphabetical)",
          responses: {
            "200": {
              description: "Array of companies",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean" },
                      data: { type: "array", items: { $ref: "#/components/schemas/Company" } },
                    },
                  },
                },
              },
            },
          },
        },
      },
      "/companies/{id}": {
        get: {
          tags: ["Companies"],
          summary: "Get a company by ID",
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
          responses: {
            "200": { description: "Company object" },
            "400": { description: "Invalid ID" },
            "404": { description: "Company not found" },
          },
        },
      },
      "/companies/{id}/compensation-summary": {
        get: {
          tags: ["Companies"],
          summary: "Median total compensation per level for a company",
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
          responses: {
            "200": {
              description: "Level breakdown with median TC and sample count",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean" },
                      data: {
                        type: "object",
                        properties: {
                          levels: { type: "array", items: { $ref: "#/components/schemas/CompanyLevelSummary" } },
                        },
                      },
                    },
                  },
                },
              },
            },
            "400": { description: "Invalid ID" },
            "500": { description: "Internal server error" },
          },
        },
      },
      // ---- Metadata ----
      "/roles": {
        get: {
          tags: ["Metadata"],
          summary: "List all roles",
          responses: {
            "200": {
              description: "Array of roles",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean" },
                      data: { type: "array", items: { $ref: "#/components/schemas/Role" } },
                    },
                  },
                },
              },
            },
          },
        },
      },
      "/levels": {
        get: {
          tags: ["Metadata"],
          summary: "List all levels (sorted by rank)",
          responses: {
            "200": {
              description: "Array of levels",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean" },
                      data: { type: "array", items: { $ref: "#/components/schemas/Level" } },
                    },
                  },
                },
              },
            },
          },
        },
      },
      "/locations": {
        get: {
          tags: ["Metadata"],
          summary: "List all locations (name = city, country)",
          responses: {
            "200": {
              description: "Array of locations",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean" },
                      data: { type: "array", items: { $ref: "#/components/schemas/Location" } },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  apis: [], // paths defined inline above — no JSDoc scanning needed
};

export const swaggerSpec = swaggerJsdoc(options);
