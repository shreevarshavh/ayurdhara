import React from "react";

export default function Modal({ title, onClose, children }) {
  return (
    <div
      className="fixed inset-0 bg-[#14291dcc] z-30 grid place-items-center p-[18px] overflow-y-auto"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-[min(480px,100%)] bg-white rounded-[16px] p-[23px] max-[600px]:p-[17px] shadow-[0_24px_80px_#07190f55] max-h-[calc(100vh-36px)] overflow-y-auto">
        <div className="flex justify-between items-start border-b border-[#edf0eb] pb-[16px] mb-[14px]">
          <div>
            <div className="text-[10px] font-extrabold tracking-[0.15em] text-[#77917f] mb-[8px]">
              AYURDHARA
            </div>
            <h2 className="font-['Manrope',sans-serif] tracking-[-0.035em] text-[21px] max-[600px]:text-[18px] m-0 font-bold">
              {title}
            </h2>
          </div>
          <button
            className="w-[30px] h-[30px] border-0 bg-[#f0f4ee] rounded-[8px] text-[21px] text-[#6f7d70] cursor-pointer grid place-items-center leading-none"
            onClick={onClose}
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
