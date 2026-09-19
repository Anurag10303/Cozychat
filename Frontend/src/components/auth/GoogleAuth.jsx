import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import toast from "react-hot-toast";
import { KeyRound, Lock, ShieldCheck } from "lucide-react";
import BASE_URL from "../../config";
import { useAuth } from "../../context/AuthProvider";
import { useE2EE } from "../../context/E2EEContext";
import { useTheme } from "../../context/ThemeContext";
import {
  createKeyPairWithBackup,
  localKeysMatch,
  restoreKeyPairFromBackup,
  storeKeyPair,
} from "../../utils/crypto";
import {
  getGoogleClientId,
  releaseGoogleIdentity,
  setupGoogleIdentity,
} from "../../lib/googleIdentity";
import { EASE } from "../../lib/motion";
import Field from "./Field";
import Button from "../ui/Button";

const MIN_PASSPHRASE = 8;

async function api(path, token, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    credentials: "include",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Request failed. Please try again.");
  return data;
}

/* ───────────────────── Passphrase dialog ───────────────────── */
function PassphraseDialog({ session, mode, busy, error, onSubmit, onCancel, onReset }) {
  const [value, setValue] = useState("");
  const [confirm, setConfirm] = useState("");
  const [localError, setLocalError] = useState("");
  const creating = mode === "create";
  const usesAccountPassword = !creating && session?.hasPassword;

  useEffect(() => {
    setValue("");
    setConfirm("");
    setLocalError("");
  }, [mode]);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && !busy && onCancel();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [busy, onCancel]);

  const submit = (e) => {
    e.preventDefault();
    if (creating) {
      if (value.length < MIN_PASSPHRASE) return setLocalError(`Use at least ${MIN_PASSPHRASE} characters.`);
      if (value !== confirm) return setLocalError("Passphrases don't match.");
    }
    setLocalError("");
    onSubmit(value);
  };

  const firstName = session?.user?.fullName?.split(" ")[0];
  const shownError = localError || error;

  return createPortal(
    <motion.div
      className="fixed inset-0 z-[90] flex items-end justify-center bg-scrim p-0 backdrop-blur-sm sm:items-center sm:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="passphrase-title"
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.98 }}
        transition={{ duration: 0.3, ease: EASE }}
        className="safe-bottom w-full max-w-md rounded-t-3xl border border-line bg-elevated p-6 shadow-float sm:rounded-3xl sm:p-8"
      >
        <div className="mb-5 grid h-12 w-12 place-items-center rounded-2xl brand-gradient text-white shadow-accent">
          {creating ? <ShieldCheck className="h-5 w-5" /> : <KeyRound className="h-5 w-5" />}
        </div>
        <h2 id="passphrase-title" className="text-xl font-semibold tracking-[-0.02em] text-fg">
          {creating
            ? `Protect your messages${firstName ? `, ${firstName}` : ""}`
            : "Unlock your encrypted messages"}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          {creating
            ? "Create an encryption passphrase. It secures your message keys so only you can read your chats. You'll need it when you sign in on a new device. We can't recover it for you."
            : usesAccountPassword
              ? "Enter your CozyChat account password. It protects your encryption keys on this new device."
              : "Enter the encryption passphrase you created. It's only needed on a new device or browser."}
        </p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <Field
            label={usesAccountPassword ? "Account password" : "Encryption passphrase"}
            icon={Lock}
            type="password"
            autoComplete={creating ? "new-password" : "current-password"}
            autoFocus
            required
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={creating ? `At least ${MIN_PASSPHRASE} characters` : "Enter passphrase"}
          />
          {creating && (
            <Field
              label="Confirm passphrase"
              icon={Lock}
              type="password"
              autoComplete="new-password"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Repeat passphrase"
            />
          )}

          <AnimatePresence>
            {shownError && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                role="alert"
                className="text-[13px] text-danger"
              >
                {shownError}
              </motion.p>
            )}
          </AnimatePresence>

          <Button type="submit" size="lg" loading={busy} disabled={busy} className="w-full">
            {creating ? "Secure & continue" : "Unlock"}
          </Button>
          <div className="flex items-center justify-between gap-3 text-[13px]">
            <button
              type="button"
              onClick={onCancel}
              disabled={busy}
              className="font-medium text-muted hover:text-fg disabled:opacity-50"
            >
              Cancel
            </button>
            {!creating && (
              <button
                type="button"
                onClick={onReset}
                disabled={busy}
                className="font-medium text-accent-text hover:underline disabled:opacity-50"
              >
                Forgot it? Start fresh
              </button>
            )}
          </div>
        </form>
      </motion.div>
    </motion.div>,
    document.body,
  );
}

