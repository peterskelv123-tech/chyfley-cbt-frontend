import { useState, useContext, useMemo } from "react";
import { useForm } from "react-hook-form";
import { ModalComponent } from "./modalComponent";
import { ControlledDropdownExample } from "./controlledDropDown";
import { handlePostForm } from "../api/formPost";
import { EXAMTYPE, TERM } from "../constant";
import SmartTable from "./table";
import { AdminContext } from "../pages/adminPage";
export const AdminExamPageContent = () => {
    const [modalState, setModalState] = useState(false);

    // ✅ Use real data from context (React Query)
    const { data: exams, isLoading, error, invalidate } = useContext(AdminContext);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
    } = useForm();

    // ✅ Derived table data (safe)
    const viewableTableDetails = useMemo(() => {
        if (!exams) return [];
        return exams.map((exam) => ({
            ...exam,
            status: exam.status ? "Active" : "Inactive",
            timeAllocated: `${exam.timeAllocated} mins`,
        }));
    }, [exams]);

    // ✅ Toggle status (server + invalidate)
    const toggleStatus = async (exam) => {
        try {
  //          await axios.patch(`/api/exams/${exam.id}/toggle-status`);
            invalidate(); // ✅ Refetch fresh server data
        } catch (err) {
            console.log(err);
            alert("Failed to toggle status");
        }
    };

    // ✅ Delete exam (server + invalidate)
    const deleteExam = async (exam) => {
        try {
//            await axios.delete(`/api/exams/${exam.id}`);
            invalidate(); // ✅ Refetch
        } catch (err) {
            alert("Failed to delete exam");
        }
    };

    const rowActions = {
        "Toggle Status": (rowIndex) => toggleStatus(exams[rowIndex]),
        "Delete": (rowIndex) => deleteExam(exams[rowIndex]),
    };

    // ✅ Form submit (server + invalidate)
    const onSubmit = async (data) => {
        try {
            await handlePostForm(data);
            reset();
            setModalState(false);
            invalidate(); // ✅ refetch new list
        } catch (error) {
            console.error("Error submitting exam:", error);
            alert(error.response?.data?.message || "An error occurred");
        }
    };

    return (
        <div className="container-fluid">

            {/* ✅ Modal */}
            <ModalComponent
                title={`Create a new exam`}
                isOpen={modalState}
                onClose={() => setModalState(false)}
                isSubmitting={isSubmitting}
                onSubmit={handleSubmit(onSubmit)}
            >
                {/* FORM */}
                <form onSubmit={handleSubmit(onSubmit)} encType="multipart/form-data">
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
                </form>
            </ModalComponent>

            {/* ✅ Table */}
            <div className="p-4">
                <h3 className="mb-3">Exams Overview</h3>

                {isLoading && <p>Loading exams...</p>}
                {error && <p>Error loading exams</p>}

                {!isLoading && !error && (
                    <SmartTable
                        contents={viewableTableDetails}
                        actions={rowActions}
                        tableActions={() => setModalState(true)}
                    />
                )}
            </div>
        </div>
    );
};
