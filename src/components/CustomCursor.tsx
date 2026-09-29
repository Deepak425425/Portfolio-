"use client";

import React, { useEffect, useRef, useState } from "react";

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  const [isVisible, setIsVisible] = useState(false);
  
  // Ref for mutable state to avoid re-renders
  const state = useRef({
    mouseX: -100,
    mouseY: -100,
    ringX: -100,
    ringY: -100,
    isHoveringClickable: false,
    isHoveringCard: false,
    isMouseDown: false,
    isHoveringInput: false,
    dragState: "none" as "none" | "grab" | "grabbing",
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
        ringRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) scale(${getScale()})`;
      }
      
      checkHoverState(e.target as HTMLElement);
    };

    const onMouseDown = () => {
      state.current.isMouseDown = true;
      if (state.current.dragState === "grab") state.current.dragState = "grabbing";
      updateRingStyle();
    };

    const onMouseUp = () => {
      state.current.isMouseDown = false;
      if (state.current.dragState === "grabbing") state.current.dragState = "grab";
      updateRingStyle();
    };

    const checkHoverState = (target: HTMLElement) => {
      let isClickable = false;
      let isCard = false;
      let isInput = false;
      let dragState: "none" | "grab" | "grabbing" = "none";

      let curr: HTMLElement | null = target;
      while (curr && curr !== document.body) {
        const tag = curr.tagName.toLowerCase();
        
        // Inputs
        if (tag === "input" || tag === "textarea" || curr.isContentEditable || tag === "select") {
          isInput = true;
        }
        
        // Clickables
        if (tag === "a" || tag === "button" || curr.getAttribute("role") === "button" || curr.onclick) {
          isClickable = true;
        }
        
        // Cards/Tools
        if (curr.classList.contains("group") || curr.classList.contains("tool-card") || tag === "img") {
          isCard = true;
        }

        // Draggable
        const classStr = curr.className;
        const hasDragClass = typeof classStr === 'string' && 
          (classStr.includes("cursor-move") || classStr.includes("cursor-grab") || classStr.includes("drag"));
        
        if (hasDragClass || curr.draggable || curr.getAttribute('data-draggable') === 'true') {
          dragState = state.current.isMouseDown ? "grabbing" : "grab";
        }

        curr = curr.parentElement;
      }

      state.current.isHoveringInput = isInput;
      state.current.isHoveringClickable = isClickable;
      state.current.isHoveringCard = isCard;
      state.current.dragState = dragState;
      
      updateRingStyle();
    };

    const getScale = () => {
      if (state.current.isMouseDown) return 0.8;
      if (state.current.dragState !== "none") return 1.2;
      if (state.current.isHoveringClickable) return 1.5;
      if (state.current.isHoveringCard) return 1.3;
      return 1.0;
    };

    const updateRingStyle = () => {
      if (!ringRef.current || !dotRef.current) return;
      
      // Hide completely over inputs to let native text cursor take over
      if (state.current.isHoveringInput) {
        ringRef.current.style.opacity = "0";
        dotRef.current.style.opacity = "0";
      } else {
        ringRef.current.style.opacity = "1";
        dotRef.current.style.opacity = "1";
      }
      
      // We don't apply scale here if not reducedMotion, because render loop handles it
      if (state.current.reducedMotion) {
        ringRef.current.style.transform = `translate3d(${state.current.ringX}px, ${state.current.ringY}px, 0) scale(${getScale()})`;
      }
      
      // Apply dragging text if needed
      if (state.current.dragState !== "none") {
        ringRef.current.setAttribute("data-text", state.current.dragState.toUpperCase());
        ringRef.current.classList.add("has-text");
      } else {
        ringRef.current.setAttribute("data-text", "");
        ringRef.current.classList.remove("has-text");
      }
    };

    let animationFrameId: number;
    const render = () => {
      if (!state.current.reducedMotion && ringRef.current) {
        // Smooth interpolation
        state.current.ringX += (state.current.mouseX - state.current.ringX) * 0.15;
        state.current.ringY += (state.current.mouseY - state.current.ringY) * 0.15;
        
        ringRef.current.style.transform = `translate3d(${state.current.ringX}px, ${state.current.ringY}px, 0) scale(${getScale()})`;
      }
      animationFrameId = requestAnimationFrame(render);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mouseup", onMouseUp);
    
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
            cursor: none;
          }
          /* Allow inputs to have native cursor */
          input, textarea, select, [contenteditable] {
            cursor: text !important;
          }
          input[type="button"], input[type="submit"], input[type="checkbox"], input[type="radio"], select {
            cursor: pointer !important;
          }
          /* We still want native behavior for inputs, but for dragging we can let our custom cursor handle it */
        }
      `}} />
      <div 
        ref={dotRef}
        className="fixed top-0 left-0 w-1.5 h-1.5 bg-[#8B7CFF] rounded-full pointer-events-none z-[999999]"
        style={{ margin: '-3px 0 0 -3px', willChange: 'transform' }}
      ></div>
      <div 
        ref={ringRef}
        className="fixed top-0 left-0 w-8 h-8 rounded-full pointer-events-none z-[999998] flex items-center justify-center transition-opacity duration-200"
        style={{ margin: '-16px 0 0 -16px', willChange: 'transform', border: '1px solid rgba(139, 124, 255, 0.6)' }}
      >
        <style dangerouslySetInnerHTML={{ __html: `
          .has-text::after {
            content: attr(data-text);
            position: absolute;
            font-size: 7px;
            font-weight: 800;
            letter-spacing: 0.1em;
            color: #8B7CFF;
            text-transform: uppercase;
          }
        `}} />
      </div>
    </>
  );
}
