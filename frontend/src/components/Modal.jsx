import React from "react";

export default function Modal({title,onClose,children}) {return <div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)onClose();}}><div className="modal-card"><div className="modal-header"><div><div className="eyebrow">AYURDHARA</div><h2>{title}</h2></div><button className="close-button" onClick={onClose}>×</button></div>{children}</div></div>;}
