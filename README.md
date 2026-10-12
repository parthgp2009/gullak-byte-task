# Gullak (गुल्लक) 🏺
> **"Drop it in. Find it later."**

A private, polished, single-device personal save-for-later mobile application built with **React Native**, **Expo (SDK 57)**, **TypeScript (Strict)**, and **Expo Router**.

---

## 📖 About Gullak

In Indian households, a **Gullak** (गुल्लक) is a traditional terracotta clay piggy bank. From loose coins to handwritten notes and cherished trinkets, you drop little treasures into your gullak through a narrow slit, knowing they are safely stored until you need them.

This app is the digital reflection of that timeless concept: a clutter-free, privacy-first vault right on your device. Whether it is a fleeting spark of thought, a recipe link, an interesting article, or a picture of an inspiring idea, you can **drop it in** and **find it later**.

There are **no accounts**, **no clouds**, **no tracking**, and **no sync servers**. Everything lives locally on your device.

---

## 🎨 Visual Identity & Branding

Gullak is crafted around rich, warm Indian artisanal earth tones:
- **Terracotta Primary** (`#C8553D`): The warmth of baked river clay.
- **Marigold Accent** (`#F2A541`): The vibrant festive yellow-orange of fresh genda phool (marigold).
- **Warm Cream Background** (`#FFF8F0`): Clean, eye-pleasing paper warmth.
- **Deep Brown Text** (`#2B1B14`): High-contrast, gentle readability.
- **Matching Dark Mode**: Deep clay brown background (`#1B120C`) with luminous terracotta and marigold accents.
- **Accessible Floating "Drop in" Button**: High-visibility floating action trigger labeled for screen readers.

---

## ✨ Features

### 1. Three Item Types with Tailored Inputs
- 📝 **Notes**: Full multiline body text with optional titles (auto-derives from the first line if left blank).
- 🔗 **Links**: Web URLs with automatic `https://` protocol normalization, domain extraction, in-app external browser opening, and one-tap clipboard copying.
- 🖼️ **Images**: Capture from device camera or select from photo gallery. Every picked image is permanently copied into the application's document directory (`expo-file-system`), ensuring it persists even if original gallery items or caches are cleared.

### 2. Smart Validation & Auto-Derivation
- **Auto-Derived Titles**: If left empty, titles automatically adapt:
  - *Note*: First line of text (capped at 60 characters).
  - *Link*: Hostname / domain (e.g., `nytimes.com`).
  - *Image*: `"Image <Date>"` (e.g., `"Image Oct 12, 2026"`).
- **Input Guardrails**:
  - Blocks completely empty notes.
  - Blocks invalid link formats with clear inline error guidance.
  - Blocks image entries without an attached image.
  - Disables save buttons during storage operations to prevent double-saves.

### 3. Tagging System with Suggestions
- Add tags dynamically by pressing comma, return, or the add button.
- All tags are trimmed, lowercased, and deduplicated.
- Quick-pick suggestion bar displays previously used tags for one-tap reuse.

### 4. Search & Combined Filtering
- Instant multi-token search matching across **title**, **content**, **URL**, and **tags**.
- Segmented views: **Active** vs. **Archived**.
- Type filters: **All** | **Notes** | **Links** | **Images**.
- Horizontally scrollable tag filter bar. Tag filters combine seamlessly with type chips and search queries.

### 5. Detail & Organization Actions
- Tap any card to view full-screen content, high-resolution image previews, full timestamps, and tags.
- Direct external link launch with graceful fallback.
- One-tap copy buttons for links and note bodies.
- Safe archive and restore flows.
- Destructive delete actions guarded by accessible confirmation dialogs (automatically cleans up associated image files from the filesystem).

---

## 🛠️ Tech Stack & Architectural Decisions

