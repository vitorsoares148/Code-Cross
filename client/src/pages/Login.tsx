import { useState } from "react";
import { FaCode } from "react-icons/fa";
import { FiArrowRight, FiEye, FiEyeOff } from "react-icons/fi";

import { useAuth } from "../contexts/AuthContext";
import { cn } from "../utils/cn";

import {
  emailFormErrorMessages,
  ERROR_FORM,
  hasError,
  nameFormErrorMessages,
  passwordFormErrorMessages,
  validateEmail,
  validateName,
  validatePassword,
} from "../utils/authValidation";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const { login, register } = useAuth();

  const [isRegistering, setIsRegistering] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [usernameFormError, setUsernameFormError] = useState(ERROR_FORM.NONE);
  const [emailFormError, setEmailFormError] = useState(ERROR_FORM.NONE);
  const [passwordFormError, setPasswordFormError] = useState(ERROR_FORM.NONE);

  const navigate = useNavigate();

  const handleModeChange = () => {
    setIsRegistering((prev) => !prev);

    setForm((prev) => ({
      ...prev,
      email: "",
    }));

    setUsernameFormError(ERROR_FORM.NONE);
    setEmailFormError(ERROR_FORM.NONE);
    setPasswordFormError(ERROR_FORM.NONE);

    setShowPassword(false);
  };

  const handleUsernameError = (reset: boolean) => {
    if (reset) {
      setUsernameFormError(ERROR_FORM.NONE);
    } else {
      setUsernameFormError(validateName(form.username));
    }
  };

  const handleEmailError = (reset: boolean) => {
    if (reset) {
      setEmailFormError(ERROR_FORM.NONE);
    } else {
      setEmailFormError(validateEmail(form.email));
    }
  };

  const handlePasswordError = (reset: boolean) => {
    if (reset) {
      setPasswordFormError(ERROR_FORM.NONE);
    } else {
      setPasswordFormError(validatePassword(form.password));
    }
  };

  const validateRequiredFields = () => {
    let valid = true;

    if (form.username.length === 0) {
      setUsernameFormError(ERROR_FORM.REQUIRED);
      valid = false;
    }

    if (form.password.length === 0) {
      setPasswordFormError(ERROR_FORM.REQUIRED);
      valid = false;
    }

    if (isRegistering && form.email.length === 0) {
      setEmailFormError(ERROR_FORM.REQUIRED);
      valid = false;
    }

    return valid;
  };

  const isFormValid = () => {
    return (
      usernameFormError === ERROR_FORM.VALID &&
      passwordFormError === ERROR_FORM.VALID &&
      (!isRegistering || emailFormError === ERROR_FORM.VALID)
    );
  };

  const handleRegister = async () => {
    if (!isFormValid()) {
      validateRequiredFields();
      return;
    }

    const result = await register(form.username, form.email, form.password);

    if (result === "USERNAME_TAKEN") {
      setUsernameFormError(ERROR_FORM.INVALID);
    } else if (result === "EMAIL_TAKEN") {
      setEmailFormError(ERROR_FORM.INVALID);
    } else if (result === "TOO_MANY_REGISTER_ATTEMPTS") {
      setEmailFormError(ERROR_FORM.NOTHING);
      setUsernameFormError(ERROR_FORM.NOTHING);
      setPasswordFormError(ERROR_FORM.TOO_MANY_REGISTERS);
    } else if (result === "SUCCESS") {
      navigate("/home");
    }
  };

  const handleLogin = async () => {
    if (!isFormValid()) {
      validateRequiredFields();
      return;
    }

    const result = await login(form.username, form.password);

    if (result === "SUCCESS") {
      navigate("/home");
    } else if (result === "TOO_MANY_LOGIN_ATTEMPTS") {
      setUsernameFormError(ERROR_FORM.NOTHING);
      setPasswordFormError(ERROR_FORM.TOO_MANY_LOGIN_ATTEMPTS);
    } else {
      setUsernameFormError(ERROR_FORM.NOTHING);
      setPasswordFormError(ERROR_FORM.INVALID);
    }
  };

  const handleSubmit = async (event: React.SubmitEvent) => {
    event.preventDefault();

    if (loading) {
      return;
    }

    setLoading(true);

    try {
      if (isRegistering) {
        await handleRegister();
      } else {
        await handleLogin();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      className={cn(
        "relative flex min-h-screen items-center justify-center",
        "overflow-hidden px-5 text-white",
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute top-1/2 left-1/2",
          "size-150 -translate-x-1/2 -translate-y-1/2",
          "bg-sapphire-500/8 rounded-full blur-[120px]",
        )}
      />

      <section className="relative w-full max-w-105">
        <div className="mb-8 flex flex-col items-center">
          <div
            className={cn(
              "mb-5 flex size-13 items-center justify-center",
              "border-sapphire-400/20 rounded-2xl border",
              "bg-sapphire-400/10",
              "shadow-[0_0_35px_rgba(59,130,246,0.12)]",
            )}
          >
            <FaCode className="text-sapphire-400 text-xl" />
          </div>

          <h1 className="text-2xl font-semibold tracking-tight">Code Cross</h1>

          <p className="mt-2 text-sm text-white/40">Revisão de código com IA</p>
        </div>

        <div
          className={cn(
            "rounded-3xl border border-white/7",
            "bg-[#0b0f0d]/90 p-7",
            "shadow-2xl shadow-black/40",
            "backdrop-blur-xl",
          )}
        >
          <div className="mb-7">
            <h2 className="text-lg font-medium">
              {isRegistering ? "Crie sua conta" : "Bem-vindo de volta"}
            </h2>

            <p className="mt-1 text-sm text-white/35">
              {isRegistering
                ? "Crie uma conta para começar a revisar seu código."
                : "Entre para continuar com suas revisões."}
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="username"
                className="mb-2 block text-xs font-medium text-white/55"
              >
                Nome de usuário
              </label>

              <input
                id="username"
                type="text"
                autoComplete="username"
                value={form.username}
                maxLength={32}
                onChange={(event) => {
                  setForm((prev) => ({
                    ...prev,
                    username: event.target.value,
                  }));

                  handleUsernameError(true);
                }}
                onBlur={() => handleUsernameError(false)}
                placeholder="Seu nome de usuário"
                className={cn(
                  "h-12 w-full rounded-xl",
                  "border",
                  hasError(usernameFormError)
                    ? "border-red-400/50"
                    : "border-white/8",
                  "bg-white/2.5",
                  "px-4 text-sm text-white",
                  "outline-none",
                  "placeholder:text-white/20",
                  "transition",
                  "focus:border-sapphire-400/50",
                  "focus:bg-sapphire-400/2.5",
                  "focus:ring-sapphire-400/5 focus:ring-3",
                )}
              />

              {hasError(usernameFormError) && (
                <p className="mt-1 text-xs font-medium text-red-400">
                  {nameFormErrorMessages[usernameFormError]}
                </p>
              )}
            </div>

            <div
              className={cn(
                "grid transition-all duration-300",
                isRegistering
                  ? "grid-rows-[1fr] opacity-100"
                  : "grid-rows-[0fr] opacity-0",
              )}
            >
              <div className="overflow-hidden">
                <div className="mt-5">
                  <label
                    htmlFor="email"
                    className="mb-2 block text-xs font-medium text-white/55"
                  >
                    E-mail
                  </label>

                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    tabIndex={isRegistering ? 0 : -1}
                    value={form.email}
                    maxLength={255}
                    onChange={(event) => {
                      setForm((prev) => ({
                        ...prev,
                        email: event.target.value,
                      }));

                      handleEmailError(true);
                    }}
                    onBlur={() => handleEmailError(false)}
                    placeholder="voce@exemplo.com"
                    className={cn(
                      "h-12 w-full rounded-xl",
                      "border",
                      hasError(emailFormError)
                        ? "border-red-400/50"
                        : "border-white/8",
                      "bg-white/2.5",
                      "px-4 text-sm text-white",
                      "outline-none",
                      "placeholder:text-white/20",
                      "transition",
                      "focus:border-sapphire-400/50",
                      "focus:bg-sapphire-400/2.5",
                      "focus:ring-sapphire-400/5 focus:ring-3",
                    )}
                  />

                  {hasError(emailFormError) && (
                    <p className="mt-1 text-xs font-medium text-red-400">
                      {emailFormErrorMessages[emailFormError]}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="text-xs font-medium text-white/55"
                >
                  Senha
                </label>
              </div>

              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete={
                    isRegistering ? "new-password" : "current-password"
                  }
                  value={form.password}
                  maxLength={32}
                  onChange={(event) => {
                    setForm((prev) => ({
                      ...prev,
                      password: event.target.value,
                    }));

                    handlePasswordError(true);
                  }}
                  onBlur={() => handlePasswordError(false)}
                  placeholder="••••••••"
                  className={cn(
                    "h-12 w-full rounded-xl",
                    "border",
                    hasError(passwordFormError)
                      ? "border-red-400/50"
                      : "border-white/8",
                    "bg-white/2.5",
                    "px-4 pr-11 text-sm text-white",
                    "outline-none",
                    "placeholder:text-white/20",
                    "transition",
                    "focus:border-sapphire-400/50",
                    "focus:bg-sapphire-400/2.5",
                    "focus:ring-sapphire-400/5 focus:ring-3",
                  )}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className={cn(
                    "absolute top-1/2 right-3 -translate-y-1/2",
                    "cursor-pointer p-1",
                    "text-white/25",
                    "transition hover:text-white/60",
                  )}
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showPassword ? <FiEyeOff size={17} /> : <FiEye size={17} />}
                </button>
              </div>

              {hasError(passwordFormError) && (
                <p className="mt-1 text-xs font-medium text-red-400">
                  {passwordFormErrorMessages[passwordFormError]}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className={cn(
                "group mt-5 flex h-12 w-full items-center",
                "cursor-pointer justify-center gap-2 rounded-xl",
                "bg-sapphire-500",
                "text-sm font-semibold text-white",
                "shadow-[0_0_25px_rgba(59,130,246,0.12)]",
                "transition",
                "hover:bg-sapphire-400",
                "hover:shadow-[0_0_30px_rgba(59,130,246,0.2)]",
                "active:scale-[0.99]",
                loading && "cursor-not-allowed opacity-60",
              )}
            >
              {loading
                ? isRegistering
                  ? "Criando conta..."
                  : "Entrando..."
                : isRegistering
                  ? "Criar conta"
                  : "Entrar"}

              {!loading && (
                <FiArrowRight
                  className="transition-transform group-hover:translate-x-0.5"
                  size={17}
                />
              )}
            </button>
          </form>

          <p className="mt-7 text-center text-xs text-white/30">
            {isRegistering ? "Já tem uma conta?" : "Não tem uma conta?"}{" "}
            <button
              type="button"
              onClick={handleModeChange}
              className={cn(
                "cursor-pointer",
                "text-sapphire-400/80 font-medium",
                "hover:text-sapphire-400 transition",
              )}
            >
              {isRegistering ? "Entrar" : "Criar uma"}
            </button>
          </p>
        </div>

        <p className="mt-6 text-center text-[12px] text-white/15">
          Análise de código com IA para desenvolvedores
        </p>
      </section>
    </main>
  );
}
