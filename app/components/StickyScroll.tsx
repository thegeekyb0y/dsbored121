"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";

interface StickyScrollProps {
  content: {
    title: string;
    description: string;
    content: React.ReactNode;
  }[];
}

export const StickyScroll: React.FC<StickyScrollProps> = ({ content }) => {
  const [activeCard, setActiveCard] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;

      const containerTop = containerRef.current.offsetTop;
      const scrollPosition = window.scrollY + window.innerHeight / 2;

      contentRefs.current.forEach((ref, index) => {
        if (!ref) return;

        const elementTop = ref.offsetTop + containerTop;
        const elementBottom = elementTop + ref.offsetHeight;

        if (scrollPosition >= elementTop && scrollPosition < elementBottom) {
          setActiveCard(index);
        }
      });
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Mobile & Tablet View - Simple stacked layout */}
      <div className="lg:hidden space-y-12 px-4 max-w-3xl mx-auto">
        {content.map((item, index) => (
          <div key={item.title + index} className="space-y-4">
            <h3 className="text-2xl md:text-3xl font-bold text-white">
              {item.title}
            </h3>
            <p className="text-base md:text-lg text-gray-400 leading-relaxed">
              {item.description}
            </p>
            <div className="w-full h-64 md:h-80 rounded-xl overflow-hidden">
              {item.content}
            </div>
          </div>
        ))}
      </div>

      {/* Desktop View - Sticky scroll effect */}
      <div className="hidden lg:grid grid-cols-2 gap-20 max-w-7xl mx-auto px-4">
        {/* Left Side - Scrolling Text Content */}
        <div className="w-full space-y-32">
          {content.map((item, index) => (
            <div
              key={item.title + index}
              ref={(el) => {
                contentRefs.current[index] = el;
              }}
              className="min-h-[80vh] flex items-center"
            >
              <motion.div
                initial={{ opacity: 0.4 }}
                animate={{
                  opacity: activeCard === index ? 1 : 0.4,
                }}
                transition={{ duration: 0.5 }}
                className="text-left"
              >
                <h3 className="text-3xl xl:text-4xl font-bold bg-clip-text text-transparent bg-linear-to-b from-white to-gray-400 mb-6">
                  {item.title}
                </h3>
                <p className="text-md xl:text-lg text-gray-400 leading-relaxed max-w-xl">
                  {item.description}
                </p>
              </motion.div>
            </div>
          ))}
        </div>

        {/* Right Side - Sticky Image Container */}
        <div className="w-full">
          <div className="sticky top-10 h-screen flex items-center justify-center">
            <div className="relative w-full h-[600px] rounded-xl overflow-hidden">
              {content.map((item, index) => (
                <motion.div
                  key={item.title + index}
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: activeCard === index ? 1 : 0,
                  }}
                  transition={{ duration: 0.8, ease: "easeInOut" }}
                  className="absolute inset-0 w-full h-full"
                >
                  {item.content}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
