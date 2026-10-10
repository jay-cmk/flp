const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const path = require("path");
const fs = require("fs");

const localEnvPath = fs.existsSync(path.join(__dirname, ".env"))
    ? path.join(__dirname, ".env")
    : path.join(__dirname, "config", "config.env");
dotenv.config({ path: localEnvPath });

const User = require("./models/userModel");
const Product = require("./models/productModel");
const Order = require("./models/orderModel");

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
    console.error("MONGO_URI is missing from the backend environment configuration");
    process.exit(1);
}

if (!process.env.SEED_ADMIN_PASSWORD || !process.env.SEED_USER_PASSWORD) {
    console.error("Set SEED_ADMIN_PASSWORD and SEED_USER_PASSWORD before running the seed");
    process.exit(1);
}

// --------------------------------------------------
// USERS
// --------------------------------------------------

const usersData = [
    {
        name: "Admin User",
        email: "admin@flipcart.com",
        gender: "Male",
        password: process.env.SEED_ADMIN_PASSWORD,
        role: "admin"
    },
    {
        name: "Rahul Sharma",
        email: "rahul@example.com",
        gender: "Male",
        password: process.env.SEED_USER_PASSWORD,
        role: "user"
    },
    {
        name: "Priya Singh",
        email: "priya@example.com",
        gender: "Female",
        password: process.env.SEED_USER_PASSWORD,
        role: "user"
    },
    {
        name: "Amit Kumar",
        email: "amit@example.com",
        gender: "Male",
        password: process.env.SEED_USER_PASSWORD,
        role: "user"
    },
    {
        name: "Neha Verma",
        email: "neha@example.com",
        gender: "Female",
        password: process.env.SEED_USER_PASSWORD,
        role: "user"
    },
    {
        name: "Arjun Yadav",
        email: "arjun@example.com",
        gender: "Male",
        password: process.env.SEED_USER_PASSWORD,
        role: "user"
    },
    {
        name: "Sneha Gupta",
        email: "sneha@example.com",
        gender: "Female",
        password: process.env.SEED_USER_PASSWORD,
        role: "user"
    },
    {
        name: "Vikas Mishra",
        email: "vikas@example.com",
        gender: "Male",
        password: process.env.SEED_USER_PASSWORD,
        role: "user"
    },
    {
        name: "Anjali Patel",
        email: "anjali@example.com",
        gender: "Female",
        password: process.env.SEED_USER_PASSWORD,
        role: "user"
    },
    {
        name: "Rohit Singh",
        email: "rohit@example.com",
        gender: "Male",
        password: process.env.SEED_USER_PASSWORD,
        role: "user"
    }
];

// --------------------------------------------------
// IMAGE HELPERS
// --------------------------------------------------

const imagePool = [
    "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=800",
    "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800",
    "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800",
    "https://images.unsplash.com/photo-1603891128711-11b4b03bb138?w=800",
    "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800",
    "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800",
    "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800",
    "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800",
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800",
    "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800",
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800",
    "https://images.unsplash.com/photo-1508057198894-247b23fe5ade?w=800",
    "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800",
    "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800",
    "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=800",
    "https://images.unsplash.com/photo-1541643600914-78b084683601?w=800"
];

const getImage = (index) => ({
    public_id: `seed_product_${index + 1}`,
    url: imagePool[index % imagePool.length]
});

const getBrand = (name, index) => ({
    name,
    logo: {
        public_id: `brand_${name.toLowerCase().replace(/\s/g, "_")}`,
        url: imagePool[index % imagePool.length]
    }
});

// --------------------------------------------------
// PRODUCT DATA
// --------------------------------------------------

