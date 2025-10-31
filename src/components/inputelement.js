import { useState } from "react";


export const Textinput = ({
  inputType = "text",
  variable,
  value,
  placeholder,
  action,
}) => {
  const [show, setShow] = useState(false);

  const changeType = () => {
    setShow((prev) => !prev);
  };

  return (
    <div style={{ marginTop: "25px", marginLeft: "0", position: "relative" }}>
      <label >{variable}</label>
      <br />
      <input
        type={inputType === "password" && show ? "text" : inputType}
        className="w-100 data"
        placeholder={placeholder}
        value={value}
        onChange={action}
        style={{ paddingRight: inputType === "password" ? "30px" : "10px" }}
      />
      {inputType === "password" &&value.length>0 && (
        <i
          className={`fa ${show ? "fa-eye-slash" : "fa-eye"}`}
          onClick={changeType}
          style={{
            position: "absolute",
            right: "10px",
            top: "38px",
            cursor: "pointer",
            color: "#555",
          }}
        />
      )}
      <br />
    </div>
  );
};
