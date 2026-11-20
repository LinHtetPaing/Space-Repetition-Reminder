import { parseTipTapDoc } from "./tip-tap";

describe("parseTipTapDoc", () => {
  it("accepts a minimal doc", () => {
    const result = parseTipTapDoc({ type: "doc" });
    expect(result).toEqual({ ok: true, value: { type: "doc" } });
  });

  it("accepts a doc with paragraph content", () => {
    const doc = {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [{ type: "text", text: "hello" }],
        },
      ],
    };
    const result = parseTipTapDoc(doc);
    expect(result).toEqual({ ok: true, value: doc });
  });

  it("rejects an HTML string", () => {
    const result = parseTipTapDoc("<p>hello</p>");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toMatch(/not a string/i);
    }
  });

  it("rejects null", () => {
    const result = parseTipTapDoc(null);
    expect(result.ok).toBe(false);
  });

  it("rejects an array", () => {
    const result = parseTipTapDoc([{ type: "doc" }]);
    expect(result.ok).toBe(false);
  });

  it('rejects an object whose type is not "doc"', () => {
    const result = parseTipTapDoc({ type: "paragraph" });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toMatch(/type must be "doc"/);
    }
  });

  it("rejects content that is not an array", () => {
    const result = parseTipTapDoc({ type: "doc", content: "nope" });
    expect(result.ok).toBe(false);
  });
});
