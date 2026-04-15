import "@/App.css";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "sonner";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Tests from "./pages/Tests";
import CreateTest from "./pages/CreateTest";
import TakeTest from "./pages/TakeTest";
import GenerateQuestions from "./pages/GenerateQuestions";
import Materials from "./pages/Materials";
import Analysis from "./pages/Analysis";
import AITeacher from "./pages/AITeacher";
import InterviewPrep from "./pages/InterviewPrep";
import AuthCallback from "./components/AuthCallback";
import ProtectedRoute from "./components/ProtectedRoute";

function AppRouter() {
  const location = useLocation();
  
  // Check URL fragment for session_id synchronously during render
  // This prevents race conditions by processing session_id FIRST before checking existing session_token
  if (location.hash?.includes('session_id=')) {
    return <AuthCallback />;
  }

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      
      {/* Protected Routes */}
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/tests" element={<ProtectedRoute><Tests /></ProtectedRoute>} />
      <Route path="/tests/create" element={<ProtectedRoute><CreateTest /></ProtectedRoute>} />
      <Route path="/test/:testId" element={<ProtectedRoute><TakeTest /></ProtectedRoute>} />
      <Route path="/questions/generate" element={<ProtectedRoute><GenerateQuestions /></ProtectedRoute>} />
      <Route path="/materials" element={<ProtectedRoute><Materials /></ProtectedRoute>} />
      <Route path="/analysis" element={<ProtectedRoute><Analysis /></ProtectedRoute>} />
      <Route path="/ai-teacher" element={<ProtectedRoute><AITeacher /></ProtectedRoute>} />
      <Route path="/interview" element={<ProtectedRoute><InterviewPrep /></ProtectedRoute>} />
    </Routes>
  );
}

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <AppRouter />
        <Toaster position="top-right" richColors />
      </BrowserRouter>
    </div>
  );
}

export default App;
