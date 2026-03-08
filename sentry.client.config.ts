import * as Sentry from "@sentry/nextjs";

Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

    // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring.
    // Adjust this value in production
    tracesSampleRate: 1.0,

    // Set sampling rate for profiling - this is relative to tracesSampleRate
    profilesSampleRate: 1.0,

    // Setting this option to true will print useful information to the console while you're setting up Sentry.
    debug: false,

    // Replay settings
    replaysOnErrorSampleRate: 1.0,
    replaysSessionSampleRate: 0.1,

    integrations: [
        Sentry.replayIntegration({
            maskAllText: true,
            blockAllMedia: true,
        }),
    ],

    // Filter out errors you don't want to see
    beforeSend(event, hint) {
        // Filter out some common errors
        if (event.exception) {
            const error = hint.originalException;
            // Skip network errors
            if (error instanceof Error && error.message?.includes("NetworkError")) {
                return null;
            }
        }
        return event;
    },

    environment: process.env.NODE_ENV,
});
