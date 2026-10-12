# Gullak (गुल्लक) 🏺
> **"Drop it in. Find it later."**

A private, beautifully crafted, single-device personal save-for-later mobile application built with **React Native**, **Expo (SDK 57)**, **TypeScript (Strict)**, and **Expo Router**.

---

## 📖 About Gullak

In Indian households, a **Gullak** (गुल्लक) is a traditional terracotta clay piggy bank. From loose coins to handwritten notes and cherished trinkets, you drop little treasures into your gullak through a narrow slit, knowing they are safely stored until you need them.

This app is the digital reflection of that timeless concept: a clutter-free, privacy-first vault right on your device. Whether it is a fleeting spark of thought, a recipe link, an interesting article, a saved photo, or a quick code snippet, you can **drop it in** and **find it later**.

There are **no accounts**, **no clouds**, **no tracking**, and **no sync servers**. Everything lives 100% locally on your device.

---

## 🎨 Visual Identity & Design Tokens

Gullak is styled after a high-end, bespoke artisanal mobile aesthetic:
- **Primary Theme**: Near-black charcoal (`#141416`) with dark surface cards (`#1E1E21`) and subtle 1px hairline borders (`rgba(255, 255, 255, 0.10)`).
- **Terracotta Accent** (`#C8654A` / pressed `#B5563D`): Baked clay warmth for active chips, primary buttons, and wordmark dot.
- **Warm Cream Text** (`#F3E9DC`): High-contrast, easy-on-the-eyes editorial typography.
- **Muted Text** (`#9A948C`): Subtle secondary information hierarchy.
- **Matching Warm Paper Light Theme**: Light paper background (`#FAF6F0`), crisp surface cards (`#FFFFFF`), and dark clay text (`#261E1A`), accessible via the Settings sheet.
- **Typography**:
  - **Fraunces** (`Fraunces_700Bold`): Elegant serif for the `"Gullak."` wordmark (with terracotta dot) and screen titles.
  - **Inter** (`Inter_400Regular`, `Inter_500Medium`, `Inter_600SemiBold`, `Inter_700Bold`): Modern sans-serif for body, buttons, chips, and metadata.
  - **Monospace** (`Menlo` / `monospace`): For code and text snippets.
- **Proportions & Radii**:
  - Cards: `20px` (modern squircle aesthetic).
  - Chips & Action Buttons: `10px` (rounded rectangles, not pills).
  - Icon Buttons: `12px` (44px touch targets).
  - Empty State Floating Tiles: `8px`.

---

## ✨ Features

### 1. Four Item Types with Tailored Inputs
- 📝 **Notes**: Multiline body text with optional titles (auto-derives from the first line if left blank).
- 🔗 **Links**: Web URLs with automatic `https://` protocol normalization, domain extraction, deterministic local monogram tiles (zero network requests), in-app external browser opening, and one-tap clipboard copying.
- 🖼️ **Images**: Capture from camera or select from photo gallery. Every picked image is permanently copied into the application's private document directory (`expo-file-system`), surviving app restarts and cache purges.
- 💻 **Snippets**: Code and text snippets displayed in dedicated monospace blocks with one-tap copy buttons.

### 2. Mockup-Accurate Home Experience
- **Header Row**: `"Gullak."` in Fraunces serif with terracotta period, plus two 44px outlined icon buttons:
  - *Archive button*: Quick toggle to archived view.
  - *Settings button*: Opens bottom sheet with Dark/Light/System theme switch and app details.
- **Animated Segmented Control**: Smooth Reanimated sliding transition between **Active** and **Archived** with a 1px terracotta outline on the active segment.
- **Search & Tag Filter Sheet**: Search bar with leading icon and trailing sliders icon opening a tag filter bottom sheet.
- **Filter Chips**: Horizontally scrollable row: `All`, `Notes`, `Links`, `Images`, `Snippets` running off the right edge.
- **Empty State**: Centered 3D clay pot (`assets/images/gullak-pot.png`) with smooth 4s sine float animation, surrounded by five floating cream icon tiles with independent float and rotation, bold Inter title, subtitle, and terracotta button.
- **Floating "Drop in" FAB**: Bottom-right rounded rectangle (radius 10), terracotta fill, spring scale on press with light haptics (`expo-haptics`).

### 3. Gesture Actions & List Transitions
- **Swipe Left**: Archive / Restore with medium haptic.
- **Swipe Right**: Delete with medium haptic and confirmation modal.
- Smooth Reanimated layout transitions during list modifications.

