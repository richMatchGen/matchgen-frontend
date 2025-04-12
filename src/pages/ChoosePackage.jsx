import { useRouter } from "next/router";
import axios from "axios";
import GraphicPackList from "@/components/GraphicPackList";

export default function ChoosePackPage() {
  const router = useRouter();

  const handleSelect = async (packId) => {
    try {
      await axios.post("/api/select-pack/", { pack_id: packId });
      router.push("/dashboard"); // Change this route to where you want to send the user
    } catch (err) {
      console.error("Error selecting pack", err);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-semibold mb-4">Choose a Graphic Pack</h1>
      <GraphicPackList onSelect={handleSelect} />
    </div>
  );
}
