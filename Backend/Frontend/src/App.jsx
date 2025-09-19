"use client"
import Left from "../src/home/left/Left.jsx"
import Right from "../src/home/right/Right.jsx"
import SignUp from "./components/SignUp.jsx"
import SignIn from "./components/SignIn.jsx"
import { Navigate, Route, Routes } from "react-router-dom"
import { useAuth } from "./context/AuthProvider"
import { ThemeProvider } from "./context/ThemeContext"

function App() {
  const [authUser, setAuthUser] = useAuth()
  console.log("Console", authUser)

  return (
    <ThemeProvider>
      <Routes>
        <Route
          path="/"
          element={
            authUser ? (
              <div className="flex h-screen bg-slate-900 dark:bg-slate-900 light:bg-gradient-to-br light:from-blue-50 light:via-white light:to-purple-50">
                <Left />
                <Right />
              </div>
            ) : (
              <Navigate to="/signIn" />
            )
          }
        />
        <Route path="/signIn" element={authUser ? <Navigate to="/" /> : <SignIn />} />
        <Route path="/signUp" element={<SignUp />} />
      </Routes>
    </ThemeProvider>
  )
}

export default App
