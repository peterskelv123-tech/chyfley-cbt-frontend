import { useState } from 'react';
function SmartInput({
  value,
  onChange,
  editable = false,
  hideable = false,
  placeholder = '',
  type = 'text',
  className = '',
}) {
  const [isHidden, setIsHidden] = useState(false);
  return (
    <div className='d-flex align-items-center'>
      <input
        type={type}
        value={!isHidden?value:"*".repeat(value.length)}
        placeholder={placeholder}
        readOnly={!editable}
        onChange={(e) => onChange && onChange(e.target.value)}
        className={`form-control border-0 shadow-none bg-transparent ${className}`}
        style={{
          outline: 'none',
          cursor: editable ? 'text' : 'default',
        }}
      />
      {hideable && (<i className={`fa ${isHidden ? "fa-eye-slash" : "fa-eye"}`} onClick={() => setIsHidden(!isHidden)}></i>)}
    </div>
  );
}

export default SmartInput;
