import { Navigate, Route, Routes } from "react-router-dom";

import AppLayout from "./layouts/AppLayout";

import Login from "./pages/Login";

import ProtectedRoute from "./routes/ProtectedRoute";
import PublicRoute from "./routes/PublicRoute";
import Home from "./pages/Home";
import { cn } from "./utils/cn";
import Review from "./pages/Review";
import Reviews from "./pages/Reviews";

function App() {
  return (
    <div className="min-h-screen bg-[#050608]">
      <div
        className={cn(
          "z-1 pointer-events-none absolute inset-0 opacity-[0.008]",
          "bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)]",
          "bg-size-[48px_48px]",
        )}
      />

      <Routes>
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<Login />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/home" element={<Home />} />
            <Route path="/reviews" element={<Reviews />} />
            <Route path="/reviews/:reviewId" element={<Review />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </div>
  );
}

export default App;
