import { useState, useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import toast from "react-hot-toast";
import {
  FaCamera,
  FaKeyboard,
  FaSpinner,
  FaCheckCircle,
} from "react-icons/fa";

import { checkIn } from "../services/checkinService";

const CheckIn = () => {
  const [mode, setMode] = useState("manual");
  const [registrationId, setRegistrationId] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isScannerActive, setIsScannerActive] = useState(false);
  const [checkInSuccess, setCheckInSuccess] = useState(false);

  const scannerRef = useRef(null);

  // Prevent multiple requests for the same scan
  const scanLockedRef = useRef(false);

  // ==========================================
  // PROCESS CHECK-IN
  // ==========================================
  const processCheckIn = async (id) => {
    if (!id) return false;

    setIsProcessing(true);

    try {
      const res = await checkIn({
        registrationId: id,
      });

      // ------------------------------------------
      // SUCCESS
      // ------------------------------------------
      toast.success(
        res.data?.message || "Check-in successful!"
      );

      setRegistrationId("");

      setCheckInSuccess(true);

      return true;

    } catch (error) {

      // ------------------------------------------
      // FAILURE
      // ------------------------------------------
      toast.error(
        error.response?.data?.message ||
        "Check-in failed"
      );

      // Allow another QR scan
      scanLockedRef.current = false;

      return false;

    } finally {
      setIsProcessing(false);
    }
  };

  // ==========================================
  // START SCANNER
  // ==========================================
  const startScanner = async () => {
    try {
      setCheckInSuccess(false);
      setIsScannerActive(false);
      setIsProcessing(false);

      // Unlock scanner
      scanLockedRef.current = false;

      // If an old scanner exists, stop it first
      if (
        scannerRef.current &&
        scannerRef.current.isScanning
      ) {
        await scannerRef.current.stop();
      }

      const html5Qrcode = new Html5Qrcode("qr-reader");

      scannerRef.current = html5Qrcode;

      // ------------------------------------------
      // START CAMERA
      // ------------------------------------------
      await html5Qrcode.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: {
            width: 250,
            height: 250,
          },
        },

        // ==========================================
        // QR DETECTED
        // ==========================================
        async (decodedText) => {

          // Ignore repeated detections
          if (scanLockedRef.current) {
            return;
          }

          // Immediately lock scanner
          scanLockedRef.current = true;

          console.log(
            "QR detected:",
            decodedText
          );

          // ------------------------------------------
          // PROCESS CHECK-IN FIRST
          // ------------------------------------------
          const success = await processCheckIn(
            decodedText
          );

          // ------------------------------------------
          // ONLY STOP CAMERA ON SUCCESS
          // ------------------------------------------
          if (success) {
            try {
              if (html5Qrcode.isScanning) {
                await html5Qrcode.stop();
              }

              setIsScannerActive(false);

            } catch (error) {
              console.error(
                "Error stopping scanner:",
                error
              );
            }
          }

          // ------------------------------------------
          // FAILURE
          // ------------------------------------------
          else {
            // Keep camera running
            // and allow another QR
            setIsScannerActive(true);
          }
        },

        // Ignore scan failures
        () => {}
      );

      setIsScannerActive(true);

    } catch (error) {

      console.error(
        "Camera start error:",
        error
      );

      toast.error(
        "Unable to access camera."
      );

      setIsScannerActive(false);
    }
  };

  // ==========================================
  // INITIALIZE SCANNER
  // ==========================================
  useEffect(() => {
    if (mode !== "scanner") return;

    startScanner();

    // ------------------------------------------
    // CLEANUP
    // ------------------------------------------
    return () => {
      if (
        scannerRef.current &&
        scannerRef.current.isScanning
      ) {
        scannerRef.current
          .stop()
          .catch(() => {});
      }

      scannerRef.current = null;

      scanLockedRef.current = false;
    };
  }, [mode]);

  // ==========================================
  // SWITCH TO SCANNER MODE
  // ==========================================
  const handleScannerMode = () => {
    setMode("scanner");
    setCheckInSuccess(false);
  };

  // ==========================================
  // SWITCH TO MANUAL MODE
  // ==========================================
  const handleManualMode = () => {
    setMode("manual");
    setCheckInSuccess(false);
  };

  // ==========================================
  // UI
  // ==========================================
  return (
    <div>

      {/* ========================================
          HEADER
      ======================================== */}
      <h1 className="text-2xl font-bold">
        Check-In Management
      </h1>

      <p className="text-gray-500 mb-5">
        Scan QR code or enter registration ID
      </p>

      {/* ========================================
          MODE BUTTONS
      ======================================== */}
      <div className="flex gap-4">

        <button
          onClick={handleManualMode}
          className="btn-primary flex items-center gap-2"
          disabled={isProcessing}
        >
          <FaKeyboard />
          Manual
        </button>

        <button
          onClick={handleScannerMode}
          className="btn-primary flex items-center gap-2"
          disabled={isProcessing}
        >
          <FaCamera />
          Scan QR
        </button>

      </div>

      {/* ========================================
          MANUAL MODE
      ======================================== */}
      {mode === "manual" && (
        <div className="card p-6 max-w-xl">

          <input
            className="input"
            placeholder="REG12345678"
            value={registrationId}
            onChange={(e) =>
              setRegistrationId(e.target.value)
            }
            disabled={isProcessing}
          />

          <button
            onClick={() =>
              processCheckIn(registrationId)
            }
            disabled={
              isProcessing ||
              !registrationId.trim()
            }
            className="btn-primary mt-5 w-full flex items-center justify-center gap-2"
          >

            {isProcessing ? (
              <>
                <FaSpinner className="animate-spin" />
                Processing...
              </>
            ) : (
              "Check In"
            )}

          </button>

        </div>
      )}

      {/* ========================================
          SCANNER MODE
      ======================================== */}
      {mode === "scanner" && (
        <div className="card p-6 max-w-xl">

          <div className="relative w-full aspect-square max-w-md mx-auto rounded-xl overflow-hidden bg-black shadow-inner">

            {/* ====================================
                ACTUAL QR CAMERA
            ==================================== */}
            <div
              id="qr-reader"
              className="w-full h-full object-cover"
            />

            {/* ====================================
                SUCCESS SCREEN
            ==================================== */}
            {checkInSuccess && !isProcessing && (
              <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center text-white">

                <FaCheckCircle className="text-6xl text-green-400 mb-4" />

                <h2 className="text-xl font-semibold mb-2">
                  Check-in Successful!
                </h2>

                <p className="text-sm text-gray-300 mb-6 text-center px-6">
                  Attendee has been successfully
                  checked in and confirmation email
                  has been sent.
                </p>

                <button
                  onClick={startScanner}
                  className="btn-primary flex items-center gap-2"
                >
                  <FaCamera />
                  Scan Next QR
                </button>

              </div>
            )}

            {/* ====================================
                SCANNING OVERLAY
            ==================================== */}
            {isScannerActive &&
              !checkInSuccess &&
              !isProcessing && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">

                  <div className="absolute inset-0 border-[24px] border-black/40" />

                  <div className="w-60 h-60 border-2 border-indigo-400/70 rounded-2xl relative flex items-center justify-center">

                    <div className="absolute w-full h-0.5 bg-indigo-500 shadow-[0_0_10px_#6366f1] animate-pulse" />

                    {/* Top Left */}
                    <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-indigo-400" />

                    {/* Top Right */}
                    <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-indigo-400" />

                    {/* Bottom Left */}
                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-indigo-400" />

                    {/* Bottom Right */}
                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-indigo-400" />

                  </div>

                </div>
              )}

            {/* ====================================
                CHECKING IN
            ==================================== */}
            {isProcessing && (
              <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-white">

                <FaSpinner className="text-3xl animate-spin text-indigo-400 mb-3" />

                <p className="text-sm font-medium">
                  Checking in...
                </p>

              </div>
            )}

            {/* ====================================
                STARTING CAMERA
            ==================================== */}
            {!isScannerActive &&
              !checkInSuccess &&
              !isProcessing && (
                <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-white">

                  <FaSpinner className="text-3xl animate-spin text-indigo-400 mb-2" />

                  <p className="text-sm font-medium">
                    Starting Camera...
                  </p>

                </div>
              )}

          </div>

        </div>
      )}

    </div>
  );
};

export default CheckIn;