import React, { useEffect, useId, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import '../index.css';

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

const Modal = ({ isOpen, onClose, title, children }) => {
  const titleId = useId();
  const contentRef = useRef(null);
  const previouslyFocusedRef = useRef(null);

  // Move focus into the dialog when it opens, and return it to whatever
  // triggered the modal (e.g. the settings/history icon button) when it
  // closes, instead of leaving keyboard focus stranded on a removed node.
  useEffect(() => {
    if (isOpen) {
      previouslyFocusedRef.current = document.activeElement;
      const firstFocusable = contentRef.current?.querySelector(FOCUSABLE_SELECTOR);
      (firstFocusable || contentRef.current)?.focus();
    } else if (previouslyFocusedRef.current instanceof HTMLElement) {
      previouslyFocusedRef.current.focus();
      previouslyFocusedRef.current = null;
    }
  }, [isOpen]);

  // Escape closes the modal, and Tab/Shift+Tab are trapped inside it so
  // keyboard users can't tab out into the (hidden) page behind the overlay.
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.stopPropagation();
      onClose();
      return;
    }
    if (e.key !== 'Tab' || !contentRef.current) return;

    const focusable = Array.from(contentRef.current.querySelectorAll(FOCUSABLE_SELECTOR));
    if (focusable.length === 0) {
      e.preventDefault();
      return;
    }
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="modal-overlay"
          onClick={onClose}
          onKeyDown={handleKeyDown}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="modal-content glass-panel"
            onClick={e => e.stopPropagation()}
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            transition={{ type: "spring", bounce: 0.4, duration: 0.4 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            ref={contentRef}
            tabIndex={-1}
          >
            <header className="modal-header">
              <h2 id={titleId} style={{ fontSize: '1.25rem' }}>{title}</h2>
              <button className="icon-button" onClick={onClose} aria-label="Cerrar">
                <X size={20} />
              </button>
            </header>
            <div className="modal-body">
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
