import { useState, useRef, useContext, useMemo, useEffect, useTransition } from "react";
import { useForm } from "react-hook-form";
import { ModalComponent } from "./modalComponent";
import { ControlledDropdownExample } from "./controlledDropDown";
import { handlePostForm } from "../api/formPost";
import { EXAMTYPE, TERM, MODALTITLES, ALL_EXAM_FILTERS } from "../constant";
import SmartTable from "./table";
import { api, backend_mapping_of_filter } from "../api/baseAxious";
import { AdminContext } from "../pages/adminPage";
import { DeleteWarningModal } from "./deleteModal";
import SmartInputDropdown from "./smart_input_dropdown";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
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
    const navigation = useNavigate()
    const [searchInput, setSearchInput] = useState(pageInfo.searchKey ?? "");
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
        setValue,
        reset,
    } = useForm({
        shouldUnregister: false,
    });
    useEffect(() => {
        const formValues = {};
        // Map backend filters to form fields
        ALL_EXAM_FILTERS.forEach((filter) => {
            formValues[backend_mapping_of_filter[filter]] = otherFilters[filter] ?? "";
        });
        reset(formValues);
    }, [otherFilters, setValue, reset]);
    const { current, all } = invalidate
    const queryKey = [
        "exams",
        pageInfo.pageNo,
        pageInfo.searchKey,
        ...ALL_EXAM_FILTERS.map(k => pageInfo.otherFilters?.[k])
    ];;
    const exams = queryClient.getQueryData(queryKey)?.contents ?? activeTabData;
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
            toast.error("Invalid modal topic");
            return;
        }

        if (!visibility) {
            reset(); // clear form when modal closes
        }

        setModalState({ topic, visibility });
    };

    // ✅ Toggle status (server + invalidate)
    const toggleStatus = async (examId) => {
        const previousData = queryClient.getQueryData(queryKey);
        //console.log("previous data for toggle:", previousData);
        try {
            queryClient.setQueryData(queryKey, (oldData) => {
                console.log("Old data in toggle updater:", oldData);
                if (!oldData) return oldData;

                return {
                    ...oldData,
                    data: oldData.data.map((exam) =>
                        exam.id === examId
                            ? { ...exam, status: !exam.status }
                            : exam
                    )
                };
            });

            const exam = previousData.data.find(e => e.id === examId);

            await api.put("/exams", undefined, {
                params: { examId, status: !exam.status }
            });

        } catch (err) {

            // rollback on failure
            queryClient.setQueryData(queryKey, previousData);
            console.error("Failed to toggle status:", err);
            toast.error("Failed to toggle status");
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

                toast.success(response.data.message ?? "exam deleted successfully")
                if (response.data.statusCode === 200) {
                    queryClient.setQueryData(queryKey, (old) => ({
                        ...old,
                        data: old.data.filter((exam) => exam.id !== selectedExam)
                    }));
                }
                exams.paginated === false ? all() : current(); // ✅ Refetch fresh server data
                setSelectedExam(null)
            } catch (err) {
                toast.error("Failed to delete exam");
            }
        } else {
            toast.error(" you need to select an exam to delete")
        }
    };
    const rowActions = {
        "Toggle Status": (rowIndex) => toggleStatus(rowIndex),
        "View Questions": (rowIndex) => {
            // const exam = exams.data.find(e => e.id === rowIndex);
            // this should go to the exam details page with the questions and other details about the exam, for now it just alerts the exam id
            const examDetail = viewableTableDetails.find((exam) => exam.id === rowIndex)
            //console.log('u clicked on exam detail:', examDetail)
            navigation(`/exam-editor/${rowIndex}/${examDetail['class']}/${examDetail['subject']}`)
            //alert(`Navigate to exam details for exam ID: ${rowIndex}`);
        },
        "Delete": (rowIndex) => {
            setSelectedExam(rowIndex)
            changeModalState(MODALTITLES[1], true)
        },
    };

    // ✅ Form submit (server + invalidate)
    const onSubmit = async (data) => {
        try {
            await handlePostForm(data, "/exams");
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
            toast.error(error.response?.data?.message || "Failed to create exam");
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
                        value={otherFilters[ALL_EXAM_FILTERS[0]] ?? ""}
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
                            value={otherFilters[ALL_EXAM_FILTERS[2]] ?? ""}
                        />
                        {errors.session && (
                            <div className="invalid-feedback">{errors.session.message}</div>
                        )}
                    </div>

                    <ControlledDropdownExample
                        title="Term"
                        name="term"
                        value={otherFilters[ALL_EXAM_FILTERS[1]] ?? ""}
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
                            accept=".txt,.docx"
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
