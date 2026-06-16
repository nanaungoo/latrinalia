# project_discussion.md

## Project Overview: "Latrinalia" (Digital Toilet Graffiti Wall)
This document chronicles the design, strategic pivots, and engineering choices discussed for the "Latrinalia" project—a digital platform that brings the age-old human culture of anonymous toilet graffiti into a modern digital ecosystem.

---

## 1. Evolution of the Product Strategy

### Initial Concept
* **Idea:** A 3D Simulation Game or an Anonymous Social App replicating the physical experience of visiting a bathroom stall and reading/writing graffiti.
* **Key Features:** First-person 3D immersion (opening doors, locking stalls), freehand marker drawing/scratching via touchscreen, location-specific walls using GPS, total anonymity, a "Janitor Mode" to wipe walls periodically, and a game-like time limit.

### Strategic Pivots & Critical Advisory
To transform this into a scalable, realistic, and production-ready project, several fundamental shifts were made based on human psychology, platform restrictions, and engineering complexity:

1.  **Platform Pivot (Native App → Progressive Web App):** * *Why:* Native App Stores (Apple App Store / Google Play Store) have strict User-Generated Content (UGC) and content moderation policies. An anonymous toilet wall app would likely face immediate rejection or bans due to unfiltered content. 
    * *Solution:* Transitioned to a Web App / PWA (Progressive Web App) accessed via Google Chrome. Users scan a QR code inside a real stall or open a link, completely bypassing app store gatekeepers while maintaining instant access without friction download times.
2.  **Input Mechanism Pivot (Freehand Drawing → Keyboard Input):**
    * *Why:* Handling touch gesture latencies, rendering vector-smooth lines (Bézier curves) in a web canvas, and managing heavy SVG/Image data formats introduce massive technical overhead.
    * *Solution:* Switched to a text-keyboard-driven system. It drastically minimizes data payloads (storing text strings instead of complex image trajectories) and ensures flawless performance even on weak mobile networks.

---

## 2. Refined UI/UX & Feature Set

To retain the authentic, chaotic vibe of toilet graffiti without freehand drawing, the interface implements the following mechanics:

* **Drag & Drop Sticker Style:** User input generates a digital text "sticker" or "post-it note" that can be freely dragged, dropped, or overlapped anywhere on the virtual 2D digital stall door canvas.
* **Graffiti Aesthetics:** Text utilizes stylized Handwriting Fonts with customizable marker colors (black, red, blue, green) and adjustable font sizes/rotations to mirror organic human scribbles.
* **Handling Unlimited Character Length:** Since text length is unrestricted, the system manages layout crowding via two options:
    * *The Envelope Model:* Extra-long texts collapse into a small letter icon that pops up on click.
    * *Dynamic Shrinking:* Font sizes automatically scale down as character counts increase to constrain the text box boundary.

---

## 3. Tech Stack & Database Architecture

The project is optimized for high concurrency, low latency, and low data footprints using modern web technologies:

* **Frontend Framework:** React.js (Mobile-first, optimized for touch interaction).
* **Canvas Management:** HTML5 Canvas combined with absolute CSS positioning (`position: absolute`) for effortless sticker placement mapping via X and Y coordinates.
* **Real-time Backend:** Supabase (PostgreSQL) leveraging WebSockets for instantaneous sync when multiple users manipulate or add data to the same wall.

### Database Schema (Sticker Table)
```sql
CREATE TABLE stickers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    toilet_id VARCHAR(255) NOT NULL,
    text_content TEXT NOT NULL,
    font_style VARCHAR(50),
    color VARCHAR(7), -- Hex Color Codes
    x_position INT NOT NULL,
    y_position INT NOT NULL,
    angle INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);