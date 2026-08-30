import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { MetadataProvider } from "./hooks/useMetadata";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import ExplorerPage from "./pages/ExplorerPage";
import ComparePage from "./pages/ComparePage";
import CompanyPage from "./pages/CompanyPage";
import MethodologyPage from "./pages/MethodologyPage";

export default function App() {
  return (
    <MetadataProvider>
      <BrowserRouter>
        <div className="flex min-h-screen flex-col">
          <Navbar />
          <div className="flex flex-1 flex-col">
            <Routes>
              <Route path="/" element={<ExplorerPage />} />
              <Route path="/compare" element={<ComparePage />} />
              <Route path="/company/:id" element={<CompanyPage />} />
              <Route path="/about" element={<MethodologyPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
          <Footer />
        </div>
      </BrowserRouter>
    </MetadataProvider>
  );
}