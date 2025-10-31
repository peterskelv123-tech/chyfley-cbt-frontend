export const Bottom = ({ number, action, ctrl, totalQuestions }) => {
  return (
    <div
      style={{
        position: "absolute",
        bottom: "10px",
        left: "0",
        width: "100%",
        display: "flex",
        justifyContent: "center",
        gap: "8px",
      }}
    >
      {number > 0 && (
        <button
          className="btn btn-light text-light previous-button"
          style={{ backgroundColor: "rgb(81, 194, 37)" }}
          onClick={action}
        >
          <i className="fas fa-arrow-left"></i>
          <span style={{ marginLeft: "3px" }}>Previous</span>
        </button>
      )}

      <button
        className="btn btn-light text-light"
        style={{ backgroundColor: "rgb(81, 194, 37)" }}
        onClick={ctrl}
      >
        <i className="fas fa-th-large"></i>
        <span style={{ marginLeft: "3px" }}>Navigation</span>
      </button>

      {number < totalQuestions - 1 && (
        <button
          className="btn btn-light text-light next-button"
          style={{ backgroundColor: "rgb(81, 194, 37)" }}
          onClick={action}
        >
          <span style={{ marginRight: "3px" }}>Next</span>
          <i className="fas fa-arrow-right"></i>
        </button>
      )}
    </div>
  );
};
