import { Home, PlusCircle, VideoIcon, User } from "lucide-react";
import { NavLink } from "react-router-dom";
import logo from "../assets/logo_flat.svg";

export default function Sidebar() {
  return (
    <aside className="hidden md:flex flex-col w-64 bg-white border-r p-6 gap-6">
      <div className="flex items-center gap-3 mb-4">
        <img src={logo} className="h-10 w-10 rounded-full" />
        <h2 className="font-bold text-slate-800">GramTeach.AI</h2>
      </div>

      <nav className="flex flex-col gap-3">
        <NavLink to="/" className="nav-item"><Home size={18} /> Home</NavLink>
        <NavLink to="/create" className="nav-item"><PlusCircle size={18} /> Create Lesson</NavLink>
        <NavLink to="/dashboard" className="nav-item"><VideoIcon size={18} /> My Lessons</NavLink>
        <NavLink to="/profile" className="nav-item"><User size={18} /> Profile</NavLink>
      </nav>
    </aside>
  );
}
