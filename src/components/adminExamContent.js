import { useState, useContext, useMemo } from "react";
import { useForm } from "react-hook-form";
import { ModalComponent } from "./modalComponent";
import { ControlledDropdownExample } from "./controlledDropDown";
import { handlePostForm } from "../api/formPost";
import { EXAMTYPE, TERM, MODALTITLES } from "../constant";
import SmartTable from "./table";
import { api } from "../api/baseAxious";
import { AdminContext } from "../pages/adminPage";
import { DeleteWarningModal } from "./deleteModal";
export const AdminExamPageContent = () => {
    const [modalState, setModalState] = useState({ visibility: false, topic: "" });
    // ✅ Use real data from context (React Query)
    const {
        activeTabData: exams,
        isLoading,
        error,
        invalidate,
        pageInfo,
        changePage
    } = useContext(AdminContext);
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
    } = useForm();
    const { current, all } = invalidate

    // ✅ Derived table data (safe)
    const viewableTableDetails = useMemo(() => {
        if (!exams) return [];
        return exams.data.map((exam) => ({
            ...exam,
            status: exam.status ? "Active" : "Inactive",
            timeAllocated: `${exam.timeAllocated} mins`,
        }));
    }, [exams]);
    const [selectedExam, setSelectedExam] = useState(null)
    const changeModalState = (topic, visibility) => {
        if (!MODALTITLES.includes(topic) && topic !== "") {
            alert("invalid topic")
        }
        setModalState({ visibility, topic })
    }
    // ✅ Toggle status (server + invalidate)
    const toggleStatus = async (examId) => {
        try {
            const examDetail = exams.data.find((exam) => exam.id === examId);

            const response = await api.put('/exams', undefined, {
                params: {
                    examId,
                    status: !examDetail.status
                }
            });

            alert(response.data.message ?? "exam updated successfully");
            exams.paginated === false ? all() : current();
        } catch (err) {
            console.log(err);
            alert("Failed to toggle status");
        }
    };
    // ✅ Delete exam (server + invalidate)
    const deleteExam = async () => {
        if (selectedExam !== null) {
            console.log("selected exam ID:", selectedExam)
            try {
                const response = await api.delete('/exams', {
                    params: { examId: selectedExam }
                });
                alert(response.data.message ?? "exam deleted successfully")
                exams.paginated === false ? all() : current(); // ✅ Refetch fresh server data
                setSelectedExam(null)
            } catch (err) {
                alert("Failed to delete exam");
            }
        } else {
            alert(" you need to select an exam to delete")
        }
    };
    const rowActions = {
        "Toggle Status": (rowIndex) => toggleStatus(rowIndex),
        "Delete": (rowIndex) => {
            setSelectedExam(rowIndex)
            changeModalState(MODALTITLES[1], true)
        },
    };

    // ✅ Form submit (server + invalidate)
    const onSubmit = async (data) => {
        try {
            await handlePostForm(data);
            reset();
            changeModalState("", false);
            all(); // ✅ refetch new list
        } catch (error) {
            console.error("Error submitting exam:", error);
            alert(error.response?.data?.message || "An error occurred");
        }
    };

    return (
        <div className="container-fluid">
            {/* ✅ Modal */}
            {MODALTITLES.indexOf(modalState.topic) === 0 && <ModalComponent
                title={`${modalState.topic}`}
                isOpen={modalState.visibility}
                onClose={() => changeModalState("", false)}
                isSubmitting={isSubmitting}
                onSubmit={handleSubmit(onSubmit)}
            >
                {/* FORM */}
                <div className="modal-body">
                    <ControlledDropdownExample
                        title="Exam Type"
                        name="examType"
                        register={register}
                        error={errors.examType}
                        options={EXAMTYPE}
                        required
                    />
                    <div className="mb-3">
                        <label className="form-label">Session</label>
                        <input
                            type="text"
                            className={`form-control ${errors.session ? "is-invalid" : ""}`}
                            {...register("session", { required: "Session is required" })}
                            placeholder="e.g. 2024/2025"
                        />
                        {errors.session && <div className="invalid-feedback">{errors.session.message}</div>}
                    </div>
                    <ControlledDropdownExample
                        title="Term"
                        name="term"
                        register={register}
                        error={errors.term}
                        options={TERM}
                        required
                    />
                    <div className="mb-3">
                        <label className="form-label">Time Allocated (minutes)</label>
                        <input
                            type="number"
                            className={`form-control ${errors.timeAllocated ? "is-invalid" : ""}`}
                            {...register("timeAllocated", { required: "Time allocated is required" })}
                        />
                        {errors.timeAllocated && <div className="invalid-feedback">{errors.timeAllocated.message}</div>}
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Questions To Answer</label>
                        <input
                            type="number"
                            className={`form-control ${errors.questionToAnswer ? "is-invalid" : ""}`}
                            {...register("questionToAnswer", { required: "Number of questions is required" })}
                        />
                        {errors.questionToAnswer && <div className="invalid-feedback">{errors.questionToAnswer.message}</div>}
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Subject</label>
                        <input
                            type="text"
                            className={`form-control ${errors.subject ? "is-invalid" : ""}`}
                            {...register("subject", { required: "Subject is required" })}
                        />
                        {errors.subject && <div className="invalid-feedback">{errors.subject.message}</div>}
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Class</label>
                        <input
                            type="text"
                            className={`form-control ${errors.className ? "is-invalid" : ""}`}
                            {...register("className", { required: "Class name is required" })}
                        />
                        {errors.className && <div className="invalid-feedback">{errors.className.message}</div>}
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Upload Question File</label>
                        <input
                            type="file"
                            className={`form-control ${errors.questionFile ? "is-invalid" : ""}`}
                            {...register("questionFile", { required: "File is required" })}
                            accept=".txt,.pdf,.docx"
                        />
                        {errors.questionFile && <div className="invalid-feedback">{errors.questionFile.message}</div>}
                    </div>
                </div>
            </ModalComponent>}
            {MODALTITLES.indexOf(modalState.topic) === 1 &&
                <DeleteWarningModal
                    isOpen={modalState.visibility}
                    onClose={() => {
                        changeModalState("", false)
                        setSelectedExam(null)
                    }}
                    onConfirm={() => {
                        deleteExam()
                        changeModalState("", false)
                    }}
                />}
            {/* ✅ Table */}
            <div className="p-4">
                <h3 className="mb-3">Exams Overview</h3>
                {isLoading && <p>Loading exams...</p>}
                {error && <p>Error loading exams</p>}
                {!isLoading && !error && (
                    <SmartTable
                        contents={viewableTableDetails}
                        actions={rowActions}
                        tableActions={{ "Add to exams": () => changeModalState(MODALTITLES[0], true) }}
                        metaData={exams.paginated === false ? undefined : {
                            changePage,
                            totalPage: pageInfo.totalPage,
                            currentPage: pageInfo.pageNo
                        }}
                    />
                )}
            </div>
        </div>
    );
};
