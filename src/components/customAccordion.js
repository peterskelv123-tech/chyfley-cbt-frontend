import { useState } from "react";

export const Accordion = ({ title, items = [] }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="card mb-2">
      {/* Header */}
      <div
        className="card-header d-flex justify-content-between align-items-center"
        style={{ cursor: "pointer" }}
        onClick={() => setOpen((prev) => !prev)}
      >
        <span>{title}</span>
        <i className={`fas fa-chevron-${open ? "up" : "down"}`} />
      </div>

      {/* Body */}
      {open && (
        <ul className="list-group list-group-flush">
          {items.map((item, index) => (
            <li key={item.id ?? index} className="list-group-item">
              <label
                className="d-flex align-items-center gap-2"
                style={{ cursor: "pointer" }}
              >
                <input
                  type="checkbox"
                  checked={!!item.checked}
                  onChange={item.onClick}
                />
                <span>
                  {typeof item === "object"
                    ? item.name || item.title
                    : item}
                </span>
              </label>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

