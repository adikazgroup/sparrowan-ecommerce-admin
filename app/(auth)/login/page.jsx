"use client";

import Image from "next/image";
import { Suspense, useState } from "react";
import toast from "react-hot-toast";
import { signIn } from "next-auth/react";
import { Input } from "@/components/ui/input/Input";
import loginImg from "@/public/img/login/login2.png";
import { useRouter, useSearchParams } from "next/navigation";
import { Checkbox } from "@/components/ui/checkbox/Checkbox";
import { LuEye, LuEyeOff, LuMail, LuLock } from "react-icons/lu";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialValue = { email: "", password: "" };
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const redirectPath = searchParams.get("redirect") || "/";
  const [formValues, setFormValues] = useState(initialValue);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const loadingToast = toast.loading("Signing...");
    try {
      const result = await signIn("credentials", {
        email: formValues.email,
        password: formValues.password,
        redirect: false,
      });

      if (result?.error) {
        const errorMessage =
          result.error === "CredentialsSignin"
            ? "Invalid email or password"
            : result.error;
        toast.error(errorMessage, { id: "login-error" });
      } else if (result?.ok) {
        toast.dismiss(loadingToast);
        toast.success("Login successful");
        setFormValues(initialValue);
        setTimeout(() => {
          router.push(redirectPath);
        }, 1500);
      } else {
        toast.dismiss(loadingToast);
        toast.error("An unexpected error occurred", { id: "login-error" });
      }
    } catch (err) {
      toast.dismiss(loadingToast);
      toast.error("An unexpected error occurred", { id: "login-error2" });
    } finally {
      toast.dismiss(loadingToast);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-white dark:bg-darkPrimary p-5">
      <div className="w-1/2 h-full bg-white border border-gray-200 rounded-2xl center flex-col relative overflow-hidden">
        <div className="w-0 h-0 border-l-[100px] border-l-transparent border-r-[100px] border-r-transparent border-b-[1080px] border-b-primary opacity-50 blur-3xl rotate-[-150deg] absolute top-0 -right-0 "></div>
        <div className="w-0 h-0 border-l-[100px] border-l-transparent border-r-[100px] border-r-transparent border-b-[980px] border-b-primary opacity-70 blur-3xl rotate-[50deg] absolute -top-80 -left-0 "></div>
        <Image
          src={loginImg}
          alt="login"
          className="rounded-2xl w-full h-full object-cover"
        />
      </div>

      <div className="w-1/2 h-full center">
        <div className="max-w-md w-md mx-auto">
          <h1 className="text-xl font-semibold text-primary">
            Sparrowan<span className="text-secondary">X</span>
          </h1>
          <h1 className="text-3xl font-medium mt-5">Log in to your account</h1>
          <p className="text-[#B0B0B0] mt-2">
            Enter your email & password to login
          </p>

          <form
            className="space-y-6 mt-10"
            onSubmit={handleSubmit}
            autoComplete="on"
          >
            <Input
              type="email"
              className="h-12 border-gray-400"
              placeholder="Email Address"
              startIcon={<LuMail className="h-4 w-4" />}
              fullWidth
              required
              value={formValues.email}
              onValueChange={(value) =>
                setFormValues((prev) => ({ ...prev, email: value }))
              }
              error={
                formValues?.email && !formValues?.email?.includes("@")
                  ? "Please enter a valid email"
                  : ""
              }
              autoComplete={rememberMe ? "email" : "off"}
              name="email"
            />

            <div className="space-y-2.5">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                required
                className="h-12 border-gray-400"
                startIcon={<LuLock className="h-4 w-4" />}
                endIcon={
                  showPassword ? (
                    <LuEye
                      className="h-4 w-4 cursor-pointer"
                      onClick={() => setShowPassword(false)}
                    />
                  ) : (
                    <LuEyeOff
                      className="h-4 w-4 cursor-pointer"
                      onClick={() => setShowPassword(true)}
                    />
                  )
                }
                fullWidth
                value={formValues.password}
                onValueChange={(value) =>
                  setFormValues((prev) => ({ ...prev, password: value }))
                }
                autoComplete={rememberMe ? "current-password" : "off"}
                name="password"
              />

              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="remember-me"
                    size="sm"
                    checked={rememberMe}
                    onChange={() => setRememberMe(!rememberMe)}
                  />
                  <label
                    htmlFor="remember-me"
                    className="text-[13px] dark:text-[#B0B0B0] text-[#6D6D6D]"
                  >
                    Remember me
                  </label>
                </div>
                <a
                  href="/forgot-password"
                  className="text-[13px] text-black hover:text-[#5e92ca]"
                >
                  Forgot password?
                </a>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary text-white py-2.5 text-sm rounded hover:bg-[#0056b3] transition duration-200 mt-5 disabled:bg-[#6ea8e0] disabled:cursor-not-allowed relative overflow-hidden"
            >
              {isLoading ? (
                <span className="loader">Loading...</span>
              ) : (
                "Log In"
              )}
              <div className="w-0 h-0 border-l-[40px] border-l-transparent border-r-[40px] border-r-transparent border-b-[280px] border-b-white opacity-70 blur-xl rotate-[50deg] absolute -top-32 -right-0 "></div>
              <div className="w-0 h-0 border-l-[40px] border-l-transparent border-r-[40px] border-r-transparent border-b-[280px] border-b-white opacity-70 blur-xl rotate-[70deg] absolute -top-32 -left-5 "></div>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          Loading...
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
