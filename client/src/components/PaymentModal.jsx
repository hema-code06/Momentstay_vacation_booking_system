import { useEffect, useState } from "react";
import "../styles/PaymentModal.scss";

const METHODS = [
    { id: "UPI", label: "UPI", hint: "Pay with any UPI app" },
    { id: "Card", label: "Credit or debit card", hint: "Demo only, no card details needed" },
    { id: "Net Banking", label: "Net banking", hint: "Pay from your bank account" },
    { id: "Pay at Property", label: "Pay at property", hint: "Pay the host when you arrive" },
];

const money = (value) => `${value < 0 ? "-" : ""}₹${Math.abs(value).toLocaleString("en-IN")}`;

const PaymentModal = ({ summary, heading = "Confirm and pay", onClose, onPay }) => {
    const [method, setMethod] = useState("UPI");
    const [processing, setProcessing] = useState(false);

    const payNow = method !== "Pay at Property";
    const total = summary.total.toLocaleString("en-IN");
    const lines = summary.lines || [
        { label: `₹${summary.price.toLocaleString("en-IN")} x ${summary.nights} nights`, value: summary.total },
    ];

    useEffect(() => {
        const handleKey = (e) => {
            if (e.key === "Escape" && !processing) onClose();
        };
        document.body.style.overflow = "hidden";
        window.addEventListener("keydown", handleKey);

        return () => {
            document.body.style.overflow = "";
            window.removeEventListener("keydown", handleKey);
        };
    }, [processing, onClose]);

    const handlePay = async () => {
        setProcessing(true);
        if (payNow) await new Promise((resolve) => setTimeout(resolve, 1500));
        const success = await onPay(method);
        if (!success) setProcessing(false);
    };

    return (
        <div className="payment-overlay" onClick={() => !processing && onClose()}>
            <div
                className="payment-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="payment-title"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 id="payment-title">{heading}</h2>
                <p className="payment-demo">
                    This is a demo payment. No real money is charged and no card details are collected.
                </p>

                <div className="payment-summary">
                    <h3>{summary.title}</h3>
                    <p>{summary.dates}</p>
                    {lines.map((line) => (
                        <div className="payment-row" key={line.label}>
                            <span>{line.label}</span>
                            <span>{money(line.value)}</span>
                        </div>
                    ))}
                    <div className="payment-row payment-total">
                        <span>{summary.totalLabel || "Total"}</span>
                        <strong>₹{total}</strong>
                    </div>
                </div>

                <div className="payment-methods" role="radiogroup" aria-label="Payment method">
                    {METHODS.map(({ id, label, hint }) => (
                        <button
                            key={id}
                            type="button"
                            role="radio"
                            aria-checked={method === id}
                            disabled={processing}
                            className={`payment-method ${method === id ? "selected" : ""}`}
                            onClick={() => setMethod(id)}
                        >
                            <span className="payment-radio" />
                            <span className="payment-method-text">
                                <strong>{label}</strong>
                                <small>{hint}</small>
                            </span>
                        </button>
                    ))}
                </div>

                <div className="payment-actions">
                    <button type="button" className="payment-cancel" disabled={processing} onClick={onClose}>
                        Cancel
                    </button>
                    <button type="button" className="payment-pay" disabled={processing} onClick={handlePay}>
                        {processing ? (
                            <>
                                <span className="payment-spinner" />
                                Processing
                            </>
                        ) : payNow ? (
                            `Pay ₹${total}`
                        ) : (
                            "Confirm booking"
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentModal;
