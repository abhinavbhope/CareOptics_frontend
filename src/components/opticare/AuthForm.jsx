
"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { registerUser, loginUser, verifyOtp, sendOtp, forgotPassword, resetPassword } from '@/lib/api';
import { useRouter, useSearchParams } from 'next/navigation';
import { OtpInput } from '@/components/ui/otp-input';
import { STRONG_PASSWORD,PASSWORD_HELP } from '@/lib/passwordPolicy';

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(1, { message: "Password is required." }),
});

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  phone: z.string().min(10, "Phone must be at least 10 characters."),
  age: z.coerce.number().positive().int(),
  email: z.string().email("Invalid email address."),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .regex(STRONG_PASSWORD, PASSWORD_HELP),
  address: z.string().min(5, "Address must be at least 5 characters."),
});

const otpSchema = z.object({
    otp: z.string().min(6, { message: "Your one-time password must be 6 characters." }),
});

const emailSchema = z.object({
    email: z.string().email({ message: "Invalid email address." }),
});

const resetPasswordSchema = z.object({
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .regex(STRONG_PASSWORD, PASSWORD_HELP),
});

export function AuthForm({ onLoginSuccess }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const [authFlow, setAuthFlow] = useState('login'); // 'login', 'register', 'forgotPassword'
  const [flowStep, setFlowStep] = useState('details'); // 'details' -> 'otp' -> 'reset'
  const [flowData, setFlowData] = useState(null);

  const loginForm = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const registerForm = useForm({
  resolver: zodResolver(registerSchema),
  defaultValues: { 
    name: "",
    phone: "",
    age: "",       // or 0
    email: "",
    password: "",
    address: ""    // <--- ADD THIS
  },
});

  
  const emailForm = useForm({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: "" },
  });

  const otpForm = useForm({
      resolver: zodResolver(otpSchema),
      defaultValues: { otp: "" },
  });
  
  const resetPasswordForm = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { newPassword: "" },
});


  async function onLoginSubmit(values) {
    setIsLoading(true);
    try {
      const response = await loginUser(values);
      const { token, userId, username, role, phone } = response.data;
      localStorage.setItem('authToken', token);
      localStorage.setItem('userId', userId);
      localStorage.setItem('userEmail', values.email);
      localStorage.setItem('userName', username);
      localStorage.setItem('userRole', role);
      localStorage.setItem('userPhone', phone);
      
      toast({
        title: "Login Successful!",
        description: `Welcome back, ${username}!`,
      });

      const redirectUrl = searchParams.get('redirectUrl');
      
      if (redirectUrl) {
          router.push(redirectUrl);
      } else if (role === 'ADMIN') {
        router.push('/admin/dashboard');
      } else {
         if (onLoginSuccess) {
            onLoginSuccess();
         } else {
            router.push('/');
         }
      }

    } catch (error) {
       toast({
        variant: "destructive",
        title: "Login Failed",
        description: error.response?.data?.message || error.response?.data || "An error occurred. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function onRegisterDetailsSubmit(values) {
     setIsLoading(true);
     try {
      await sendOtp({ email: values.email });
      setFlowData(values);
      setFlowStep('otp');
      toast({
        title: "OTP Sent!",
        description: "We've sent a verification code to your email.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: error.response?.data?.message || "Could not send OTP. Please try again.",
      });
    } finally {
        setIsLoading(false);
    }
  }

  async function onOtpSubmit(values) {
      setIsLoading(true);
      try {
          await verifyOtp({ email: flowData.email, otp: values.otp });
          toast({
              title: "Email Verified!",
              description: "Finalizing your registration...",
          });
          
          await registerUser({ ...flowData });

          toast({
              title: "Registration Successful!",
              description: "Your account has been created. Please log in.",
          });

          setFlowStep('details');
          setActiveTab('login');
          loginForm.setValue('email', flowData.email);
          registerForm.reset();
          otpForm.reset();

      } catch (error) {
          toast({
              variant: "destructive",
              title: "An Error Occurred",
              description: error.response?.data?.message || error.response?.data || "Failed to register. Please try again.",
          });
      } finally {
          setIsLoading(false);
      }
  }

  async function onForgotPasswordEmailSubmit(values) {
    setIsLoading(true);
    try {
        await forgotPassword({ email: values.email });
        setFlowData(values);
        setFlowStep('otp');
        toast({
            title: "OTP Sent!",
            description: "If an account exists, we've sent a password reset code to your email.",
        });
    } catch (error) {
        toast({
            variant: "destructive",
            title: "Error",
            description: error.response?.data?.message || "Could not send OTP. Please try again.",
        });
    } finally {
        setIsLoading(false);
    }
  }
  
  async function onForgotPasswordOtpSubmit(values) {
    setIsLoading(true);
    try {
        await verifyOtp({ email: flowData.email, otp: values.otp });
        setFlowStep('reset');
        toast({ title: "OTP Verified!", description: "You can now reset your password." });
    } catch (error) {
         toast({
            variant: "destructive",
            title: "OTP Verification Failed",
            description: error.response?.data?.message || "Invalid or expired OTP. Please try again.",
        });
    } finally {
        setIsLoading(false);
    }
  }
  
  async function onResetPasswordSubmit(values) {
    setIsLoading(true);
    try {
        await resetPassword({ email: flowData.email, newPassword: values.newPassword });
        toast({
            title: "Password Reset Successful!",
            description: "You can now log in with your new password.",
        });
        // Reset to login screen
        setAuthFlow('login');
        setFlowStep('details');
        loginForm.setValue('email', flowData.email);
        setFlowData(null);
        resetPasswordForm.reset();
        otpForm.reset();

    } catch (error) {
        toast({
            variant: "destructive",
            title: "Password Reset Failed",
            description: error.response?.data?.message || "An error occurred. Please try again.",
        });
    } finally {
        setIsLoading(false);
    }
  }

  const handleTabChange = (newTab) => {
      setActiveTab(newTab);
      if (newTab === 'login') {
          setAuthFlow('login');
          setFlowStep('details');
      } else {
          setAuthFlow('register');
          setFlowStep('details');
      }
  }
  
  const cardVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.4, ease: "easeInOut" } },
  };

  const renderLogin = () => (
    <>
        <CardHeader>
            <CardTitle>Welcome Back!</CardTitle>
            <CardDescription>Enter your credentials to access your account.</CardDescription>
        </CardHeader>
        <CardContent>
            <Form {...loginForm}>
            <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                <FormField control={loginForm.control} name="email" render={({ field }) => (
                <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl><Input placeholder="you@example.com" {...field} disabled={isLoading} /></FormControl>
                    <FormMessage />
                </FormItem>
                )} />
                <FormField control={loginForm.control} name="password" render={({ field }) => (
                <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                    <div className="relative">
                        <Input type={showPassword ? "text" : "password"} placeholder="••••••••" {...field} disabled={isLoading} />
                        <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7" onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                    </div>
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )} />
                 <Button type="button" variant="link" className="p-0 h-auto" onClick={() => setAuthFlow('forgotPassword')}>
                    Forgot Password?
                </Button>
                <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Login
                </Button>
            </form>
            </Form>
        </CardContent>
    </>
  );

