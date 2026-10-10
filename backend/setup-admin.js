const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

const localEnvPath = fs.existsSync(path.join(__dirname, ".env"))
    ? path.join(__dirname, ".env")
    : path.join(__dirname, "config", "config.env");
dotenv.config({ path: localEnvPath });

const connectDatabase = require("./config/database");
const User = require("./models/userModel");

const createFirstAdmin = async () => {
    const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

    if (!ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
        throw new Error("Set ADMIN_NAME, ADMIN_EMAIL, and ADMIN_PASSWORD in the backend environment");
    }

    if (ADMIN_PASSWORD.length < 8) {
        throw new Error("ADMIN_PASSWORD must be at least 8 characters");
    }

    await connectDatabase();

    if (await User.exists({ role: "admin" })) {
        throw new Error("An admin account already exists; first-admin setup is disabled");
    }

    const email = ADMIN_EMAIL.trim().toLowerCase();
    if (await User.exists({ email })) {
        throw new Error("An account with ADMIN_EMAIL already exists");
    }

    await User.create({
        name: ADMIN_NAME.trim(),
        email,
        gender: "Unspecified",
        password: ADMIN_PASSWORD,
        role: "admin",
    });

    console.log("First admin account created. Remove ADMIN_PASSWORD from the environment now.");
};

createFirstAdmin()
    .catch((error) => {
        console.error(`Admin setup failed: ${error.message}`);
        process.exitCode = 1;
    })
    .finally(async () => {
        if (mongoose.connection.readyState !== 0) {
            await mongoose.disconnect();
        }
    });
