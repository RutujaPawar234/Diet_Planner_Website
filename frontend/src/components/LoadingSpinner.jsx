export default function LoadingSpinner({ label = 'Loading…', fullScreen = false, size }) {
  const content = (
    <div className="loading-block" role="status">
      <div className={`spinner ${size || ''}`} aria-hidden="true" />
      {label && <span>{label}</span>}
    </div>
  );
  return fullScreen ? <div className="loading-screen">{content}</div> : content;
}
