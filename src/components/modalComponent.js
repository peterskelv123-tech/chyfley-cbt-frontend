import React, { useEffect } from "react";

export const ModalComponent = ({ isOpen, onClose, title, children,isSubmitting,onSubmit }) => {
  useEffect(() => {
    // Add/remove body class to prevent background scroll when modal is open
    if (isOpen) {
      document.body.classList.add("modal-open");
    } else {
      document.body.classList.remove("modal-open");
    }

    return () => document.body.classList.remove("modal-open");
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      
      {/* Backdrop */}
      <div
        className="modal-backdrop fade show"
        onClick={onClose}
        style={{ zIndex: 1040 }}
      ></div>

      {/* Modal */}
      <div
        className="modal fade show"
        tabIndex="-1"
        role="dialog"
        style={{
          display: "block",
          zIndex: 1050,
        }}
      >
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content shadow">
            {/* Header */}
            <div className="modal-header">
              <h5 className="modal-title">{title}</h5>
              <button
                type="button"
                className="btn-close"
                onClick={onClose}
                aria-label="Close"
              ></button>
            </div>
             <form onSubmit={onSubmit} encType="multipart/form-data">
            {/* Body */}
            <div className="modal-body">{children}</div>

            {/* Footer */}
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
              >
                Close
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting}
              >
                   {isSubmitting ? "Submitting..." : "Create Exam"}
              </button>
            </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};
