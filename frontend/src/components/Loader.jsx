import { Loader2 } from "lucide-react";

export default function Loader({ text = "Loading..." }){
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Loader2 className="animate-spin text-brand-500" size={40} />
      <div className="text-gray-500 mt-3">{text}</div>
    </div>
  );
}
