import { Suspense, lazy } from "react";
import { Route, Routes } from "react-router-dom";
import BottomNav from "./components/BottomNav";
import { AuthProvider } from "./contexts/AuthContext";
import Feed from "./pages/Feed";
import Home from "./pages/Home";
import Lineup from "./pages/Lineup";
import Login from "./pages/Login";
import Tickets from "./pages/Tickets";

// Pulls in html5-qrcode (~500kB). Only staff visit this route, so keep it
// out of the bundle everyone else downloads to buy a ticket.
const Scan = lazy(() => import("./pages/Scan"));

export default function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-ink pb-24">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/lineup" element={<Lineup />} />
          <Route path="/tickets" element={<Tickets />} />
          <Route path="/feed" element={<Feed />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/staff/scan"
            element={
              <Suspense fallback={null}>
                <Scan />
              </Suspense>
            }
          />
        </Routes>
        <BottomNav />
      </div>
    </AuthProvider>
  );
}
