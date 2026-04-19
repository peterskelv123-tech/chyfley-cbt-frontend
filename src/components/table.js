import SmartInput from "./smartInput";
import { useEffect } from "react";
const SmartTable = ({
  contents = [],
  actions = {},
  tableActions = {},
  metaData = {},
  actionParams,
  column_characteristics = { hidable: [], editAble: [] },
  column_edit_function={},
  hide = []
}) => {
   useEffect(() => {
    const editableColumns = column_characteristics.editAble || [];

    if (editableColumns.length > 0) {
      const editFuncKeys = Object.keys(column_edit_function);

      // Check if column_edit_function is empty
      if (editFuncKeys.length === 0) {
        throw new Error(
          "'column_edit_function' is empty but 'editAble' columns are defined: " +
          editableColumns.join(', ')
        );
      }

      // Check if all editable columns have corresponding edit functions
      const missingKeys = editableColumns.filter(col => !editFuncKeys.includes(col));
      if (missingKeys.length > 0) {
        throw new Error(
          "'column_edit_function' is missing keys for the following editable columns: " +
          missingKeys.join(', ')
        );
      }
    }
  }, [column_characteristics, column_edit_function]);
  if (!contents || contents.length === 0) {
    return <>
      <p>No data available</p>
      {tableActions && <div className="d-flex gap-2">
        {Object.keys(tableActions).map((btnName, index) => (
          <button
            key={index}
            className="btn btn-primary btn-sm"
            onClick={tableActions[btnName]}
          >
            {btnName}
          </button>
        ))}
      </div>}
    </>;
  }

  const headers = Object.keys(contents[0]);
  const hasActions = Object.keys(actions).length > 0;
  const hasPagination =
    metaData && metaData.totalPages && metaData.totalPages > 1;
  const hasIdkey = !actionParams ? headers.includes("id") : headers.includes(actionParams)
  const keyForAction = actionParams || "id";
  return (
    <div className="card p-3 shadow-sm">
      <table className="table table-bordered align-middle">
        <thead className="table-light">
          <tr>
            {headers.map((header, index) => (
              !hide.includes(header) && <th key={index}>{header.toUpperCase()}</th>
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
                !hide.includes(header) && <td key={i}>{
                  !column_characteristics.hidable.includes(header) && !column_characteristics.editAble.includes(header) && String(row[header]).toUpperCase()
                }
                  {(column_characteristics.hidable.includes(header) || column_characteristics.editAble.includes(header))
                    && <SmartInput
                      value={row[header]??"NULL"}
                      editable={column_characteristics.editAble.includes(header)}
                      onChange={(newValue) => {
                        if (column_edit_function[header]) {
                          column_edit_function[header](newValue, row, rowIndex);
                        }
                      }}
                      hideable={column_characteristics.hidable.includes(header)}
                    />}
                </td>
              ))}
              {hasActions &&
                Object.keys(actions).map((actionName, actionIndex) => (
                  <td key={actionIndex}>
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => actions[actionName](!hasIdkey ? rowIndex : row[keyForAction])}
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
                  className={`btn btn-sm ${isActive ? "btn-primary" : "btn-outline-primary"
                    }`}
                  onClick={() => {
                    metaData.changePage(pageNumber)
                  }}
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
