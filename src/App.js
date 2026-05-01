import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ExamPage } from "./pages/examPage";
import QuizEditor from "./pages/adminQuestionPage";
import { LoginPage } from "./pages/loginpage";
import SidebarApp from "./pages/adminPage";
import { Toaster } from "react-hot-toast";
import { ExamSelectionPage } from "./pages/examSelectionPage";
function App() {
  const queryClient = new QueryClient();
  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
      <QueryClientProvider client={queryClient}>
        <Router>
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/dashboard" element={<SidebarApp />} />
            <Route path="/exam-editor/:examId/:class_name/:subject" element={<QuizEditor />} />
            <Route path="/exam-selection" element={<ExamSelectionPage />} />
            <Route path="/exam" element={<ExamPage />} />
          </Routes>
        </Router>
      </QueryClientProvider>
    </>
  );
}

export default App;
