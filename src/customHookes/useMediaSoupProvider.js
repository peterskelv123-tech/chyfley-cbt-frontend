import { useEffect, useRef, useCallback } from "react";
import * as mediasoupClient from "mediasoup-client";

export const useMediasoupProducer = (socket, currentExam, studentId) => {
  const deviceRef = useRef(null);
  const sendTransportRef = useRef(null);
  const producingRef = useRef(false); // prevent double produce

  // -----------------------------
  // Initialize mediasoup
  // -----------------------------
  useEffect(() => {
    if (!socket || !currentExam || !studentId) return;

    console.log("🚀 Initializing mediasoup producer", {
      examId: currentExam,
      studentId,
      socketId: socket.id,
    });

    const init = async () => {
      try {
        // 1️⃣ Get RTP capabilities
        const routerRtpCapabilities = await socket.emitWithAck(
          "get-rtp-capabilities"
        );
        console.log("📡 Router RTP Capabilities received");

        const device = new mediasoupClient.Device();
        await device.load({ routerRtpCapabilities });
        deviceRef.current = device;

        // 2️⃣ Create send transport
        const transportParams = await socket.emitWithAck("createTransport");
        console.log("🛠 Send transport params received");

        const transport = device.createSendTransport(transportParams);

        // 3️⃣ Transport connect
        transport.on("connect", ({ dtlsParameters }, callback, errback) => {
          console.log("🔗 Connecting send transport...");
          socket.emit(
            "connectTransport",
            { transportId: transport.id, dtlsParameters },
            (err) => {
              if (err) {
                console.error("❌ Transport connect failed", err);
                errback(err);
              } else {
                console.log("✅ Send transport connected");
                callback();
              }
            }
          );
        });

        // 4️⃣ PRODUCE EVENT (🔥 THIS WAS YOUR BUG 🔥)
        transport.on(
          "produce",
          async ({ kind, rtpParameters }, callback, errback) => {
            try {
              console.log(`🎬 Producing ${kind} track...`);
              const { producerId } = await socket.emitWithAck(
                "student-produce",
                {
                  transportId: transport.id,
                  kind,
                  rtpParameters,
                  studentId,
                }
              );

              console.log(`✅ Server created producer: ${producerId}`);
              callback({ id: producerId });
            } catch (err) {
              console.error("❌ Produce failed:", err);
              errback(err);
            }
          }
        );

        sendTransportRef.current = transport;
      } catch (err) {
        console.error("❌ Mediasoup init failed:", err);
      }
    };

    init();
  }, [socket, currentExam, studentId]);

  // -----------------------------
  // Produce camera stream
  // -----------------------------
  const onCameraStream = useCallback(async (stream) => {
    if (!stream || !(stream instanceof MediaStream)) {
      console.error("❌ Invalid stream passed:", stream);
      return;
    }

    if (producingRef.current) {
      console.warn("⚠️ Already producing, skipping");
      return;
    }

    console.log("🎥 Camera stream received");
    producingRef.current = true;

    // Wait for transport
    let transport = sendTransportRef.current;
    const start = Date.now();
    while (!transport) {
      if (Date.now() - start > 3000) {
        console.error("❌ Send transport not ready after 3s");
        producingRef.current = false;
        return;
      }
      await new Promise((r) => setTimeout(r, 50));
      transport = sendTransportRef.current;
    }

    try {
      const videoTrack = stream.getVideoTracks()[0];
      const audioTrack = stream.getAudioTracks()[0];

      console.log("🎞 Video track:", videoTrack);
      console.log("🎤 Audio track:", audioTrack);

      if (videoTrack) {
        const videoProducer = await transport.produce({ track: videoTrack });
        console.log("🎥 Video producer created:", videoProducer.id);
      }

      if (audioTrack) {
        const audioProducer = await transport.produce({ track: audioTrack });
        console.log("🎤 Audio producer created:", audioProducer.id);
      }

      console.log("✅ Media successfully produced");
    } catch (err) {
      console.error("❌ Error producing media:", err);
      producingRef.current = false;
    }
  }, []);

  return { onCameraStream };
};