import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import { WelcomeScreen } from "./screens/WelcomeScreen";
import { LoginScreen } from "./screens/LoginScreen";
import { RegisterDonorScreen } from "./screens/RegisterDonorScreen";
import { RegisterHospitalScreen } from "./screens/RegisterHospitalScreen";
import { AppLayout } from "./AppLayout";

export default function App() {
  return (
    <BrowserRouter>
      <div className="w-full min-h-screen overflow-hidden relative flex flex-col" style={{ fontFamily: "'Vazirmatn', sans-serif" }}>
        <div className="w-full max-w-[430px] mx-auto h-screen overflow-hidden relative flex flex-col pt-4 frame">
          <Routes>
            <Route path="/" element={<WelcomeScreen />} />
            <Route path="/login" element={<LoginScreen />} />
            <Route path="/register/donor" element={<RegisterDonorScreen />} />
            <Route path="/register/hospital" element={<RegisterHospitalScreen />} />
            <Route path="/app" element={<AppLayout />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
        <style>{`
          @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
          ::-webkit-scrollbar { width: 0; height: 0; }
          @keyframes slide-up { from { transform: translateY(100%); } to { transform: translateY(0); } }
          .animate-slide-up { animation: slide-up 0.3s ease-out; }
          @media (min-width: 640px) {
            .frame {
              transform: translateZ(0);
              border-radius: 24px;
              box-shadow:
                0 0 0 1px rgba(122, 0, 25, 0.15),
                0 0 20px rgba(122, 0, 25, 0.08),
                0 0 60px rgba(26, 0, 51, 0.06);
            }
          }
        `}</style>
      </div>
    </BrowserRouter>
  );
}
