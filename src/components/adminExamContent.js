import { useState, useRef, useContext, useMemo, useEffect, useTransition } from "react";
import { useForm } from "react-hook-form";
import { ModalComponent } from "./modalComponent";
import { ControlledDropdownExample } from "./controlledDropDown";
import { handlePostForm } from "../api/formPost";
import { EXAMTYPE, TERM, MODALTITLES, ALL_EXAM_FILTERS } from "../constant";
import SmartTable from "./table";
import { api, fetchExamDetailFilters } from "../api/baseAxious";
import { AdminContext } from "../pages/adminPage";
import { DeleteWarningModal } from "./deleteModal";
import { useQuery } from "@tanstack/react-query";
import { use } from "react";
import SmartInputDropdown from "./smart_input_dropdown";
export const AdminExamPageContent = () => {
    const [modalState, setModalState] = useState({ visibility: false, topic: "" });
    const {
        isLoading,
        activeTabData,
        error,
        invalidate,
        otherFilters,
        pageInfo,
        updateExamdetailsOtherFilter,
        changeDataPage,
        changeSearchKey,
        queryClient,
        termsLoading,
        examTypesLoading,
        sessionsLoading,
        allExamTypes,
        allSessions,
        allTerms
    } = useContext(AdminContext);
    const [searchInput, setSearchInput] = useState(pageInfo.searchKey ?? "");
    /*useEffect(() => {
        if (!sessionError && !termsError && !examTypesError) {
            console.log("Fetched exam detail filters:", {
                sessions: allSessions,
                terms: allTerms,
                examTypes: allExamTypes
            });
        }
    }, [sessionError, termsError, examTypesError, allSessions, allTerms, allExamTypes]);*/
    const [isPending, startTransition] = useTransition();
    useEffect(() => {
        setSearchInput(pageInfo.searchKey ?? "");
    }, [pageInfo.searchKey]);

    const searchTimeoutRef = useRef(null);
    const searchRef = useRef(null);

    // ✅ Focus input on mount
    useEffect(() => {
        if (searchRef.current) searchRef.current.focus();
    }, []);
    const onChangeSearchKey = (e) => {
        const value = e.target.value;

        // ✅ Immediate UX update
        setSearchInput(value);

        // ✅ Debounced backend/state update
        clearTimeout(searchTimeoutRef.current);
        searchTimeoutRef.current = setTimeout(() => {
            startTransition(() => {
                changeSearchKey(value);
            });
        }, 400);
    };

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
    } = useForm({
        shouldUnregister: false,
    });

    const { current, all } = invalidate
    const exams = activeTabData;
    // ✅ Derived table data (safe)
    const viewableTableDetails = useMemo(() => {
        if (!exams) return [];
        return exams.data.map((exam) => ({
            ...exam,
            status: exam.status ? "Active" : "Inactive",
            timeAllocated: `${exam.timeAllocated} mins`,
        }));
    }, [exams]);
    useEffect(() => {
        if (exams?.data && !queryClient.getQueryData(["exams"])) {
            queryClient.setQueryData(["exams"], exams);
        }
    }, [exams, queryClient]);

    const [selectedExam, setSelectedExam] = useState(null)
    const changeModalState = (topic, visibility) => {
        if (topic !== "" && !MODALTITLES.includes(topic)) {
            alert("Invalid modal topic");
            return;
        }

        if (!visibility) {
            reset(); // clear form when modal closes
        }

        setModalState({ topic, visibility });
    };

    // ✅ Toggle status (server + invalidate)
    const toggleStatus = async (examId) => {
        try {
            const exam = exams.data.find(e => e.id === examId);
            await api.put('/exams', undefined, {
                params: { examId, status: !exam.status }
            });
            // 🔥 refetch exact page
            queryClient.invalidateQueries({
                queryKey: ["exams", pageInfo.pageNo],
                exact: true,
            });

        } catch (err) {
            console.error(err);
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
                if (response.data.statusCode === 200) {
                    queryClient.setQueryData(["exams"], (old) => ({
                        ...old,
                        data: old.data.filter((exam) => exam.id !== selectedExam)
                    }));
                }
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
            console.log("Submitted data:", data);
            reset();
            changeModalState("", false);
            queryClient.setQueryData(["exams"], (old) => ({
                ...old,
                data: [...old.data, data]
            }));
            all(); // ✅ refetch new list
        } catch (error) {
            console.error("Error submitting exam:", error);
            alert(error.response?.data?.message || "An error occurred");
        }
    };
    const isAllloading = examTypesLoading || termsLoading || sessionsLoading;

    if (isAllloading) {
        return (
            <div className="text-center py-4">
                <h4>Loading exam selection filters...</h4>
            </div>
        );
    }


    return (
        <div className="container-fluid">
            <div className="row mb-4">
                <div className="col-4">
                    <SmartInputDropdown
                        label="Filter by Exam Type"
                        options={allExamTypes}
                        value={otherFilters[ALL_EXAM_FILTERS[0]] ?? ""}
                        onChange={(value) => updateExamdetailsOtherFilter(ALL_EXAM_FILTERS[0], value)}
                    />
                </div>
                <div className="col-4">
                    <SmartInputDropdown
                        label="Filter by Term"
                        options={allTerms}
                        value={otherFilters[ALL_EXAM_FILTERS[1]] ?? ""}
                        onChange={(value) => updateExamdetailsOtherFilter(ALL_EXAM_FILTERS[1], value)}
                    />
                </div>
                <div className="col-4">
                    <SmartInputDropdown
                        label="Filter by Session"
                        options={allSessions}
                        value={otherFilters[ALL_EXAM_FILTERS[2]] ?? ""}
                        onChange={(value) => updateExamdetailsOtherFilter(ALL_EXAM_FILTERS[2], value)}
                    />
                </div>
            </div>
            {/* ✅ Modal */}
            <ModalComponent
                title={modalState.topic}
                isOpen={modalState.visibility && MODALTITLES.indexOf(modalState.topic) === 0}
                onClose={() => changeModalState("", false)}
                isSubmitting={isSubmitting}
                onSubmit={handleSubmit(onSubmit)}
            >
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
                        {errors.session && (
                            <div className="invalid-feedback">{errors.session.message}</div>
                        )}
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
                            {...register("timeAllocated", {
                                required: "Time allocated is required",
                            })}
                        />
                        {errors.timeAllocated && (
                            <div className="invalid-feedback">
                                {errors.timeAllocated.message}
                            </div>
                        )}
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Questions To Answer</label>
                        <input
                            type="number"
                            className={`form-control ${errors.questionToAnswer ? "is-invalid" : ""}`}
                            {...register("questionToAnswer", {
                                required: "Number of questions is required",
                            })}
                        />
                        {errors.questionToAnswer && (
                            <div className="invalid-feedback">
                                {errors.questionToAnswer.message}
                            </div>
                        )}
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Subject</label>
                        <input
                            type="text"
                            className={`form-control ${errors.subject ? "is-invalid" : ""}`}
                            {...register("subject", { required: "Subject is required" })}
                        />
                        {errors.subject && (
                            <div className="invalid-feedback">{errors.subject.message}</div>
                        )}
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Class</label>
                        <input
                            type="text"
                            className={`form-control ${errors.className ? "is-invalid" : ""}`}
                            {...register("className", {
                                required: "Class name is required",
                            })}
                        />
                        {errors.className && (
                            <div className="invalid-feedback">
                                {errors.className.message}
                            </div>
                        )}
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Upload Question File</label>
                        <input
                            type="file"
                            className={`form-control ${errors.questionFile ? "is-invalid" : ""}`}
                            {...register("questionFile", {
                                required: "File is required",
                            })}
                            accept=".txt,.pdf,.docx"
                        />
                        {errors.questionFile && (
                            <div className="invalid-feedback">
                                {errors.questionFile.message}
                            </div>
                        )}
                    </div>
                </div>
            </ModalComponent>

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
                <div className="d-flex justify-content-between mb-5">
                    <h3 className="mb-3">Exams Overview</h3>
                    <input
                        type="text"
                        className="form-control w-25"
                        placeholder="Search exam content..."
                        value={searchInput}
                        onChange={onChangeSearchKey}
                    />
                </div>
                {isLoading && <p>Loading exams...</p>}
                {error && <p>Error loading exams</p>}
                {!isLoading && !error && (
                    <SmartTable
                        contents={viewableTableDetails}
                        actions={rowActions}
                        hide={['id']}
                        tableActions={{ "Add to exams": () => changeModalState(MODALTITLES[0], true) }}
                        metaData={exams?.paginated === false ? undefined : {
                            changePage: (page) => changeDataPage(page),
                            totalPages: pageInfo.totalPages,
                            currentPage: pageInfo.pageNo
                        }}
                        column_characteristics={{ hidable: ['roomId',], editAble: [] }}
                    />
                )}
            </div>
        </div>
    );
};
