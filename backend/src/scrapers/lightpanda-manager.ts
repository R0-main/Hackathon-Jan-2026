import puppeteer, { Browser } from 'puppeteer-core';
import { lightpanda } from '@lightpanda/browser';

/**
 * Singleton manager for LightPanda to avoid port conflicts
 * Uses a mutex to ensure only one scrape at a time
 */
class LightPandaManager {
    private proc: any = null;
    private browser: Browser | null = null;
    private isRunning = false;
    private queue: Array<{
        resolve: (browser: Browser) => void;
        reject: (error: Error) => void;
    }> = [];
    private currentUser: string | null = null;

    private readonly host = '127.0.0.1';
    private readonly port = 9222;

    async acquire(userId: string): Promise<Browser> {
        // If already in use, wait in queue
        if (this.currentUser) {
            console.log(`🐼 [LightPanda] Waiting in queue (current user: ${this.currentUser})...`);
            return new Promise((resolve, reject) => {
                this.queue.push({ resolve, reject });
            });
        }

        this.currentUser = userId;

        try {
            // Start LightPanda if not running
            if (!this.isRunning) {
                console.log('🐼 [LightPanda] Starting server...');
                this.proc = await lightpanda.serve({
                    host: this.host,
                    port: this.port,
                });
                this.isRunning = true;

                // Small delay to let the server start
                await new Promise(resolve => setTimeout(resolve, 500));
            }

            // Connect puppeteer
            console.log('🐼 [LightPanda] Connecting puppeteer...');
            this.browser = await puppeteer.connect({
                browserWSEndpoint: `ws://${this.host}:${this.port}`,
            });

            return this.browser;
        } catch (error: any) {
            this.currentUser = null;
            await this.cleanup();
            throw error;
        }
    }

    async release(): Promise<void> {
        console.log('🐼 [LightPanda] Releasing...');

        // Disconnect browser but keep process alive for next user
        if (this.browser) {
            await this.browser.disconnect().catch(() => {});
            this.browser = null;
        }

        this.currentUser = null;

        // Process next in queue
        if (this.queue.length > 0) {
            const next = this.queue.shift()!;
            try {
                const browser = await this.acquire('queued-user');
                next.resolve(browser);
            } catch (error: any) {
                next.reject(error);
            }
        }
    }

    async cleanup(): Promise<void> {
        console.log('🐼 [LightPanda] Full cleanup...');

        if (this.browser) {
            await this.browser.disconnect().catch(() => {});
            this.browser = null;
        }

        if (this.proc) {
            try {
                this.proc.stdout?.destroy();
                this.proc.stderr?.destroy();
                this.proc.kill('SIGTERM');
            } catch (e) {
                // Ignore cleanup errors
            }
            this.proc = null;
        }

        this.isRunning = false;
        this.currentUser = null;

        // Reject all waiting in queue
        while (this.queue.length > 0) {
            const next = this.queue.shift()!;
            next.reject(new Error('LightPanda cleanup - queue cleared'));
        }
    }
}

// Export singleton instance
export const lightPandaManager = new LightPandaManager();