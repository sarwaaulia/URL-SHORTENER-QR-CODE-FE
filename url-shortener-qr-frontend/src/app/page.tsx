"use client";

import React, { useState, useEffect } from "react";
import { 
  LinkIcon, 
  QrCode, 
  ChevronDown, 
  CheckCircle2, 
  User,
  ChartSpline
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("link"); // 'link' or 'qr'
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [url, setUrl] = useState("");

  useEffect(() => {
    // check login status
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user || null);
    };
    getSession();
  }, []);

  const handleGetStarted = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      router.push("/login");
    } else {
      router.push("/links");
    }
  };

  const faqs = [
    {
      q: "What is LinkZip?",
      a: "LinkZip is an all-in-one platform for shortening long URLs into short, easy-to-remember links, as well as creating custom QR Codes for your branding needs."
    },
    {
      q: "How does a Short Link work?",
      a: "Simply paste your long link into the input box, click 'Get your link,' and our system will generate a unique alias that will instantly redirect users to your original destination."
    },
    {
      q: "How do I know how many people clicked on my link?",
      a: "We offer a dashboard with chart analysis and click count features, designed to help you track the progress of your shared links."
    }
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">

      {/* navbar */}
      <nav className="border-b border-slate-100 sticky top-0 bg-white/80 backdrop-blur-md z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-black text-[#6C5CE7] tracking-tighter">
              Link<span className="text-gray-700">Zip</span>
            </h1>
          </div>

          <div className="flex items-center gap-6">
            {user ? (
              <Link href="/home" className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-full border border-slate-200">
                <div className="w-8 h-8 bg-[#6C5CE7] rounded-full flex items-center justify-center text-white">
                  <User size={18} />
                </div>
                <span className="text-sm font-bold text-slate-700">{user.email?.split('@')[0]}</span>
              </Link>
            ) : (
              <div className="flex items-center gap-4">
                <Link href="/login" className="font-bold text-slate-600 hover:text-[#6C5CE7] transition-colors">Log in</Link>
                <Link href="/register" className="bg-[#6C5CE7] text-white px-6 py-2.5 rounded-xl font-bold hover:bg-[#5b4cc4] transition-all shadow-lg shadow-indigo-100">
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* hero section */}
      <section className="bg-[#0B1221] py-20 px-6 relative overflow-hidden">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">
            Shorten a long link
          </h2>
          <p className="text-slate-400 text-xl mb-12">Build your identity with our short link and QR code generator and track links with our chart analytics</p>

          {/* generator, redirect to login */}
          <div className="bg-white p-2 rounded-3xl shadow-2xl max-w-2xl mx-auto">
            <div className="flex p-2 gap-2">
              <button 
                onClick={() => setActiveTab("link")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-bold transition-all ${activeTab === 'link' ? 'bg-slate-100 text-[#6C5CE7]' : 'text-slate-400'}`}
              >
                <LinkIcon size={20} /> Short Link
              </button>
              <button 
                onClick={() => setActiveTab("qr")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-bold transition-all ${activeTab === 'qr' ? 'bg-slate-100 text-[#6C5CE7]' : 'text-slate-400'}`}
              >
                <QrCode size={20} /> QR Code
              </button>
            </div>

            <form onSubmit={handleGetStarted} className="p-4 space-y-4">
              <div className="text-left">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">Paste your long link here</label>
                <input 
                  type="url"
                  required
                  placeholder="https://example.com/my-very-long-url-to-shorten"
                  className="w-full mt-2 p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-[#6C5CE7] transition-all text-slate-700"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
              </div>
              <button className="w-full bg-[#6C5CE7] text-white py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-2 hover:bg-[#5b4cc4] transition-all group">
                Get your link for free
              </button>
            </form>
          </div>
        </div>
        
        {/* background */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#6C5CE7] opacity-10 blur-[120px] -mr-48 -mt-48"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500 opacity-10 blur-[120px] -ml-48 -mb-48"></div>
      </section>

      {/* features section */}
      <section className="py-24 max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h3 className="text-4xl font-black text-slate-800 mb-4">Unlock the power of your links.</h3>
          <p className="text-slate-500 font-medium">All the features you need in one platform.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">

          {/* feature 1 */}
          <div className="bg-white border border-slate-100 p-8 rounded-[2rem] shadow-sm hover:shadow hover:-translate-y-2 transition-all duration-300 group">
            <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-[#6C5CE7] mb-6 group-hover:bg-[#6C5CE7] group-hover:text-white transition-colors">
              <LinkIcon size={28} />
            </div>
            <h4 className="text-xl font-black mb-4">URL Shortener</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-slate-500 text-sm font-medium">
                <CheckCircle2 size={16} className="text-emerald-500" /> Custom short codes
              </li>
              <li className="flex items-center gap-2 text-slate-500 text-sm font-medium">
                <CheckCircle2 size={16} className="text-emerald-500" /> Auto redirection
              </li>
            </ul>
          </div>

          {/* feature 2 */}
          <div className="bg-white border border-slate-100 p-8 rounded-[2rem] shadow-sm hover:shadow hover:-translate-y-2 transition-all duration-300 group">
            <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 mb-6 group-hover:bg-purple-600 group-hover:text-white transition-colors">
              <QrCode size={28} />
            </div>
            <h4 className="text-xl font-black mb-4">QR Codes</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-slate-500 text-sm font-medium">
                <CheckCircle2 size={16} className="text-emerald-500" /> Style with colors & patterns
              </li>
              <li className="flex items-center gap-2 text-slate-500 text-sm font-medium">
                <CheckCircle2 size={16} className="text-emerald-500" /> High-res download
              </li>
              <li className="flex items-center gap-2 text-slate-500 text-sm font-medium">
                <CheckCircle2 size={16} className="text-emerald-500" /> Easy to share
              </li>
            </ul>
          </div>

          {/* feature 3 */}
          <div className="bg-[#6C5CE7] p-8 rounded-[2rem] hover:shadow hover:-translate-y-2 transition-all duration-300 group text-white relative overflow-hidden">
            <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 mb-6 group-hover:bg-purple-600 group-hover:text-white transition-colors">
              <ChartSpline size={28} />
            </div>
            <h4 className="text-xl font-black mb-4 relative z-10">Advanced Analytics</h4>
            <p className="text-indigo-100 text-sm mb-6 relative z-10">Track who clicks on your links in real-time with an intuitive dashboard.</p>
          </div>
        </div>
      </section>

      {/* accordion for question */}
      <section className="py-24 bg-slate-50 px-6">
        <div className="max-w-3xl mx-auto">
          <h3 className="text-3xl font-black text-center mb-12 text-slate-800">Questions you might have.</h3>
          
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div 
                key={index} 
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden transition-all"
              >
                <button 
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full p-6 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
                >
                  <span className="font-bold text-slate-700">{faq.q}</span>
                  <ChevronDown 
                    size={20} 
                    className={`text-slate-400 transition-transform duration-300 ${openFaq === index ? 'rotate-180' : ''}`} 
                  />
                </button>
                
                <div className={`transition-all duration-300 ease-in-out ${openFaq === index ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}>
                  <div className="p-6 pt-0 text-slate-500 leading-relaxed border-t border-slate-50">
                    {faq.a}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* CTA bottom */}
          <div className="mt-20 text-center bg-white p-12 rounded-[3rem] border border-slate-100 shadow-sm">
            <h4 className="text-3xl font-black mb-4">Ready to simplify your links?</h4>
            <p className="text-slate-500 mb-8">Join LinkZip and spread show your identity now.</p>
            <Link href="/register">
              <button className="bg-[#6C5CE7] text-white px-10 py-4 rounded-2xl font-black text-lg hover:bg-[#5b4cc4]">
                Create account
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* footer */}
      <footer className="py-12 border-t border-slate-100 text-center text-slate-400 text-sm font-medium">
        <p>© 2026 LinkZip. Made with 💜 for MicroSaas Project.</p>
      </footer>
    </div>
  );
}