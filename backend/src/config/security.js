const helmetConfig = {
    contentSecurityPolicy: {
        useDefaults: true,
        directives: {
            "default-src": ["'self'"],
            "script-src": ["'self'"],
            "script-src-attr": ["'none'"],
            "style-src": ["'self'", "'unsafe-inline'"],
            "img-src": ["'self'", "data:", "https:"],
            "font-src": ["'self'", "https:", "data:"],
            "connect-src": ["'self'"],
            "object-src": ["'none'"],
            "base-uri": ["'self'"],
            "frame-ancestors": ["'self'"],
            "upgrade-insecure-requests": []
        }
    },
    crossOriginEmbedderPolicy: false
};

const corsConfig = {
    origin: process.env.APP_ENV === "production"
        ? process.env.CORS_ORIGIN
        : true,
    credentials: true
};

module.exports = {
    helmetConfig,
    corsConfig
};