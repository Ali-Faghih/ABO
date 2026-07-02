import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import { WelcomeScreen } from "./screens/WelcomeScreen";
import { LoginScreen } from "./screens/LoginScreen";
import { RegisterDonorScreen } from "./screens/RegisterDonorScreen";
import { RegisterHospitalScreen } from "./screens/RegisterHospitalScreen";
import { AppLayout } from "./AppLayout";

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col" style={{ background: "linear-gradient(135deg, #f8f9ff 0%, #fff0f2 50%, #f0f2f8 100%)", fontFamily: "'Vazirmatn', sans-serif" }}>
        <Routes>
          <Route path="/" element={<WelcomeScreen />} />
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/register/donor" element={<RegisterDonorScreen />} />
          <Route path="/register/hospital" element={<RegisterHospitalScreen />} />
          <Route path="/app" element={<AppLayout />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <style>{`
          @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
          ::-webkit-scrollbar { width: 0; height: 0; }
        `}</style>
      </div>
    </BrowserRouter>
  );
}
