"use client";

import { useTheme } from "../context/ThemeContext";

export default function Header({ onToggleSidebar }) {
  const { theme, toggleTheme } = useTheme();

  const handleNavClick = (section) => {
    console.log("Navigate to:", section);
  };

  return (
    <header className="h-[64px] sm:h-[72px] lg:h-[82px] relative border-b border-[var(--header-border)] shrink-0">
      {/* Logo & Mobile Menu Toggle */}
      <div className="absolute left-[12px] sm:left-[15px] top-[12px] sm:top-[16px] lg:top-[19px] flex items-center gap-[8px] sm:gap-[10px] text-[var(--brand-accent)] text-[24px] sm:text-[28px] font-extrabold leading-none">
        <span>F</span>
        {/* Mobile sidebar toggle */}
        <button
          type="button"
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
          className="lg:hidden w-[38px] h-[38px] sm:w-[40px] sm:h-[40px] rounded-[8px] border panel flex items-center justify-center text-[var(--text-primary)] text-[14px] sm:text-[16px] cursor-pointer touch-manipulation active:bg-[var(--bg-tertiary)] transition-colors"
        >
          <i className="fas fa-bars" />
        </button>
      </div>

      {/* Topline decorative bar - hidden on mobile */}
      <div className="hidden lg:block absolute left-1/2 -translate-x-1/2 top-[10px] w-[60%] max-w-[300px] xl:w-[374px] h-[10px] lg:h-[13px] rounded-full topline" />

      {/* Navigation */}
      <nav className="hidden lg:flex absolute left-1/2 -translate-x-1/2 top-[31px] items-center gap-[34px] text-[var(--nav-icon)] text-[15px]">
        <button type="button" onClick={() => handleNavClick("home")} aria-label="Home" className="cursor-pointer">
          <i className="fas fa-home" />
        </button>
        <button
          type="button"
          onClick={() => handleNavClick("image")}
          aria-label="Image generation"
          className="w-[40px] h-[25px] rounded-[7px] accent flex items-center justify-center cursor-pointer"
        >
          <i className="far fa-image text-[13px]" />
        </button>
        <button type="button" onClick={() => handleNavClick("video")} aria-label="Video generation" className="cursor-pointer">
          <i className="fas fa-video" />
        </button>
        <button type="button" onClick={() => handleNavClick("magic")} aria-label="Magic tools" className="cursor-pointer">
          <i className="fas fa-magic" />
        </button>
        <button type="button" onClick={() => handleNavClick("theme")} aria-label="Theme" className="cursor-pointer">
          <i className="far fa-sun" />
        </button>
        <button type="button" onClick={() => handleNavClick("gallery")} aria-label="Gallery" className="cursor-pointer">
          <i className="far fa-image" />
        </button>
      </nav>

      {/* Right side buttons */}
      <div className="absolute right-[12px] sm:right-[16px] top-[12px] sm:top-[16px] lg:top-[19px] flex items-center gap-[6px] sm:gap-[7px]">
        <button
          type="button"
          onClick={() => console.log("Plans")}
          aria-label="View plans"
          className="hidden sm:flex btn h-[25px] px-[10px] rounded-[7px] text-[10px] font-bold cursor-pointer hover:opacity-80 transition-opacity items-center justify-center"
        >
          <i className="far fa-credit-card mr-1" />
          Plans
        </button>
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          className="btn h-[38px] w-[38px] sm:h-[25px] sm:w-[25px] rounded-[7px] text-[16px] sm:text-[11px] cursor-pointer hover:opacity-80 transition-opacity flex items-center justify-center"
        >
          <i className={`fas ${theme === "dark" ? "fa-sun" : "fa-moon"}`} />
        </button>
        <button
          type="button"
          onClick={() => console.log("Try Now")}
          aria-label="Try now"
          className="hidden sm:flex btn h-[25px] px-[16px] rounded-[7px] text-[11px] font-extrabold cursor-pointer hover:opacity-80 transition-opacity items-center justify-center"
        >
          Try Now
        </button>
      </div>
    </header>
  );
}
