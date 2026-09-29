import Modal from './Modal';

export default function ConfirmDialog({ open, title, message, confirmLabel = 'Delete', loading, onConfirm, onCancel }) {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={title}
      size="sm"
      footer={
        <>
          <button className="btn btn-outline" onClick={onCancel} disabled={loading}>
            Cancel
          </button>
          <button className="btn btn-danger" onClick={onConfirm} disabled={loading}>
            {loading && <span className="spinner sm" />}
            {confirmLabel}
          </button>
        </>
      }
    >
      <p className="text-2">{message}</p>
    </Modal>
  );
}
