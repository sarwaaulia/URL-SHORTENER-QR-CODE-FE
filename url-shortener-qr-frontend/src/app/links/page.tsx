"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { NavItem } from "../components/Navitems";
import Link from "next/link";
import toast from "react-hot-toast";
import {
	Search,
	Calendar,
	Plus,
	MoreHorizontal,
	Link as LinkIcon,
	QrCode,
	Copy,
	ChevronLeft,
	ChevronRight,
	Home,
	Trash2,
	X,
	ExternalLink,
	Menu
} from "lucide-react";

const domain = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
const API_BASE_URL =
	process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export default function LinkPage() {
	const [links, setLinks] = useState<any[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [isShowNavigation, setIsShowNavigation] = useState(false);
	const [isShowProfile, setIsShowProfile] = useState(false);
	const [searchQuery, setIsSearchQuery] = useState("");
	const [userData, setUserData] = useState({ name: "User", email: "" });
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

	const [isModalEditOpen, setIsModalEditOpen] = useState(false);
	const [selectedLink, setSelectedLink] = useState<any>(null);
	const [editData, setEditData] = useState({
		originalUrl: "",
		customAlias: "",
	});

	const router = useRouter();

	const fetchLinks = useCallback(async () => {
		setIsLoading(true);

		try {
			const token = localStorage.getItem("token");
			if (!token) return router.push("/login");

			const response = await fetch(`${API_BASE_URL}/api/links`, {
				headers: { Authorization: `Bearer ${token}` },
			});

			const contentType = response.headers.get("content-type");

			if (contentType && contentType.includes("text/html")) {
				const htmlText = await response.text();

				console.error("show error", htmlText);
				return;
			}

			const data = await response.json();
			console.log("Raw Response Data:", data);

			if (data && Array.isArray(data)) {
				setLinks(data);
			} else {
				console.error("data is not an array ", data);
				setLinks([]);
			}
		} catch (error) {
			console.error("Fetch error:", error);
		} finally {
			setIsLoading(false);
		}
	}, [router]);

	useEffect(() => {
		const storeUser = localStorage.getItem("user_info");
		if (storeUser) setUserData(JSON.parse(storeUser));
		fetchLinks();
	}, [fetchLinks]);

	const handleDelete = async (shortCode: string) => {
		if (!confirm(`Are you sure want to delete this link?`)) return;

		try {
			const res = await fetch(`${API_BASE_URL}/api/links/${shortCode}`, {
				method: "DELETE",
				headers: {
					Authorization: `Bearer ${localStorage.getItem("token")}`,
				},
			});

			if (res.ok) {
				toast.success(`Link has been removed`);
				fetchLinks();
			}
		} catch (error) {
			toast.error(`Delete failed cause internal server error`);
		}
	};

	const submitUpdate = async () => {
		if (!selectedLink?.short_code) {
			toast.error("No link selected");
			return;
		}

		try {
			const response = await fetch(
				`${API_BASE_URL}/api/links/${selectedLink.short_code}`,
				{
					method: "PUT",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${localStorage.getItem("token")}`,
					},
					body: JSON.stringify({
						originalUrl: editData.originalUrl,
						customAlias: editData.customAlias,
						regenerateQr: true,
					}),
				},
			);

			if (response.ok) {
				toast.success("Updated!");
				setIsModalEditOpen(false);
				fetchLinks();
			} else {
				const err = await response.json();
				toast.error(err.message || "Update failed");
			}
		} catch (error) {
			toast.error("Network error");
		}
	};

	const filteredLinks = (Array.isArray(links) ? links : []).filter(
		(link: any) => {
			const matchSearch = 
			link.original_url?.toLowerCase().includes(searchQuery.toLowerCase()) ||
			link.short_code?.toLowerCase().includes(searchQuery.toLowerCase())

			// just render link generated
			return matchSearch && !link.qr_code
		}
	);

	return (
        <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
            
            {mobileMenuOpen && (
                <div className="fixed inset-0 z-[100] flex lg:hidden">
                    <div
                        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300"
                        onClick={() => setMobileMenuOpen(false)}
                    />
                    <div className="relative w-72 bg-white h-full p-6 shadow-2xl flex flex-col animate-in slide-in-from-left duration-300">
                        <div className="flex items-center justify-between mb-8">
                            <h1 className="text-2xl font-black text-[#6C5CE7]">LinkZip</h1>
                            <button
                                onClick={() => setMobileMenuOpen(false)}
                                className="p-2 hover:bg-slate-100 rounded-full"
                            >
                                <X size={24} />
                            </button>
                        </div>
                        <nav className="space-y-3">
                            <Link href="/home" onClick={() => setMobileMenuOpen(false)}>
                                <div className="flex items-center gap-4 p-3 text-slate-600 hover:bg-slate-50 rounded-xl font-bold transition-all">
                                    <Home size={20} /> Home
                                </div>
                            </Link>
                            <Link href="/links" onClick={() => setMobileMenuOpen(false)}>
                                <div className="flex items-center gap-4 p-3 bg-[#6C5CE7] text-white rounded-xl font-bold">
                                    <LinkIcon size={20} /> Links
                                </div>
                            </Link>
                            <Link href="/qr-codes" onClick={() => setMobileMenuOpen(false)}>
                                <div className="flex items-center gap-4 p-3 text-slate-600 hover:bg-slate-50 rounded-xl font-bold transition-all">
                                    <QrCode size={20} /> QR Codes
                                </div>
                            </Link>
                        </nav>
                    </div>
                </div>
            )}

            {/* sidebar */}
            <aside
                className={`hidden lg:flex flex-col bg-white border-r border-slate-200 h-screen sticky top-0 transition-all duration-300 ${isShowNavigation ? "w-64" : "w-20"}`}
            >
                <div className={`p-6 flex items-center ${isShowNavigation ? "justify-between" : "justify-center"}`}>
                    <h1 className={`text-2xl font-black text-[#6C5CE7] tracking-tighter ${!isShowNavigation && "hidden"}`}>
                        Link<span className="text-slate-400">Zip</span>
                    </h1>
                    <button
                        onClick={() => setIsShowNavigation(!isShowNavigation)}
                        className="p-1.5 rounded-xl bg-slate-100 hover:bg-[#6C5CE7] hover:text-white transition-colors"
                    >
                        {isShowNavigation ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
                    </button>
                </div>

                <nav className="flex-1 px-4 space-y-2">
                    <Link href="/home">
                        <button className="bg-[#6C5CE7] text-white w-full p-3 rounded-xl flex items-center justify-center gap-2 mb-6 hover:shadow-lg transition-all overflow-hidden">
                            <Plus size={20} /> {isShowNavigation && <span className="whitespace-nowrap">Create New</span>}
                        </button>
                    </Link>
                    <Link href="/home">
                        <NavItem icon={<Home size={20} />} label="Dashboard" isOpen={isShowNavigation} active={false} />
                    </Link>
                    <Link href="/links">
                        <NavItem icon={<LinkIcon size={20} />} label="My Links" isOpen={isShowNavigation} active={true} />
                    </Link>
                    <Link href="/qr-codes">
                        <NavItem icon={<QrCode size={20} />} label="QR Codes" isOpen={isShowNavigation} active={false} />
                    </Link>
                </nav>
            </aside>

            {/* main content */}
            <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
                {/* Header Nav */}
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 shrink-0">
                    <div className="flex items-center flex-1 gap-4">
                        <button 
                            onClick={() => setMobileMenuOpen(true)}
                            className="lg:hidden p-2 hover:bg-slate-100 rounded-lg text-slate-600"
                        >
                            <Menu size={24} />
                        </button>

                        <div className="relative flex-1 max-w-md hidden sm:block">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search your links..."
                                className="w-full pl-10 pr-4 py-2 bg-slate-100 rounded-full text-sm outline-none focus:ring-2 focus:ring-[#6C5CE7]/20 transition-all"
                                value={searchQuery}
                                onChange={(e) => setIsSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4 ml-4">
                        <div className="relative">
                            <button
                                onClick={() => setIsShowProfile(!isShowProfile)}
                                className="w-10 h-10 rounded-full bg-[#6C5CE7] text-white flex items-center justify-center font-bold shadow-sm"
                            >
                                {userData.name[0]?.toUpperCase()}
                            </button>
                            {isShowProfile && (
                                <div className="absolute right-0 mt-3 w-48 bg-white border rounded-2xl shadow-xl py-2 z-[60] animate-in fade-in zoom-in-95 duration-200">
                                    <div className="px-4 py-2 border-b text-xs text-slate-500 uppercase font-bold">Profile</div>
                                    <div className="px-4 py-2 text-sm font-medium truncate">{userData.email}</div>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-4 lg:p-8">
                    <div className="max-w-5xl mx-auto">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                            <div>
                                <h2 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
                                    My Short Links
                                </h2>
                                <p className="text-slate-500 text-sm">
                                    You have {links.length} shortened URLs
                                </p>
                            </div>
                        </div>

                        {/* link lists */}
                        <div className="grid gap-4">
                            {isLoading ? (
                                [1, 2, 3].map((i) => (
                                    <div key={i} className="h-24 bg-white animate-pulse rounded-2xl border border-slate-200" />
                                ))
                            ) : filteredLinks.length > 0 ? (
                                filteredLinks.map((link: any) => (
                                    <div
                                        key={link.id}
                                        className="group bg-white p-4 lg:p-5 rounded-2xl border border-slate-200 hover:shadow-md transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                                    >
                                        <Link href={`/links/${link.id}`} className="flex-1 min-w-0 w-full group">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-bold text-slate-900 truncate group-hover:text-[#6C5CE7] transition-colors">
                                                    {link.short_code}
                                                </h3>
                                                <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-full text-slate-500 font-bold uppercase">
                                                    {link.click_count || 0} Clicks
                                                </span>
                                            </div>
                                            <p className="text-sm text-slate-400 truncate max-w-full">
                                                {link.original_url}
                                            </p>
                                            <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-400 font-medium">
                                                <span className="flex items-center gap-1">
                                                    <Calendar size={12} /> {new Date(link.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </Link>

                                        <div className="flex items-center gap-2 w-full md:w-auto justify-end border-t md:border-0 pt-3 md:pt-0">
                                            <button
                                                onClick={() => {
                                                    navigator.clipboard.writeText(`${domain}/${link.short_code}`);
                                                    toast.success("Copied!");
                                                }}
                                                className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
                                                title="Copy Link"
                                            >
                                                <Copy size={18} />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setSelectedLink(link);
                                                    setEditData({ originalUrl: link.original_url, customAlias: link.short_code });
                                                    setIsModalEditOpen(true);
                                                }}
                                                className="p-2 hover:bg-slate-100 rounded-lg text-slate-500"
                                            >
                                                <MoreHorizontal size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(link.short_code)}
                                                className="p-2 hover:bg-red-50 rounded-lg text-red-500"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                            <a
                                                href={`${domain}/r/${link.short_code}`}
                                                target="_blank"
                                                className="p-2 bg-[#6C5CE7] text-white rounded-lg hover:bg-[#5b4cc4] transition-all"
                                            >
                                                <ExternalLink size={18} />
                                            </a>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200">
                                    <p className="text-slate-400 mb-4">No links found. Create your first one!</p>
                                    <Link href='/home' className="inline-block px-6 py-2 bg-[#6C5CE7] text-white rounded-xl font-bold">
                                        Create a link
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            {/* edit modal */}
            {isModalEditOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl w-full max-w-md p-6 lg:p-8 shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold">Edit Link</h3>
                            <button onClick={() => setIsModalEditOpen(false)}>
                                <X size={20} className="hover:bg-slate-100 rounded-full cursor-pointer"/>
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Target URL</label>
                                <input
                                    type="url"
                                    value={editData.originalUrl}
                                    onChange={(e) => setEditData({ ...editData, originalUrl: e.target.value })}
                                    className="w-full p-3 bg-slate-50 border rounded-xl outline-none focus:border-[#6C5CE7]"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Custom Alias</label>
                                <input
                                    type="text"
                                    value={editData.customAlias}
                                    onChange={(e) => setEditData({ ...editData, customAlias: e.target.value })}
                                    className="w-full p-3 bg-slate-50 border rounded-xl outline-none focus:border-[#6C5CE7]"
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={() => setIsModalEditOpen(false)}
                                    className="flex-1 py-3 font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={submitUpdate}
                                    className="flex-1 py-3 bg-[#6C5CE7] text-white font-bold rounded-xl shadow-lg hover:shadow-[#6C5CE7]/30 transition-all"
                                >
                                    Save
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
