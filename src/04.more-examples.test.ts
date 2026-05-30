import {describe, it, expect} from 'vitest';
import fc from 'fast-check';

type User = {
    firstName: string;
    lastName: string;
    age: number;
};

function sortByAge(users: User[]): User[] {
    return [...users].sort((a, b) => a.age - b.age);
}

// Custom arbitrary
const userArb = fc.record({
    firstName: fc.string({minLength: 1, maxLength: 20}),
    lastName: fc.string({minLength: 1, maxLength: 20}),
    age: fc.integer({min: 0, max: 119}),
});

describe('fast-check examples', () => {
    it('sorts users by ascending age', () => {
        fc.assert(
            fc.property(fc.gen(), (g) => {
                const youngerUser = g(() => userArb);

                const olderUser = {
                    firstName: g(() => fc.string({minLength: 1})),
                    lastName: g(() => fc.string({minLength: 1})),
                    age: g(() =>
                        fc.integer({
                            min: youngerUser.age + 1,
                            max: 120,
                        }),
                    ),
                };

                expect(
                    sortByAge([olderUser, youngerUser]),
                ).toEqual([youngerUser, olderUser]);

                expect(
                    sortByAge([youngerUser, olderUser]),
                ).toEqual([youngerUser, olderUser]);
            }),
        );
    });

    it('reversing twice returns original array', () => {
        fc.assert(
            fc.property(
                fc.array(fc.integer()),
                (arr) => {
                    expect(
                        [...arr].reverse().reverse(),
                    ).toEqual(arr);
                },
            ),
        );
    });

    it('sum of positives is positive', () => {
        fc.assert(
            fc.property(
                fc.integer(),
                fc.integer(),
                (a, b) => {
                    fc.pre(a > 0);
                    fc.pre(b > 0);

                    expect(a + b).toBeGreaterThan(0);
                },
            ),
        );
    });

    it('maximum element is always inside the array', () => {
        fc.assert(
            fc.property(
                fc.array(fc.integer(), {
                    minLength: 1,
                }),
                (numbers) => {
                    const max = Math.max(...numbers);

                    expect(numbers).toContain(max);
                },
            ),
        );
    });
});