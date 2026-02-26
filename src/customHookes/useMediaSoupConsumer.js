// useMediaSoupConsumer.js
import { useRef, useCallback } from "react";
import * as mediasoupClient from "mediasoup-client";

export const useMediasoupAdmin = (socket) => {
  const deviceRef = useRef(null);

  const transportRef = useRef(null);
  const transportPromiseRef = useRef(null);

  const consumersRef = useRef({
    consumers: {}, // key: studentId-producerId
    streams: {},   // key: studentId
  });

  const ensureDevice = async () => {
    if (deviceRef.current) return deviceRef.current;

    const device = new mediasoupClient.Device();
    const rtpCapabilities = await new Promise((resolve) =>
      socket.emit("get-rtp-capabilities", resolve)
    );

    await device.load({ routerRtpCapabilities: rtpCapabilities });
    deviceRef.current = device;

    console.log("📱 Admin device loaded");
    return device;
  };

  const ensureTransport = async () => {
    if (transportRef.current) return transportRef.current;

    if (transportPromiseRef.current) {
      return transportPromiseRef.current;
    }

    transportPromiseRef.current = (async () => {
      const params = await new Promise((resolve) =>
        socket.emit("createConsumerTransport", resolve)
      );

      const transport =
        deviceRef.current.createRecvTransport(params);

      transport.on("connect", ({ dtlsParameters }, callback, errback) => {
        socket.emit(
          "connectConsumerTransport",
          { transportId: transport.id, dtlsParameters },
          (res) => {
            if (!res?.ok) return errback(res?.error);
            console.log("✅ Consumer transport connected");
            callback();
          }
        );
      });

      transport.on("connectionstatechange", (state) => {
        console.log("🚦 Admin transport state:", state);
      });

      transportRef.current = transport;
      transportPromiseRef.current = null;
      return transport;
    })();

    return transportPromiseRef.current;
  };

  const consumeStudent = useCallback(
    async (studentId, producerId, videoEl, audioEl) => {
      const key = `${studentId}-${producerId}`;
      if (consumersRef.current.consumers[key]) return;

      await ensureDevice();
      const transport = await ensureTransport();

      const params = await new Promise((resolve) =>
        socket.emit(
          "consume",
          {
            transportId: transport.id,
            producerId,
            rtpCapabilities: deviceRef.current.rtpCapabilities,
          },
          resolve
        )
      );

      if (!params) return;

      const consumer = await transport.consume(params);
      consumer.on("producerclose", () => {
        console.log("🧹 Producer closed → removing track");

        const stream = consumersRef.current.streams[studentId];
        if (!stream) return;

        stream.removeTrack(consumer.track);
        consumer.close();

        delete consumersRef.current.consumers[key];

        // 🔥 IMPORTANT: clear element when stream is empty
        if (stream.getTracks().length === 0) {
          if (videoEl) videoEl.srcObject = null;
          if (audioEl) audioEl.srcObject = null;
          delete consumersRef.current.streams[studentId];
        }
      });
      consumersRef.current.consumers[key] = consumer;

      if (!consumersRef.current.streams[studentId]) {
        consumersRef.current.streams[studentId] = new MediaStream();
      }

      const stream = consumersRef.current.streams[studentId];
      stream.addTrack(consumer.track);

      // 🔁 attach FIRST
      if (consumer.kind === "video" && videoEl) {
        videoEl.srcObject = stream;
        videoEl.muted = true;
        videoEl.playsInline = true;
      }

      if (consumer.kind === "audio" && audioEl) {
        audioEl.srcObject = stream;
      }
      if (videoEl && videoEl.srcObject !== stream) {
        videoEl.srcObject = stream;
      }

      if (audioEl && audioEl.srcObject !== stream) {
        audioEl.srcObject = stream;
      }
      // ▶️ then resume
      await new Promise((resolve) =>
        socket.emit("resume-consumer", { consumerId: consumer.id }, resolve)
      );

      // ▶️ then play
      if (consumer.kind === "video" && videoEl) {
        await videoEl.play().catch(() => { });
      }
      if (consumer.kind === "audio" && audioEl) {
        await audioEl.play().catch(() => { });
      }

      console.log(`✅ Admin consuming ${consumer.kind} from ${studentId}`);
    },
    [socket]
  );

  return { consumeStudent };
};