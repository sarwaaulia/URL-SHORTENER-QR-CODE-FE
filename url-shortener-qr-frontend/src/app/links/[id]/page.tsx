"use client";

import React, { useEffect, useState, use, useCallback } from "react";
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
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { NavItem } from "@/app/components/Navitems";

const domain = "http://localhost:3000";

export default function LinkDetailPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const resolvedParams = use(params);
	const id = resolvedParams.id;

	const router = useRouter();
	const [linkData, setLinkData] = useState<any>(null);
	const [clickStats, setClickStats] = useState<any[]>([]);
	const [totalClicks, setTotalClicks] = useState(0);
	const [isShowNavigation, setIsShowNavigation] = useState(false);
	const [isShowProfile, setIsShowProfile] = useState(false);
	const [showDeleteMenu, setShowDeleteMenu] = useState(false);
	const [userData, setUserData] = useState({ name: "User", email: "" });

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

				// fetch stats from API
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
		if (confirm("Delete this link permanently?")) {
			const { error } = await supabase.from("links").delete().eq("id", id);
			if (!error) {
				toast.success("Link deleted");
				router.push("/links");
			}
		}
	};

	const copyToClipboard = () => {
		const url = `${window.location.origin}/${linkData?.short_code}`;
		navigator.clipboard.writeText(url);
		toast.success("Copied to clipboard!");
	};

	const dataPoints =
		clickStats.length > 0 ? clickStats.map((_, i) => i + 1).join(",") : "0";

	const chartConfig = {
		type: "line",
		data: {
			labels: clickStats.map((_, i) => i + 1), // x axis
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
			scales: {
				xAxes: [{ display: false }],
				yAxes: [{ display: false }],
			},
		},
	};

	const chartUrl = `https://quickchart.io/chart?c=${encodeURIComponent(JSON.stringify(chartConfig))}&w=300&h=100`;

	if (!linkData) {
		return (
			<div className="flex items-center justify-center min-h-screen bg-slate-50">
				<p className="animate-pulse font-medium text-slate-500">Loading...</p>
			</div>
		);
	}

	return (
		<div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
			{/* sidebar section */}
			<aside
				className={`fixed lg:relative z-50 bg-white border-r border-slate-200 h-screen transition-all duration-300 ${
					isShowNavigation ? "w-64" : "w-20"
				} overflow-hidden`}
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

			{/* navbar */}
			<main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
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
							href="/links"
							className="flex items-center gap-2 text-slate-600 hover:text-indigo-600 mb-6 group w-fit"
						>
							<ChevronLeft
								size={18}
								className="group-hover:-translate-x-1 transition-transform"
							/>
							<span className="font-medium text-sm">Back to list</span>
						</Link>

						{/* main card */}
						<div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
							<div className="flex justify-between items-start mb-4">
								<div className="flex-1">
									<div className="flex items-center gap-2 mt-1">
										<p className="text-indigo-600 font-semibold text-lg">
											<Link href={`${domain}/${linkData.short_code}`}>
												{linkData.short_code}
											</Link>
										</p>
										<button
											onClick={copyToClipboard}
											className="p-1 hover:bg-indigo-50 rounded text-indigo-400"
										>
											<Copy size={16} />
										</button>
									</div>
									<p className="text-slate-400 text-sm mt-2 truncate max-w-xl">
										↳ {linkData.original_url}
									</p>
								</div>

								<div className="relative">
									<button
										onClick={() => setShowDeleteMenu(!showDeleteMenu)}
										className="p-2 hover:bg-slate-100 rounded-lg border border-slate-200"
									>
										<Settings size={18} className="text-slate-600" />
									</button>
									{showDeleteMenu && (
										<div className="absolute right-0 top-12 bg-white border border-slate-200 shadow-xl rounded-lg py-2 w-40 z-10">
											<button
												onClick={handleDelete}
												className="w-full text-left px-4 py-2 text-red-600 text-sm hover:bg-red-50 flex items-center gap-2"
											>
												<Trash2 size={16} /> Delete Link
											</button>
										</div>
									)}
								</div>
							</div>
							<div className="text-[12px] text-slate-400 border-t border-slate-100 pt-4">
								Created {new Date(linkData.created_at).toLocaleString("id-ID")}
							</div>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
							{/* left side for analytics */}
							<div className="md:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
								<div className="flex items-center justify-between mb-6">
									<h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
										<BarChart3 size={20} className="text-indigo-600" /> Click
										Analytics
									</h2>
									<span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
										Last 7 Days
									</span>
								</div>

								<div className="w-full bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 flex items-center justify-center min-h-[250px]">
									{chartUrl ? (
										<img
											src={chartUrl}
											alt="Analytics"
											className="w-full h-auto object-contain p-4"
											onError={(e) => {
												e.currentTarget.src =
													"https://placehold.co/600x250?text=Chart+Preview+Not+Available";
											}}
										/>
									) : (
										<div className="text-center p-6">
											<p className="text-slate-400 text-sm italic">
												Gathering data for visualization...
											</p>
										</div>
									)}
								</div>
							</div>

							{/* right side for total click count data */}
							<div className="flex flex-col gap-6">
								<div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex-1">
									<h2 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-4">
										Engagement
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
												Total Link Clicks
											</p>
										</div>
									</div>
								</div>

								{/* activity card */}
								<div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex-1">
									<h2 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-4">
										Status
									</h2>
									<div className="flex items-center gap-4">
										<div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl">
											<Calendar size={24} />
										</div>
										<div>
											<p className="text-lg font-bold text-slate-900 leading-tight">
												{clickStats.length > 0
													? "Recently Visited"
													: "No Activity"}
											</p>
											<p className="text-slate-500 text-xs mt-1">
												{clickStats.length > 0
													? `Last click: ${new Date(clickStats[clickStats.length - 1]).toLocaleTimeString()}`
													: "Waiting for first visitor"}
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
