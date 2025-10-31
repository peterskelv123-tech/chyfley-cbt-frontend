import { useState, useEffect } from "react";
export const Option = ({ options, no, save, answer = null }) => {
  const [selectedOption, setSelectedOption] = useState(null);
  const updateSelectedOption = (option) => {
    setSelectedOption((prev) => (prev !== option ? option : null));
  };

  // Reset local selection when question changes
  useEffect(() => {
    setSelectedOption(null);
  }, [no]);
  return (
    <div style={{ marginTop: "3rem" }}>
      {options.map((option, index) => (
        <label
          key={`${option}_${index}`}
          style={{ display: "block", marginTop: "0.5rem", cursor: "pointer" }}
        >
          <input
            type="radio"
            name={`question_${no}`}
            value={option}
            checked={selectedOption === option || answer === option}
            onChange={() => {
              updateSelectedOption(option);
              save(option);
            }}
          />
          <span style={{ marginLeft: "8px" }}>{option}</span>
        </label>
      ))}
    </div>
  );
};

