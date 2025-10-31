export const ControlledDropdownExample=({
  title,
  name,
  register,
  error,
  options = [],
  required = false,
})=> {
  return (
    <div className="mb-3">
      <label htmlFor={name} className="form-label">
        {title}
      </label>

      <select
        id={name}
        className={`form-select ${error ? "is-invalid" : ""}`}
        {...register(name, required ? { required: `Please select a ${title}` } : {})}
      >
        <option value="">-- Choose {title} --</option>
        {options.map((option, index) => (
          <option value={option} key={`${option}_${index}`}>
            {option}
          </option>
        ))}
      </select>

      {error && <div className="invalid-feedback">{error.message}</div>}
    </div>
  );
}

