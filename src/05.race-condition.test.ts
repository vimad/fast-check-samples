import { describe, it } from 'vitest';
import fc from 'fast-check';

class Counter {
    value = 0;

    async increment() {
        const current = this.value;

        // Simulate async work
        await Promise.resolve();

        this.value = current + 1;
    }
}

describe('race conditions', () => {
    it('should detect lost updates', async () => {
        await fc.assert(
            fc.asyncProperty(
                fc.scheduler(),
                async (scheduler) => {
                    const counter = new Counter();

                    const task1 = scheduler.schedule(
                        counter.increment(),
                        'increment-1',
                    );

                    const task2 = scheduler.schedule(
                        counter.increment(),
                        'increment-2',
                    );

                    await scheduler.waitIdle();

                    // This assertion is intentionally wrong for the implementation.
                    // fast-check should discover schedules where the result is 1.
                    if (counter.value !== 2) {
                        throw new Error(
                            `Race condition found. Expected 2 but got ${counter.value}`,
                        );
                    }

                    await task1;
                    await task2;
                },
            ),
            {
                verbose: true,
            },
        );
    });
});