import { useId } from 'react';

/**
 * Label + control + error/hint. Pass the control as a render function so it
 * receives the generated id and aria props:
 *   <FormField label="Email" error={errors.email}>{(p) => <input {...p} className="input" />}</FormField>
 */
export default function FormField({ label, error, hint, className = '', children }) {
  const id = useId();
  const describedBy = error || hint ? `${id}-msg` : undefined;
  return (
    <div className={`field ${className}`}>
      {label && (
        <label className="label" htmlFor={id}>
          {label}
        </label>
      )}
      {children({ id, 'aria-invalid': Boolean(error), 'aria-describedby': describedBy })}
      {error ? (
        <span className="field-error" id={describedBy}>
          {error}
        </span>
      ) : (
        hint && (
          <span className="field-hint" id={describedBy}>
            {hint}
          </span>
        )
      )}
    </div>
  );
}
