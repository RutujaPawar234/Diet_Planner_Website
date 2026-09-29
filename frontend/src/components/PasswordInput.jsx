import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export default function PasswordInput({ invalid, ...props }) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="input-wrap">
      <input {...props} type={visible ? 'text' : 'password'} className={`input ${invalid ? 'invalid' : ''}`} />
      <button
        type="button"
        className="icon-btn input-icon-btn"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? 'Hide password' : 'Show password'}
      >
        {visible ? <EyeOff /> : <Eye />}
      </button>
    </div>
  );
}
