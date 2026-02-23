"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const domain = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
const API_BASE_URL =
	process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export default function RegisterPage() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [loading, setLoading] = useState(false);
	const router = useRouter();

	const handleRegister = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);

		try {
			const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					email,
					password,
				}),
			});

			const result = await response.json();
			if (!response.ok) {
				throw new Error(result.message || `Failed to regist account`);
			}

			toast.success("Registration account successfully!");
			router.push("/login");
		} catch (error: any) {
			toast.error(error.message || `Something went wrong during register`);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="flex min-h-screen font-sans bg-gray-200">
			{/*  left-side form section */}
			<div className="w-full lg:w-[40%] flex flex-col justify-center px-6 md:px-16 lg:px-20 bg-white shadow-xl">
				<div className="mb-10">
					{/* logo */}
					<h1 className="text-3xl font-black text-[#6C5CE7] tracking-tighter cursor-pointer">
						Link<span className="text-gray-700">Zip</span>
					</h1>
				</div>

				<div className="max-w-md w-full lg:mx-0 mx-auto">
					<h2 className="text-3xl md:text-4xl font-black leading-tight text-[#273132] mb-2">
						Create an account
					</h2>
					<p className="text-slate-400 text-lg md:text-xl mb-8 md:mb-10">
						Join the world's leading URL shortener.
					</p>

					<form onSubmit={handleRegister} className="space-y-5">
						<div>
							<label className="block text-xs font-bold uppercase text-gray-600 mb-1">
								Email
							</label>
							<input
								type="email"
								placeholder="Email address"
								className="w-full p-3 border text-gray-400 border-gray-300 rounded focus:ring-2 focus:ring-[#6C5CE7]outline-none transition placeholder:text-gray-400"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								required
							/>
						</div>

						{/* input password */}
						<div>
							<label className="block text-xs font-bold uppercase text-gray-600 mb-1">
								Password
							</label>
							<div className="relative">
								<input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Password"
                                    className="w-full p-3 text-gray-400 pr-12 border border-gray-300 rounded focus:ring-2 focus:ring-[#6C5CE7] outline-none transition placeholder:text-gray-400"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
								<button
									type="button"
									onClick={() => setShowPassword((prev) => !prev)}
									className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#6C5CE7] transition"
								>
									{showPassword ? (
										<svg
											xmlns="http://www.w3.org/2000/svg"
											className="h-5 w-5"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-5-10-7s4.477-7 10-7c1.284 0 2.509.27 3.625.763M15 12a3 3 0 11-6 0 3 3 0 016 0z"
											/>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M3 3l18 18"
											/>
										</svg>
									) : (
										<svg
											xmlns="http://www.w3.org/2000/svg"
											className="h-5 w-5"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
											/>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
											/>
										</svg>
									)}
								</button>
							</div>
						</div>

						<button
							type="submit"
							disabled={loading}
							className={`w-full font-bold py-3 rounded text-lg transition duration-300 shadow-md flex justify-center items-center ${
								loading
									? "bg-gray-400 cursor-not-allowed text-gray-200"
									: "bg-[#6C5CE7] hover:bg-[#5A4AD1] text-white"
							}`}
						>
							{loading ? (
								<div className="flex items-center gap-2">
									<svg
										className="animate-spin h-5 w-5 text-white"
										xmlns="http://www.w3.org/2000/svg"
										fill="none"
										viewBox="0 0 24 24"
									>
										<circle
											className="opacity-25"
											cx="12"
											cy="12"
											r="10"
											stroke="currentColor"
											strokeWidth="4"
										></circle>
										<path
											className="opacity-75"
											fill="currentColor"
											d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
										></path>
									</svg>
									<span>Processing...</span>
								</div>
							) : (
								"Create Account"
							)}
						</button>
					</form>

					<div className="mt-8 text-sm text-gray-600 text-center lg:text-left">
						Already have an account?{" "}
						<a
							href="/login"
							className="text-[#6C5CE7] font-bold hover:underline"
						>
							Log in
						</a>
					</div>
				</div>
			</div>

			{/* right side for picture and words */}
			<div className="hidden lg:flex lg:w-[60%] bg-[#f4f6f8] items-center justify-center p-12">
				<div className="max-w-xl text-center">
					{/* picture rigth side */}
					<img
						style={{ width: "300px" }}
						src="https://images.unsplash.com/vector-1762336615091-205fc9cf182e?q=80&w=880&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
						alt="Dashboard Preview"
						className="rounded-xl shadow-2xl mb-8 border border-gray-200 mx-auto w-[300px] md:w-[400px]"
					/>
					<h3 className="text-2xl font-bold text-[#273132] mb-4">
						Shorten links, expand reach.
					</h3>
					<p className="text-gray-600 leading-relaxed">
						Create a link that reflects your identity.
					</p>
				</div>
			</div>
		</div>
	);
}
