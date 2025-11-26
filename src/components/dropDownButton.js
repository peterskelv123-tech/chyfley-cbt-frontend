import { useState, useRef, useEffect } from "react";

export default function DropdownButton({
  label = "Select",
  items = [],
  onSelect = () => {},
  iconClass = "fas fa-book",
  btnClass = "btn btn-light greenborder text-lemon",
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="dropdown" ref={menuRef} style={{ position: "relative" }}>
      {/* Main button */}
      <button
        className={btnClass}
        onClick={() => setOpen((prev) => !prev)}
      >
        <i className={iconClass} style={{ marginRight: "15px" }}></i>
        <span style={{ display: "inline-flex", alignItems: "center" }}>
          {label}
        </span>
      </button>

      {/* Dropdown menu */}
      {open && (
        <ul
          className="dropdown-menu show"
          style={{
            display: "block",
            position: "absolute",
            top: "110%",
            left: 0,
            zIndex: 9999,
            padding: "10px 0",
            minWidth: "180px",
            borderRadius: "8px",
          }}
        >
          {items.map((item, idx) => (
            <li
              key={idx}
              className="dropdown-item"
              style={{ cursor: "pointer" }}
              onClick={() => {
                onSelect(item);
                setOpen(false);
              }}
            >
              {item.label ?? item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