/* ───────────────────── Google button + flow ───────────────────── */
export default function GoogleAuth({ mode = "signin" }) {
  const [, setAuthUser] = useAuth();
  const { bootstrapE2EE } = useE2EE();
  const { theme } = useTheme();
  const navigate = useNavigate();

  const buttonRef = useRef(null);
  const [clientId, setClientId] = useState(null); // null = resolving, "" = not configured
  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [session, setSession] = useState(null); // { token, user, hasKeyBackup, hasPassword }
  const [keyMode, setKeyMode] = useState(null); // "create" | "unlock" | null
  const [busy, setBusy] = useState(false);
  const [keyError, setKeyError] = useState("");

  // Persist the session and open the app. Called only once keys are in place.
  const complete = useCallback(
    async (s, passphrase) => {
      localStorage.setItem("RealChat", JSON.stringify({ token: s.token, user: s.user }));
      await bootstrapE2EE(passphrase ?? ""); // keys already in IndexedDB → uploads public key
      setAuthUser({ token: s.token, user: s.user });
      toast.success(s.isNewUser ? "Welcome to CozyChat!" : "Signed in with Google");
      navigate("/", { replace: true });
    },
    [bootstrapE2EE, setAuthUser, navigate],
  );

  const handleCredential = useCallback(
    async ({ credential }) => {
      if (!credential) return;
      setVerifying(true);
      try {
        const data = await api("/user/google", null, {
          method: "POST",
          body: JSON.stringify({ credential }),
        });
        const s = {
          token: data.token,
          user: data.user,
          isNewUser: data.isNewUser,
          hasKeyBackup: data.hasKeyBackup,
          hasPassword: data.hasPassword,
        };

        // Same device as before? Skip the passphrase entirely.
        if (s.hasKeyBackup) {
          const { publicKey } = await api(`/user/public-key/${s.user._id}`, s.token).catch(() => ({}));
          if (await localKeysMatch(publicKey)) {
            await complete(s);
            return;
          }
        }

        setSession(s);
        setKeyError("");
        setKeyMode(s.hasKeyBackup ? "unlock" : "create");
      } catch (err) {
        toast.error(err.message || "Google sign-in failed");
      } finally {
        setVerifying(false);
      }
    },
    [complete],
  );

  useEffect(() => {
    let active = true;
    getGoogleClientId().then((id) => active && setClientId(id));
    return () => {
      active = false;
    };
  }, []);

  // Load GIS and (re)render the official button to match theme and width.
  useEffect(() => {
    if (!clientId) return;
    let cancelled = false;
    let observer;

    const render = (google) => {
      const el = buttonRef.current;
      if (!el || cancelled) return;
      const width = Math.max(200, Math.min(400, Math.floor(el.getBoundingClientRect().width)));
      el.innerHTML = "";
      google.accounts.id.renderButton(el, {
        type: "standard",
        theme: theme === "dark" ? "filled_black" : "outline",
        size: "large",
        shape: "rectangular",
        text: mode === "signup" ? "signup_with" : "continue_with",
        logo_alignment: "center",
        width,
      });
    };

    setupGoogleIdentity(clientId, handleCredential)
      .then((google) => {
        if (cancelled) return;
        render(google);
        setReady(true);
        let lastWidth = buttonRef.current?.offsetWidth;
        observer = new ResizeObserver(() => {
          const w = buttonRef.current?.offsetWidth;
          if (w && Math.abs(w - lastWidth) > 8) {
            lastWidth = w;
            render(google);
          }
        });
        if (buttonRef.current) observer.observe(buttonRef.current);
      })
      .catch((err) => !cancelled && setLoadError(err.message));

    return () => {
      cancelled = true;
      observer?.disconnect();
      releaseGoogleIdentity(handleCredential);
    };
  }, [clientId, theme, mode, handleCredential]);

  const submitPassphrase = async (passphrase) => {
    if (!session) return;
    setBusy(true);
    setKeyError("");
    const { token, user } = session;
    try {
      if (keyMode === "unlock") {
        const { encryptedPrivateKey } = await api("/user/key-backup", token);
        if (!encryptedPrivateKey) throw new Error("No key backup found. Please start fresh.");
        try {
          await restoreKeyPairFromBackup(encryptedPrivateKey, passphrase, user._id);
        } catch {
          throw new Error(session.hasPassword ? "Incorrect password." : "Incorrect passphrase.");
        }
      } else {
        const { keyPair, encryptedPrivateKey } = await createKeyPairWithBackup(passphrase, user._id);
        await api("/user/key-backup", token, {
          method: "POST",
          body: JSON.stringify({ encryptedPrivateKey }),
        });
        await storeKeyPair(keyPair);
      }
      await complete(session, passphrase);
      setKeyMode(null);
      setSession(null);
    } catch (err) {
      setKeyError(err.message || "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const cancel = async () => {
    setKeyMode(null);
    setSession(null);
    setKeyError("");
    // The server already set a session cookie; clear it since sign-in wasn't completed.
    fetch(`${BASE_URL}/user/logout`, { method: "POST", credentials: "include" }).catch(() => {});
  };

  const startFresh = () => {
    const ok = window.confirm(
      "Start fresh with new encryption keys?\n\nMessages encrypted with your old keys will no longer be readable on any device.",
    );
    if (ok) {
      setKeyError("");
      setKeyMode("create");
    }
  };

  // Resolving or not configured → render nothing; the email form works as before.
  if (!clientId) return null;

  return (
    <motion.div
      className="mb-6"
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      transition={{ duration: 0.3, ease: EASE }}
    >
      <div className="relative flex min-h-11 items-center justify-center">
        {!ready && !loadError && <div className="skeleton absolute inset-0 rounded-xl" aria-hidden="true" />}
        <div
          ref={buttonRef}
          className={`flex w-full justify-center transition-opacity duration-300 ${
            ready ? "opacity-100" : "opacity-0"
          } ${verifying ? "pointer-events-none opacity-50" : ""}`}
          aria-busy={verifying}
        />
        {verifying && (
          <span className="absolute inset-0 grid place-items-center">
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-line-strong border-t-accent" />
          </span>
        )}
      </div>
      {loadError && <p className="mt-2 text-center text-xs text-danger">{loadError}</p>}

      <div className="mt-6 flex items-center gap-3 text-xs text-subtle">
        <span className="h-px flex-1 bg-line" />
        or continue with email
        <span className="h-px flex-1 bg-line" />
      </div>

      <AnimatePresence>
        {keyMode && (
          <PassphraseDialog
            key={keyMode}
            session={session}
            mode={keyMode}
            busy={busy}
            error={keyError}
            onSubmit={submitPassphrase}
            onCancel={cancel}
            onReset={startFresh}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
