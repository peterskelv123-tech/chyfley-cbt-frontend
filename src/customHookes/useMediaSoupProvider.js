import { useRef, useEffect, useCallback } from "react";
import * as mediasoupClient from "mediasoup-client";

export const useMediasoupProducer = (socket, currentExam, studentId) => {
  const deviceRef = useRef(null);
  const transportRef = useRef(null);
  const streamRef = useRef(null);
  const producersRef = useRef([]);
  const producingRef = useRef(false);

  // -----------------------------
  // Produce tracks safely
  // -----------------------------
  const tryProduce = useCallback(async () => {
    if (
      producingRef.current ||
      !transportRef.current ||
      !streamRef.current
    ) {
      return;
    }

    producingRef.current = true;
    console.log("🚀 Producing media tracks");

    try {
      const stream = streamRef.current;
      const transport = transportRef.current;

      const videoTrack = stream.getVideoTracks()[0];
      const audioTrack = stream.getAudioTracks()[0];

      if (videoTrack) {
        const vp = await transport.produce({ track: videoTrack });
        producersRef.current.push(vp);
        console.log("🎥 Video producer:", vp.id);
      }

      if (audioTrack) {
        const ap = await transport.produce({ track: audioTrack });
        producersRef.current.push(ap);
        console.log("🎤 Audio producer:", ap.id);
      }
    } catch (err) {
      console.error("❌ Produce failed:", err);
      producingRef.current = false;
    }
  }, []);

  // -----------------------------
  // Init mediasoup
  // -----------------------------
  useEffect(() => {
    if (!socket || !currentExam || !studentId) return;

    const init = async () => {
      try {
        console.log("🚀 Initializing student mediasoup");

        const routerRtpCapabilities = await socket.emitWithAck(
          "get-rtp-capabilities"
        );

        const device = new mediasoupClient.Device();
        await device.load({ routerRtpCapabilities });
        deviceRef.current = device;

        const transportParams = await socket.emitWithAck("createTransport");

        const transport = device.createSendTransport(transportParams);
        transportRef.current = transport;

        transport.on("connect", ({ dtlsParameters }, callback, errback) => {
          socket.emit(
            "connectTransport",
            { transportId: transport.id, dtlsParameters },
            (ack) => (ack?.ok ? callback() : errback())
          );
        });

        transport.on(
          "produce",
          async ({ kind, rtpParameters }, callback, errback) => {
            try {
              const { producerId } = await socket.emitWithAck(
                "student-produce",
                {
                  transportId: transport.id,
                  kind,
                  rtpParameters,
                  studentId,
                }
              );
              callback({ id: producerId });
            } catch (e) {
              errback(e);
            }
          }
        );

        transport.on("connectionstatechange", (s) =>
          console.log("🚦 Producer transport:", s)
        );

        tryProduce();
      } catch (err) {
        console.error("❌ Producer init failed:", err);
      }
    };

    init();

    return () => {
      producersRef.current.forEach((p) => p.close());
      transportRef.current?.close();
      producersRef.current = [];
      producingRef.current = false;
    };
  }, [socket, currentExam, studentId, tryProduce]);

  // -----------------------------
  // Camera ready
  // -----------------------------
  const onCameraStream = useCallback(
    (stream) => {
      if (!stream) return;
      streamRef.current = stream;
      console.log("🎥 Camera ready");
      tryProduce();
    },
    [tryProduce]
  );

  return { onCameraStream };
};