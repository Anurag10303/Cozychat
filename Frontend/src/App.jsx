import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import { Toaster } from "react-hot-toast";
import { useEffect, useRef } from "react";
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import Left from "./home/left/Left.jsx";
import Right from "./home/right/Right.jsx";
import SignUp from "./components/SignUp.jsx";
import SignIn from "./components/SignIn.jsx";
import Landing from "./components/Landing.jsx";
import { useAuth } from "./context/AuthProvider";
import { ThemeProvider } from "./context/ThemeContext";
import useConversation from "./zustand/userConveration";
import { pageTransition } from "./lib/motion";

const isPhone = () => window.matchMedia("(max-width: 767px)").matches;

function ChatLayout() {
  const { selectedConversation, setSelectedConversation } = useConversation();
  const inChat = !!selectedConversation;
  const location = useLocation();
  const navigate = useNavigate();
  const prevHash = useRef(location.hash);

  // On phones, opening a chat pushes a history entry so the system Back
  // gesture returns to the list instead of leaving the app.
  useEffect(() => {
    if (selectedConversation?._id && isPhone() && location.hash !== "#chat") {
      navigate("#chat");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedConversation?._id]);

  useEffect(() => {
    if (prevHash.current === "#chat" && location.hash !== "#chat") {
      setSelectedConversation(null);
    }
    prevHash.current = location.hash;
  }, [location.hash, setSelectedConversation]);

  // Phones show one pane at a time; md+ shows the sidebar and conversation side by side.
  return (
    <div className="flex h-dvh w-full overflow-hidden bg-app">
      <div className={`${inChat ? "hidden md:flex" : "flex"} w-full md:w-[320px] lg:w-[360px] xl:w-[380px] shrink-0`}>
        <Left />
      </div>
      <div className={`${inChat ? "flex" : "hidden md:flex"} min-w-0 flex-1`}>
        <Right />
      </div>
    </div>
  );
}

function Page({ children }) {
  return (
    <motion.div {...pageTransition} className="min-h-dvh">
      {children}
    </motion.div>
  );
}

function App() {
  const [authUser] = useAuth();
  const location = useLocation();

  return (
    <ThemeProvider>
      <MotionConfig reducedMotion="user">
        <AnimatePresence mode="wait" initial={false}>
          <Routes location={location} key={location.pathname}>
            <Route
              path="/"
              element={<Page>{authUser ? <ChatLayout /> : <Landing />}</Page>}
            />
            <Route
              path="/login"
              element={authUser ? <Navigate to="/" /> : <Page><SignIn /></Page>}
            />
            <Route path="/signUp" element={<Page><SignUp /></Page>} />
          </Routes>
        </AnimatePresence>
        <Toaster
          position="top-center"
          gutter={10}
          toastOptions={{
            duration: 3000,
            className: "!rounded-xl !border !border-line !bg-surface !text-fg !shadow-float !text-sm !px-4 !py-3",
            success: { iconTheme: { primary: "var(--c-success)", secondary: "var(--c-surface)" } },
            error: { iconTheme: { primary: "var(--c-danger)", secondary: "var(--c-surface)" } },
          }}
        />
      </MotionConfig>
    </ThemeProvider>
  );
}

export default App;
