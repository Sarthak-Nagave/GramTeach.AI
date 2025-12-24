import { useState, useRef, useEffect } from "react";
import { Mic, MicOff, Image, Loader2, Check, X } from "lucide-react";
import { motion } from "framer-motion";

export default function LessonInput({ topic, setTopic }){
  const [recognizing, setRecognizing] = useState(false);
  const [uploadState, setUploadState] = useState("idle");
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState(null);
  const fileRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(()=>{
    if (typeof window === "undefined") return;
    if (!("webkitSpeechRecognition" in window)) return;
    if (recognitionRef.current) return;

    const r = new window.webkitSpeechRecognition();
    r.lang = "hi-IN";
    r.interimResults = false;
    r.continuous = false;

    r.onstart = () => setRecognizing(true);
    r.onend = () => setRecognizing(false);
    r.onerror = (e) => setError("Speech recognition error");
    r.onresult = (e) => {
      const txt = e.results?.[0]?.[0]?.transcript;
      if (txt) setTopic(txt);
    };

    recognitionRef.current = r;
    return ()=>{ try{ r.onstart = r.onend = r.onresult = null }catch{} };
  }, [setTopic]);

  const toggleMic = ()=> {
    const r = recognitionRef.current;
    if (!r) return setError("Use Chrome/Edge for voice input");
    setError(null);
    if (!recognizing) r.start(); else r.stop();
  };

  const handleFile = async (file) => {
    if (!file) return;
    setError(null);
    setUploadState("loading");
    setPreview(URL.createObjectURL(file));
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'}/lessons/extract-image-topic`, {method:'POST', body: fd});
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      if (data?.extracted_topic) setTopic(data.extracted_topic);
      else setError("No topic found");
      setUploadState("done");
    } catch (err) {
      setError("Upload failed. Check backend & CORS");
      setUploadState("idle");
    } finally {
      setTimeout(()=>{ setUploadState(s => s==='done' ? 'idle' : s); }, 1200);
    }
  };

  const clearPreview = ()=> { setPreview(null); if(fileRef.current) fileRef.current.value = ""; };

  return (
    <div className="card">
      <div className="flex gap-6 items-start">
        <div className="flex-1">
          <label className="block text-sm font-semibold mb-2">Lesson Topic</label>
          <input value={topic||""} onChange={e=>setTopic(e.target.value)} placeholder="Type a topic or use voice / image" className="w-full border rounded-lg px-4 py-3" />
          {error && <div className="text-sm text-red-500 mt-2">{error}</div>}
        </div>

        <div className="w-40 flex flex-col gap-3 items-stretch">
          <button onClick={toggleMic} className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2 ${recognizing ? 'bg-red-500 text-white' : 'bg-brand-500 text-white'}`}>
            {recognizing ? <MicOff size={16}/> : <Mic size={16}/>} <span className="text-sm">{recognizing ? 'Listening' : 'Voice'}</span>
          </button>

          <label className="block">
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e=>handleFile(e.target.files?.[0])} />
            <div className="flex items-center justify-center gap-2 border rounded-lg p-2 cursor-pointer hover:bg-gray-50">
              <Image size={16} className="text-gray-600"/> <span className="text-sm text-gray-700">Upload Image</span>
            </div>
          </label>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {uploadState === 'loading' && <Loader2 className="animate-spin text-gray-500" size={16} />}
          {uploadState === 'done' && <Check className="text-green-600" size={16} />}
          <div className="text-sm text-gray-500">{uploadState === 'loading' ? 'Processing...' : uploadState === 'done' ? 'Topic extracted' : 'Upload to auto-extract'}</div>
        </div>

        <div>
          {preview ? (
            <div className="flex items-center gap-3">
              <img src={preview} alt="preview" className="w-28 h-16 object-cover rounded-md border" />
              <button onClick={clearPreview} className="btn-secondary"><X size={14}/>Remove</button>
            </div>
          ) : <div className="text-sm text-gray-400">No preview</div>}
        </div>
      </div>
    </div>
  );
}
