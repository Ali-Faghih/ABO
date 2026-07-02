import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "./contexts/AuthContext";
import { BottomNav } from "./components/ui/BottomNav";
import { GuestBanner } from "./components/ui/GuestBanner";
import { GuestPromptModal } from "./components/ui/GuestPromptModal";
import { GuestHomeScreen } from "./screens/GuestHomeScreen";
import { DonorHomeScreen } from "./screens/DonorHomeScreen";
import { HospitalHomeScreen } from "./screens/HospitalHomeScreen";
import { DonorProfileScreen } from "./screens/DonorProfileScreen";
import { HospitalProfileScreen } from "./screens/HospitalProfileScreen";
import { GuestProfileScreen } from "./screens/GuestProfileScreen";
import { AddRequestDonorScreen } from "./screens/AddRequestDonorScreen";
import { AddRequestHospitalScreen } from "./screens/AddRequestHospitalScreen";
import { ChatListScreen } from "./screens/ChatListScreen";
import { ChatDetailScreen } from "./screens/ChatDetailScreen";
import { MagazineScreen } from "./screens/MagazineScreen";
import { ArticleDetailScreen } from "./screens/ArticleDetailScreen";
import { CitySelectScreen } from "./screens/CitySelectScreen";
import { RegistryAdminScreen } from "./screens/RegistryAdminScreen";
import { BookAppointmentScreen } from "./screens/BookAppointmentScreen";
import { MyAppointmentsScreen } from "./screens/MyAppointmentsScreen";
import { HospitalAppointmentsScreen } from "./screens/HospitalAppointmentsScreen";
import { NotificationsScreen } from "./screens/NotificationsScreen";
import { VolunteersListScreen } from "./screens/VolunteersListScreen";
import { getConversationByRequestAndParticipants, addConversation } from "./services/chatStore";
import type { Tab, SubScreen, BloodRequest } from "./types";
import { Loader } from "lucide-react";

