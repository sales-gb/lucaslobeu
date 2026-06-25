"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import ImageBlock from "@/components/ui/image-block";
import { VideoEmbed, isVideoEmbedUrl } from "@/components/ui/video-embed";

// ─── SHOWCASE INTRO · scroll-scale + SHOW/CASE split title ───
export function ShowcaseIntroSection({ imageUrl }: { imageUrl?: string }) {
  const isEmbed = isVideoEmbedUrl(imageUrl);
  const isVideo = !isEmbed && imageUrl ? /\.mp4$/i.test(imageUrl) : false;
  const trackRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"],
  });

  // Video: grows from a small centered box to full-screen
  const videoScale = useTransform(scrollYProgress, [0, 0.82], [0.15, 1]);
  const videoBorderRadius = useTransform(scrollYProgress, [0, 0.7], [10, 0]);

  // SHOW: comes from left → natural left position (no crossing)
  const showX = useTransform(scrollYProgress, [0.06, 0.88], ["-120vw", "0vw"]);
  // CASE: comes from right → natural right position (no crossing)
  const caseX = useTransform(scrollYProgress, [0.06, 0.88], ["120vw", "0vw"]);
  // Words fade in early
  const wordOpacity = useTransform(scrollYProgress, [0.04, 0.18], [0, 1]);

  return (
    <div ref={trackRef} className="relative h-[250vh] bg-ink">
      <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden bg-ink">
        {/* Expanding media behind the words */}
        <motion.div
          className="absolute inset-0 origin-center will-change-transform [&>*]:!h-full [&>*]:!w-full [&>*]:block"
          style={{ scale: videoScale, borderRadius: videoBorderRadius }}
        >
          {isEmbed ? (
            <VideoEmbed url={imageUrl!} title="Showcase" background />
          ) : isVideo ? (
            <video
              autoPlay
              muted
              loop
              playsInline
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
            >
              <source src={imageUrl} type="video/mp4" />
            </video>
          ) : (
            <ImageBlock
              tone="dark"
              ratio="16/9"
              style={{ height: "100%" }}
              src={imageUrl || undefined}
            />
          )}
        </motion.div>

        {/* SHOW   CASE split title */}
        <div
          className="pointer-events-none absolute z-[2] flex w-full select-none items-center justify-center gap-[0.06em]"
          aria-label="Showcase"
        >
          <motion.span
            className="font-serif font-light italic text-[clamp(80px,16vw,240px)] uppercase leading-none tracking-[-0.025em] text-paper [mix-blend-mode:difference] will-change-transform"
            style={{ x: showX, opacity: wordOpacity }}
            aria-hidden
          >
            SHOW
          </motion.span>
          <motion.span
            className="font-serif font-light italic text-[clamp(80px,16vw,240px)] uppercase leading-none tracking-[-0.025em] text-paper [mix-blend-mode:difference] will-change-transform"
            style={{ x: caseX, opacity: wordOpacity }}
            aria-hidden
          >
            CASE
          </motion.span>
        </div>

        {/* crosshair corners */}
        <span className="ll-crosshair ll-crosshair--tl" aria-hidden />
        <span className="ll-crosshair ll-crosshair--tr" aria-hidden />
        <span className="ll-crosshair ll-crosshair--bl" aria-hidden />
        <span className="ll-crosshair ll-crosshair--br" aria-hidden />
      </div>
    </div>
  );
}
