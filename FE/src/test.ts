describe("frontend sanity", () => {
  test("dom is available", () => {
    const el = document.createElement("div");
    expect(el.tagName).toBe("DIV");
  });
});
