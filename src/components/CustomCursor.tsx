"use client";

import React, { useEffect, useRef, useState } from "react";

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hasMoved, setHasMoved] = useState(false);

  const state = useRef({
    mouseX: 0,
    mouseY: 0,
    cursorX: 0,
    cursorY: 0,
    isHoveringBig: false,
    reducedMotion: false,
    hasPointer: true,
    hasMoved: false
  });

  useEffect(() => {
    const hasPointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    
    state.current.hasPointer = hasPointer;
    state.current.reducedMotion = reducedMotion;

    if (!hasPointer) return;
    setIsVisible(true);

    const onMouseMove = (e: MouseEvent) => {
      if (!state.current.hasMoved) {
        state.current.hasMoved = true;
        state.current.cursorX = e.clientX;
        state.current.cursorY = e.clientY;
        setHasMoved(true);
      }
      
      state.current.mouseX = e.clientX;
      state.current.mouseY = e.clientY;

      if (state.current.reducedMotion && cursorRef.current) {
        state.current.cursorX = e.clientX;
        state.current.cursorY = e.clientY;
        cursorRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%)`;
      }
      
      checkHoverState(e.target as HTMLElement);
    };

    const checkHoverState = (target: HTMLElement) => {
      let isBig = false;
      let curr: HTMLElement | null = target;
      
      while (curr && curr !== document.body) {
        const tag = curr.tagName.toLowerCase();
        
        // Add .big on mouseenter for: a, button, .cap-card, .project
        if (
          tag === "a" || 
          tag === "button" || 
          curr.classList.contains("cap-card") || 
          curr.classList.contains("project")
        ) {
          isBig = true;
          break;
        }
        curr = curr.parentElement;
      }

      state.current.isHoveringBig = isBig;
      
      if (cursorRef.current) {
        if (isBig) {
          cursorRef.current.classList.add("big");
        } else {
          cursorRef.current.classList.remove("big");
        }
      }
    };

    let animationFrameId: number;
    const render = () => {
      if (!state.current.reducedMotion && cursorRef.current && state.current.hasMoved) {
        state.current.cursorX += (state.current.mouseX - state.current.cursorX) * 0.15;
        state.current.cursorY += (state.current.mouseY - state.current.cursorY) * 0.15;
        
        cursorRef.current.style.transform = `translate3d(${state.current.cursorX}px, ${state.current.cursorY}px, 0) translate(-50%, -50%)`;
      }
      animationFrameId = requestAnimationFrame(render);
    };

    window.addEventListener("mousemove", onMouseMove);
    
    if (!reducedMotion) {
      animationFrameId = requestAnimationFrame(render);
    }

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
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
        }
        
        .custom-cursor {
          position: fixed;
          top: 0;
          left: 0;
          z-index: 9999;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #fff;
          pointer-events: none;
          mix-blend-mode: difference;
          transform: translate(-50%, -50%);
          transition:
            width .3s cubic-bezier(.22,1,.36,1),
            height .3s cubic-bezier(.22,1,.36,1);
          will-change: transform, width, height, background;
        }

        .custom-cursor.big {
          width: 65px;
          height: 65px;
          background: rgba(124, 58, 237, 0.35);
          mix-blend-mode: normal;
        }
      `}} />
      <div 
        ref={cursorRef}
        className="custom-cursor"
        style={{ opacity: hasMoved ? 1 : 0 }}
      ></div>
    </>
  );
}
