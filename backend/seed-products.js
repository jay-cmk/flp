const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

const localEnvPath = fs.existsSync(path.join(__dirname, ".env"))
    ? path.join(__dirname, ".env")
    : path.join(__dirname, "config", "config.env");
dotenv.config({ path: localEnvPath });

const connectDatabase = require("./config/database");
const Product = require("./models/productModel");
const User = require("./models/userModel");

const sampleProducts = [
    {
        name: "Wireless Earbuds",
        description: "Compact wireless earbuds for everyday calls, music, and travel.",
        highlights: ["True wireless design", "Bluetooth connectivity", "Portable charging case"],
        specifications: [
            { title: "Type", description: "True wireless earbuds" },
            { title: "Connectivity", description: "Bluetooth" },
            { title: "Use", description: "Music and calls" },
        ],
        price: 149,
        category: "Audio",
        stock: 40,
        brand: "SoundBeat",
        imageId: "1606220945770-b5b6c2c55bf1",
    },
    {
        name: "Bluetooth Neckband",
        description: "Lightweight Bluetooth neckband headphones for everyday listening.",
        highlights: ["Wireless Bluetooth audio", "In-line controls", "Flexible neckband"],
        specifications: [
            { title: "Type", description: "Bluetooth neckband" },
            { title: "Connectivity", description: "Bluetooth" },
            { title: "Use", description: "Music and calls" },
        ],
        price: 199,
        category: "Audio",
        stock: 35,
        brand: "SoundBeat",
        imageId: "1505740420928-5e560c06d30e",
    },
    {
        name: "USB Charging Cable",
        description: "Everyday USB charging cable for compatible phones and accessories.",
        highlights: ["USB charging", "Flexible cable", "Everyday replacement accessory"],
        specifications: [
            { title: "Type", description: "USB charging cable" },
            { title: "Compatibility", description: "Compatible USB devices" },
            { title: "Use", description: "Charging and data transfer" },
        ],
        price: 99,
        category: "Accessories",
        stock: 80,
        brand: "ChargeLink",
        imageId: "1583863788434-e58a36330cf0",
    },
    {
        name: "Mobile Phone Stand",
        description: "Compact desktop stand for hands-free phone viewing.",
        highlights: ["Tabletop design", "Hands-free viewing", "Compact and portable"],
        specifications: [
            { title: "Type", description: "Desktop mobile stand" },
            { title: "Material", description: "Accessory-grade material" },
            { title: "Compatibility", description: "Most smartphones" },
        ],
        price: 79,
        category: "Accessories",
        stock: 60,
        brand: "MobileMate",
        imageId: "1512499617640-c74ae3a79d37",
    },
    {
        name: "Wireless Mouse",
        description: "Wireless mouse for everyday laptop and desktop navigation.",
        highlights: ["Wireless connectivity", "Comfortable everyday use", "Plug and play"],
        specifications: [
            { title: "Type", description: "Wireless mouse" },
            { title: "Connectivity", description: "2.4 GHz wireless" },
            { title: "Use", description: "Laptop and desktop" },
        ],
        price: 249,
        category: "Accessories",
        stock: 45,
        brand: "TechGear",
        imageId: "1527814050087-3793815479db",
    },
    {
        name: "Fast Charging Adapter",
        description: "Compact wall adapter for charging compatible mobile devices.",
        highlights: ["Compact wall charger", "Fast charging for compatible devices", "Travel friendly"],
        specifications: [
            { title: "Type", description: "USB wall adapter" },
            { title: "Compatibility", description: "Compatible USB charging devices" },
            { title: "Use", description: "Mobile device charging" },
        ],
        price: 299,
        category: "Accessories",
        stock: 50,
        brand: "ChargeLink",
        imageId: "1583863788434-e58a36330cf0",
    },
];

const getProductRecord = (item, adminId) => {
    const slug = item.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const imageUrl = `https://images.unsplash.com/photo-${item.imageId}?auto=format&fit=crop&w=800&q=80`;

    return {
        name: item.name,
        description: item.description,
        highlights: item.highlights,
        specifications: item.specifications,
        price: item.price,
        cuttedPrice: item.price,
        images: [{ public_id: `seed-external-${slug}`, url: imageUrl }],
        brand: {
            name: item.brand,
            logo: {
                public_id: `seed-external-brand-${item.brand.toLowerCase()}`,
                url: imageUrl,
            },
        },
        category: item.category,
        stock: item.stock,
        warranty: 1,
        ratings: 0,
        numOfReviews: 0,
        reviews: [],
        user: adminId,
    };
};

const seedProducts = async () => {
    try {
        await connectDatabase();
        const admin = await User.findOne({ role: "admin" }).select("_id").lean();
        if (!admin) {
            throw new Error("No admin account exists. Create the first admin with `npm run setup-admin` before seeding sample products.");
        }

        let inserted = 0;
        let alreadyPresent = 0;

        for (const item of sampleProducts) {
            const result = await Product.updateOne(
                { name: item.name, category: item.category },
                { $setOnInsert: getProductRecord(item, admin._id) },
                { upsert: true, runValidators: true }
            );
            if (result.upsertedCount) inserted += 1;
            else alreadyPresent += 1;
        }

        console.log(`Sample product seed complete: ${inserted} inserted, ${alreadyPresent} already present.`);
        console.log(`Database: ${mongoose.connection.name}`);
        console.log("No existing users, products, or orders were deleted or updated.");
    } catch (error) {
        console.error(`Sample product seed failed: ${error.message}`);
        process.exitCode = 1;
    } finally {
        if (mongoose.connection.readyState !== 0) {
            await mongoose.disconnect();
        }
    }
};

seedProducts();
