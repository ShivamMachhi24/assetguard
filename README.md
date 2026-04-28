# AssetGuard – Digital Asset Protection System 🛡️

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/Frontend-React-61DAFB?logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js-339933?logo=node.js)](https://nodejs.org/)

**AssetGuard** is an AI-powered Digital Asset Protection system designed to combat unauthorized duplication and leakage of visual content. Using advanced **Perceptual Hashing (pHash)**, it detects similar images even if they have been resized, compressed, or slightly modified.

---

## 📊 Problem Statement
In the digital age, asset theft and unauthorized duplication are rampant. Content creators and businesses face significant losses due to:
- **Unauthorized Usage**: Images being used without license or attribution.
- **Duplication**: Re-uploading content with minor edits to bypass traditional filters.
- **Metadata Stripping**: Existing solutions often rely on metadata or exact bit-matching, which are easily bypassed by simple re-saving or resizing.

## 🔐 Solution Overview
AssetGuard solves this by moving beyond simple file hashes. It implements **Perceptual Hashing (pHash)**, which creates a "fingerprint" of an image based on its visual features rather than its raw data.
- **Robust Detection**: Detects matches even after resizing, color shifts, or compression.
- **Forensic Accuracy**: Provides a similarity score to distinguish between exact matches and derivative works.

---

## ✨ Features
- 🚀 **Multi-image Detection (1-vs-MANY)**: Compare a single suspicious asset against a massive registry of protected images.
- 🧬 **Perceptual Hashing (pHash)**: Utilizes Discrete Cosine Transform (DCT) based hashing for superior visual matching.
- 📈 **Similarity Scoring**: Granular confidence levels to determine the degree of duplication.
- 📁 **Registry System**: A centralized repository to manage and monitor your protected digital assets.
- 📑 **Intelligence Report**: Simulated forensic analysis providing deep insights into detected breaches.
- 🚦 **Classification System**: Automatically labels assets as **Breach**, **Possible Match**, or **Clean**.
- 📥 **Forensic Report Export**: Generate and download detailed PDF/Forensic reports for legal documentation.
- ☁️ **Cloud Deployed**: Fully deployed on Render (frontend + backend).
- 🔗 **Live API Integration**: Frontend connected to deployed backend API for real-time analysis.

---

## 🛠️ Tech Stack
| Layer | Technologies |
|---|---|
| **Frontend** | React.js, Tailwind CSS, Framer Motion, Lucide React |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB (via Mongoose) |
| **Image Processing** | Sharp |
| **Algorithm** | DCT-based Perceptual Hashing (imghash) |

---

## 🏗️ System Architecture
The system follows a modern decoupled architecture:
1. **Frontend**: React application handles file uploads and displays forensic results.
2. **Backend**: Node.js API manages the processing pipeline.
3. **Image Processing**: **Sharp** normalizes images (grayscale, resize) to prepare for hashing.
4. **Hashing Engine**: Generates a 64-bit pHash using the DCT algorithm.
5. **Comparison Logic**: Calculates the **Hamming Distance** between the target hash and the registry.
6. **Reporting**: Logic engine classifies the result and generates a similarity confidence score.

---

## 🚀 How to Run Locally

### 1. Clone the Repository
```bash
git clone https://github.com/ShivamMachhi24/assetguard.git
cd assetguard
```

### 2. Backend Setup
```bash
cd backend
npm install
```
Create a `.env` file in the `backend` directory:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
FRONTEND_URL=http://localhost:5173
```
Start the backend:
```bash
npm run dev
```

### 3. Frontend Setup
Open a new terminal in the root directory:
```bash
npm install
npm run dev
```
The application will be running at `http://localhost:5173`.

---

## 🔮 Future Enhancements
- 🔍 **Google Vision API**: Integrate for object detection and deeper image understanding.
- ☁️ **Cloud Scalability**: Deployment on AWS with S3 for massive asset storage.
- 🔔 **Real-time Alerts**: Push notifications or email alerts when a breach is detected.
- 🗄️ **Relational Database**: Migration to PostgreSQL for complex asset relationship mapping.

---

## 🔗 Demo
[View Live Demo](https://assetguard-shivam.onrender.com)

---

## 🌐 Deployment
- **Frontend**: Deployed on Render (Static Site)
- **Backend**: Deployed on Render (Web Service)
- **Database**: None (Stateless Analysis)
- **Live Demo**: [https://assetguard-shivam.onrender.com](https://assetguard-shivam.onrender.com)

## 👨‍💻 Author
**Shivam Machhi**

---
*Created with ❤️ for Digital Asset Protection.*
