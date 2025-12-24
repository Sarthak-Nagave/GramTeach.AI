// src/components/MicWaveform.jsx
import React, { useEffect, useRef } from "react";

/**
 * MicWaveform
 * Props:
 *  - active: boolean (start/stop visualization)
 *
 * This component uses Web Audio API to show a small bar-based waveform.
 */
export default function MicWaveform({ active }) {
  const canvasRef = useRef(null);
  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let mounted = true;

    async function start() {
      try {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        sourceRef.current = audioCtxRef.current.createMediaStreamSource(stream);
        analyserRef.current = audioCtxRef.current.createAnalyser();
        analyserRef.current.fftSize = 256;
        sourceRef.current.connect(analyserRef.current);

        const bufferLength = analyserRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const draw = () => {
          if (!mounted) return;
          rafRef.current = requestAnimationFrame(draw);
          analyserRef.current.getByteTimeDomainData(dataArray);

          ctx.fillStyle = "transparent";
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          // draw bars
          const barWidth = canvas.width / 20;
          let x = 0;
          for (let i = 0; i < 20; i++) {
            const v = dataArray[Math.floor((i / 20) * dataArray.length)] / 128.0;
            const h = (v * canvas.height) / 2;
            ctx.fillStyle = `rgba(255,120,40,${0.6 - i * 0.02})`;
            ctx.fillRect(x, (canvas.height - h) / 2, barWidth - 2, h);
            x += barWidth;
          }
        };
        draw();
      } catch (err) {
        console.warn("MicWaveform failed:", err);
      }
    }

    if (active) start();

    return () => {
      mounted = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (analyserRef.current) analyserRef.current.disconnect();
      if (sourceRef.current) sourceRef.current.disconnect();
      if (audioCtxRef.current) audioCtxRef.current.close().catch(() => {});
    };
  }, [active]);

  return <canvas ref={canvasRef} width={220} height={44} style={{ display: "block", borderRadius: 8 }} />;
}
