import { useSelector, useDispatch } from "react-redux";
import { changeExams } from "../action";
import { useState } from "react";
import toast from "react-hot-toast";
import { Accordion } from "../components/customAccordion";
import { useNavigate } from "react-router-dom";
export const ExamSelectionPage = () => {
  const activeExams = useSelector((state) => state.items.exams) || [];
  const dispatch = useDispatch();
  const navigation = useNavigate();
  const [selectedExams, setSelectedExams] = useState([]);

  const toggleExamSelection = (examId) => {
    setSelectedExams((prev) =>
      prev.includes(examId)
        ? prev.filter((id) => id !== examId)
        : [...prev, examId]
    );
  };

  const continue_to_exam = () => {
    if (selectedExams.length === 0) {
      toast.error("Please select at least one exam to continue.", {
        duration: 4000,
      });
      return;
    }

    dispatch(
      changeExams(activeExams.filter((e) => selectedExams.includes(e.id)))
    );

    navigation("/exam", { replace: true });
  };
  return (
    <div className="container-fluid mt-5">
      <h2 className="text-center mb-4 text-lemon">
        Select Exams to Take
      </h2>
      <Accordion
        title={"select subject"}
        items={activeExams
          .map((e) => ({
            id: e.id,
            name: `${e.subject}`,
            checked: selectedExams.includes(e.id),
            onClick: () => toggleExamSelection(e.id),
          }))}
      />
      {/* {subjects.map((subjectObj) => {
        const subject = subjectObj.subject;

        return (
          <Accordion
            key={subject}
            title={subject}
            items={activeExams
              .filter((e) => e.subject === subject)
              .map((e) => ({
                id: e.id,
                name: `${e.subject} - ${e.class}`,
                checked: selectedExams.includes(e.id),
                onClick: () => toggleExamSelection(e.id),
              }))}
          />
        );
      })} */}

      <div className="text-center mt-4">
        <button className="container-fluid btn btn-primary" onClick={continue_to_exam} disabled={selectedExams.length<=0}>
          Continue
        </button>
      </div>
    </div>
  );
};
