import { describe, it, expect } from "vitest";
import { loginSchema, registerSchema } from "./schemas";

describe("loginSchema", () => {
  it("accepts valid input", () => {
    const result = loginSchema.safeParse({
      email: "a@b.com",
      password: "password1",
    });
    expect(result.success).toBe(true);
  });

  it("rejects short password", () => {
    const result = loginSchema.safeParse({
      email: "a@b.com",
      password: "short",
    });
    expect(result.success).toBe(false);
  });
});

describe("registerSchema", () => {
  it("accepts valid input", () => {
    const result = registerSchema.safeParse({
      name: "Test",
      email: "a@b.com",
      password: "password1",
    });
    expect(result.success).toBe(true);
  });
});
