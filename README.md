# Sushi earn 🍣🚗

**Sushi earn** is a mobile-first Progressive Web App (PWA) designed specifically for e-hailing drivers in Malaysia. It provides a streamlined, offline-capable dashboard to track daily shift earnings, manage micro-expenses (such as municipal street parking applications like Smart Selangor and Flexi Parking), monitor vehicle compliance (PSV and EVP license expirations), and visualize financial trends.

![Sushi earn App Preview](icon-192.png)

---

## Key Features

* **Offline-First PWA Architecture:** Powered by Service Workers (`sw.js`), the app caches all assets and runs smoothly even in low-signal areas or underground parking structures. It can be installed directly onto your mobile home screen without needing an app store.
* **Financial & Shift Tracking:** Log individual trip earnings and micro-expenses categorized by Smart Selangor Parking, Flexi Parking, Fuel/Petrol, and Touch 'n Go/RFID tolls.
* **7-Day Trend Visualization:** Interactive dark-mode line charts built with Chart.js to monitor recent earnings versus expenses at a glance.
* **Compliance & Permit Management:** Track your **PSV (Public Service Vehicle)** license and **E-Hailing Vehicle Permit (EVP)** expiration dates with automated color-coded status badges that alert you 30 days before renewal deadlines.
* **CSV Backup & Restore:** Securely export your financial history to a CSV file for backup or view it in Excel, with full import capabilities to restore your data anytime.
* **Local Data Privacy:** All records are stored securely on your device using the browser's `localStorage`, ensuring complete privacy without requiring a cloud server.

---

## Tech Stack

* **Frontend:** HTML5, CSS3, Vanilla JavaScript (Mobile-First UI)
* **Visualizations:** Chart.js
* **PWA & Offline Support:** Web App Manifest (`manifest.json`), Service Workers (`sw.js`)
* **Storage:** Browser `localStorage`

---

## Installation Guide (Mobile PWA)

You can install **Sushi earn** directly to your phone for a native app experience:

1. Open your mobile browser (Chrome for Android, Safari for iOS) and navigate to your deployed live URL (hosted via GitHub Pages).
2. **Android:** Tap the 3-dot menu in Chrome and select **Install app** (or tap the automated prompt at the bottom).
3. **iOS:** Tap the **Share** button in Safari and select **Add to Home Screen**.

The app will launch in full-screen mode with your custom branding and stay fully operational offline!