const productTemplates = [
    // Mobiles
    {
        name: "Samsung Galaxy S24 5G",
        category: "Mobiles",
        brand: "Samsung",
        price: 64999,
        cuttedPrice: 79999,
        description: "Premium 5G smartphone with powerful performance, excellent camera and bright AMOLED display.",
        highlights: ["8GB RAM", "256GB Storage", "50MP Camera", "5G Connectivity"],
        specifications: [
            { title: "Display", description: "6.2 inch Dynamic AMOLED 2X" },
            { title: "Processor", description: "Snapdragon 8 Gen 3" },
            { title: "Battery", description: "4000 mAh" }
        ],
        stock: 25,
        warranty: 1
    },
    {
        name: "Apple iPhone 15",
        category: "Mobiles",
        brand: "Apple",
        price: 69999,
        cuttedPrice: 79900,
        description: "Powerful Apple smartphone with Super Retina display and advanced camera system.",
        highlights: ["128GB Storage", "A16 Bionic", "48MP Main Camera", "USB-C"],
        specifications: [
            { title: "Display", description: "6.1 inch Super Retina XDR" },
            { title: "Processor", description: "Apple A16 Bionic" },
            { title: "Battery", description: "All-day battery life" }
        ],
        stock: 18,
        warranty: 1
    },
    {
        name: "OnePlus 12 5G",
        category: "Mobiles",
        brand: "OnePlus",
        price: 59999,
        cuttedPrice: 64999,
        description: "Flagship OnePlus smartphone with high performance and Hasselblad camera system.",
        highlights: ["12GB RAM", "256GB Storage", "50MP Camera", "100W Charging"],
        specifications: [
            { title: "Display", description: "6.82 inch AMOLED 120Hz" },
            { title: "Processor", description: "Snapdragon 8 Gen 3" },
            { title: "Battery", description: "5400 mAh" }
        ],
        stock: 30,
        warranty: 1
    },
    {
        name: "Google Pixel 8",
        category: "Mobiles",
        brand: "Google",
        price: 52999,
        cuttedPrice: 75999,
        description: "Google smartphone with AI-powered camera features and clean Android experience.",
        highlights: ["8GB RAM", "128GB Storage", "50MP Camera", "Google AI"],
        specifications: [
            { title: "Display", description: "6.2 inch OLED 120Hz" },
            { title: "Processor", description: "Google Tensor G3" },
            { title: "Battery", description: "4575 mAh" }
        ],
        stock: 20,
        warranty: 1
    },

    // Laptops
    {
        name: "Apple MacBook Air M2",
        category: "Laptops",
        brand: "Apple",
        price: 84999,
        cuttedPrice: 99900,
        description: "Thin and powerful laptop powered by Apple M2 chip.",
        highlights: ["M2 Chip", "8GB RAM", "256GB SSD", "13.6 inch Display"],
        specifications: [
            { title: "Processor", description: "Apple M2" },
            { title: "RAM", description: "8GB Unified Memory" },
            { title: "Storage", description: "256GB SSD" }
        ],
        stock: 12,
        warranty: 1
    },
    {
        name: "HP Pavilion 14",
        category: "Laptops",
        brand: "HP",
        price: 58999,
        cuttedPrice: 69999,
        description: "Everyday performance laptop suitable for work, study and entertainment.",
        highlights: ["Intel Core i5", "16GB RAM", "512GB SSD", "Full HD Display"],
        specifications: [
            { title: "Processor", description: "Intel Core i5 13th Gen" },
            { title: "RAM", description: "16GB DDR4" },
            { title: "Storage", description: "512GB SSD" }
        ],
        stock: 15,
        warranty: 1
    },
    {
        name: "Dell Inspiron 15",
        category: "Laptops",
        brand: "Dell",
        price: 54999,
        cuttedPrice: 64999,
        description: "Reliable Dell laptop with modern processor and large display.",
        highlights: ["Intel Core i5", "8GB RAM", "512GB SSD", "15.6 inch Display"],
        specifications: [
            { title: "Processor", description: "Intel Core i5" },
            { title: "RAM", description: "8GB" },
            { title: "Storage", description: "512GB SSD" }
        ],
        stock: 20,
        warranty: 1
    },
    {
        name: "Lenovo IdeaPad Slim 5",
        category: "Laptops",
        brand: "Lenovo",
        price: 62999,
        cuttedPrice: 74999,
        description: "Slim performance laptop designed for productivity and entertainment.",
        highlights: ["Ryzen 7", "16GB RAM", "512GB SSD", "OLED Display"],
        specifications: [
            { title: "Processor", description: "AMD Ryzen 7" },
            { title: "RAM", description: "16GB" },
            { title: "Storage", description: "512GB SSD" }
        ],
        stock: 17,
        warranty: 1
    },

    // Audio
    {
        name: "Sony WH-1000XM5",
        category: "Audio",
        brand: "Sony",
        price: 27999,
        cuttedPrice: 34990,
        description: "Premium wireless headphones with industry-leading noise cancellation.",
        highlights: ["Active Noise Cancellation", "30 Hours Battery", "Bluetooth 5.2", "Fast Charging"],
        specifications: [
            { title: "Type", description: "Over Ear Wireless" },
            { title: "Battery", description: "Up to 30 hours" },
            { title: "Connectivity", description: "Bluetooth" }
        ],
        stock: 25,
        warranty: 1
    },
    {
        name: "Apple AirPods Pro 2",
        category: "Audio",
        brand: "Apple",
        price: 19999,
        cuttedPrice: 24900,
        description: "Premium true wireless earbuds with active noise cancellation.",
        highlights: ["ANC", "USB-C Charging", "Spatial Audio", "MagSafe Case"],
        specifications: [
            { title: "Type", description: "True Wireless Earbuds" },
            { title: "Battery", description: "Up to 6 hours" },
            { title: "Water Resistance", description: "IPX4" }
        ],
        stock: 40,
        warranty: 1
    },
    {
        name: "JBL Tune 770NC",
        category: "Audio",
        brand: "JBL",
        price: 5999,
        cuttedPrice: 7999,
        description: "Wireless headphones with adaptive noise cancellation and powerful bass.",
        highlights: ["Adaptive ANC", "70 Hours Battery", "Pure Bass", "Bluetooth"],
        specifications: [
            { title: "Battery", description: "Up to 70 hours" },
            { title: "Type", description: "Over Ear" },
            { title: "Connectivity", description: "Bluetooth 5.3" }
        ],
        stock: 50,
        warranty: 1
    },
    {
        name: "boAt Airdopes 141",
        category: "Audio",
        brand: "boAt",
        price: 1299,
        cuttedPrice: 4490,
        description: "Affordable wireless earbuds with long battery life and low latency.",
        highlights: ["42 Hours Playback", "Low Latency", "ENx Technology", "Bluetooth"],
        specifications: [
            { title: "Battery", description: "42 Hours" },
            { title: "Type", description: "TWS" },
            { title: "Charging", description: "USB Type-C" }
        ],
        stock: 100,
        warranty: 1
    },

    // TVs
    {
        name: "Samsung 55 inch 4K Smart TV",
        category: "Televisions",
        brand: "Samsung",
        price: 52999,
        cuttedPrice: 69999,
        description: "4K smart television with vibrant colors and smart streaming features.",
        highlights: ["55 inch 4K", "HDR", "Smart TV", "Voice Assistant"],
        specifications: [
            { title: "Resolution", description: "3840 x 2160" },
            { title: "Display", description: "55 inch LED" },
            { title: "Smart OS", description: "Tizen" }
        ],
        stock: 10,
        warranty: 2
    },
    {
        name: "LG 50 inch 4K UHD Smart TV",
        category: "Televisions",
        brand: "LG",
        price: 44999,
        cuttedPrice: 59999,
        description: "LG smart TV with 4K resolution and cinematic picture quality.",
        highlights: ["50 inch 4K", "HDR10", "WebOS", "AI Sound"],
        specifications: [
            { title: "Resolution", description: "4K UHD" },
            { title: "Operating System", description: "WebOS" },
            { title: "Display", description: "50 inch" }
        ],
        stock: 14,
        warranty: 2
    },
    {
        name: "Sony Bravia 55 inch 4K",
        category: "Televisions",
        brand: "Sony",
        price: 72999,
        cuttedPrice: 89999,
        description: "Premium Sony Bravia television with excellent picture processing.",
        highlights: ["55 inch 4K", "Dolby Vision", "Google TV", "Dolby Atmos"],
        specifications: [
            { title: "Display", description: "55 inch LED" },
            { title: "Resolution", description: "4K UHD" },
            { title: "OS", description: "Google TV" }
        ],
        stock: 8,
        warranty: 2
    },
    {
        name: "TCL 43 inch 4K Smart TV",
        category: "Televisions",
        brand: "TCL",
        price: 29999,
        cuttedPrice: 39999,
        description: "Affordable 4K smart television with Google TV experience.",
        highlights: ["43 inch 4K", "Google TV", "HDR10", "Dolby Audio"],
        specifications: [
            { title: "Display", description: "43 inch" },
            { title: "Resolution", description: "4K UHD" },
            { title: "OS", description: "Google TV" }
        ],
        stock: 18,
        warranty: 2
    },

    // Cameras
    {
        name: "Canon EOS R50",
        category: "Cameras",
        brand: "Canon",
        price: 67999,
        cuttedPrice: 74999,
        description: "Compact mirrorless camera designed for photography and content creation.",
        highlights: ["24.2MP Sensor", "4K Video", "Dual Pixel AF", "Wi-Fi"],
        specifications: [
            { title: "Sensor", description: "24.2MP APS-C" },
            { title: "Video", description: "4K UHD" },
            { title: "Mount", description: "RF Mount" }
        ],
        stock: 7,
        warranty: 1
    },
    {
        name: "Sony Alpha ZV-E10",
        category: "Cameras",
        brand: "Sony",
        price: 61999,
        cuttedPrice: 69999,
        description: "Creator-focused mirrorless camera with fast autofocus and 4K video.",
        highlights: ["24.2MP", "4K Video", "Fast Autofocus", "Flip Screen"],
        specifications: [
            { title: "Sensor", description: "24.2MP APS-C" },
            { title: "Video", description: "4K" },
            { title: "Screen", description: "Vari-angle LCD" }
        ],
        stock: 9,
        warranty: 1
    },
    {
        name: "Nikon Z30",
        category: "Cameras",
        brand: "Nikon",
        price: 57999,
        cuttedPrice: 64999,
        description: "Compact creator camera optimized for video and vlogging.",
        highlights: ["20.9MP", "4K Video", "Vlogging Camera", "Wi-Fi"],
        specifications: [
            { title: "Sensor", description: "20.9MP APS-C" },
            { title: "Video", description: "4K UHD" },
            { title: "Mount", description: "Z Mount" }
        ],
        stock: 8,
        warranty: 1
    },
    {
        name: "GoPro HERO12 Black",
        category: "Cameras",
        brand: "GoPro",
        price: 34999,
        cuttedPrice: 44999,
        description: "Rugged action camera with high-resolution video and advanced stabilization.",
        highlights: ["5.3K Video", "HyperSmooth", "Waterproof", "HDR Video"],
        specifications: [
            { title: "Video", description: "5.3K60" },
            { title: "Stabilization", description: "HyperSmooth 6.0" },
            { title: "Waterproof", description: "Up to 10m" }
        ],
        stock: 20,
        warranty: 1
    },

    // Fashion
    {
        name: "Nike Air Max Running Shoes",
        category: "Fashion",
        brand: "Nike",
        price: 6999,
        cuttedPrice: 9999,
        description: "Comfortable running shoes with responsive cushioning and modern design.",
        highlights: ["Cushioned Sole", "Breathable Upper", "Running Shoes", "Lightweight"],
        specifications: [
            { title: "Material", description: "Mesh and Synthetic" },
            { title: "Sole", description: "Rubber" },
            { title: "Usage", description: "Running" }
        ],
        stock: 60,
        warranty: 0
    },
    {
        name: "Adidas Grand Court Sneakers",
        category: "Fashion",
        brand: "Adidas",
        price: 3999,
        cuttedPrice: 5999,
        description: "Classic casual sneakers suitable for everyday wear.",
        highlights: ["Classic Design", "Comfort Fit", "Casual Wear", "Durable Sole"],
        specifications: [
            { title: "Material", description: "Synthetic" },
            { title: "Sole", description: "Rubber" },
            { title: "Style", description: "Sneakers" }
        ],
        stock: 70,
        warranty: 0
    },
    {
        name: "Puma Essential Hoodie",
        category: "Fashion",
        brand: "Puma",
        price: 1999,
        cuttedPrice: 2999,
        description: "Comfortable cotton-blend hoodie for casual everyday styling.",
        highlights: ["Cotton Blend", "Regular Fit", "Hooded", "Soft Fabric"],
        specifications: [
            { title: "Fabric", description: "Cotton Blend" },
            { title: "Fit", description: "Regular Fit" },
            { title: "Pattern", description: "Solid" }
        ],
        stock: 80,
        warranty: 0
    },
    {
        name: "Levi's Men's Regular Fit Jeans",
        category: "Fashion",
        brand: "Levi's",
        price: 2499,
        cuttedPrice: 3999,
        description: "Classic regular-fit denim jeans with durable fabric.",
        highlights: ["Regular Fit", "Denim", "Classic Style", "Durable"],
        specifications: [
            { title: "Material", description: "Cotton Denim" },
            { title: "Fit", description: "Regular" },
            { title: "Wash", description: "Medium Blue" }
        ],
        stock: 90,
        warranty: 0
    },

    // Home & Kitchen
    {
        name: "Philips Air Fryer 4.1L",
        category: "Home & Kitchen",
        brand: "Philips",
        price: 7999,
        cuttedPrice: 9999,
        description: "Healthy cooking air fryer with rapid air technology.",
        highlights: ["4.1L Capacity", "Rapid Air", "Digital Controls", "Easy Cleaning"],
        specifications: [
            { title: "Capacity", description: "4.1 Litres" },
            { title: "Power", description: "1400W" },
            { title: "Control", description: "Digital" }
        ],
        stock: 35,
        warranty: 2
    },
    {
        name: "Prestige Induction Cooktop",
        category: "Home & Kitchen",
        brand: "Prestige",
        price: 2499,
        cuttedPrice: 3999,
        description: "Efficient induction cooktop with multiple cooking modes.",
        highlights: ["1600W", "Multiple Menus", "Auto Shut Off", "Easy Cleaning"],
        specifications: [
            { title: "Power", description: "1600W" },
            { title: "Control", description: "Touch" },
            { title: "Surface", description: "Glass" }
        ],
        stock: 50,
        warranty: 1
    },
    {
        name: "Dyson V8 Cordless Vacuum",
        category: "Home & Kitchen",
        brand: "Dyson",
        price: 29999,
        cuttedPrice: 34999,
        description: "Cordless vacuum cleaner with powerful suction and convenient design.",
        highlights: ["Cordless", "Powerful Suction", "HEPA Filtration", "40 Min Runtime"],
        specifications: [
            { title: "Runtime", description: "Up to 40 minutes" },
            { title: "Type", description: "Cordless" },
            { title: "Filter", description: "HEPA" }
        ],
        stock: 12,
        warranty: 2
    },
    {
        name: "Milton Stainless Steel Water Bottle",
        category: "Home & Kitchen",
        brand: "Milton",
        price: 799,
        cuttedPrice: 1299,
        description: "Durable stainless steel water bottle for everyday use.",
        highlights: ["Stainless Steel", "Leak Proof", "750ml", "Reusable"],
        specifications: [
            { title: "Capacity", description: "750ml" },
            { title: "Material", description: "Stainless Steel" },
            { title: "Type", description: "Insulated Bottle" }
        ],
        stock: 100,
        warranty: 0
    },

    // Beauty
    {
        name: "Philips Hair Dryer",
        category: "Beauty",
        brand: "Philips",
        price: 1499,
        cuttedPrice: 2199,
        description: "Compact hair dryer with multiple heat and speed settings.",
        highlights: ["1200W", "Multiple Settings", "Cool Air", "Compact"],
        specifications: [
            { title: "Power", description: "1200W" },
            { title: "Settings", description: "3 Heat Settings" },
            { title: "Type", description: "Hair Dryer" }
        ],
        stock: 60,
        warranty: 1
    },
    {
        name: "Dyson Airwrap Multi-Styler",
        category: "Beauty",
        brand: "Dyson",
        price: 44999,
        cuttedPrice: 49900,
        description: "Premium multi-styler for drying, curling and styling hair.",
        highlights: ["Multiple Attachments", "Air Styling", "Heat Control", "Premium Design"],
        specifications: [
            { title: "Type", description: "Multi Styler" },
            { title: "Technology", description: "Air Styling" },
            { title: "Motor", description: "High Speed Digital Motor" }
        ],
        stock: 6,
        warranty: 2
    },
    {
        name: "Lakme Face Care Kit",
        category: "Beauty",
        brand: "Lakme",
        price: 899,
        cuttedPrice: 1299,
        description: "Daily skincare kit for cleansing and moisturizing.",
        highlights: ["Face Wash", "Moisturizer", "Daily Care", "Skin Friendly"],
        specifications: [
            { title: "Type", description: "Skincare Kit" },
            { title: "Usage", description: "Daily" },
            { title: "Skin Type", description: "Normal Skin" }
        ],
        stock: 100,
        warranty: 0
    },
    {
        name: "Nivea Body Lotion",
        category: "Beauty",
        brand: "Nivea",
        price: 499,
        cuttedPrice: 699,
        description: "Moisturizing body lotion for soft and hydrated skin.",
        highlights: ["Deep Moisture", "Long Lasting", "Non Sticky", "Daily Use"],
        specifications: [
            { title: "Volume", description: "400ml" },
            { title: "Type", description: "Body Lotion" },
            { title: "Usage", description: "Daily" }
        ],
        stock: 120,
        warranty: 0
    },

    // Grocery
    {
        name: "Tata Tea Premium",
        category: "Grocery",
        brand: "Tata",
        price: 299,
        cuttedPrice: 349,
        description: "Rich and refreshing tea blend for everyday consumption.",
        highlights: ["Premium Blend", "Strong Aroma", "Rich Taste", "Daily Tea"],
        specifications: [
            { title: "Weight", description: "1kg" },
            { title: "Type", description: "Tea" },
            { title: "Packaging", description: "Pouch" }
        ],
        stock: 150,
        warranty: 0
    },
    {
        name: "Fortune Sunflower Oil",
        category: "Grocery",
        brand: "Fortune",
        price: 149,
        cuttedPrice: 179,
        description: "Light and refined sunflower cooking oil.",
        highlights: ["Refined Oil", "Light Taste", "Cooking Oil", "Quality Tested"],
        specifications: [
            { title: "Volume", description: "1 Litre" },
            { title: "Type", description: "Sunflower Oil" },
            { title: "Packaging", description: "Bottle" }
        ],
        stock: 200,
        warranty: 0
    },
    {
        name: "Aashirvaad Atta",
        category: "Grocery",
        brand: "Aashirvaad",
        price: 399,
        cuttedPrice: 449,
        description: "Whole wheat flour made from quality wheat grains.",
        highlights: ["Whole Wheat", "High Quality", "Soft Rotis", "Everyday Use"],
        specifications: [
            { title: "Weight", description: "10kg" },
            { title: "Type", description: "Whole Wheat Flour" },
            { title: "Packaging", description: "Bag" }
        ],
        stock: 180,
        warranty: 0
    },
    {
        name: "Nestle Maggi 2-Minute Noodles",
        category: "Grocery",
        brand: "Nestle",
        price: 120,
        cuttedPrice: 140,
        description: "Popular instant noodles with classic masala flavor.",
        highlights: ["Instant Food", "Masala Flavor", "Quick Cooking", "Family Pack"],
        specifications: [
            { title: "Weight", description: "560g" },
            { title: "Type", description: "Instant Noodles" },
            { title: "Preparation", description: "2 Minutes" }
        ],
        stock: 250,
        warranty: 0
    },

    // Accessories
    {
        name: "Apple 20W USB-C Power Adapter",
        category: "Accessories",
        brand: "Apple",
        price: 1699,
        cuttedPrice: 1900,
        description: "Compact USB-C power adapter for fast and efficient charging.",
        highlights: ["20W Fast Charging", "USB-C", "Compact", "Original Accessory"],
        specifications: [
            { title: "Power", description: "20W" },
            { title: "Port", description: "USB Type-C" },
            { title: "Type", description: "Power Adapter" }
        ],
        stock: 70,
        warranty: 1
    },
    {
        name: "Samsung 25W Fast Charger",
        category: "Accessories",
        brand: "Samsung",
        price: 1299,
        cuttedPrice: 1699,
        description: "Fast charging adapter compatible with supported Samsung devices.",
        highlights: ["25W Fast Charging", "USB-C", "Compact", "Travel Friendly"],
        specifications: [
            { title: "Power", description: "25W" },
            { title: "Port", description: "USB Type-C" },
            { title: "Charging", description: "Super Fast Charging" }
        ],
        stock: 80,
        warranty: 1
    },
    {
        name: "Logitech Wireless Mouse",
        category: "Accessories",
        brand: "Logitech",
        price: 999,
        cuttedPrice: 1499,
        description: "Reliable wireless mouse with comfortable ergonomic design.",
        highlights: ["Wireless", "Ergonomic", "Long Battery", "Plug and Play"],
        specifications: [
            { title: "Connectivity", description: "2.4GHz Wireless" },
            { title: "Battery", description: "Long Battery Life" },
            { title: "Type", description: "Wireless Mouse" }
        ],
        stock: 100,
        warranty: 1
    },
    {
        name: "HP Wireless Keyboard and Mouse Combo",
        category: "Accessories",
        brand: "HP",
        price: 1799,
        cuttedPrice: 2499,
        description: "Wireless keyboard and mouse combo for work and home use.",
        highlights: ["Wireless", "Keyboard + Mouse", "Full Size", "Comfortable"],
        specifications: [
            { title: "Connectivity", description: "Wireless" },
            { title: "Layout", description: "Full Size" },
            { title: "Type", description: "Combo" }
        ],
        stock: 60,
        warranty: 1
    }
];

