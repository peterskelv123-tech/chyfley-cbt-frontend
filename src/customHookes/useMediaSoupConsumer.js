import { useRef } from "react";
import * as mediasoupClient from "mediasoup-client";

export const useMediasoupAdmin = (socket) => {
  const deviceRef = useRef(null);
  const transportRef = useRef(null);
  const consumersRef = useRef({});

  const waitForElement = async (el) => {
    while (!el) {
      await new Promise((r) => setTimeout(r, 50));
      el = document.getElementById(el.id);
    }
    return el;
  };

  const consumeStudent = async (studentId, producerId, transportParams, videoEl, audioEl) => {
    try {
      if (!deviceRef.current) {
        const device = new mediasoupClient.Device();
        const { rtpCapabilities } = await socket.emitWithAck("get-rtp-capabilities");
        await device.load({ routerRtpCapabilities: rtpCapabilities });
        deviceRef.current = device;
      }

      if (!transportRef.current) {
        const transport = deviceRef.current.createRecvTransport(transportParams);
        transport.on("connect", ({ dtlsParameters }, callback, errback) => {
          socket.emit(
            "connectConsumerTransport",
            { transportId: transport.id, dtlsParameters },
            (resp) => (resp?.error ? errback(resp.error) : callback())
          );
        });
        transportRef.current = transport;
      }

      const transport = transportRef.current;

      const consumerParams = await socket.emitWithAck("consume", {
        transportId: transport.id,
        producerId,
        rtpCapabilities: deviceRef.current.rtpCapabilities,
      });

      const consumer = await transport.consume({
        id: consumerParams.id,
        producerId: consumerParams.producerId,
        kind: consumerParams.kind,
        rtpParameters: consumerParams.rtpParameters,
        paused: false,
      });

      consumersRef.current[`${studentId}-${consumer.kind}`] = consumer;

      // -----------------------------
      // Wait for elements if they aren't ready
      // -----------------------------
      if (consumer.kind === "video" && videoEl) videoEl = await waitForElement(videoEl);
      if (consumer.kind === "audio" && audioEl) audioEl = await waitForElement(audioEl);

      const stream = new MediaStream([consumer.track]);
      if (consumer.kind === "video") videoEl.srcObject = stream;
      if (consumer.kind === "audio") audioEl.srcObject = stream;

      videoEl?.play().catch(() => { });
      audioEl?.play().catch(() => { });
    } catch (err) {
      console.error("Failed to consume student media:", err);
    }
  };

  return { consumeStudent };
};