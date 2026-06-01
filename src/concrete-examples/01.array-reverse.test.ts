import { describe, it, expect } from 'vitest';
import fc from 'fast-check';

function reverse<T>(arr: T[]): T[] {
    return [...arr].reverse();
}

describe('reverse', () => {
    it('reversing twice returns the original array', () => {
        fc.assert(
            fc.property(
                fc.array(fc.integer()),
                (arr) => {
                    expect(
                        reverse(reverse(arr))
                    ).toEqual(arr);
                }
            )
        );
    });

    it('preserves length', () => {
        fc.assert(
            fc.property(
                fc.array(fc.integer()),
                (arr) => {
                    expect(
                        reverse(arr).length
                    ).toBe(arr.length);
                }
            )
        );
    });

    it('preserves elements', () => {
        fc.assert(
            fc.property(
                fc.array(fc.integer()),
                (arr) => {
                    const reversed = reverse(arr);

                    expect(
                        [...reversed].sort((a, b) => a - b)
                    ).toEqual(
                        [...arr].sort((a, b) => a - b)
                    );
                }
            )
        );
    });

    it('first element becomes last', () => {
        fc.assert(
            fc.property(
                fc.array(fc.integer(), { minLength: 1 }),
                (arr) => {
                    const reversed = reverse(arr);

                    expect(
                        reversed[reversed.length - 1]
                    ).toBe(arr[0]);
                }
            )
        );
    });

    it('last element becomes first', () => {
        fc.assert(
            fc.property(
                fc.array(fc.integer(), { minLength: 1 }),
                (arr) => {
                    const reversed = reverse(arr);

                    expect(
                        reversed[0]
                    ).toBe(arr[arr.length - 1]);
                }
            )
        );
    });

    it('index mapping property', () => {
        fc.assert(
            fc.property(
                fc.array(fc.integer()),
                (arr) => {
                    const reversed = reverse(arr);

                    for (let i = 0; i < arr.length; i++) {
                        expect(
                            reversed[arr.length - 1 - i]
                        ).toBe(arr[i]);
                    }
                }
            )
        );
    });

    it('concatenation reverse law', () => {
        fc.assert(
            fc.property(
                fc.array(fc.integer()),
                fc.array(fc.integer()),
                (a, b) => {
                    expect(
                        reverse([...a, ...b])
                    ).toEqual([
                        ...reverse(b),
                        ...reverse(a),
                    ]);
                }
            )
        );
    });
});