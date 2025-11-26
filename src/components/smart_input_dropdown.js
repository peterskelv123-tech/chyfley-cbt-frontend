import { useState, useRef, useEffect, useMemo } from "react";

export default function SmartInputDropdown({
  label,
  value,
  onChange,
  options = [],
  placeholder = "Type or select...",
}) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  const filteredOptions = useMemo(() => {
    if (!value) return options;
    return options.filter((it) =>
      it.toLowerCase().includes(value.toLowerCase())
    );
  }, [value, options]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSelect = (option) => {
    onChange(option);
    setOpen(false);
  };

  return (
    <div className="mb-3 w-100" ref={wrapperRef}>
      {label && <label className="form-label fw-semibold">{label}</label>}

      <div className="position-relative">
        {/* INPUT */}
        <input
          type="text"
          className="form-control pe-5"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setOpen(true)}
        />

        {/* TOGGLE ICON */}
        <button
          type="button"
          className="btn btn-light position-absolute top-50 end-0 translate-middle-y me-1 p-1"
          onClick={() => setOpen((prev) => !prev)}
          style={{ border: "none" }}
        >
          ▼
        </button>

        {/* DROPDOWN */}
        {open && (
          <ul
            className="position-absolute w-100 mt-1 bg-white shadow border rounded py-1"
            style={{
              zIndex: 50,
              maxHeight: "200px",
              overflowY: "auto",
              listStyleType: "none",
              paddingLeft: 0,
            }}
          >
            {filteredOptions.length === 0 && (
              <li className="px-3 py-2 text-muted fst-italic">
                No options available
              </li>
            )}

            {filteredOptions.map((opt, idx) => {
              const isSelected = opt === value;
              return (
                <li
                  key={idx}
                  className={`px-3 py-2 ${
                    isSelected
                      ? "bg-primary text-white"
                      : "bg-white text-dark"
                  } ${!isSelected ? "hover-bg-light" : ""}`}
                  style={{ cursor: "pointer" }}
                  onClick={() => handleSelect(opt)}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.classList.add("bg-light");
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.classList.remove("bg-light");
                  }}
                >
                  {opt}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
