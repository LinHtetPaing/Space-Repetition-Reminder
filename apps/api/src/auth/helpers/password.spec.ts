import { passwordsMatch } from "./password";

describe("passwordsMatch", () => {
  it("returns true when equal", () => {
    expect(passwordsMatch("secret123", "secret123")).toBe(true);
  });

  it("returns false when different", () => {
    expect(passwordsMatch("secret123", "secret124")).toBe(false);
  });
});
