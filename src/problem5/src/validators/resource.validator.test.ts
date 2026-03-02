import {
  createResourceSchema,
  updateResourceSchema,
  listResourcesSchema,
  resourceIdSchema,
} from "./resource.validator";

// ─── createResourceSchema ────────────────────────────────────────────────────

describe("createResourceSchema", () => {
  it("should pass with required name only", () => {
    const result = createResourceSchema.safeParse({ name: "Auth Service" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe("active"); // default
    }
  });

  it("should pass with all fields provided", () => {
    const result = createResourceSchema.safeParse({
      name: "Auth Service",
      description: "JWT auth",
      status: "inactive",
    });
    expect(result.success).toBe(true);
  });

  it("should trim whitespace from name", () => {
    const result = createResourceSchema.safeParse({ name: "  Hello  " });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.name).toBe("Hello");
  });

  it("should fail when name is missing", () => {
    const result = createResourceSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("should fail when name is empty string", () => {
    const result = createResourceSchema.safeParse({ name: "" });
    expect(result.success).toBe(false);
  });

  it("should fail when name exceeds 255 chars", () => {
    const result = createResourceSchema.safeParse({ name: "a".repeat(256) });
    expect(result.success).toBe(false);
  });

  it("should fail when description exceeds 2000 chars", () => {
    const result = createResourceSchema.safeParse({
      name: "Test",
      description: "x".repeat(2001),
    });
    expect(result.success).toBe(false);
  });

  it("should fail when status is not a valid enum value", () => {
    const result = createResourceSchema.safeParse({
      name: "Test",
      status: "deleted",
    });
    expect(result.success).toBe(false);
  });

  it("should accept all valid status values", () => {
    for (const status of ["active", "inactive", "archived"] as const) {
      const result = createResourceSchema.safeParse({ name: "X", status });
      expect(result.success).toBe(true);
    }
  });
});

// ─── updateResourceSchema ────────────────────────────────────────────────────

describe("updateResourceSchema", () => {
  it("should pass with at least one field", () => {
    expect(updateResourceSchema.safeParse({ name: "New name" }).success).toBe(
      true,
    );
    expect(updateResourceSchema.safeParse({ status: "archived" }).success).toBe(
      true,
    );
    expect(updateResourceSchema.safeParse({ description: null }).success).toBe(
      true,
    );
  });

  it("should fail when body is empty (no fields provided)", () => {
    const result = updateResourceSchema.safeParse({});
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        "At least one field must be provided for update",
      );
    }
  });

  it("should allow description to be set to null (clear)", () => {
    const result = updateResourceSchema.safeParse({ description: null });
    expect(result.success).toBe(true);
  });

  it("should fail when name is empty string", () => {
    const result = updateResourceSchema.safeParse({ name: "" });
    expect(result.success).toBe(false);
  });

  it("should fail when status is invalid", () => {
    const result = updateResourceSchema.safeParse({ status: "gone" });
    expect(result.success).toBe(false);
  });
});

// ─── listResourcesSchema ─────────────────────────────────────────────────────

describe("listResourcesSchema", () => {
  it("should use defaults when no params provided", () => {
    const result = listResourcesSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
    }
  });

  it("should coerce string page/limit to numbers", () => {
    const result = listResourcesSchema.safeParse({ page: "2", limit: "10" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(2);
      expect(result.data.limit).toBe(10);
    }
  });

  it("should fail when page is 0", () => {
    expect(listResourcesSchema.safeParse({ page: "0" }).success).toBe(false);
  });

  it("should fail when limit exceeds 100", () => {
    expect(listResourcesSchema.safeParse({ limit: "101" }).success).toBe(false);
  });

  it("should fail when limit is 0", () => {
    expect(listResourcesSchema.safeParse({ limit: "0" }).success).toBe(false);
  });

  it("should accept valid status filter", () => {
    const result = listResourcesSchema.safeParse({ status: "active" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.status).toBe("active");
  });

  it("should fail with invalid status filter", () => {
    expect(listResourcesSchema.safeParse({ status: "banned" }).success).toBe(
      false,
    );
  });

  it("should accept and trim name filter", () => {
    const result = listResourcesSchema.safeParse({ name: "  service  " });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.name).toBe("service");
  });
});

// ─── resourceIdSchema ────────────────────────────────────────────────────────

describe("resourceIdSchema", () => {
  it("should pass with a non-empty id", () => {
    expect(resourceIdSchema.safeParse({ id: "cm9abc123" }).success).toBe(true);
  });

  it("should fail with an empty id", () => {
    const result = resourceIdSchema.safeParse({ id: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("id is required");
    }
  });

  it("should fail when id is missing", () => {
    expect(resourceIdSchema.safeParse({}).success).toBe(false);
  });
});
