import {
    BrowserRouter,
    Routes,
    Route,
    Navigate
} from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Events from "./pages/Events";
import EventDetails from "./pages/EventDetails";
import MyRegistrations from "./pages/MyRegistrations";
import OrganizerDashboard from "./pages/OrganizerDashboard";

import Navbar from "./components/Navbar";

function App() {
    return (
        <BrowserRouter>
            <Navbar />

            <Routes>

                {/* Home */}
                <Route
                    path="/"
                    element={
                        <Navigate to="/events" replace />
                    }
                />

                {/* Authentication */}
                <Route
                    path="/login"
                    element={<Login />}
                />

                <Route
                    path="/register"
                    element={<Register />}
                />

                {/* Events */}
                <Route
                    path="/events"
                    element={<Events />}
                />

                <Route
                    path="/events/:id"
                    element={<EventDetails />}
                />

                {/* Student */}
                <Route
                    path="/my-registrations"
                    element={<MyRegistrations />}
                />

                {/* Organizer/Admin */}
                <Route
                    path="/organizer"
                    element={<OrganizerDashboard />}
                />

                {/* Unknown URL */}
                <Route
                    path="*"
                    element={
                        <Navigate to="/events" replace />
                    }
                />

            </Routes>
        </BrowserRouter>
    );
}

export default App;