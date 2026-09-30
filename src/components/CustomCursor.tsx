"use client";

import React, { useEffect, useRef, useState } from "react";

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  const [isVisible, setIsVisible] = useState(false);
  
  // Ref for mutable state to avoid re-renders
  const state = useRef({
    mouseX: -100,
    mouseY: -100,
    ringX: -100,
    ringY: -100,
    isHoveringClickable: false,
    isHoveringImage: false,
    isHoveringProject: false,
    isHoveringCTA: false,
    isMouseDown: false,
    isHoveringInput: false,
    reducedMotion: false,
    hasPointer: true
  });

  useEffect(() => {
    // Check pointer capabilities and reduced motion
    const hasPointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    
    state.current.hasPointer = hasPointer;
    state.current.reducedMotion = reducedMotion;

    if (!hasPointer) return;

    setIsVisible(true);

    const onMouseMove = (e: MouseEvent) => {
      state.current.mouseX = e.clientX;
      state.current.mouseY = e.clientY;

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      }

      // If reduced motion, ring follows instantly
      if (state.current.reducedMotion && ringRef.current) {
        state.current.ringX = e.clientX;
        state.current.ringY = e.clientY;
        updateRingTransform();
      }
      
      checkHoverState(e.target as HTMLElement);
    };

    const onMouseDown = () => {
      state.current.isMouseDown = true;
      updateRingStyle();
    };

    const onMouseUp = () => {
      state.current.isMouseDown = false;
      updateRingStyle();
    };

    const checkHoverState = (target: HTMLElement) => {
      let isClickable = false;
      let isImage = false;
      let isProject = false;
      let isCTA = false;
      let isInput = false;

      let curr: HTMLElement | null = target;
      while (curr && curr !== document.body) {
        const tag = curr.tagName.toLowerCase();
        
        if (tag === "input" || tag === "textarea" || curr.isContentEditable || tag === "select") {
          isInput = true;
        }
        
        if (tag === "a" || tag === "button" || curr.getAttribute("role") === "button" || curr.onclick) {
          isClickable = true;
          // Check if it's a major CTA
          const text = curr.textContent?.toLowerCase() || "";
          if (text.includes("start") || text.includes("open") || text.includes("view") || curr.classList.contains("cta")) {
             isCTA = true;
          }
        }
        
        if (tag === "img" || curr.getAttribute("data-cursor") === "view") {
          isImage = true;
        }

        if (curr.closest("article") || curr.classList.contains("project-card")) {
          isProject = true;
        }

        curr = curr.parentElement;
      }

      state.current.isHoveringInput = isInput;
      state.current.isHoveringClickable = isClickable;
      state.current.isHoveringImage = isImage;
      state.current.isHoveringProject = isProject;
      state.current.isHoveringCTA = isCTA;
      
      updateRingStyle();
    };

    const updateRingStyle = () => {
      if (!ringRef.current || !dotRef.current || !textRef.current) return;
      
      // Hide completely over inputs to let native text cursor take over
      if (state.current.isHoveringInput) {
        ringRef.current.style.opacity = "0";
        dotRef.current.style.opacity = "0";
        return;
      } else {
        dotRef.current.style.opacity = "1";
        ringRef.current.style.opacity = "1";
      }
      
      let mode = "default";
      let text = "";
      
      if (state.current.isHoveringImage || state.current.isHoveringProject) {
         mode = "pill";
         text = "VIEW";
      } else if (state.current.isHoveringCTA) {
         mode = "expanded";
         text = "START";
      } else if (state.current.isHoveringClickable) {
         mode = "expanded";
      }

      if (state.current.isMouseDown) {
         mode = "mousedown";
      }

      // Apply styling based on mode
      if (mode === "pill") {
         ringRef.current.style.width = "64px";
         ringRef.current.style.height = "26px";
         ringRef.current.style.borderRadius = "20px";
         ringRef.current.style.backgroundColor = "#11110f";
         ringRef.current.style.border = "none";
         ringRef.current.style.marginLeft = "-32px";
         ringRef.current.style.marginTop = "-13px";
         dotRef.current.style.opacity = "0"; // hide dot inside pill
         textRef.current.textContent = text;
         textRef.current.style.opacity = "1";
         textRef.current.style.color = "#ffffff";
      } else if (mode === "expanded") {
         ringRef.current.style.width = "48px";
         ringRef.current.style.height = "48px";
         ringRef.current.style.borderRadius = "50%";
         ringRef.current.style.backgroundColor = "transparent";
         ringRef.current.style.border = "1px solid rgba(17, 17, 15, 0.4)";
         ringRef.current.style.marginLeft = "-24px";
         ringRef.current.style.marginTop = "-24px";
         dotRef.current.style.opacity = "1";
         if (text) {
           textRef.current.textContent = text;
           textRef.current.style.opacity = "1";
           textRef.current.style.color = "#11110f";
           dotRef.current.style.opacity = "0";
           ringRef.current.style.backgroundColor = "#c4ff38"; // Lime accent for CTA
           ringRef.current.style.border = "none";
         } else {
           textRef.current.textContent = "";
           textRef.current.style.opacity = "0";
         }
      } else if (mode === "mousedown") {
         ringRef.current.style.width = "20px";
         ringRef.current.style.height = "20px";
         ringRef.current.style.marginLeft = "-10px";
         ringRef.current.style.marginTop = "-10px";
      } else {
         // Default
         ringRef.current.style.width = "32px";
         ringRef.current.style.height = "32px";
         ringRef.current.style.borderRadius = "50%";
         ringRef.current.style.backgroundColor = "transparent";
         ringRef.current.style.border = "1px solid rgba(17, 17, 15, 0.2)";
         ringRef.current.style.marginLeft = "-16px";
         ringRef.current.style.marginTop = "-16px";
         dotRef.current.style.opacity = "1";
         textRef.current.textContent = "";
         textRef.current.style.opacity = "0";
      }
    };

    const updateRingTransform = () => {
      if (ringRef.current) {
         ringRef.current.style.transform = `translate3d(${state.current.ringX}px, ${state.current.ringY}px, 0)`;
      }
    };

    let animationFrameId: number;
    const render = () => {
      if (!state.current.reducedMotion && ringRef.current) {
        // Smooth interpolation
        state.current.ringX += (state.current.mouseX - state.current.ringX) * 0.15;
        state.current.ringY += (state.current.mouseY - state.current.ringY) * 0.15;
        updateRingTransform();
      }
      animationFrameId = requestAnimationFrame(render);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mouseup", onMouseUp);
    
    // Initial style update
    updateRingStyle();

    if (!reducedMotion) {
      animationFrameId = requestAnimationFrame(render);
    }

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @media (hover: hover) and (pointer: fine) {
          body * {
            cursor: none !important;
          }
          /* Allow inputs to have native cursor */
          input, textarea, select, [contenteditable] {
            cursor: text !important;
          }
          /* Remove pointer styles from buttons to let our cursor handle it */
          a, button, [role="button"], input[type="button"], input[type="submit"], input[type="checkbox"], input[type="radio"] {
            cursor: none !important;
          }
        }
      `}} />
      <div 
        ref={dotRef}
        className="fixed top-0 left-0 w-1.5 h-1.5 bg-[#11110f] rounded-full pointer-events-none z-[999999] transition-opacity duration-200"
        style={{ margin: '-3px 0 0 -3px', willChange: 'transform' }}
      ></div>
      <div 
        ref={ringRef}
        className="fixed top-0 left-0 pointer-events-none z-[999998] flex items-center justify-center transition-all duration-300 ease-out"
        style={{ willChange: 'transform, width, height, background-color, border-radius' }}
      >
         <div 
            ref={textRef} 
            className="font-mono text-[9px] font-bold tracking-widest uppercase transition-opacity duration-200"
            style={{ opacity: 0 }}
         ></div>
      </div>
    </>
  );
}
