import { useEffect, useState } from "react";
import axios from "axios";

export default function GraphicPackList({ onSelect }) {
  const [packs, setPacks] = useState([]);

  useEffect(() => {
    axios.get("/api/graphic-packs/")
      .then(res => setPacks(res.data))
      .catch(err => console.error("Failed to load packs", err));
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {packs.map(pack => (
        <div key={pack.id} className="border rounded-xl p-4 shadow-md">
          <img
            src={pack.preview_image}
            alt={pack.name}
            className="w-full h-48 object-cover rounded-md"
          />
          <h3 className="text-xl font-bold mt-2">{pack.name}</h3>
          <p className="text-sm text-gray-600">{pack.description}</p>
          <button
            onClick={() => onSelect(pack.id)}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            Use this Pack
          </button>
        </div>
      ))}
    </div>
  );
}
