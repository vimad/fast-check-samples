import {faker} from '@faker-js/faker';
import fc from 'fast-check';
import {it, expect} from "vitest";

/*

Limitations
While this approach works, it has several limitations:
    - Performance: Instantiating and seeding generators repeatedly is not efficient.
    - Distribution: Values generated this way are not well-distributed and are more likely to collide.
    - Side Effects: Seeding Faker globally is a side effect. It can make our tests less reliable.
 */

function fakerToArb<TValue>(generator: () => TValue): fc.Arbitrary<TValue> {
    return fc.noShrink(fc.integer()).map((seed) => {
        faker.seed(seed);
        return generator();
    });
}

function format(firstName: string, lastName: string) {
    return `${firstName} ${lastName}`
}

it('produce a string containing the first and the last name', () => {
    fc.assert(
        fc.property(fakerToArb(faker.person.firstName), fakerToArb(faker.person.lastName), (firstName, lastName) => {
            const formatted = format(firstName, lastName);
            expect(formatted).toContain(firstName);
            expect(formatted).toContain(lastName);
        })
    );
});