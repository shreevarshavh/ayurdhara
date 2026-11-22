import React from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

export default function Modal({ title, onClose, children }) {
  return createPortal(
    <div
      className="fixed inset-0 z-[9999] grid place-items-center bg-[#14291dcc] p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="w-full max-w-[480px] max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"
      >
        <div className="mb-5 flex items-center justify-between border-b border-gray-200 pb-4">
          <div>
            <div className="mb-1 text-xs font-bold tracking-widest text-green-700">
              AYURDHARA
            </div>

            <h2 id="modal-title" className="text-xl font-bold text-gray-900">
              {title}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="grid h-9 w-9 place-items-center rounded-lg bg-gray-100 hover:bg-gray-200"
          >
            <X size={18} />
          </button>
        </div>

        {children}
      </div>
    </div>,
    document.body
  );
}