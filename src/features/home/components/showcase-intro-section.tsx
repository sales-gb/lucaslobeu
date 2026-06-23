"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import ImageBlock from "@/components/ui/image-block";

// ─── SHOWCASE INTRO · scroll-scale + SHOW/CASE split title ───
export function ShowcaseIntroSection({ imageUrl }: { imageUrl?: string }) {
  const isVideo = imageUrl ? /\.mp4$/i.test(imageUrl) : false;
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
    <div ref={trackRef} className="ll-sc-track">
      <div className="ll-sc-sticky">
        {/* Expanding media behind the words */}
        <motion.div
          className="ll-sc-media"
          style={{ scale: videoScale, borderRadius: videoBorderRadius }}
        >
          {isVideo ? (
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
        <div className="ll-sc-words" aria-label="Showcase">
          <motion.span
            className="ll-sc-word"
            style={{ x: showX, opacity: wordOpacity }}
            aria-hidden
          >
            SHOW
          </motion.span>
          <motion.span
            className="ll-sc-word"
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
