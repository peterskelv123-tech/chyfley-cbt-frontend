import { useState, useEffect } from "react";
export const Option = ({ options, no, save, answer = null, changeQuestion }) => {
  const [selectedOption, setSelectedOption] = useState(null);

  const updateSelectedOption = (option) => {
    setSelectedOption((prev) => (prev !== option ? option : null));
  };

  // Reset local selection when question changes
  useEffect(() => {
    setSelectedOption(null);
  }, [no]);

  // -------------------------
  // 🔥 KEYBOARD EVENT HANDLER
  // -------------------------
  useEffect(() => {
    const handleKeyPress = (e) => {
      const key = e.key.toLowerCase();

      // A, B, C, D selection
      if (["a", "b", "c", "d"].includes(key)) {
        const index = key.charCodeAt(0) - 97; // a=0, b=1, c=2, d=3

        if (options[index]) {
          updateSelectedOption(options[index]);
          save(options[index]);
        }
      }

      // Arrow Right → (Next question)
      if (e.key === "ArrowRight"||e.key === "ArrowLeft") {
        changeQuestion(e); // call next if provided
      }
    };

    window.addEventListener("keydown", handleKeyPress);

    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [options, no, save,changeQuestion]);
  // include needed dependencies

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
