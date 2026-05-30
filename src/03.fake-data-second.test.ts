import {it, expect} from "vitest";
import { Faker, type Randomizer, base, faker } from '@faker-js/faker';
import fc from 'fast-check';

class FakerBuilder<TValue> extends fc.Arbitrary<TValue> {
    // @ts-ignore
    constructor(private readonly generator: (faker: Faker) => TValue) {
        super();
    }

    generate(mrng: fc.Random, _biasFactor: number | undefined): fc.Value<TValue> {
        const randomizer: Randomizer = {
            next: (): number => mrng.nextDouble(),
            seed: () => {}, // no-op, no support for updates of the seed, could even throw
        };
        const customFaker = new Faker({ locale: base, randomizer });
        return new fc.Value(this.generator(customFaker), undefined);
    }
    canShrinkWithoutContext(value: unknown): value is TValue {
        return false;
    }
    shrink(_value: TValue, _context: unknown): fc.Stream<fc.Value<TValue>> {
        return fc.Stream.nil();
    }
}

function fakerToArb<TValue>(generator: () => TValue): fc.Arbitrary<TValue> {
    return new FakerBuilder(generator);
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