"use client";

import React, { useEffect, useState, use, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";
import {
	ChevronLeft,
	MousePointer2,
	Calendar,
	QrCode,
	Settings,
	Trash2,
	BarChart3,
	Copy,
	LinkIcon,
	ChevronRight,
	Home,
	Plus,
	Search,
	LogOut,
	Download,
	ExternalLink,
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { NavItem } from "@/app/components/Navitems";
import { QRCodeSVG } from "qrcode.react";

export default function LinkDetailPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const resolvedParams = use(params);
	const id = resolvedParams.id;

	const router = useRouter();
	// save to png
	const qrRef = useRef<SVGSVGElement>(null);
	const [linkData, setLinkData] = useState<any>(null);
	const [clickStats, setClickStats] = useState<any[]>([]);
	const [totalClicks, setTotalClicks] = useState(0);
	const [isShowNavigation, setIsShowNavigation] = useState(false);
	const [isShowProfile, setIsShowProfile] = useState(false);
	const [showDeleteMenu, setShowDeleteMenu] = useState(false);
	const [userData, setUserData] = useState({ name: "User", email: "" });
	// qr color edits
	const [qrColor, setQrColor] = useState("#000000");

	const domain = "http://localhost:3000";

	const fetchAllData = useCallback(async () => {
		try {
			const token = localStorage.getItem("token");
			if (!token) return router.push("/login");

			const { data: link, error } = await supabase
				.from("links")
				.select("*")
				.eq("id", id)
				.single();

			if (error) throw error;

			if (link) {
				setLinkData(link);
				const response = await fetch(
					`${process.env.NEXT_PUBLIC_API_URL}/links/${link.short_code}/stats`,
					{
						headers: { Authorization: `Bearer ${token}` },
					},
				);

				if (response.ok) {
					const statsData = await response.json();
					setTotalClicks(statsData.total_clicks);
					setClickStats(statsData.click_times || []);
				}
			}
		} catch (err) {
			console.error("Sync error:", err);
		}
	}, [id, router]);

	useEffect(() => {
		const storeUser = localStorage.getItem("user_info");
		if (storeUser) setUserData(JSON.parse(storeUser));

		if (id) {
			fetchAllData();
			const interval = setInterval(fetchAllData, 5000);
			return () => clearInterval(interval);
		}
	}, [id, fetchAllData]);

	const handleDelete = async () => {
		if (confirm("Delete this QR permanently?")) {
			const { error } = await supabase.from("links").delete().eq("id", id);
			if (!error) {
				toast.success("Link deleted");
				router.push("/links");
			}
		}
	};

	const copyToClipboard = () => {
		const url = `${domain}/${linkData?.short_code}`;
		navigator.clipboard.writeText(url);
		toast.success("Copied to clipboard!");
	};

	// download qr to png file
	const downloadQRCode = () => {
		const svg = qrRef.current;
		if (!svg) return;

		const svgData = new XMLSerializer().serializeToString(svg);
		const canvas = document.createElement("canvas");
		const ctx = canvas.getContext("2d");
		const img = new Image();

		img.onload = () => {
			canvas.width = img.width + 40;
			canvas.height = img.height + 40;
			if (ctx) {
				ctx.fillStyle = "white";
				ctx.fillRect(0, 0, canvas.width, canvas.height);
				ctx.drawImage(img, 20, 20);
				const pngFile = canvas.toDataURL("image/png");
				const downloadLink = document.createElement("a");
				downloadLink.download = `QR-${linkData.short_code}.png`;
				downloadLink.href = pngFile;
				downloadLink.click();
			}
		};

		img.src = "data:image/svg+xml;base64," + btoa(svgData);
		toast.success("Download QR success");
	};

	const chartConfig = {
		type: "line",
		data: {
			labels: clickStats.map((_, i) => i + 1),
			datasets: [
				{
					data: clickStats.length > 0 ? clickStats.map((_, i) => i + 1) : [0],
					borderColor: "rgb(108, 92, 231)",
					backgroundColor: "rgba(108, 92, 231, 0.1)",
					fill: true,
					borderWidth: 2,
				},
			],
		},
		options: {
			legend: { display: false },
			scales: { xAxes: [{ display: false }], yAxes: [{ display: false }] },
		},
	};

	const chartUrl = `https://quickchart.io/chart?c=${encodeURIComponent(JSON.stringify(chartConfig))}&w=300&h=100`;

	useEffect(() => {
		const savedColor = localStorage.getItem(`qr_color_${id}`);
		if (savedColor) {
			setQrColor(savedColor);
		}
	}, [id]);

	const handleColorChange = (newColor: string) => {
		setQrColor(newColor);
		localStorage.setItem(`qr_color_${id}`, newColor);
		toast.success(`Colors have been updated`);
	};

	if (!linkData) {
		return (
			<div className="flex items-center justify-center min-h-screen bg-slate-50">
				<p className="animate-pulse font-medium text-slate-500">
					Syncing with server...
				</p>
			</div>
		);
	}

	return (
		<div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
			{/* sidebar */}
			<aside
				className={`fixed lg:relative z-50 bg-white border-r border-slate-200 h-screen transition-all duration-300 ${isShowNavigation ? "w-64" : "w-20"} overflow-hidden`}
			>
				<div className="flex flex-col h-full">
					<div
						className={`p-6 flex items-center ${isShowNavigation ? "justify-between" : "justify-center"}`}
					>
						<h1
							className={`text-2xl font-black text-[#6C5CE7] tracking-tighter ${!isShowNavigation ? "hidden" : "block"}`}
						>
							Link<span className="text-slate-400">Zip</span>
						</h1>
						<button
							onClick={() => setIsShowNavigation(!isShowNavigation)}
							className="p-1.5 rounded-xl bg-slate-100 hover:bg-[#6C5CE7] hover:text-white transition-colors"
						>
							{isShowNavigation ? (
								<ChevronLeft size={20} />
							) : (
								<ChevronRight size={20} />
							)}
						</button>
					</div>
					<nav className="flex-1 px-4 space-y-2">
						<Link href="/home">
							<button className="bg-[#6C5CE7] text-white w-full p-3 rounded-xl flex items-center justify-center gap-2 mb-6 hover:shadow-lg transition-all">
								<Plus size={20} /> {isShowNavigation && "Create New"}
							</button>
						</Link>
						<Link href="/home">
							<NavItem
								icon={<Home size={20} />}
								label="Dashboard"
								isOpen={isShowNavigation}
								active={false}
							/>
						</Link>
						<Link href="/links">
							<NavItem
								icon={<LinkIcon size={20} />}
								label="My Links"
								isOpen={isShowNavigation}
								active={true}
							/>
						</Link>
						<Link href="/qr-codes">
							<NavItem
								icon={<QrCode size={20} />}
								label="QR Codes"
								isOpen={isShowNavigation}
								active={false}
							/>
						</Link>
					</nav>
				</div>
			</aside>

			<main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
				{/* header nav */}
				<header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 shrink-0">
					<div className="relative flex-1 max-w-md">
						<Search
							className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
							size={18}
						/>
						<input
							type="text"
							placeholder="Search your links..."
							className="w-full pl-10 pr-4 py-2 bg-slate-100 rounded-full text-sm outline-none focus:ring-2 focus:ring-[#6C5CE7]/20"
						/>
					</div>
					<div className="flex items-center gap-4 ml-4">
						<div className="relative">
							<button
								onClick={() => setIsShowProfile(!isShowProfile)}
								className="w-10 h-10 rounded-full bg-[#6C5CE7] text-white flex items-center justify-center font-bold shadow-sm"
							>
								{userData.name[0].toUpperCase()}
							</button>
							{isShowProfile && (
								<div className="absolute right-0 mt-3 w-48 bg-white border rounded-2xl shadow-xl py-2 z-[60]">
									<div className="px-4 py-2 border-b text-xs text-slate-500 uppercase font-bold">
										Profile
									</div>
									<div className="px-4 py-2 text-sm font-medium truncate">
										{userData.email}
									</div>
									<button
										onClick={() => {
											localStorage.clear();
											router.push("/login");
										}}
										className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
									>
										<LogOut size={16} /> Sign Out
									</button>
								</div>
							)}
						</div>
					</div>
				</header>

				<div className="flex-1 overflow-y-auto p-4 lg:p-8">
					<div className="max-w-5xl mx-auto">
						<Link
							href="/qr-codes"
							className="flex items-center gap-2 text-slate-600 hover:text-indigo-600 mb-6 group w-fit"
						>
							<ChevronLeft
								size={18}
								className="group-hover:-translate-x-1 transition-transform"
							/>
							<span className="font-medium text-sm">Back to list</span>
						</Link>

						{/* main card */}
						<div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-8 flex flex-col md:flex-row gap-8 items-start">
							<div className="flex-1 min-w-0">
								<div className="space-y-4">
									<div className="flex items-center gap-3">
										<div className="p-2 bg-indigo-50 rounded-lg">
											<LinkIcon size={18} className="text-indigo-600" />
										</div>
										<div className="flex-1 min-w-0">
											<a
												href={linkData.original_url}
												target="_blank"
												className="text-slate-600 hover:text-indigo-600 text-sm truncate block"
											>
												{linkData.original_url}
											</a>
										</div>
									</div>

									<div className="flex items-center gap-3 group">
										<div className="p-2 bg-emerald-50 rounded-lg">
											<ExternalLink size={18} className="text-emerald-600" />
										</div>
										<div className="flex-1">
											<div className="flex items-center gap-2">
												<span className="text-indigo-600 font-bold text-lg">
													<Link href={`${domain}/${linkData.short_code}`}>
													{linkData.short_code}</Link>
												</span>
												<button
													onClick={copyToClipboard}
													className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors"
												>
													<Copy size={16} />
												</button>
											</div>
										</div>
									</div>

									<div className="flex items-center gap-6 pt-4 text-sm text-slate-400">
										<span className="flex items-center gap-1.5 font-medium">
											<Calendar size={16} />{" "}
											{new Date(linkData.created_at).toLocaleDateString(
												"en-US",
												{ month: "long", day: "numeric", year: "numeric" },
											)}
										</span>
										<span className="flex items-center gap-1.5 font-medium text-indigo-600">
											<MousePointer2 size={16} /> {totalClicks} Total Clicks
										</span>
									</div>
								</div>

								{/* action button */}
								<div className="flex items-center gap-3 mt-8">
									<button
										onClick={downloadQRCode}
										className="flex items-center gap-2 px-4 py-2 border-2 border-indigo-400 text-[#6C5CE7] rounded-xl font-bold text-sm hover:bg-[#6C5CE7]/5 transition-all"
									>
										<Download size={18} /> Export QR
									</button>
									<div className="relative ml-auto">
										<button
											onClick={() => setShowDeleteMenu(!showDeleteMenu)}
											className="p-2.5 hover:bg-slate-100 rounded-xl border border-slate-200"
										>
											<Settings size={20} className="text-slate-600" />
										</button>
										{showDeleteMenu && (
											<div className="absolute right-0 bottom-14 bg-white border border-slate-200 rounded-xl py-2 w-48 z-10 overflow-hidden">
												<button
													onClick={handleDelete}
													className="w-full text-left px-4 py-3 text-red-600 text-sm font-bold hover:bg-red-50 flex items-center gap-2"
												>
													<Trash2 size={18} /> Delete Link
												</button>
											</div>
										)}
									</div>
								</div>
							</div>

							<div className="w-full md:w-auto flex flex-col items-center gap-3">
								<div className="p-4 bg-white rounded-2xl border-2 border-slate-100 shadow-sm">
									<QRCodeSVG
										ref={qrRef}
										value={`${domain}/${linkData.short_code}`}
										size={180}
										level={"H"}
										includeMargin={false}
										fgColor={qrColor}
									/>
								</div>
								<p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ">
									Scan to visit
								</p>
							</div>
						</div>

						{/* Analytics Grid */}
						<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
							<div className="md:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
								<div className="flex items-center justify-between mb-6">
									<h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
										<BarChart3 size={20} className="text-indigo-600" /> Click
										Analytics
									</h2>
									<span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
										Performance
									</span>
								</div>
								<div className="w-full bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 flex items-center justify-center min-h-[250px]">
									<img
										src={chartUrl}
										alt="Analytics"
										className="w-full h-auto object-contain p-4"
									/>
								</div>
							</div>

							<div className="flex flex-col gap-6">
								<div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex-1">
									<h2 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-4">
										Total Engagement
									</h2>
									<div className="flex items-center gap-4">
										<div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl">
											<MousePointer2 size={24} />
										</div>
										<div>
											<p className="text-3xl font-black text-slate-900 leading-none">
												{totalClicks.toLocaleString()}
											</p>
											<p className="text-slate-500 text-xs mt-1 font-medium">
												Link Clicks
											</p>
										</div>
									</div>
								</div>

								<div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex-1">
									<h2 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-4">
										Latest Activity
									</h2>
									<div className="flex items-center gap-4">
										<div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl">
											<Calendar size={24} />
										</div>
										<div>
											<p className="text-lg font-bold text-slate-900 leading-tight">
												{clickStats.length > 0 ? "Active" : "No Clicks"}
											</p>
											<p className="text-slate-500 text-xs mt-1">
												{clickStats.length > 0
													? `Last: ${new Date(clickStats[clickStats.length - 1]).toLocaleTimeString()}`
													: "Ready for use"}
											</p>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</main>
		</div>
	);
}
