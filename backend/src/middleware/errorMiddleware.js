const notFoundHandler = (req, res, next) => {
    if (req.path.startsWith("/api/")) {
        return res.status(404).json({
            success: false,
            message: "API endpoint not found."
        });
    }

    next();
};

const errorHandler = (error, req, res, next) => {
    console.error("[ERROR]", error);

    const isProduction = process.env.APP_ENV === "production";

    res.status(error.status || 500).json({
        success: false,
        message: isProduction ? "Internal server error." : error.message,
        ...(isProduction ? {} : { stack: error.stack })
    });
};

module.exports = {
    notFoundHandler,
    errorHandler
};