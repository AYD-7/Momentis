const status = {
    status: "ok",
    service: "Momentis",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
};

export default status;