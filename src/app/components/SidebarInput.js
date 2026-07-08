"use client";

import { useState, useRef, useEffect } from "react";

function Select({ text, big, value, onChange, options }) {
  return (
    <div
      className={
        (big
          ? "mt-[15px] h-[39px] rounded-full"
          : "mt-[15px] h-[26px] rounded-[7px]") +
        " panel2 px-[12px] flex items-center justify-between text-[11px] font-extrabold"
      }
    >
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent text-inherit font-inherit outline-none appearance-none flex-1 cursor-pointer"
        aria-label={text}
      >
        {options.map((opt) => (
          <option key={opt} value={opt} className="bg-[var(--select-option-bg)] text-[var(--select-option-text)]">
            {text.startsWith("Model:") ? `Model: ${opt}` : opt}
          </option>
        ))}
      </select>
      <i className="fas fa-chevron-down text-[8px] muted pointer-events-none" />
    </div>
  );
}

const aspectRatios = [
  { id: "auto", label: "Auto", boxClass: "w-5 h-5 border-dashed" },
  { id: "1:1", label: "1:1", boxClass: "w-5 h-5" },
  { id: "3:2", label: "3:2", boxClass: "w-7 h-5" },
  { id: "2:3", label: "2:3", boxClass: "w-5 h-7" },
  { id: "3:4", label: "3:4", boxClass: "w-5 h-6" },
  { id: "4:3", label: "4:3", boxClass: "w-6 h-5" },
  { id: "4:5", label: "4:5", boxClass: "w-5 h-6" },
  { id: "5:4", label: "5:4", boxClass: "w-6 h-5" },
  { id: "9:16", label: "9:16", boxClass: "w-4 h-7" },
  { id: "16:9", label: "16:9", boxClass: "w-8 h-4" },
  { id: "21:9", label: "21:9", boxClass: "w-9 h-4" },
];