const renderRegister = () => (
  <>
    {flowStep === "details" && (
      <>
        <CardHeader>
          <CardTitle>Create an Account</CardTitle>
          <CardDescription>
            It's quick and easy. We'll send an OTP to your email for verification.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Form {...registerForm}>
            <form
              onSubmit={registerForm.handleSubmit(onRegisterDetailsSubmit)}
              className="space-y-4"
            >
              {/* ----- Full Name ----- */}
              <FormField
                control={registerForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* ----- Phone | Age | Address (2-column grid) ----- */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={registerForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="123-456-7890" {...field} disabled={isLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={registerForm.control}
                  name="age"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Age</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 25" {...field} disabled={isLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={registerForm.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input placeholder="123 Main Street" {...field} disabled={isLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* ----- Email ----- */}
              <FormField
                control={registerForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="you@example.com" {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* ----- Password (with live hint) ----- */}
              <FormField
                control={registerForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          {...field}
                          disabled={isLoading}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                          onClick={() => setShowPassword((s) => !s)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </FormControl>

                    {/*  OPTIONAL BUT NICE : live hint  */}
                    <p className="text-xs text-muted-foreground mt-1">{PASSWORD_HELP}</p>

                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* ----- Submit ----- */}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Send OTP
              </Button>
            </form>
          </Form>
        </CardContent>
      </>
    )}

    {/* ----------------  OTP STEP  ---------------- */}
    {flowStep === "otp" && (
      <>
        <CardHeader>
          <CardTitle>Verify Your Email</CardTitle>
          <CardDescription>
            Enter the 6-digit code sent to <strong>{flowData?.email}</strong>.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Form {...otpForm}>
            <form
              onSubmit={otpForm.handleSubmit(onOtpSubmit)}
              className="space-y-6"
            >
              <FormField
                control={otpForm.control}
                name="otp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>One-Time Password</FormLabel>
                    <FormControl>
                      <OtpInput
                        value={field.value}
                        onChange={field.onChange}
                        numInputs={6}
                        isDisabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Verify & Register
              </Button>
            </form>
          </Form>

          <Button
            variant="link"
            className="mt-4 w-full"
            onClick={() => setFlowStep("details")}
            disabled={isLoading}
          >
            Back to registration details
          </Button>
        </CardContent>
      </>
    )}
  </>
);
  
  const renderForgotPassword = () => (
    <>
      {flowStep === 'details' && (
        <>
          <CardHeader>
            <CardTitle>Forgot Password</CardTitle>
            <CardDescription>Enter your email to receive a password reset code.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...emailForm}>
              <form onSubmit={emailForm.handleSubmit(onForgotPasswordEmailSubmit)} className="space-y-4">
                <FormField control={emailForm.control} name="email" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl><Input placeholder="you@example.com" {...field} disabled={isLoading} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Send OTP
                </Button>
                 <Button variant="link" className="w-full" onClick={() => setAuthFlow('login')}>Back to Login</Button>
              </form>
            </Form>
          </CardContent>
        </>
      )}

      {flowStep === 'otp' && (
        <>
          <CardHeader>
            <CardTitle>Check Your Email</CardTitle>
            <CardDescription>Enter the 6-digit code sent to <strong>{flowData?.email}</strong>.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...otpForm}>
              <form onSubmit={otpForm.handleSubmit(onForgotPasswordOtpSubmit)} className="space-y-6">
                 <FormField control={otpForm.control} name="otp" render={({ field }) => (
                    <FormItem>
                    <FormLabel>One-Time Password</FormLabel>
                    <FormControl>
                        <OtpInput value={field.value} onChange={field.onChange} numInputs={6} isDisabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )} />
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Verify Code
                </Button>
              </form>
            </Form>
             <Button variant="link" className="mt-4 w-full" onClick={() => setFlowStep('details')}>Back to email entry</Button>
          </CardContent>
        </>
      )}

      {flowStep === 'reset' && (
        <>
          <CardHeader>
            <CardTitle>Reset Your Password</CardTitle>
            <CardDescription>Enter your new password below.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...resetPasswordForm}>
              <form onSubmit={resetPasswordForm.handleSubmit(onResetPasswordSubmit)} className="space-y-4">
                 <FormField control={resetPasswordForm.control} name="newPassword" render={({ field }) => (
                    <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <FormControl>
                        <div className="relative">
                            <Input type={showPassword ? "text" : "password"} placeholder="••••••••" {...field} disabled={isLoading}/>
                            <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7" onClick={() => setShowPassword(!showPassword)}>
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                        </div>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )} 
                />
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Set New Password
                </Button>
              </form>
            </Form>
          </CardContent>
        </>
      )}
    </>
  );


  return (
    <motion.div initial="hidden" animate="visible" variants={cardVariants}>
      <Card className="w-full max-w-md bg-card">
        {authFlow === 'login' && (
             <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="login">Login</TabsTrigger>
                    <TabsTrigger value="register">Register</TabsTrigger>
                </TabsList>
                <TabsContent value="login">{renderLogin()}</TabsContent>
                <TabsContent value="register">{renderRegister()}</TabsContent>
            </Tabs>
        )}
        {authFlow === 'register' && (
             <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="login">Login</TabsTrigger>
                    <TabsTrigger value="register">Register</TabsTrigger>
                </TabsList>
                <TabsContent value="login">{renderLogin()}</TabsContent>
                <TabsContent value="register">{renderRegister()}</TabsContent>
            </Tabs>
        )}
        {authFlow === 'forgotPassword' && renderForgotPassword()}
      </Card>
    </motion.div>
  );
}
