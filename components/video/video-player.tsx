"use client";

export function VideoPlayer({ src }: { src: string }) {
  return (
    <div className="overflow-hidden rounded-2xl bg-black aspect-[4/3]">
      <video src={src} controls playsInline className="h-full w-full object-cover" />
    </div>
  );
}
