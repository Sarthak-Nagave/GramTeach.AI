import React, { useState } from "react";
import api from "../services/api";
import { ImagePlus } from "lucide-react";

export default function ImageUploader({ onExtract = (text) => {} }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFile = (f) => {
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const uploadAndExtract = async () => {
    if (!file) return alert("Choose an image first");
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);

      // backend endpoint should accept file and return { extracted_topic: "..." }
      const res = await api.post("/lessons/extract-image-topic", fd, { headers: { "Content-Type": "multipart/form-data" } });
      const text = res.data.extracted_topic;
      if (text) onExtract(text);
    } catch (e) {
      console.error("extract error", e);
      alert("Failed to extract text from image");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border rounded-lg p-3">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-sm font-medium">Upload Image</div>
          <div className="text-xs text-slate-500">Photo of textbook or notes</div>
        </div>

        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 px-3 py-2 bg-slate-100 rounded cursor-pointer">
            <ImagePlus size={16} />
            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files[0])} />
          </label>

          <button disabled={!file || loading} onClick={uploadAndExtract} className="px-3 py-2 rounded bg-brand-600 text-white">
            {loading ? "Extracting…" : "Extract"}
          </button>
        </div>
      </div>

      <div className="h-32 bg-slate-100 rounded flex items-center justify-center">
        {preview ? <img src={preview} alt="preview" className="h-full object-contain" /> : <div className="text-xs text-slate-400">No preview</div>}
      </div>
    </div>
  );
}
