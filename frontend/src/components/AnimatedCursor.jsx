import { useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

const INTERACTIVE_TARGETS = 'a, button, [role="button"], .project-card';
const NATIVE_CURSOR_TARGETS = 'input, textarea, select, [contenteditable="true"], [role="textbox"]';

export default function AnimatedCursor() {
  const dotX = useMotionValue(-100);
  const dotY = useMotionValue(-100);
  const ringX = useSpring(dotX, { stiffness: 560, damping: 42, mass: 0.42 });
  const ringY = useSpring(dotY, { stiffness: 560, damping: 42, mass: 0.42 });
  const lastTarget = useRef(null);

  useEffect(() => {
    const { body } = document;
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let enabled = false;
    let pointerInside = false;
    let pointerDown = false;
    let hasSelection = false;

    const setClass = (name, value) => body.classList.toggle(name, value);
    const clearCursor = () => {
      body.classList.remove(
        'custom-cursor-active',
        'custom-cursor-visible',
        'custom-cursor-hover',
        'custom-cursor-native',
      );
    };
    const updateCursorState = () => {
      const target = lastTarget.current;
      const nativeCursor = pointerDown
        || hasSelection
        || Boolean(target?.closest(NATIVE_CURSOR_TARGETS));
      const hovered = !nativeCursor && Boolean(target?.closest(INTERACTIVE_TARGETS));

      setClass('custom-cursor-native', nativeCursor);
      setClass('custom-cursor-hover', hovered);
      setClass('custom-cursor-visible', enabled && pointerInside && !nativeCursor);
    };
    const syncPreferences = () => {
      enabled = finePointer.matches && !reducedMotion.matches;
      setClass('custom-cursor-active', enabled && pointerInside);
      if (!enabled) clearCursor();
      else updateCursorState();
    };
    const onPointerMove = (event) => {
      if (event.pointerType !== 'mouse' || !enabled) {
        pointerInside = false;
        clearCursor();
        return;
      }

      pointerInside = true;
      lastTarget.current = event.target instanceof Element ? event.target : null;
      dotX.set(event.clientX);
      dotY.set(event.clientY);
      body.classList.add('custom-cursor-active');
      updateCursorState();
    };
    const onPointerDown = (event) => {
      if (event.pointerType !== 'mouse' || !enabled) return;
      pointerDown = true;
      lastTarget.current = event.target instanceof Element ? event.target : null;
      updateCursorState();
    };
    const onPointerUp = (event) => {
      if (event.pointerType !== 'mouse' || !enabled) return;
      pointerDown = false;
      updateCursorState();
    };
    const onPointerOut = (event) => {
      if (event.pointerType !== 'mouse' || event.relatedTarget !== null) return;
      pointerInside = false;
      updateCursorState();
    };
    const onSelectionChange = () => {
      const selection = window.getSelection();
      hasSelection = Boolean(selection && !selection.isCollapsed && selection.toString());
      if (enabled) updateCursorState();
    };
    const onWindowBlur = () => {
      pointerInside = false;
      pointerDown = false;
      clearCursor();
    };

    syncPreferences();
    document.addEventListener('pointermove', onPointerMove, { passive: true });
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('pointerup', onPointerUp);
    document.addEventListener('pointerout', onPointerOut);
    document.addEventListener('selectionchange', onSelectionChange);
    window.addEventListener('blur', onWindowBlur);
    finePointer.addEventListener('change', syncPreferences);
    reducedMotion.addEventListener('change', syncPreferences);

    return () => {
      document.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('pointerup', onPointerUp);
      document.removeEventListener('pointerout', onPointerOut);
      document.removeEventListener('selectionchange', onSelectionChange);
      window.removeEventListener('blur', onWindowBlur);
      finePointer.removeEventListener('change', syncPreferences);
      reducedMotion.removeEventListener('change', syncPreferences);
      clearCursor();
    };
  }, [dotX, dotY]);

  return (
    <>
      <motion.div aria-hidden="true" className="custom-cursor-position" style={{ x: dotX, y: dotY, pointerEvents: 'none' }}>
        <span className="custom-cursor-dot" />
      </motion.div>
      <motion.div aria-hidden="true" className="custom-cursor-position" style={{ x: ringX, y: ringY, pointerEvents: 'none' }}>
        <span className="custom-cursor-ring" />
      </motion.div>
    </>
  );
}
