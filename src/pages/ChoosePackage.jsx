import { useNavigate } from "react-router-dom";
import axios from "axios";
import GraphicPackList from "../components/GraphicPackList";
import { Container, Typography } from "@mui/material";

export default function ChoosePackPage() {
  const navigate = useNavigate();

  const handleSelect = async (packId) => {
    try {
      await axios.post("https://matchgen-backend-production.up.railway.app/api/graphicpack/select-pack/", { pack_id: packId });
      navigate("/dashboard"); // This replaces router.push()
    } catch (err) {
      console.error("Error selecting pack", err);
    }
  };

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Choose a Template Pack
      </Typography>
      <GraphicPackList onSelect={handleSelect} />
    </Container>
  );
}
