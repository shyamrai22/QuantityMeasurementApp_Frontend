# ⚖️ Quantity Measurement App - Smart Measurement System

The Quantity Measurement App is a modern, high-performance web application designed for precise quantity measurements and unit conversions. Built with a focus on user experience and accuracy, it provides a seamless interface for converting, comparing, and performing arithmetic operations on various physical quantities.

## ✨ Features

- **🔄 Multi-Category Conversion**: Support for Length, Weight, Temperature, and Volume.
- **➕ Mathematical Operations**: Add and subtract quantities with automatic unit handling.
- **⚖️ Smart Comparison**: Compare two quantities in different units to find their relation.
- **🔐 Secure Authentication**: Personalized experience with secure login and registration.
- **👤 Guest Access**: Perform conversions and operations instantly without account creation.
- **📜 Operations History**: Track your past measurements (saved locally for guests, synced for users).
- **🎨 Premium UI**: A stunning, responsive interface with glassmorphism, dynamic gradients, and smooth animations.

## 🛠️ Technology Stack

- **Framework**: [Angular 19+](https://angular.dev/)
- **State Management**: Angular Signals (Fine-grained reactivity)
- **Styling**: Modern CSS3 (Variables, Gradients, Flexbox/Grid)
- **Networking**: RxJS & HttpClient
- **Testing**: Vitest
- **Backend API**: Spring Boot (RESTful API)

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18.0.0 or higher)
- [npm](https://www.npmjs.com/) (v9.0.0 or higher)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/shyamrai22/QuantityMeasurementApp_Frontend.git
   cd QuantityMeasurementApp_Frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```
   *Navigate to `http://localhost:4200/` in your browser.*

## 📁 Project Structure

```text
src/
├── app/
│   ├── auth/           # Login & Registration components
│   ├── core/           # Services, Models, Guards, Interceptors
│   ├── dashboard/      # Main operation interface
│   ├── records/        # History & Records view
│   └── shared/         # Reusable components & Utility pipes
├── assets/             # Static assets (images, icons)
└── styles.css          # Global design system
```

## 🧪 Testing

To run unit tests using Vitest:
```bash
npm test
```

## 🏗️ Building for Production

To create an optimized production build:
```bash
npm run build
```
The artifacts will be stored in the `dist/` directory.

---
*Developed as part of BridgeLabz Training.*
