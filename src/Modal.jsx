import { useEffect, useRef } from 'react';

const FOCUSABLE = 'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

export function Modal({ wrapperClassName, backdropClassName, contentClassName, titleId, onClose, children }) {
  const contentRef = useRef(null);

  useEffect(() => {
    const previouslyFocused = document.activeElement;
    const content = contentRef.current;
    const focusable = content ? Array.from(content.querySelectorAll(FOCUSABLE)) : [];
    focusable[0]?.focus();

    function onKeyDown(e) {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key !== 'Tab' || focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus();
    };
  }, [onClose]);

  return (
    <div className={wrapperClassName}>
      <div className={backdropClassName} onClick={onClose} />
      <div className={contentClassName} role="dialog" aria-modal="true" aria-labelledby={titleId} ref={contentRef}>
        {children}
      </div>
    </div>
  );
}
