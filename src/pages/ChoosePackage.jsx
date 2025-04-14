
import axios from "axios";
import GraphicPackList from "../components/GraphicPackList";
import { Container, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function ChoosePackPage() {
  const navigate = useNavigate();

  const handleSelect = async (packId) => {
    try {
      const token = localStorage.getItem("accessToken"); // or wherever you're storing it

      await axios.post(
        "https://matchgen-backend-production.up.railway.app/api/graphicpack/select-pack/",
        { pack_id: packId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      navigate("/dashboard");
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