// --------------------------------------------------
// MAIN SEED FUNCTION
// --------------------------------------------------

const seedDatabase = async () => {
    try {
        console.log("Connecting to MongoDB...");

        await mongoose.connect(MONGO_URI);

        console.log("✅ MongoDB connected");

        console.log("Clearing old seed data...");

        await Order.deleteMany({});
        await Product.deleteMany({});
        await User.deleteMany({});

        console.log("Creating users...");

        const users = await User.create(usersData);

        const admin = users.find(
            user => user.role === "admin"
        );

        const customers = users.filter(
            user => user.role === "user"
        );

        console.log(`✅ ${users.length} users created`);

        // --------------------------------------------------
        // PRODUCTS
        // --------------------------------------------------

        console.log("Creating 40 products...");

        const products = [];

        for (let i = 0; i < productTemplates.length; i++) {
            const item = productTemplates[i];

            const product = {
                ...item,

                images: [
                    getImage(i),
                    getImage(i + 4)
                ],

                brand: getBrand(item.brand, i),

                user: admin._id,

                ratings: 0,

                numOfReviews: 0,

                reviews: []
            };

            products.push(product);
        }

        const createdProducts = await Product.insertMany(products);

        console.log(`✅ ${createdProducts.length} products created`);

        // --------------------------------------------------
        // REVIEWS
        // --------------------------------------------------

        console.log("Adding reviews...");

        for (let i = 0; i < createdProducts.length; i++) {
            const product = createdProducts[i];

            const reviewCount = 2 + (i % 3);

            const reviews = [];

            for (let r = 0; r < reviewCount; r++) {
                const reviewer = customers[(i + r) % customers.length];

                const rating = 3 + ((i + r) % 3);

                reviews.push({
                    user: reviewer._id,
                    name: reviewer.name,
                    rating,
                    comment:
                        rating >= 5
                            ? "Excellent product. Really happy with the purchase."
                            : rating === 4
                                ? "Very good product. Quality is impressive."
                                : "Good product. Works as expected."
                });
            }

            const averageRating =
                reviews.reduce((sum, review) => sum + review.rating, 0) /
                reviews.length;

            product.reviews = reviews;
            product.numOfReviews = reviews.length;
            product.ratings = Number(averageRating.toFixed(1));

            await product.save();
        }

        console.log("✅ Reviews added");

        // --------------------------------------------------
        // PENDING ORDERS
        // --------------------------------------------------

        console.log("Creating pending orders...");

        for (let i = 0; i < 8; i++) {
            const customer = customers[i % customers.length];

            const product1 = createdProducts[(i * 3) % createdProducts.length];
            const product2 = createdProducts[(i * 3 + 1) % createdProducts.length];

            const quantity1 = 1 + (i % 2);
            const quantity2 = 1;

            const orderItems = [
                {
                    name: product1.name,
                    price: product1.price,
                    quantity: quantity1,
                    image: product1.images[0].url,
                    product: product1._id
                },
                {
                    name: product2.name,
                    price: product2.price,
                    quantity: quantity2,
                    image: product2.images[0].url,
                    product: product2._id
                }
            ];

            const totalPrice =
                product1.price * quantity1 +
                product2.price * quantity2;

            const order = await Order.create({
                shippingInfo: {
                    name: customer.name,
                    email: customer.email,
                    address: `${100 + i} Main Market Road`,
                    city: [
                        "Lucknow",
                        "Delhi",
                        "Mumbai",
                        "Jaipur",
                        "Varanasi",
                        "Pune",
                        "Kanpur",
                        "Noida"
                    ][i],
                    state: [
                        "Uttar Pradesh",
                        "Delhi",
                        "Maharashtra",
                        "Rajasthan",
                        "Uttar Pradesh",
                        "Maharashtra",
                        "Uttar Pradesh",
                        "Uttar Pradesh"
                    ][i],
                    country: "India",
                    pincode: 226001 + i,
                    phoneNo: 9000000000 + i
                },

                orderItems,

                user: customer._id,

                paymentInfo: {
                    id: `UPI_SEED_${10000 + i}`,
                    status: "PENDING_PAYMENT",
                    method: "PHONEPE"
                },

                paidAt: null,

                totalPrice,

                orderStatus: "Pending Payment"
            });
        }

        console.log("✅ 8 orders created");

        console.log("\n=================================");
        console.log("🎉 DATABASE SEED COMPLETED");
        console.log("=================================");
        console.log(`Users: ${users.length}`);
        console.log(`Products: ${createdProducts.length}`);
        console.log("Orders: 8");
        console.log("=================================\n");

        console.log("Login accounts:");
        console.log("---------------------------------");
        console.log("ADMIN");
        console.log("Email: admin@flipcart.com");
        console.log("Password: Admin@123");
        console.log("---------------------------------");
        console.log("USER");
        console.log("Email: rahul@example.com");
        console.log("Password: User@12345");
        console.log("---------------------------------\n");

        await mongoose.connection.close();

        process.exit(0);

    } catch (error) {
        console.error("\n❌ SEED ERROR:");
        console.error(error);

        await mongoose.connection.close();

        process.exit(1);
    }
};

seedDatabase();