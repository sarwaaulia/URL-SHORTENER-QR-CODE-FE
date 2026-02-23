import toast from "react-hot-toast";

export const downloadQR = async (fullUrl: string, fileName: string) => {
	const qrUrl = `https://quickchart.io/qr?size=500x500&text=${encodeURIComponent(fullUrl)}`;
	try {
		const response = await fetch(qrUrl);
		if (!response.ok) throw new Error("Network response wasn't okay");

		const blob = await response.blob(); //change from raw into blob
		const url = window.URL.createObjectURL(blob);

		const link = document.createElement("a");
		link.href = url;

		link.download = `qr-${fileName}.png`; //convert into png

		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);

		window.URL.revokeObjectURL(url); //remove memory

		toast.success("QR Code downloaded!");
	} catch (error) {
		console.error("Download QR Code error:", error);
		toast.error("Failed to download QR Code");
	}
};

// share QR code function
export const shareQRCode = async (fullUrl: string, fileName: string) => {
	const qrUrl = `https://quickchart.io/qr?size=500x500&text=${encodeURIComponent(fullUrl)}`;

	try {
		const response = await fetch(qrUrl);
		const blob = await response.blob();
		const file = new File([blob], "qrcode.png", { type: "image/png" });

        // if browser support web share api for file
		if (navigator.canShare && navigator.canShare({ files: [file] })) {
			await navigator.share({
				files: [file],
				title: "My QR Code",
				text: `Scan this to visit link ${fullUrl}`,
			});

		} else {
			toast.error("Share not supported on this browser");
		}

	} catch (error) {
		console.log("Error sharing", error);
        toast.error(`Failed to share QR codes`)
	}
};