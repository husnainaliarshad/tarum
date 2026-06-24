# Tarum — Creator UI - tarum-nw5j.vercel.app

An AI-powered image and video generation platform built with Next.js. This project was developed as part of the Frontend Developer Technical Assessment for Tarum.

## Tech Stack

- **Framework:** Next.js 16 (App Router, Turbopack)
- **Language:** JavaScript (ES6+)
- **Styling:** Tailwind CSS v4
- **Icons:** Font Awesome 5.15.3
- **Fonts:** Inter (body), Geist Mono (code)
- **Database:** Turso (libsql) — local SQLite via `@libsql/client`

## Project Structure

```
tarum/
├── src/
│   └── app/
│       ├── api/
│       │   └── generate/
│       │       └── route.js        # Dummy API endpoint for content generation
│       ├── components/
│       │   ├── Header.js           # Top navigation bar with theme toggle
│       │   ├── HistoryPanel.js     # History, New Chat, and empty state
│       │   ├── SidebarInput.js     # Main generation controls (prompt, upload, settings)
│       │   └── GeneratedContent.js # Responsive grid of generated images/videos
│       ├── context/
│       │   └── ThemeContext.js      # Dark/light theme provider
│       ├── globals.css             # Custom utilities, theme variables, animations
│       ├── layout.js               # Root layout with ThemeProvider
│       └── page.js                 # Main page composing all components
├── next.config.mjs                 # Image remote patterns configuration
└── package.json
```

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Features

### Core (Required)
- **Interactive Sidebar:** Real `<button>`, `<textarea>`, `<input type="file">`, `<select>` elements with proper React state management
- **Image/Video Mode Toggle:** Switch between image and video generation modes
- **Prompt Input:** Textarea for describing the desired content
- **File Upload:** Hidden file input triggered by button click
- **Image Count Selector:** 1/2/3/4 button group with active state
- **Resolution Selector:** Dropdown (1K/2K/3K/4K) for images, chip buttons (720p/1080p/4K) for video
- **Aspect Ratio Dropdown:** Popover grid with 11 options (Auto through 21:9), each with a visual preview box shaped to the ratio
- **Model Selector:** Dropdown for selecting AI model
- **Advanced Settings:** Expandable section with negative prompt, seed, duration, FPS inputs
- **Multi-shot Toggle:** Toggle switch for video multi-shot mode
- **Effects Thumb:** Visual placeholder for video effects selection
- **Generated Content Grid:** Responsive image grid with loading skeletons, empty state, and error handling
- **Dummy API:** `POST /api/generate` endpoint returning placeholder images from picsum.photos

### Responsive Design
- **Desktop (lg+):** Full layout with sidebar, history panel, and content grid side by side
- **Tablet/Mobile:** Sidebar hidden behind a hamburger menu toggle with overlay backdrop
- **Content Grid:** Responsive columns (1/2/3/4) based on viewport width
- **No horizontal scrolling** at any breakpoint

### Accessibility
- `aria-label` on all icon-only buttons
- `aria-expanded` on toggle buttons (Advance settings, aspect ratio dropdown)
- `aria-pressed` on toggle groups (mode switch, image count, resolution chips)
- `aria-selected` on tab elements
- `role="tablist"` and `role="tab"` for mode toggle
- `alt` text on generated images via `next/image`
- Semantic HTML (`<header>`, `<nav>`, `<main>`, `<aside>`, `<section>`)

### Performance
- Images optimized with `next/image` component
- Remote image patterns configured in `next.config.mjs`
- CSS custom properties for theme colors (no runtime style recalculations)
- Proper component separation for code splitting

### Bonus Features
- **Dark/Light Mode:** Theme toggle in header with CSS custom properties, persisted to localStorage
- **Smooth Animations:** Fade-in for generated content cards, hover scale effects, skeleton loading pulse animation
- **CSS Variables:** Full theme system using CSS custom properties for all colors

## Design Decisions

1. **CSS Custom Properties over Tailwind dark: variant:** Using CSS variables allows a single source of truth for all theme colors, making the light/dark toggle simpler and more maintainable than Tailwind's `dark:` prefix approach.

2. **Client Components with useState:** The sidebar uses local state rather than a global state manager because each instance is self-contained. The `onGenerate` callback pattern keeps the data flow unidirectional.

3. **Aspect Ratio Visual Preview:** Each ratio option in the dropdown shows a miniature box shaped to the actual aspect ratio, making selection intuitive.

4. **Scrollable Sidebar Content:** Only the content below the mode toggle scrolls, keeping the toggle always visible. The scrollbar is hidden for a cleaner UI.

5. **Mobile Sidebar as Overlay:** On smaller screens, the sidebar slides in as an overlay with a backdrop, preserving screen real estate for the main content.

## API

### `POST /api/generate`

Generates mock image/video results.

**Request Body:**
```json
{
  "mode": "image",
  "prompt": "a beautiful landscape",
  "count": 4,
  "aspectRatio": "16:9"
}
```

**Response:**
```json
{
  "results": [
    {
      "id": "gen-1234567890-0",
      "url": "https://picsum.photos/seed/gen-1234567890-0/800/450",
      "prompt": "a beautiful landscape",
      "type": "image",
      "aspectRatio": "16:9",
      "createdAt": "2026-06-24T16:00:00.000Z"
    }
  ]
}
```
