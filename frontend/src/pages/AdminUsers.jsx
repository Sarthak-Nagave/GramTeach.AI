import React, { useEffect, useState } from "react";
import api from "../services/api";
import { adminTokenStore } from "../utils/adminTokenStore";
import { useNavigate } from "react-router-dom";

export default function AdminUsers() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = adminTokenStore.getToken();
    if (!token) {
      navigate("/");
      return;
    }

    const load = async () => {
      try {
        const res = await api.get("/admin/users");
        setUsers(res.data);
      } catch (err) {
        console.error("Admin Users Load Error:", err);
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
      <h2 className="text-3xl font-bold mb-6">Users</h2>

      <div className="overflow-x-auto">
        <table className="table-auto w-full border-collapse border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <Th>ID</Th>
              <Th>UID</Th>
              <Th>Email</Th>
              <Th>Name</Th>
              <Th>Admin?</Th>
              <Th>Created</Th>
            </tr>
          </thead>

          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t">
                <Td>{u.id}</Td>
                <Td>{u.uid}</Td>
                <Td>{u.email}</Td>
                <Td>{u.name || "-"}</Td>
                <Td>{u.is_admin ? "YES" : "NO"}</Td>
                <Td>{u.created_at?.slice(0, 19) || "-"}</Td>
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