### 4. Create, Edit & Detail Views
- Outlined inputs with hairline borders and radius 12.
- Full-width terracotta primary button above keyboard with quiet text "Cancel".
- Save flourish coin animation dropping smoothly as save completes.
- Detail screen with large Fraunces title, metadata micro-labels, domain monograms, and sticky outlined action bar (Edit, Archive, Delete).

---

## 🛠️ Tech Stack

| Technology | Purpose |
| :--- | :--- |
| **Expo SDK 57 & React Native 0.86** | Cross-platform native mobile foundation |
| **TypeScript (Strict Mode)** | Complete end-to-end type safety |
| **Expo Router** | File-based declarative routing (`/`, `/item/new`, `/item/[id]`, `/item/edit/[id]`) |
| **`@react-native-async-storage/async-storage`** | Fast local key-value storage under versioned key `"gullak:items:v1"` |
| **`expo-file-system/legacy`** | Permanent local sandbox copying for persistent image retention |
| **`react-native-reanimated`** | Smooth 60fps animations: pot float, floating tiles, segmented slide, spring buttons |
| **`react-native-gesture-handler`** | Native swipe-to-archive and swipe-to-delete gestures |
| **`expo-haptics`** | Native tactile vibration on press, swipe, and save flourish |
| **`@expo-google-fonts/fraunces` & `inter`** | Editorial serif and crisp sans-serif loaded with `expo-splash-screen` |

---

## 🚀 How to Run Locally

1. Navigate into the `gullak` folder:
   ```bash
   cd "gullak"
   ```

2. Start the Expo development server:
   ```bash
   npx expo start
   ```

3. Open on your device or simulator:
   - **Physical Device**: Scan the QR code in the terminal with the **Expo Go** app.
   - **Android Emulator**: Press `a`.
   - **iOS Simulator**: Press `i` (macOS).
   - **Web Preview**: Press `w`.

4. Run type check:
   ```bash
   npx tsc --noEmit
   ```

5. Run verification suite:
   ```bash
   node scripts/verify-logic.js
   ```

---

## 🧪 Verification Matrix & Test Results

| Feature / Scenario | Verification Details | Result |
| :--- | :--- | :---: |
| **TypeScript Strict Checking** | Ran `npx tsc --noEmit` across all app and src files | **PASS (0 errors)** ✅ |
| **Logic Verification Suite** | Ran `node scripts/verify-logic.js` (URLs, tags, titles, search, snippets) | **PASS (100%)** ✅ |
| **Production Web Export** | Ran `npx expo export --platform web` across all 6 static routes | **PASS (0 errors)** ✅ |
| **Header Row Layout** | Fraunces wordmark with terracotta dot, 44px archive & settings buttons | **PASS** ✅ |
| **Animated Segmented Control** | 1px terracotta outline, smooth sliding animation, haptic feedback | **PASS** ✅ |
| **Search & Tag Filter Sheet** | Live search, sliders icon opens bottom sheet with toggleable chips | **PASS** ✅ |
| **Filter Chips** | Radius 10, terracotta active state, chips scroll smoothly off right edge | **PASS** ✅ |
| **Empty State 3D Pot** | 4s sine float on 3D pot, 5 independent floating cream tiles | **PASS** ✅ |
| **Floating "Drop in" FAB** | Radius 10 rectangle, terracotta, spring scale with light haptics | **PASS** ✅ |
| **Item Cards Redesign** | Surface `#1E1E21`, 1px border, radius 20, Fraunces title, domain monogram | **PASS** ✅ |
| **Snippet Type** | 4th item type: monospace code block with one-tap copy button | **PASS** ✅ |
| **Swipe Gestures** | Swipe left to archive, swipe right to delete, with tactile haptics | **PASS** ✅ |
| **Create & Edit Screens** | Outlined inputs, quiet cancel, inline error states, coin drop flourish | **PASS** ✅ |
| **Detail View** | Large Fraunces title, domain monogram, outlined action buttons, delete sheet | **PASS** ✅ |
| **Persistence Across Restarts** | Saved items and local images reload cleanly without data loss | **PASS** ✅ |
| **Theme Toggle** | Settings sheet toggles smoothly between Dark Charcoal and Warm Paper Light | **PASS** ✅ |

---

## 🔮 Stage 2 Ideas (Roadmap)

1. **Biometric Vault Lock**: FaceID / TouchID lock via `expo-local-authentication`.
2. **Encrypted Archive Export**: Export/import a password-protected ZIP archive containing all items and image assets.
3. **Syntax Highlighting**: On-device language detection and syntax coloring for Snippet blocks.
4. **Offline OCR**: Extract text directly from saved photos and receipts.
