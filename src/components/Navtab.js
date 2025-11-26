import { useEffect } from "react";
import "./navtab.css";
export const Easynavigator = ({ num, show, action, answered, table, examQuestions }) => {
  return (
    <div
      className="container-fluid d-flex justify-content-center align-items-start"
      style={{
        position: "absolute",
        bottom: "60px",
        left: "50%",
        transform: "translateX(-50%)", // centers horizontally
        zIndex: 10,
      }}
    >
      <div className="col-md-3">
        <table
          className={`table table-bordered table-responsive ${show ? "" : "d-none"
            }`}
          style={{
            width: "60%",
            borderRadius: "18px",
            borderCollapse: "separate",
            backgroundColor: "white",
            boxShadow: "0px 2px 10px rgba(0, 0, 0, 0.1)",
          }}
        >
          <tbody>
            {table.map((tr, rowIndex) => (
              <tr key={rowIndex}>
                {tr.map((td, cellIndex) => {
                  const questionIndex = answered.findIndex(
                    (item) => examQuestions[td - 1].id === item.questionId
                  );
                  const isCurrent = td === num + 1;
                  const isAnswered = questionIndex >= 0;
                  return (
                    <td
                      key={cellIndex}
                      onClick={action}
                      style={{
                        backgroundColor: isCurrent
                          ? "rgb(37, 155, 194)"
                          : "white",
                        color: isCurrent
                          ? "white"
                          : isAnswered
                            ? "rgb(37, 155, 194)"
                            : "red",
                        border: `1px solid ${isAnswered ? "rgb(37, 155, 194)" : "red"
                          }`,
                        textAlign: "center",
                        padding: "5px 10px",
                        borderRadius: "10px",
                        cursor: "pointer",
                        fontWeight: "bold",
                        transition: "all 0.2s ease-in-out",
                      }}
                      onMouseEnter={(e) =>
                        (e.target.style.transform = "scale(1.1)")
                      }
                      onMouseLeave={(e) =>
                        (e.target.style.transform = "scale(1)")
                      }
                    >
                      {td}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
