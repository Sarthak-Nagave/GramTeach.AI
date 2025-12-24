import React, { useEffect, useState } from "react";
import api from "../services/api";
import { adminTokenStore } from "../utils/adminTokenStore";
import { useNavigate } from "react-router-dom";

export default function AdminStorage() {
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = adminTokenStore.getToken();
    if (!token) {
      navigate("/");
      return;
    }

    const load = async () => {
      try {
        const res = await api.get("/admin/s3/list");
        setFiles(res.data);
      } catch (err) {
        console.error("S3 listing error:", err);
        navigate("/");
      }
      setLoading(false);
    };

    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-gray-700"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-10 px-4">
      <h2 className="text-3xl font-bold mb-6">S3 Storage</h2>

      <div className="overflow-x-auto">
        <table className="table-auto w-full border-collapse border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <Th>File</Th>
              <Th>Size</Th>
              <Th>Last Modified</Th>
            </tr>
          </thead>

          <tbody>
            {files.map((f, i) => (
              <tr key={i} className="border-t">
                <Td>{f.Key}</Td>
                <Td>{(f.Size / (1024 * 1024)).toFixed(2)} MB</Td>
                <Td>{f.LastModified || "-"}</Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const Th = ({ children }) => (
  <th className="px-4 py-2 border border-gray-300 text-left">{children}</th>
);
const Td = ({ children }) => (
  <td className="px-4 py-2 border border-gray-300">{children}</td>
);
