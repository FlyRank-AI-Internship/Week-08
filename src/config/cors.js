export const publicCorsOptions = {
  origin(origin, callback) {
    // Development:
    // permit requests from browser pages,
    // including our second localhost origin.

    if (!origin) {
      return callback(null, true);
    }

    const allowedOrigins = [
      "http://localhost:5500",
      "http://127.0.0.1:5500",
      "http://localhost:8080",
    ];

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(
      new Error("Origin not allowed by CORS")
    );
  },

  methods: [
    "GET",
    "POST",
    "OPTIONS",
  ],

  allowedHeaders: [
    "Content-Type",
    "Idempotency-Key",
  ],
};