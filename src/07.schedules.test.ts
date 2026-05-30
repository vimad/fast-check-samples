import { describe, it, expect } from 'vitest';
import fc from 'fast-check';

function delay(ms = 0): Promise<void> {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

class BankAccount {
    balance = 0;

    async deposit(amount: number) {
        const current = this.balance;
        await delay();
        this.balance = current + amount;
    }

    async withdraw(amount: number) {
        const current = this.balance;
        await delay();
        this.balance = current - amount;
    }

    async getBalance() {
        await delay();
        return this.balance;
    }
}

describe('scheduler examples', () => {
    it('schedule - concurrent tasks', async () => {
        await fc.assert(
            fc.asyncProperty(fc.scheduler(), async (s) => {
                const account = new BankAccount();

                const deposit1 = s.schedule(
                    account.deposit(100),
                    'deposit-100'
                );

                const deposit2 = s.schedule(
                    account.deposit(100),
                    'deposit-100-again'
                );

                await s.waitIdle();

                // Race condition may be discovered here
                expect(account.balance).toBeLessThanOrEqual(200);

                await deposit1;
                await deposit2;
            })
        );
    });

    it('scheduleFunction - intercept async method calls', async () => {
        await fc.assert(
            fc.asyncProperty(fc.scheduler(), async (s) => {
                const account = new BankAccount();

                const scheduledDeposit = s.scheduleFunction(account.deposit.bind(account));

                const scheduledWithdraw = s.scheduleFunction(account.withdraw.bind(account));

                const p1 = scheduledDeposit(100);
                const p2 = scheduledWithdraw(50);

                await s.waitIdle();

                await p1;
                await p2;
            })
        );
    });

    it('scheduleSequence - workflow ordering', async () => {
        await fc.assert(
            fc.asyncProperty(fc.scheduler(), async (s) => {
                const events: string[] = [];

                const createUser = async () => {
                    events.push('create-start');
                    await delay();
                    events.push('create-end');
                };

                const sendEmail = async () => {
                    events.push('email-start');
                    await delay();
                    events.push('email-end');
                };

                const activateUser = async () => {
                    events.push('activate-start');
                    await delay();
                    events.push('activate-end');
                };

                s.scheduleSequence([
                    async () => createUser(),
                    async () => sendEmail(),
                    async () => activateUser(),
                ]);

                await s.waitIdle();

                expect(events).toContain('create-start');
                expect(events).toContain('email-start');
                expect(events).toContain('activate-start');
            })
        );
    });

    it('waitIdle - wait until scheduler becomes idle', async () => {
        await fc.assert(
            fc.asyncProperty(fc.scheduler(), async (s) => {
                let completed = false;

                s.schedule(
                    (async () => {
                        await delay();
                        completed = true;
                    })(),
                    'background-job'
                );

                await s.waitIdle();

                expect(completed).toBe(true);
            })
        );
    });

    it('report execution order', async () => {
        await fc.assert(
            fc.asyncProperty(fc.scheduler(), async (s) => {
                const account = new BankAccount();

                s.schedule(account.deposit(100), 'deposit');
                s.schedule(account.withdraw(50), 'withdraw');

                await s.waitIdle();

                console.log(
                    s.toString()
                );
            })
        );
    });
});