export const DeleteWarningModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-window p-4">
        
        <h4 className="text-danger mb-3">
          ⚠️ Confirm Permanent Deletion
        </h4>

        <p className="text-light">
          You're about to <strong>permanently delete</strong> this exam.
        </p>

        <p className="text-light" >This will also remove:</p>
        <ul className="text-light" >
          <li>✅ All exam questions</li>
          <li>✅ All exam results</li>
          <li>✅ All student attempts</li>
          <li>✅ All attendance records for this exam</li>
        </ul>

        <p className="text-danger fw-bold">
          This action cannot be undone.
        </p>

        <div className="d-flex justify-content-end gap-3 mt-3">
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-danger" onClick={onConfirm}>
            Yes, Delete Permanently
          </button>
        </div>

      </div>
    </div>
  );
};
