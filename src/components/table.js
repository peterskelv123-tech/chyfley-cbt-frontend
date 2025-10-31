const SmartTable = ({ 
  contents = [], 
  actions = {}, 
  tableActions = {}, 
  metaData = {} 
}) => {
  if (!contents || contents.length === 0) {
    return <p>No data available</p>;
  }

  const headers = Object.keys(contents[0]);
  const hasActions = Object.keys(actions).length > 0;
  const hasPagination =
    metaData && metaData.totalPages && metaData.totalPages > 1;

  return (
    <div className="card p-3 shadow-sm">
      <table className="table table-bordered align-middle">
        <thead className="table-light">
          <tr>
            {headers.map((header, index) => (
              <th key={index}>{header.toUpperCase()}</th>
            ))}
            {hasActions && (
              <th colSpan={Object.keys(actions).length}>Actions</th>
            )}
          </tr>
        </thead>
        <tbody>
          {contents.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {headers.map((header, i) => (
                <td key={i}>{String(row[header]).toUpperCase()}</td>
              ))}
              {hasActions &&
                Object.keys(actions).map((actionName, actionIndex) => (
                  <td key={actionIndex}>
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => actions[actionName](rowIndex)}
                    >
                      {actionName}
                    </button>
                  </td>
                ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Bottom section */}
      <div className="mt-3 d-flex justify-content-between align-items-center flex-wrap">
        {/* Table actions (e.g. Add new exam) */}
        <div className="d-flex gap-2">
          {Object.keys(tableActions).map((btnName, index) => (
            <button
              key={index}
              className="btn btn-primary btn-sm"
              onClick={tableActions[btnName]}
            >
              {btnName}
            </button>
          ))}
        </div>
        {/* Pagination controls */}
        {hasPagination && (
          <div className="d-flex gap-2 mt-2 mt-sm-0">
            {Array.from({ length: metaData.totalPages }, (_, i) => {
              const pageNumber = i + 1;
              const isActive = pageNumber === metaData.currentPage;
              return (
                <button
                  key={pageNumber}
                  className={`btn btn-sm ${
                    isActive ? "btn-primary" : "btn-outline-primary"
                  }`}
                  onClick={() => metaData.changePage(pageNumber)}
                >
                  {pageNumber}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default SmartTable;
