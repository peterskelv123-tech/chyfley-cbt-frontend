import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ExamPage } from "./pages/examPage";
import { LoginPage } from "./pages/loginpage";
import SidebarApp from "./pages/adminPage";
function App() {
  const queryClient = new QueryClient();
  return (
    <QueryClientProvider client={queryClient}>
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/dashboard" element={<SidebarApp />} />
        <Route path="/exam" element={<ExamPage />} />
      </Routes>
    </Router>
    </QueryClientProvider>
  );
}

export default App;
