import { createContext, useContext, useState, useCallback, useRef } from "react";

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  const addToast = useCallback((message, type = "success", duration = 3000) => {
    const id = ++idRef.current;
    setToasts((prev) => [...prev, { id, message, type, exiting: false }]);

    setTimeout(() => {
      // mark as exiting to trigger slide-out
      setToasts((prev) =>
        prev.map((t) => (t.id === id ? { ...t, exiting: true } : t))
      );
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 400);
    }, duration);
  }, []);

  const toast = {
    success: (msg, dur) => addToast(msg, "success", dur),
    error: (msg, dur) => addToast(msg, "error", dur),
    info: (msg, dur) => addToast(msg, "info", dur),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toasts} />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
};

/* ── icons ── */
const SuccessIcon = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
    <circle cx="11" cy="11" r="10" stroke="currentColor" strokeWidth="1.8" />
    <path
      d="M6.5 11.2l3.2 3.2 5.8-6.4"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ strokeDasharray: 20, strokeDashoffset: 20, animation: "checkDraw 0.45s ease 0.15s forwards" }}
    />
  </svg>
);

const ErrorIcon = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
    <circle cx="11" cy="11" r="10" stroke="currentColor" strokeWidth="1.8" />
    <path d="M7.5 7.5l7 7M14.5 7.5l-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const InfoIcon = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
    <circle cx="11" cy="11" r="10" stroke="currentColor" strokeWidth="1.8" />
    <path d="M11 10v5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <circle cx="11" cy="7.5" r="1" fill="currentColor" />
  </svg>
);

const ICON_MAP = { success: <SuccessIcon />, error: <ErrorIcon />, info: <InfoIcon /> };

const COLORS = {
  success: { bg: "linear-gradient(135deg,#0a7a4b,#0eb869)", border: "#0a7a4b", glow: "rgba(10,122,75,0.25)" },
  error:   { bg: "linear-gradient(135deg,#b91c1c,#ef4444)", border: "#b91c1c", glow: "rgba(185,28,28,0.25)" },
  info:    { bg: "linear-gradient(135deg,#004369,#0b5c8f)", border: "#004369", glow: "rgba(0,67,105,0.25)" },
};

/* ── container ── */
const ToastContainer = ({ toasts }) => {
  if (!toasts.length) return null;
  return (
    <>
      <style>{`
        @keyframes checkDraw { to { stroke-dashoffset: 0; } }
        @keyframes ms-toast-in {
          from { opacity:0; transform:translateX(-50%) translateY(-24px) scale(0.92); }
          to   { opacity:1; transform:translateX(-50%) translateY(0)      scale(1);    }
        }
        @keyframes ms-toast-out {
          from { opacity:1; transform:translateX(-50%) translateY(0)       scale(1);    }
          to   { opacity:0; transform:translateX(-50%) translateY(-18px) scale(0.94); }
        }
        .ms-toast-stack { position:fixed; top:24px; left:50%; transform:translateX(-50%); z-index:99999; display:flex; flex-direction:column; gap:10px; align-items:center; pointer-events:none; }
        .ms-toast {
          pointer-events:all;
          display:flex; align-items:center; gap:12px;
          padding:13px 22px; border-radius:14px;
          font-size:14.5px; font-weight:600; letter-spacing:0.3px;
          color:#fff; white-space:nowrap;
          box-shadow:0 10px 30px var(--toast-glow,rgba(0,0,0,.2));
          animation:ms-toast-in 0.42s cubic-bezier(0.22,1,0.36,1) forwards;
          border:1px solid rgba(255,255,255,0.18);
          backdrop-filter:blur(4px);
        }
        .ms-toast.exiting { animation:ms-toast-out 0.38s ease forwards; }
        .ms-toast-icon { flex-shrink:0; display:flex; align-items:center; }
        @media(max-width:480px){ .ms-toast{ font-size:13px; padding:11px 16px; border-radius:12px; gap:9px; } }
      `}</style>
      <div className="ms-toast-stack">
        {toasts.map((t) => {
          const c = COLORS[t.type];
          return (
            <div
              key={t.id}
              className={`ms-toast${t.exiting ? " exiting" : ""}`}
              style={{ background: c.bg, "--toast-glow": c.glow }}
            >
              <span className="ms-toast-icon">{ICON_MAP[t.type]}</span>
              <span>{t.message}</span>
            </div>
          );
        })}
      </div>
    </>
  );
};
