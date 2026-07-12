import { useEffect, useRef, useState } from 'react';

export default function ConfirmButton({ label, confirmLabel, onConfirm, className = 'btn', disabled, skipConfirm = false }) {
  const [arming, setArming] = useState(false);
  const timer = useRef();
  useEffect(() => () => clearTimeout(timer.current), []);

  function click() {
    if (skipConfirm || arming) {
      clearTimeout(timer.current);
      setArming(false);
      onConfirm();
    } else {
      setArming(true);
      timer.current = setTimeout(() => setArming(false), 5000);
    }
  }

  return (
    <>
      <button className={`${className}${arming ? ' danger' : ''}`} disabled={disabled} onClick={click}>
        {arming ? confirmLabel : label}
      </button>
      {arming && (
        <button className="btn ghost" onClick={() => { clearTimeout(timer.current); setArming(false); }}>
          Cancel
        </button>
      )}
    </>
  );
}