| Technology | Rationale |
| :--- | :--- |
| **Expo SDK 57 & React Native 0.86** | Modern, reliable native mobile framework with fast refresh and universal support. |
| **TypeScript (Strict Mode)** | End-to-end type safety, preventing null/undefined runtime crashes. |
| **Expo Router** | Clean, declarative, file-based routing (`/`, `/item/new`, `/item/[id]`, `/item/edit/[id]`). |
| **`@react-native-async-storage/async-storage`** | Local, high-performance persistence. Encapsulated in `itemRepository.ts` under versioned key `"gullak:items:v1"` with safe JSON fallbacks. |
| **`expo-file-system`** | Copies and isolates image files inside the application's private document sandbox (`gullak_images/`). |
| **`expo-image-picker`** | Native camera capture and gallery selection with permission handling. |
| **`expo-crypto`** | Cryptographically secure UUID generation for item identification. |
| **Custom Theme Engine** | Pure React Native styling without heavy UI bloat, supporting both light and dark aesthetics. |

---

## 🚀 How to Run Locally

### Prerequisites
- Node.js (v18+)
- npm or yarn
- Expo Go app on your physical device (iOS or Android) or a simulator

### Setup Instructions
1. Navigate into the `gullak` directory:
   ```bash
   cd "gullak"
   ```

2. Start the Expo development server:
   ```bash
   npx expo start
   ```

3. Open the app:
   - **Physical Device**: Scan the QR code displayed in the terminal using the Expo Go app (Android) or the Camera app (iOS).
   - **Android Emulator**: Press `a` in the terminal.
   - **iOS Simulator**: Press `i` in the terminal (macOS only).
   - **Web Preview**: Press `w` in the terminal.

4. Run static type checking:
   ```bash
   npx tsc --noEmit
   ```

5. Run logic verification suite:
   ```bash
   node scripts/verify-logic.js
   ```

---

## 🧪 Manual Verification Checklist & Results

| Test Scenario | Steps Taken | Result |
| :--- | :--- | :---: |
| **Create Note** | Created note with title + body; created note with empty title (auto-derived first line). | **PASS** ✅ |
| **Create Link** | Entered URL without scheme (`github.com/expo`); verified auto-prepend to `https://`, domain derived title `github.com`. | **PASS** ✅ |
| **Create Image** | Picked image, verified persistent copy in document directory, verified thumbnail preview and full-width detail display. | **PASS** ✅ |
| **Add & Remove Tags** | Added tags via enter/comma; verified `#tag` normalization, lowercasing, deduplication, and removal via 'x'. | **PASS** ✅ |
| **Search Functionality** | Searched across title, content, URL, and tags; verified real-time case-insensitive filtering. | **PASS** ✅ |
| **Combined Filtering** | Selected "Notes" type chip + tapped `#recipe` tag chip; verified combined intersection filtering. | **PASS** ✅ |
| **Edit Item** | Preloaded item into `ItemForm`, changed title and note content; verified `id` and `createdAt` preserved, `updatedAt` updated. | **PASS** ✅ |
| **Archive & Restore** | Archived item from inbox; switched to "Archived" tab; verified presence; restored back to "Active" inbox. | **PASS** ✅ |
| **Delete with Confirm** | Triggered delete dialog; confirmed; verified item removed from storage and local image file unlinked. | **PASS** ✅ |
| **Input Validation & Edge Cases** | Attempted to save empty note, empty URL, or empty image; verified inline error banners and prevented double-saves. | **PASS** ✅ |
| **Long Text Layouts** | Tested 500+ character notes and long URLs; verified non-overflowing wrapped text and smooth ScrollView. | **PASS** ✅ |
| **Persistence Across Restarts** | Tested AsyncStorage `"gullak:items:v1"` reload and verified file existence in document directory. | **PASS** ✅ |
| **Corrupt Data Fallback** | Tested corrupt JSON parsing; verified graceful fallback to `[]` without crashes. | **PASS** ✅ |
| **Light & Dark Mode** | Toggled theme button; verified high contrast and palette consistency in dark brown mode. | **PASS** ✅ |

---

## 🔮 Stage 2 Ideas (Roadmap)

1. **Biometric Vault Lock**: Protect your Gullak with device FaceID / TouchID via `expo-local-authentication` for additional local privacy.
2. **Encrypted Backup & Export**: One-tap export to an encrypted JSON/ZIP file containing all notes and local images to share or restore on another device.
3. **Rich Web Previews**: Lightweight metadata extraction (title, description, and OpenGraph thumbnail) when saving URLs.
4. **On-Device OCR**: Offline text extraction from saved receipts and photos using on-device ML kit.
5. **Reminders & Snooze**: Local notification alerts to revisit a saved item after a set number of days.