export function AppLayout() {
  const { user, isGuest, isAuthenticated, isLoading, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("home");
  const [subScreen, setSubScreen] = useState<SubScreen>("none");
  const CITY_KEY = "abo_selected_city";
  const [selectedCity, setSelectedCity] = useState(() => {
    try { return localStorage.getItem(CITY_KEY) || "تهران"; }
    catch { return "تهران"; }
  });
  const [selectedChatId, setSelectedChatId] = useState("");
  const [selectedRequest, setSelectedRequest] = useState<BloodRequest | null>(null);
  const [showGuestPrompt, setShowGuestPrompt] = useState(false);
  const [registerType, setRegisterType] = useState<"donor" | "hospital">("donor");

  useEffect(() => {
    if (!isLoading && !isAuthenticated && !isGuest) {
      navigate("/", { replace: true });
    }
  }, [isLoading, isAuthenticated, isGuest, navigate]);

  useEffect(() => {
    if (user?.type === "donor") {
      const saved = localStorage.getItem(CITY_KEY);
      if (!saved) setSelectedCity(user.city);
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem(CITY_KEY, selectedCity);
  }, [selectedCity]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-screen bg-white" dir="rtl">
        <Loader size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated && !isGuest) return null;

  const goHome = () => { setTab("home"); setSubScreen("none"); };

  const onAction = (fn: () => void) => {
    if (isGuest) { setShowGuestPrompt(true); return; }
    fn();
  };

  const handleTabChange = (t: Tab) => {
    if (isGuest && (t === "chat" || t === "add" || t === "profile")) {
      setShowGuestPrompt(true);
      return;
    }
    setTab(t);
    setSubScreen("none");
  };

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  const handleGuestPromptLogin = () => {
    setShowGuestPrompt(false);
    navigate("/login");
  };

  const handleGuestPromptRegister = () => {
    setShowGuestPrompt(false);
    navigate(registerType === "donor" ? "/register/donor" : "/register/hospital");
  };

  const renderTab = () => {
    if (subScreen === "chat-detail" && selectedChatId) return <ChatDetailScreen conversationId={selectedChatId} onBack={() => { setSubScreen("none"); setSelectedChatId(""); }} />;
    if (subScreen === "article-detail") return <ArticleDetailScreen onBack={() => setSubScreen("none")} />;
    if (subScreen === "city-select") {
      return <CitySelectScreen currentCity={selectedCity} onSelect={setSelectedCity} onBack={() => setSubScreen("none")} />;
    }
    if (subScreen === "registry") {
      return <RegistryAdminScreen onBack={() => setSubScreen("none")} />;
    }
    if (subScreen === "volunteers-list") {
      return <VolunteersListScreen onBack={() => setSubScreen("none")} onChat={(donorId, donorName) => { const cid = `CONV-${Date.now()}`; if (user?.type === "hospital") { let conv = getConversationByRequestAndParticipants("", donorId, user.username); if (!conv) { addConversation({ id: cid, participants: [donorId, user.username], hospitalId: user.username, hospitalName: user.name, donorId, donorName, requestId: "", lastMessage: "", lastMessageTime: "", unread: 0 }); conv = { id: cid, participants: [donorId, user.username], hospitalId: user.username, hospitalName: user.name, donorId, donorName, requestId: "", lastMessage: "", lastMessageTime: "", unread: 0 }; } setSelectedChatId(conv.id); } setSubScreen("chat-detail"); }} />;
    }
    if (subScreen === "book-appointment" && selectedRequest && user?.type === "donor") {
      return <BookAppointmentScreen request={selectedRequest} onBack={() => { setSubScreen("none"); setSelectedRequest(null); }} onChat={(convId) => { setSelectedChatId(convId); setSubScreen("chat-detail"); }} />;
    }
    if (subScreen === "my-appointments") {
      return <MyAppointmentsScreen onBack={() => setSubScreen("none")} />;
    }
    if (subScreen === "hospital-appointments") {
      return <HospitalAppointmentsScreen onBack={() => setSubScreen("none")} />;
    }
    if (subScreen === "notifications") {
      return <NotificationsScreen onBack={() => setSubScreen("none")} />;
    }

    switch (tab) {
      case "home":
        if (isGuest) return <GuestHomeScreen city={selectedCity} onCityClick={() => setSubScreen("city-select")} onLogin={handleGuestPromptLogin} onAction={onAction} />;
        if (user?.type === "donor") {
          return <DonorHomeScreen donor={user} city={selectedCity} onCityClick={() => setSubScreen("city-select")} onAction={onAction} onBookRequest={(req) => { setSelectedRequest(req); setSubScreen("book-appointment"); }} onMyAppointments={() => setSubScreen("my-appointments")} onNotifications={() => setSubScreen("notifications")} />;
        }
        if (user?.type === "hospital") {
          return <HospitalHomeScreen hospital={user} onAddRequest={() => setTab("add")} onAction={onAction} onAppointments={() => setSubScreen("hospital-appointments")} onNotifications={() => setSubScreen("notifications")} onVolunteers={() => setSubScreen("volunteers-list")} />;
        }
        return null;
      case "chat":
        return <ChatListScreen onChatSelect={(id) => { setSelectedChatId(id); setSubScreen("chat-detail"); }} />;
      case "add":
        if (user?.type === "donor") return <AddRequestDonorScreen donor={user} onBack={goHome} />;
        if (user?.type === "hospital") return <AddRequestHospitalScreen hospital={user} onBack={goHome} />;
        return null;
      case "magazine":
        return <MagazineScreen onArticle={() => setSubScreen("article-detail")} />;
      case "profile":
        if (isGuest) {
          return <GuestProfileScreen onLogin={handleGuestPromptLogin} onRegister={() => navigate("/register/donor")} />;
        }
          if (user?.type === "donor") return <DonorProfileScreen donor={user} onLogout={handleLogout} />;
          if (user?.type === "hospital") return <HospitalProfileScreen hospital={user} onLogout={handleLogout} />;
        return null;
      default:
        return null;
    }
  };

  const showBottomNav = tab !== "add" && subScreen === "none";

  return (
    <div className="relative h-full overflow-hidden flex flex-col">
      {isGuest && subScreen === "none" && tab !== "add" && (
        <GuestBanner onLogin={handleGuestPromptLogin} />
      )}
      <div className="flex-1 overflow-hidden relative">{renderTab()}</div>
      {showBottomNav && <BottomNav active={tab} onChange={handleTabChange} />}
      {showGuestPrompt && (
        <GuestPromptModal
          onLogin={handleGuestPromptLogin}
          onRegister={handleGuestPromptRegister}
          onClose={() => setShowGuestPrompt(false)}
        />
      )}
    </div>
  );
}
