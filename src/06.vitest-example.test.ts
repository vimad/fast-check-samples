import { test, fc } from '@fast-check/vitest';
import { expect } from "vitest";

// Record notation — inputs are passed as a named object
test.prop({ a: fc.string(), b: fc.string(), c: fc.string() })('should detect the substring', ({ a, b, c }) => {
    const text = a + b + c;
    expect(isSubstring(text, b)).toBe(true);
});

// Tuple notation — inputs are passed as positional arguments
test.prop([fc.string(), fc.string(), fc.string()])('should detect the substring', (a, b, c) => {
    const text = a + b + c;
    expect(isSubstring(text, b)).toBe(true);
});

// Code under test: should rather be imported from another file
function isSubstring(text, pattern) {
    return text.includes(pattern);
}