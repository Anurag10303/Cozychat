import { motion } from "framer-motion";
import { LogOut as LogOutIcon } from "lucide-react";
import { useSocketContext } from "../../context/SocketContext";
import useConversation from "../../zustand/userConveration";
import { useAuth } from "../../context/AuthProvider";
import Avatar from "../../components/ui/Avatar";

function LogOut() {
  const { socket } = useSocketContext();
  const { setSelectedConversation } = useConversation();
  const [authUser] = useAuth();

  const handleLogout = () => {
    localStorage.removeItem("RealChat"); // ✅ match the key used in SignIn
    setSelectedConversation(null);
    socket?.disconnect();
    window.location.href = "/login";
  };

  const displayName = authUser?.user?.fullName || "You";

  return (
    <div className="safe-bottom flex items-center gap-3 px-4 pt-3 sm:px-5">
      <Avatar name={displayName} src={authUser?.user?.avatar} size={38} online ringClass="border-elevated" />

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-fg">{displayName}</p>
        <p className="truncate text-xs text-muted">{authUser?.user?.email || "Active now"}</p>
      </div>

      <motion.button
        type="button"
        onClick={handleLogout}
        whileTap={{ scale: 0.92 }}
        title="Log out"
        aria-label="Log out"
        className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-muted transition-colors hover:bg-danger-soft hover:text-danger"
      >
        <LogOutIcon className="h-4 w-4" />
      </motion.button>
    </div>
  );
}

export default LogOut;
