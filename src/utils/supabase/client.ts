import { createClient as createSupabaseClient, SupabaseClient } from '@supabase/supabase-js'

const globalForSupabase = globalThis as unknown as {
    supabaseClient: SupabaseClient | undefined
}

// In-memory lock to replace navigator.locks.
// This prevents cross-mount deadlocks AND refresh hangs in Next.js/Browser
// while perfectly preserving the concurrency safety of Supabase's internal auth state (gotrue-js).
let isLocked = false;
let lockQueue: (() => void)[] = [];

const acquireMemoryLock = async (fn: () => Promise<any>) => {
    if (isLocked) {
        await new Promise<void>(resolve => lockQueue.push(resolve));
    }
    isLocked = true;
    try {
        return await fn();
    } finally {
        isLocked = false;
        if (lockQueue.length > 0) {
            const next = lockQueue.shift();
            if (next) next();
        }
    }
};

export function createClient() {
    if (globalForSupabase.supabaseClient) {
        return globalForSupabase.supabaseClient;
    }

    const client = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            auth: {
                persistSession: true,
                autoRefreshToken: true,
                lock: async (...args: any[]) => {
                    const fn = args[args.length - 1];
                    if (typeof fn === 'function') {
                        return await acquireMemoryLock(fn);
                    }
                    return null;
                }
            }
        }
    )

    globalForSupabase.supabaseClient = client;

    return client;
}
