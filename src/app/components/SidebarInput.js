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
        className={`flex items-center gap-[6px] px-[10px] h-[25px] rounded-[7px] bg-[#262220] border transition-colors duration-200 ${
          isOpen ? "border-[#D9774B]" : "border-stone-700 hover:border-stone-600"
        }`}
      >
        {selected.id === "auto" ? (
          <div className="w-5 h-5 border-2 border-dashed border-stone-400 rounded-sm flex items-center justify-center text-[8px] font-bold text-stone-400">
            A
          </div>
        ) : (
          <div className={`border border-stone-400 rounded-sm ${selected.boxClass}`} />
        )}
        <span className="font-bold text-[11px] text-stone-200">{selected.label}</span>
        <i className={`fas fa-chevron-down text-[7px] text-stone-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Popover Menu */}
      {isOpen && (
        <div className="absolute bottom-full left-0 mb-2 w-56 bg-[#262220] border border-stone-800 rounded-xl p-3 shadow-2xl z-50">
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
                  className="flex flex-col items-center gap-1 group w-full py-1 rounded-lg hover:bg-stone-800/30 transition-all"
                >
                  <div className="h-8 flex items-center justify-center w-full">
                    {ratio.id === "auto" ? (
                      <div
                        className={`w-5 h-5 border-2 border-dashed rounded flex items-center justify-center text-[9px] font-bold transition-all ${
                          isSelected
                            ? "border-[#D9774B] text-[#D9774B] bg-[#D9774B]/10 shadow-[0_0_6px_rgba(217,119,75,0.2)]"
                            : "border-stone-600 text-stone-400 group-hover:border-stone-400"
                        }`}
                      >
                        A
                      </div>
                    ) : (
                      <div
                        className={`border rounded transition-all ${
                          isSelected
                            ? "border-[#D9774B] bg-[#D9774B]/10 shadow-[0_0_6px_rgba(217,119,75,0.2)]"
                            : "border-stone-600 group-hover:border-stone-400"
                        } ${ratio.boxClass}`}
                      />
                    )}
                  </div>
                  <span
                    className={`text-[9px] font-semibold ${
                      isSelected ? "text-[#D9774B]" : "text-stone-400 group-hover:text-stone-200"
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
    <aside className="w-full lg:w-[305px] lg:panel lg:rounded-[22px] px-3 lg:px-[18px] pt-3 lg:pt-[17px] lg:bg-[var(--bg-secondary)] lg:border lg:border-[var(--border-primary)] shrink-0 flex flex-col h-full" aria-label="Generation controls">
      {/* Mode toggle: Image / Video */}
      <div className="h-[31px] bg-[#282522] rounded-full p-[3px] flex text-[10px] font-bold shrink-0" role="tablist" aria-label="Generation mode">
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
            <div className="panel2 rounded-[18px] h-[178px] p-[16px] relative">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe you imaginations to be converted to piece of art ...."
                aria-label="Image prompt"
                className="w-full h-full bg-transparent text-[#898681] text-[12px] font-bold leading-[15px] resize-none outline-none placeholder:text-[#898681]"
              />
              <button
                type="button"
                onClick={handleGenerate}
                aria-label="Generate image"
                className="absolute right-[12px] bottom-[12px] bg-[#8b9094] text-[#474747] rounded-full h-[38px] px-[18px] text-[12px] font-extrabold cursor-pointer hover:bg-[#9ba0a4] transition-colors"
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
              className="panel2 rounded-[16px] mt-[17px] h-[118px] flex flex-col items-center justify-center w-full cursor-pointer hover:opacity-80 transition-opacity"
            >
              <i className="fas fa-upload text-[#9d9993] text-[22px]" />
              <div className="text-[10px] font-extrabold mt-[12px] text-[#c0d8d1]">
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
                      imageCount === num ? "accent" : "hover:bg-[#3a3735]"
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
              <div className="panel2 rounded-[7px] rounded-t-none px-[12px] py-[10px] text-[10px] text-[#8f8d88] space-y-2 border-t-0">
                <label className="flex items-center justify-between">
                  <span>Negative prompt</span>
                  <input
                    type="text"
                    placeholder="..."
                    aria-label="Negative prompt"
                    className="bg-[#242321] rounded px-2 py-1 text-white text-[10px] w-[160px] outline-none"
                  />
                </label>
                <label className="flex items-center justify-between">
                  <span>Seed</span>
                  <input
                    type="text"
                    placeholder="random"
                    aria-label="Seed"
                    className="bg-[#242321] rounded px-2 py-1 text-white text-[10px] w-[160px] outline-none"
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
                className="absolute right-[7px] top-[8px] bg-[#31302e] rounded-full px-2 py-1 micro font-bold cursor-pointer hover:bg-[#3d3b39] transition-colors"
              >
                <i className="fas fa-pen mr-1" />
                Change
              </button>
              <div className="absolute left-[9px] bottom-[17px] text-[#c87759] micro font-extrabold">
                EFFECTS
              </div>
              <div className="absolute left-[9px] bottom-[7px] text-white micro font-extrabold">
                No effect selected.
              </div>
            </div>

            {/* Prompt textarea */}
            <div className="panel2 rounded-[12px] mt-[11px] h-[172px] p-[14px] relative">
              <textarea
                value={videoPrompt}
                onChange={(e) => setVideoPrompt(e.target.value)}
                placeholder="Describe you imaginations to be converted to piece of art ...."
                aria-label="Video prompt"
                className="w-full h-full bg-transparent text-[#898681] text-[11px] font-bold leading-[14px] resize-none outline-none placeholder:text-[#898681]"
              />
              <button
                type="button"
                onClick={handleGenerate}
                aria-label="Generate video"
                className="absolute right-[11px] bottom-[12px] bg-[#c67458] text-[#442820] rounded-full h-[27px] px-[13px] text-[10px] font-extrabold cursor-pointer hover:bg-[#d47f63] transition-colors"
              >
                <i className="fas fa-magic mr-1" />
                Generate
              </button>
            </div>

            {/* Multi-shot toggle */}
            <div className="panel2 rounded-[9px] mt-[10px] h-[57px] p-[10px] relative">
              <div className="text-[10px] font-extrabold text-[#c0d8d1]">
                Multi-shot
              </div>
              <div className="micro font-bold text-[#aaa6a0]">
                Up to 6 shots, max 16s total
              </div>
              <button
                type="button"
                onClick={() => setMultiShot(!multiShot)}
                aria-label={`Multi-shot: ${multiShot ? "on" : "off"}`}
                aria-pressed={multiShot}
                className={`absolute right-[12px] top-[18px] w-[36px] h-[21px] rounded-full cursor-pointer transition-colors ${
                  multiShot ? "bg-[#7b4a38]" : "bg-[#3b3937]"
                }`}
              >
                <div
                  className={`w-[17px] h-[17px] bg-[#302e2c] rounded-full mt-[2px] transition-transform ${
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
              <i className="fas fa-upload text-[#9d9993]" />
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
                      : "panel2 hover:bg-[#3a3735]"
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
              <div className="panel2 rounded-[7px] rounded-t-none px-[12px] py-[10px] text-[10px] text-[#8f8d88] space-y-2 border-t-0">
                <label className="flex items-center justify-between">
                  <span>Duration</span>
                  <input
                    type="text"
                    placeholder="5s"
                    aria-label="Duration in seconds"
                    className="bg-[#242321] rounded px-2 py-1 text-white text-[10px] w-[160px] outline-none"
                  />
                </label>
                <label className="flex items-center justify-between">
                  <span>FPS</span>
                  <input
                    type="text"
                    placeholder="24"
                    aria-label="Frames per second"
                    className="bg-[#242321] rounded px-2 py-1 text-white text-[10px] w-[160px] outline-none"
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
