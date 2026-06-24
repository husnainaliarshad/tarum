"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4 w-full">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse rounded-xl bg-[#272421] border border-[#3b3633] overflow-hidden"
        >
          <div className="aspect-square bg-[#3a3735] rounded-t-xl" />
          <div className="p-3 space-y-2">
            <div className="h-3 bg-[#3a3735] rounded w-3/4" />
            <div className="h-2 bg-[#3a3735] rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTemplates() {
      try {
        const res = await fetch("/api/templates");
        const data = await res.json();
        setTemplates(data.templates || []);
      } catch (err) {
        console.error("Failed to fetch templates:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchTemplates();
  }, []);

  return (
    <div className="flex-1 flex flex-col items-center justify-start pt-[50px] lg:pt-[92px] w-full px-4 overflow-y-auto scrollbar-none">
      <h1 className="text-[28px] sm:text-[31px] font-extrabold text-center">
        Let's Start <span className="text-[#c9785f]">Creating</span>
      </h1>
      
      {/* Featured Images Horizontal scrolling list in mobile, Grid on desktop */}
      <div className="mt-8 w-full max-w-[900px] pb-32 lg:pb-8">
        {loading ? (
          <div className="text-center text-[12px] text-stone-500 font-extrabold py-10">
            Loading templates...
          </div>
        ) : templates.length > 0 ? (
          <div className="flex gap-[16px] overflow-x-auto scrollbar-none py-2 px-1 snap-x snap-mandatory lg:grid lg:grid-cols-3 lg:overflow-x-visible lg:snap-none">
            {templates.map((temp) => (
              <div
                key={temp.id}
                className="w-[220px] sm:w-[260px] lg:w-full shrink-0 aspect-[4/5] relative rounded-[15px] overflow-hidden border border-[#3b3633] snap-start hover:border-[#D9774B]/40 transition-all duration-300 group cursor-pointer"
              >
                <Image
                  src={temp.image_url}
                  alt={temp.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 1024px) 260px, 300px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                  <span className="text-[11px] text-white font-extrabold">{temp.title}</span>
                  <span className="text-[8px] text-stone-300 mt-1 line-clamp-2 leading-[10px] font-semibold">{temp.prompt}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-[12px] text-stone-500 font-extrabold py-10">
            No templates available
          </div>
        )}
      </div>
    </div>
  );
}

function ErrorState({ message }) {
  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="text-red-400 text-[14px] font-bold mb-2">Generation Failed</div>
        <div className="text-[#8f8d88] text-[12px]">{message}</div>
      </div>
    </div>
  );
}

export default function GeneratedContent({ results, loading, error }) {
  if (loading) return <SkeletonGrid />;
  if (error) return <ErrorState message={error} />;
  if (!results || results.length === 0) return <EmptyState />;

  return (
    <div className="flex-1 overflow-y-auto p-4 pb-36 lg:pb-4 w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 auto-rows-max">
        {results.map((item, index) => (
          <div
            key={item.id}
            className="group rounded-xl bg-[#272421] border border-[#3b3633] overflow-hidden hover:border-[#D9774B]/40 transition-all duration-300 animate-fadeIn"
            style={{ animationDelay: `${index * 80}ms` }}
          >
            <div className="relative aspect-square bg-[#1e1c1b] overflow-hidden">
              <Image
                src={item.url}
                alt={item.prompt || `Generated ${item.type} ${index + 1}`}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
            </div>
            <div className="p-3">
              <p className="text-[11px] text-[#c0d8d1] font-bold truncate">
                {item.prompt || "Untitled"}
              </p>
              <div className="flex items-center justify-between mt-1">
                <span className="text-[8px] text-[#8f8d88] font-semibold uppercase">
                  {item.type} · {item.aspectRatio}
                </span>
                <span className="text-[8px] text-[#8f8d88]">
                  {new Date(item.createdAt).toLocaleTimeString()}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
