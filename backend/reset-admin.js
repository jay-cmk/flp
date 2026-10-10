const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

const localEnvPath = fs.existsSync(path.join(__dirname, ".env"))
    ? path.join(__dirname, ".env")
    : path.join(__dirname, "config", "config.env");
dotenv.config({ path: localEnvPath });

const connectDatabase = require("./config/database");
const User = require("./models/userModel");

const resetAdminPassword = async () => {
    const email = process.argv[2]?.trim().toLowerCase();
    if (!email || process.argv[3] !== "--confirm") {
        throw new Error("Usage: npm run reset-admin -- <admin-email> --confirm");
    }

    await connectDatabase();

    const admin = await User.findOne({ email, role: "admin" }).select("+password");
    if (!admin) {
        throw new Error("No admin account exists with that email");
    }

    const temporaryPassword = crypto.randomBytes(24).toString("base64url");
    admin.password = temporaryPassword;
    await admin.save();

    if (!(await admin.comparePassword(temporaryPassword))) {
        throw new Error("Password reset verification failed");
    }

    console.log(`Admin password reset and verified for ${admin.email}.`);
    console.log(`Temporary password: ${temporaryPassword}`);
    console.log("Store it securely, sign in, and change it immediately.");
};

resetAdminPassword()
    .catch((error) => {
        console.error(`Admin password reset failed: ${error.message}`);
        process.exitCode = 1;
    })
    .finally(async () => {
        if (mongoose.connection.readyState !== 0) {
            await mongoose.disconnect();
        }
    });
