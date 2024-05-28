"use client";

import Link from "next/link";
import { MobileView } from "react-device-detect";

import { Cross, IconButton, QrCode } from "@/assets/icons";
import { AppDownload, HeaderWithButton } from "@/components";
import {
  Format,
  checkPermissions,
  requestPermissions,
  scan,
} from "@tauri-apps/plugin-barcode-scanner";
import { useEffect, useState } from "react";

const QrScan = () => {
  const [scanned, setScanned] = useState<string | null>(null);
  useEffect(() => {
    const requestCameraAccess = async (): Promise<void> => {
      console.log("Checking permissions");

      switch (await checkPermissions()) {
        case "prompt" || "denied":
          console.log("Requesting permissions");
          await requestPermissions();
          break;

        case "granted":
          await performScan();
          break;

        default:
          await requestPermissions();
          break;
      }
    };

    const performScan = async () => {
      console.log("Scanning");
      const scanResult = await scan({
        cameraDirection: "back",
        windowed: true,
        formats: [Format.QRCode],
      });
      setScanned(scanResult.content);
    };

    requestCameraAccess();
  }, []);
  return (
    <div className="flex flex-col center h-full w-full">
      <HeaderWithButton
        title="QrScan"
        icon={<IconButton icon={<Cross height={24} />} href="/" />}
      />

      <AppDownload />

      <MobileView className="flex flex-grow flex-col center gap-8 w-full p-8 bg-transparent">
        <div className="flex flex-grow flex-col">{scanned}</div>

        <Link
          className="absolute bottom-8 right-8 flex center p-4 bg-blue-5 rounded-full cursor-pointer"
          href="/qr/code"
        >
          <QrCode height={32} color="fill-white" />
        </Link>
      </MobileView>
    </div>
  );
};

export default QrScan;