function AspectRatioDropdown({ value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const selected = aspectRatios.find((r) => r.id === value) || aspectRatios[0];

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={`Aspect ratio: ${selected.label}`}
        aria-expanded={isOpen}
        className={`flex items-center gap-[6px] px-[10px] h-[25px] rounded-[7px] bg-[var(--aspect-btn-bg)] border transition-colors duration-200 ${
          isOpen ? "border-[var(--brand-accent)]" : "border-[var(--border-primary)] hover:border-[var(--border-secondary)]"
        }`}
      >
        {selected.id === "auto" ? (
          <div className="w-5 h-5 border-2 border-dashed border-[var(--text-muted)] rounded-sm flex items-center justify-center text-[8px] font-bold text-[var(--text-muted)]">
            A
          </div>
        ) : (
          <div className={`border border-[var(--text-muted)] rounded-sm ${selected.boxClass}`} />
        )}
        <span className="font-bold text-[11px] text-[var(--text-primary)]">{selected.label}</span>
        <i className={`fas fa-chevron-down text-[7px] text-[var(--text-muted)] transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Popover Menu */}
      {isOpen && (
        <div className="absolute bottom-full left-0 mb-2 w-56 bg-[var(--aspect-btn-bg)] border border-[var(--border-primary)] rounded-xl p-3 shadow-2xl z-50">
          <div className="grid grid-cols-4 gap-y-3 gap-x-1 justify-items-center items-center">
            {aspectRatios.map((ratio) => {
              const isSelected = selected.id === ratio.id;
              return (
                <button
                  key={ratio.id}
                  type="button"
                  onClick={() => {
                    onChange(ratio.id);
                    setIsOpen(false);
                  }}
                  aria-label={`${ratio.label} aspect ratio`}
                  aria-pressed={isSelected}
                  className="flex flex-col items-center gap-1 group w-full py-1 rounded-lg hover:bg-[var(--bg-tertiary)]/30 transition-all"
                >
                  <div className="h-8 flex items-center justify-center w-full">
                    {ratio.id === "auto" ? (
                      <div
                        className={`w-5 h-5 border-2 border-dashed rounded flex items-center justify-center text-[9px] font-bold transition-all ${
                          isSelected
                            ? "border-[var(--accent-border)] text-[var(--accent-border)] bg-[var(--accent-border)]/10 shadow-[0_0_6px_rgba(217,119,75,0.2)]"
                            : "border-[var(--text-muted)] text-[var(--text-muted)] group-hover:border-[var(--text-primary)]"
                        }`}
                      >
                        A
                      </div>
                    ) : (
                      <div
                        className={`border rounded transition-all ${
                          isSelected
                            ? "border-[var(--accent-border)] bg-[var(--accent-border)]/10 shadow-[0_0_6px_rgba(217,119,75,0.2)]"
                            : "border-[var(--text-muted)] group-hover:border-[var(--text-primary)]"
                        } ${ratio.boxClass}`}
                      />
                    )}
                  </div>
                  <span
                    className={`text-[9px] font-semibold ${
                      isSelected ? "text-[var(--accent-border)]" : "text-[var(--text-muted)] group-hover:text-[var(--text-primary)]"
                    }`}
                  >
                    {ratio.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default function SidebarInput({ onGenerate, prefilledPrompt, prefilledMode, onClearPrefill }) {
  const [mode, setMode] = useState("image");

  // Image mode state
  const [prompt, setPrompt] = useState("");
  const [imageCount, setImageCount] = useState(1);
  const [resolution, setResolution] = useState("2K");
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [model, setModel] = useState("Nano Banana 2");
  const [advanceOpen, setAdvanceOpen] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const imageFileInputRef = useRef(null);

  // Video mode state
  const [videoPrompt, setVideoPrompt] = useState("");
  const [multiShot, setMultiShot] = useState(false);
  const [videoResolution, setVideoResolution] = useState("720p");
  const [videoAspect, setVideoAspect] = useState("16:9");
  const [videoModel, setVideoModel] = useState("Kling v3");
  const [videoAdvanceOpen, setVideoAdvanceOpen] = useState(false);
  const [videoUpload, setVideoUpload] = useState(null);
  const videoFileInputRef = useRef(null);

  useEffect(() => {
    if (prefilledPrompt) {
      if (prefilledMode === "image") {
        setPrompt(prefilledPrompt);
        setMode("image");
      } else {
        setVideoPrompt(prefilledPrompt);
        setMode("video");
      }
      if (onClearPrefill) {
        onClearPrefill();
      }
    }
  }, [prefilledPrompt, prefilledMode, onClearPrefill]);

  const handleGenerate = () => {
    if (!onGenerate) return;
    if (mode === "image") {
      onGenerate({
        mode: "image",
        prompt,
        count: imageCount,
        resolution,
        aspectRatio,
        model,
      });
    } else {
      onGenerate({
        mode: "video",
        prompt: videoPrompt,
        resolution: videoResolution,
        aspectRatio: videoAspect,
        model: videoModel,
        multiShot,
      });
    }
  };

  const handleFileUpload = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      if (type === "image") {
        setUploadedFile(file);
      } else {
        setVideoUpload(file);
      }
    }
  };

  const resolutions = ["1K", "2K", "3K", "4K"];
  const imageModels = ["Nano Banana 2", "Nano Banana 3", "Pro Vision"];
  const videoModels = ["Kling v3", "Kling v2", "Pika"];

  return (
    <aside className="w-full lg:w-[305px] lg:panel lg:rounded-[22px] px-3 sm:px-4 lg:px-[18px] pt-3 lg:pt-[17px] shrink-0 flex flex-col h-full" aria-label="Generation controls">
      {/* Mode toggle: Image / Video */}
      <div className="h-[35px] sm:h-[31px] bg-[var(--mode-toggle-bg)] rounded-full p-[3px] flex text-[12px] sm:text-[11px] font-bold shrink-0" role="tablist" aria-label="Generation mode">
        <button
          type="button"
          role="tab"
          aria-selected={mode === "image"}
          aria-pressed={mode === "image"}
          onClick={() => setMode("image")}
          className={
            (mode === "image" ? "accent " : "") + "rounded-full flex-1 cursor-pointer"
          }
        >
          Image
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === "video"}
          aria-pressed={mode === "video"}
          onClick={() => setMode("video")}
          className={
            (mode === "video" ? "accent " : "") + "rounded-full flex-1 muted cursor-pointer"
          }
        >
          Video
        </button>
      </div>

      {/* Scrollable content below the toggle */}
      <div className="flex-1 overflow-y-scroll mt-[17px] pr-1 scrollbar-none">
        {/* ==================== IMAGE MODE ==================== */}
        {mode === "image" && (
          <>
            {/* Prompt textarea */}
            <div className="panel2 rounded-[18px] h-[180px] sm:h-[178px] p-[16px] relative">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe what you want to create..."
                aria-label="Image prompt"
                className="w-full h-full bg-transparent text-[var(--text-primary)] text-[13px] sm:text-[12px] font-bold leading-[16px] sm:leading-[15px] resize-none outline-none placeholder:text-[var(--text-muted)]"
              />
              <button
                type="button"
                onClick={handleGenerate}
                aria-label="Generate image"
                className="absolute right-[12px] bottom-[12px] bg-[var(--generate-btn-bg)] text-[var(--generate-btn-text)] rounded-full h-[40px] sm:h-[38px] px-[20px] sm:px-[18px] text-[13px] sm:text-[12px] font-extrabold cursor-pointer hover:opacity-80 active:scale-95 transition-all"
              >
                <i className="fas fa-magic mr-1" /> Generate
              </button>
            </div>

            {/* Upload image */}
            <input
              ref={imageFileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => handleFileUpload(e, "image")}
              className="hidden"
              aria-hidden="true"
            />
            <button
              type="button"
              onClick={() => imageFileInputRef.current?.click()}
              aria-label={uploadedFile ? `Uploaded: ${uploadedFile.name}` : "Upload image"}
              className="panel2 rounded-[16px] mt-[17px] h-[120px] sm:h-[118px] flex flex-col items-center justify-center w-full cursor-pointer hover:opacity-80 transition-opacity"
            >
              <i className="fas fa-upload text-[var(--text-muted)] text-[24px] sm:text-[22px]" />
              <div className="text-[11px] sm:text-[10px] font-extrabold mt-[12px] text-[var(--text-accent)]">
                {uploadedFile ? uploadedFile.name : "Upload image"}
              </div>
            </button>

            {/* Number of images + Resolution */}
            <div className="flex gap-[7px] mt-[13px]">
              <div className="panel2 h-[25px] rounded-[7px] flex items-center overflow-hidden text-[11px] font-extrabold" role="group" aria-label="Number of images">
                {[1, 2, 3, 4].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setImageCount(num)}
                    aria-label={`${num} image${num > 1 ? "s" : ""}`}
                    aria-pressed={imageCount === num}
                    className={`h-full px-[12px] flex items-center cursor-pointer transition-colors ${
                      imageCount === num ? "accent" : "hover:bg-[var(--bg-tertiary)]"
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
              <div className="panel2 h-[25px] rounded-[7px] flex-1 px-[12px] flex items-center justify-between text-[11px] font-extrabold">
                <select
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  aria-label="Resolution"
                  className="bg-transparent text-inherit font-inherit outline-none appearance-none flex-1 cursor-pointer"
                >
                  {resolutions.map((r) => (
                    <option key={r} value={r} className="bg-[var(--select-option-bg)] text-[var(--select-option-text)]">
                      {r}
                    </option>
                  ))}
                </select>
                <i className="fas fa-chevron-down text-[8px] muted pointer-events-none" />
              </div>
            </div>

            {/* Aspect ratio dropdown */}
            <div className="mt-[9px]">
              <AspectRatioDropdown value={aspectRatio} onChange={setAspectRatio} />
            </div>

            <Select
              text="Model:"
              value={model}
              onChange={setModel}
              options={imageModels}
            />

            {/* Advance toggle */}
            <button
              type="button"
              onClick={() => setAdvanceOpen(!advanceOpen)}
              aria-expanded={advanceOpen}
              aria-label="Advanced settings"
              className={
                "w-full panel2 px-[12px] flex items-center justify-between text-[11px] font-extrabold cursor-pointer mt-[15px] transition-colors " +
                (advanceOpen
                  ? "h-[39px] rounded-[7px] rounded-b-none border-b-0"
                  : "h-[39px] rounded-[7px]")
              }
            >
              <span>Advance</span>
              <i className={`fas fa-chevron-down text-[8px] muted transition-transform ${advanceOpen ? "rotate-180" : ""}`} />
            </button>
            {advanceOpen && (
              <div className="panel2 rounded-[7px] rounded-t-none px-[12px] py-[10px] text-[10px] text-[var(--text-muted)] space-y-2 border-t-0">
                <label className="flex items-center justify-between">
                  <span>Negative prompt</span>
                  <input
                    type="text"
                    placeholder="..."
                    aria-label="Negative prompt"
                    className="bg-[var(--bg-soft)] rounded px-2 py-1 text-[var(--text-primary)] text-[10px] w-[160px] outline-none"
                  />
                </label>
                <label className="flex items-center justify-between">
                  <span>Seed</span>
                  <input
                    type="text"
                    placeholder="random"
                    aria-label="Seed"
                    className="bg-[var(--bg-soft)] rounded px-2 py-1 text-[var(--text-primary)] text-[10px] w-[160px] outline-none"
                  />
                </label>
              </div>
            )}
          </>
        )}

        {/* ==================== VIDEO MODE ==================== */}
        {mode === "video" && (
          <>
            {/* Effects thumb */}
            <div className="thumb h-[124px] rounded-[15px] relative overflow-hidden">
              <button
                type="button"
                aria-label="Change effect"
                className="absolute right-[7px] top-[8px] bg-[var(--change-btn-bg)] rounded-full px-2 py-1 micro font-bold cursor-pointer hover:bg-[var(--bg-tertiary)] transition-colors"
              >
                <i className="fas fa-pen mr-1" />
                Change
              </button>
              <div className="absolute left-[9px] bottom-[17px] text-[var(--brand-accent)] micro font-extrabold">
                EFFECTS
              </div>
              <div className="absolute left-[9px] bottom-[7px] text-[var(--text-primary)] micro font-extrabold">
                No effect selected.
              </div>
            </div>

            {/* Prompt textarea */}
            <div className="panel2 rounded-[12px] mt-[11px] h-[180px] sm:h-[172px] p-[14px] relative">
              <textarea
                value={videoPrompt}
                onChange={(e) => setVideoPrompt(e.target.value)}
                placeholder="Describe what you want to create..."
                aria-label="Video prompt"
                className="w-full h-full bg-transparent text-[var(--text-primary)] text-[12px] sm:text-[11px] font-bold leading-[15px] sm:leading-[14px] resize-none outline-none placeholder:text-[var(--text-muted)]"
              />
              <button
                type="button"
                onClick={handleGenerate}
                aria-label="Generate video"
                className="absolute right-[11px] bottom-[12px] bg-[var(--brand-accent)] text-[var(--brand-accent-text)] rounded-full h-[32px] sm:h-[27px] px-[16px] sm:px-[13px] text-[11px] sm:text-[10px] font-extrabold cursor-pointer hover:opacity-80 active:scale-95 transition-all"
              >
                <i className="fas fa-magic mr-1" />
                Generate
              </button>
            </div>

            {/* Multi-shot toggle */}
            <div className="panel2 rounded-[9px] mt-[10px] h-[57px] p-[10px] relative">
              <div className="text-[10px] font-extrabold text-[var(--text-accent)]">
                Multi-shot
              </div>
              <div className="micro font-bold text-[var(--text-muted)]">
                Up to 6 shots, max 16s total
              </div>
              <button
                type="button"
                onClick={() => setMultiShot(!multiShot)}
                aria-label={`Multi-shot: ${multiShot ? "on" : "off"}`}
                aria-pressed={multiShot}
                className={`absolute right-[12px] top-[18px] w-[36px] h-[21px] rounded-full cursor-pointer transition-colors ${
                  multiShot ? "bg-[var(--accent-bg)]" : "bg-[var(--multi-shot-off)]"
                }`}
              >
                <div
                  className={`w-[17px] h-[17px] bg-[var(--multi-shot-knob)] rounded-full mt-[2px] transition-transform ${
                    multiShot ? "translate-x-[17px]" : "translate-x-[2px]"
                  }`}
                />
              </button>
            </div>

            {/* Upload image */}
            <input
              ref={videoFileInputRef}
              type="file"
              accept="image/*,video/*"
              onChange={(e) => handleFileUpload(e, "video")}
              className="hidden"
              aria-hidden="true"
            />
            <button
              type="button"
              onClick={() => videoFileInputRef.current?.click()}
              aria-label={videoUpload ? `Uploaded: ${videoUpload.name}` : "Upload image or video"}
              className="panel2 border-dashed rounded-[8px] mt-[10px] h-[73px] flex flex-col items-center justify-center w-full cursor-pointer hover:opacity-80 transition-opacity"
            >
              <i className="fas fa-upload text-[var(--text-muted)]" />
              <div className="micro font-extrabold mt-2">
                {videoUpload ? videoUpload.name : "Upload image"}
              </div>
            </button>

            {/* Resolution chips */}
            <div className="flex gap-1 mt-[8px]">
              {["720p", "1080p", "4K"].map((res) => (
                <button
                  key={res}
                  type="button"
                  onClick={() => setVideoResolution(res)}
                  aria-label={`${res} resolution`}
                  aria-pressed={videoResolution === res}
                  className={`micro px-3 py-1 rounded cursor-pointer transition-colors ${
                    videoResolution === res
                      ? "accent"
                      : "panel2 hover:bg-[var(--bg-tertiary)]"
                  }`}
                >
                  {res}
                </button>
              ))}
              <AspectRatioDropdown value={videoAspect} onChange={setVideoAspect} />
            </div>

            <Select
              text="Model:"
              value={videoModel}
              onChange={setVideoModel}
              options={videoModels}
            />

            {/* Advance toggle */}
            <button
              type="button"
              onClick={() => setVideoAdvanceOpen(!videoAdvanceOpen)}
              aria-expanded={videoAdvanceOpen}
              aria-label="Advanced video settings"
              className={
                "w-full panel2 px-[12px] flex items-center justify-between text-[11px] font-extrabold cursor-pointer mt-[15px] transition-colors " +
                (videoAdvanceOpen
                  ? "h-[39px] rounded-[7px] rounded-b-none border-b-0"
                  : "h-[39px] rounded-[7px]")
              }
            >
              <span>Advance</span>
              <i className={`fas fa-chevron-down text-[8px] muted transition-transform ${videoAdvanceOpen ? "rotate-180" : ""}`} />
            </button>
            {videoAdvanceOpen && (
              <div className="panel2 rounded-[7px] rounded-t-none px-[12px] py-[10px] text-[10px] text-[var(--text-muted)] space-y-2 border-t-0">
                <label className="flex items-center justify-between">
                  <span>Duration</span>
                  <input
                    type="text"
                    placeholder="5s"
                    aria-label="Duration in seconds"
                    className="bg-[var(--bg-soft)] rounded px-2 py-1 text-[var(--text-primary)] text-[10px] w-[160px] outline-none"
                  />
                </label>
                <label className="flex items-center justify-between">
                  <span>FPS</span>
                  <input
                    type="text"
                    placeholder="24"
                    aria-label="Frames per second"
                    className="bg-[var(--bg-soft)] rounded px-2 py-1 text-[var(--text-primary)] text-[10px] w-[160px] outline-none"
                  />
                </label>
              </div>
            )}
          </>
        )}
      </div>
    </aside>
  );
}
