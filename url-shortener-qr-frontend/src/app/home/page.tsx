"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
	ChevronRight,
	ChevronLeft,
	Home,
	Link as LinkIcon,
	QrCode,
	LogOut,
	Search,
	Plus,
	Share2,
	Copy,
	Menu,
	X,
} from "lucide-react";
import { NavItem } from "@/app/components/Navitems";
import toast from "react-hot-toast";
import Link from "next/link";
import { downloadQR, shareQRCode } from "@/lib/utils";

interface LinkResponse {
	id: string;
	short_code: string;
	original_url: string;
	short_url?: string;
	qr_code?: string;
}

interface UserData {
	name: string;
	email: string;
}

const domain = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export default function HomePage() {
	const [isLoadingAuth, setIsLoadingAuth] = useState(true);
	const [showNavigation, setShowNavigation] = useState(false);
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const [showProfile, setShowProfile] = useState(false);

	const [originalURL, setOriginalURL] = useState("");
	const [customAlias, setCustomAlias] = useState("");
	const [loading, setLoading] = useState(false);
	const [shortedLink, setShortedLink] = useState<LinkResponse | null>(null);
	const [generateQR, setGenerateQR] = useState(false);

	const [userData, setUserData] = useState<UserData | null>(null);

	const router = useRouter();

	useEffect(() => {
        const token = localStorage.getItem("token");
        const savedUser = localStorage.getItem("user_info");

        if (!token) {
            router.replace("/login");
        } else {
            if (savedUser) {
                setUserData(JSON.parse(savedUser));
            }
            setIsLoadingAuth(false);
        }
    }, [router]);

	if (isLoadingAuth) return <p>Loading...</p>;

	const handleCreateLink = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);

		const token = localStorage.getItem("token");

		try {
			const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/links`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({
					originalUrl: originalURL,
					customAlias: customAlias,
					generateQr: generateQR,
				}),
			});

			const result = await response.json();

			if (!response.ok) {
				throw new Error(result.message || `Failed to make a link`);
			}

			setShortedLink(result);
			toast.success(`Link ready to use!`);
		} catch (error: any) {
			toast.error(error.message || "Something went wrong");
		} finally {
			setLoading(false);
		}
	};

	const handleLogOut = async () => {
		localStorage.removeItem("token");
		toast.success("Logged out successfully");
		router.push("/login");
	};

	return (
		<div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
			<aside
				className={`hidden lg:flex flex-col bg-white border-r border-slate-200 transition-all duration-300 ease-in-out ${showNavigation ? "w-64" : "w-20"}`}
			>
				<div className="p-6 flex items-center justify-between">
					{showNavigation && (
						<h1 className="text-2xl font-black text-[#6C5CE7] tracking-tighter transition-opacity">
							Link<span className="text-slate-400">Zip</span>
						</h1>
					)}
					<button
						onClick={() => setShowNavigation(!showNavigation)}
						className="p-1.5 rounded-xl bg-slate-100 hover:bg-[#6C5CE7] hover:text-white transition-colors"
					>
						{showNavigation ? (
							<ChevronLeft size={20} />
						) : (
							<ChevronRight size={20} />
						)}
					</button>
				</div>

				<nav className="flex-1 px-4 space-y-2 mt-5">
					<button
						className={`bg-[#6C5CE7] hover:bg-[#5b4cc4] text-white w-full p-2.5 rounded-xl flex items-center justify-center transition-all shadow-md shadow-[#6C5CE7]/20`}
					>
						{showNavigation ? "Create New" : <Plus size={20} />}
					</button>
					<Link href="/home">
						<NavItem
							icon={<Home size={20} />}
							label="Home"
							isOpen={showNavigation}
							active={true}
						/>
					</Link>
					<Link href="/links">
						<NavItem
							icon={<LinkIcon size={20} />}
							label="Links"
							isOpen={showNavigation}
							active={false}
						/>
					</Link>
					<Link href="/qr-codes">
						<NavItem
							icon={<QrCode size={20} />}
							label="QR Codes"
							isOpen={showNavigation}
							active={false}
						/>
					</Link>
				</nav>
			</aside>

			{/* main section */}
			<main className="flex-1 flex flex-col min-w-0 overflow-hidden">

				{/* navbar */}
				<header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8">
					<div className="flex items-center gap-4">
						<button
							onClick={() => setMobileMenuOpen(true)}
							className="lg:hidden p-2 hover:bg-slate-100 rounded-lg"
						>
							<Menu size={24} />
						</button>
						<div className="relative w-48 md:w-96 hidden sm:block">
							<Search
								className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
								size={18}
							/>
							<input
								type="text"
								placeholder="Search links..."
								className="w-full pl-10 pr-4 py-2 bg-slate-100 rounded-full text-sm outline-none focus:ring-2 focus:ring-[#6C5CE7]/20"
							/>
						</div>
					</div>

					{/* user info */}
					<div className="relative">
						<button
							onClick={() => setShowProfile(!showProfile)}
							className="flex items-center gap-2 p-1.5 rounded-full hover:bg-slate-100 transition border border-transparent hover:border-slate-200"
						>
							<div className="w-8 h-8 rounded-full bg-[#6C5CE7] flex items-center justify-center text-white font-bold text-xs">
								{userData?.name?.charAt(0).toUpperCase() || "U"}
							</div>
							<span className="text-sm font-semibold text-slate-700 hidden md:block">
								{userData?.email || "user@gmail.com"}
							</span>
						</button>

						{showProfile && (
							<div className="absolute right-0 mt-3 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl py-3 z-50">
								<div className="px-5 py-3 border-b border-slate-100 mb-2">
									<p className="text-sm font-bold text-slate-900 truncate">
										{userData?.name || "Loading..."}
									</p>
									<p className="text-xs text-slate-500 truncate">
										{userData?.email || "email@example.com"}
									</p>
								</div>
								<button
									onClick={handleLogOut}
									className="w-full text-left px-5 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
								>
									<LogOut size={16} /> Sign Out
								</button>
							</div>
						)}
					</div>
				</header>

				{/* content quick create */}
				<div className="p-4 md:p-8 overflow-y-auto">
					<div className="max-w-5xl mx-auto">
						<header className="mb-8">
							<h2 className="text-2xl md:text-3xl font-black text-slate-800">
								Hello, {userData?.name?.split(" ")[0] || "User"}!
							</h2>
							<p className="text-slate-500">
								Let's create something short and impactful today.
							</p>
						</header>

						<div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

							{/* form card */}
							<form
								onSubmit={handleCreateLink}
								className={`${shortedLink ? "lg:col-span-7" : "lg:col-span-12"} bg-white rounded-3xl shadow-sm border border-slate-200 p-6 md:p-8 transition-all`}
							>
								<div className="flex items-center gap-3 mb-8">
									<div className="p-2.5 bg-[#6C5CE7]/10 rounded-xl text-[#6C5CE7]">
										<Plus size={22} />
									</div>
									<h3 className="text-xl font-bold">Quick Create</h3>
								</div>

								<div className="space-y-6">
									<div className="space-y-2">
										<label className="text-sm font-bold text-slate-700">
											Destination URL
										</label>
										<input
											type="url"
											required
											value={originalURL}
											onChange={(e) => setOriginalURL(e.target.value)}
											placeholder="https://very-long-link.com/your-destination"
											className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-[#6C5CE7] outline-none transition"
										/>
									</div>

									<div className="space-y-2">
										<label className="text-sm font-bold text-slate-700">
											Custom Alias (Optional)
										</label>
										<input
											type="text"
											value={customAlias}
											onChange={(e) =>
												setCustomAlias(e.target.value.replace(/\s/g, ""))
											}
											placeholder="e.g: my-promo"
											className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-[#6C5CE7] outline-none transition"
										/>
									</div>

									<label className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-300 cursor-pointer hover:bg-slate-100 transition">
										<input
											type="checkbox"
											checked={generateQR}
											onChange={(e) => setGenerateQR(e.target.checked)}
											className="w-5 h-5 accent-[#6C5CE7] rounded"
										/>
										<span className="text-sm font-medium text-slate-600">
											Generate QR Code for this link
										</span>
									</label>

									<button
										type="submit"
										disabled={loading}
										className="w-full bg-[#6C5CE7] hover:bg-[#5b4cc4] disabled:bg-slate-300 text-white font-bold py-4 rounded-2xl shadow-lg shadow-[#6C5CE7]/30 transition active:scale-95"
									>
										{loading ? "Creating..." : "Generate Link"}
									</button>
								</div>
							</form>

							{/* output from generate */}
							{shortedLink && (
								<div className="lg:col-span-5 bg-white p-6 md:p-8 rounded-3xl border-2 border-[#6C5CE7] shadow-xl shadow-[#6C5CE7]/10 flex flex-col items-center animate-in fade-in slide-in-from-right-4 duration-500">
									<div className="bg-[#6C5CE7] text-white text-[10px] uppercase tracking-widest font-black px-3 py-1 rounded-full mb-6">
										Link ready!
									</div>

									{generateQR && (
										<div className="mb-6 p-4 bg-slate-50 rounded-3xl border border-slate-100 shadow-inner">
											<img
												src={`https://quickchart.io/qr?size=200x200&text=${domain}/${shortedLink.short_code}`}
												alt="QR Code"
												className="w-32 h-32 md:w-40 md:h-40 object-contain"
											/>
										</div>
									)}

									<div className="w-full bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-8 group relative overflow-hidden">
										<p className="text-xs font-bold text-slate-400 uppercase mb-1">
											Your short link
										</p>
										<p className="text-lg font-bold text-[#6C5CE7] break-all font-mono">
											{`${domain.replace("http://", "")}/${shortedLink.short_code}`}
										</p>
									</div>

									<div className="grid grid-cols-1 w-full gap-3">
										<button
											onClick={() => {
												navigator.clipboard.writeText(
													`${domain}/${shortedLink.short_code}`,
												);
												toast.success("Copied!");
											}}
											className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-[#6C5CE7] text-white rounded-xl font-bold hover:bg-[#5b4cc4] transition shadow-md shadow-[#6C5CE7]/20"
										>
											<Copy size={18} /> Copy Link
										</button>

										<div className="flex gap-2">
											{generateQR && (
												<>
													<button
														onClick={() =>
															downloadQR(
																`${domain}/${shortedLink.short_code}`,
																shortedLink.short_code,
															)
														}
														className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition"
													>
														<QrCode size={18} /> PNG
													</button>
													<button
														onClick={() =>
															shareQRCode(
																`${domain}/${shortedLink.short_code}`,
																shortedLink.short_code,
															)
														}
														className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition"
													>
														<Share2 size={18} /> Share
													</button>
												</>
											)}
										</div>
									</div>
								</div>
							)}
						</div>
					</div>
				</div>
			</main>

			{/* for mobile view */}
			{mobileMenuOpen && (
				<div className="fixed inset-0 z-[60] flex">
					<div
						className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm"
						onClick={() => setMobileMenuOpen(false)}
					/>
					<div className="relative w-72 bg-white h-full p-6 shadow-2xl flex flex-col">
						<div className="flex items-center justify-between mb-10">
							<h1 className="text-2xl font-black text-[#6C5CE7]">LinkZip</h1>
							<button onClick={() => setMobileMenuOpen(false)} className="p-2">
								<X />
							</button>
						</div>
						<nav className="space-y-4">
							<Link href="/home" onClick={() => setMobileMenuOpen(false)}>
								<div className="flex items-center gap-4 p-3 bg-[#6C5CE7]/10 text-[#6C5CE7] rounded-xl font-bold">
									<Home size={20} /> Home
								</div>
							</Link>
							<Link href="/links" onClick={() => setMobileMenuOpen(false)}>
								<div className="flex items-center gap-4 p-3 bg-[#6C5CE7]/10 text-[#6C5CE7] rounded-xl font-bold">
									<LinkIcon size={20} /> Link
								</div>
							</Link>
							<Link href="/home" onClick={() => setMobileMenuOpen(false)}>
								<div className="flex items-center gap-4 p-3 bg-[#6C5CE7]/10 text-[#6C5CE7] rounded-xl font-bold">
									<QrCode size={20} /> QR Code
								</div>
							</Link>
						</nav>
					</div>
				</div>
			)}
		</div>
	);
}
