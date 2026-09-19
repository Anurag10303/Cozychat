import { motion } from "framer-motion";
import { ArrowLeft, Lock, MoreVertical, Phone, Video } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import useConversation from "../../zustand/userConveration";
import { useSocketContext } from "../../context/SocketContext";
import Avatar from "../../components/ui/Avatar";

function HeaderButton({ icon: Icon, label, className = "" }) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.92 }}
      title={label}
      aria-label={label}
      className={`grid h-9 w-9 place-items-center rounded-xl text-muted transition-colors hover:bg-surface-2 hover:text-fg ${className}`}
    >
      <Icon className="h-[18px] w-[18px]" />
    </motion.button>
  );
}

function Chatuser() {
  const { selectedConversation, setSelectedConversation } = useConversation();
  const { onlineUser } = useSocketContext();
  const location = useLocation();
  const navigate = useNavigate();

  const isOnline =
    selectedConversation && onlineUser.map(String).includes(String(selectedConversation._id));

  const goBack = () => {
    // Pop the phone-only #chat entry when present so history stays tidy.
    if (location.hash === "#chat") navigate(-1);
    else setSelectedConversation(null);
  };

  return (
    <header className="safe-top z-10 shrink-0 border-b border-line bg-bar">
      <div className="flex h-16 items-center gap-2 px-2 sm:gap-3 sm:px-4 lg:px-6">
        <motion.button
          type="button"
          onClick={goBack}
          whileTap={{ scale: 0.9 }}
          aria-label="Back to chats"
          className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-fg hover:bg-surface-2 md:hidden"
        >
          <ArrowLeft className="h-5 w-5" />
        </motion.button>

        <Avatar
          name={selectedConversation?.fullName}
          src={selectedConversation?.avatar}
          size={40}
          online={isOnline}
          ringClass="border-elevated"
        />

        <div className="min-w-0 flex-1">
          <h2 className="truncate text-[0.9375rem] font-semibold tracking-[-0.01em] text-fg">
            {selectedConversation?.fullName || "Unknown"}
          </h2>
          <p className="flex items-center gap-1.5 truncate text-xs text-muted">
            {isOnline ? (
              <span className="font-medium text-success">Online</span>
            ) : (
              <span>Offline</span>
            )}
            <span className="hidden text-subtle sm:inline">·</span>
            <span className="hidden items-center gap-1 sm:inline-flex">
              <Lock className="h-3 w-3" /> End-to-end encrypted
            </span>
          </p>
        </div>

        <div className="flex items-center gap-0.5 sm:gap-1">
          <HeaderButton icon={Phone} label="Voice call" className="hidden xs:grid" />
          <HeaderButton icon={Video} label="Video call" className="hidden xs:grid" />
          <HeaderButton icon={MoreVertical} label="More options" />
        </div>
      </div>
    </header>
  );
}

export default Chatuser;
