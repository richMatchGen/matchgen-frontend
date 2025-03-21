import React, { useState, useEffect } from "react";
import Grid from "@mui/material/Grid";
import List from "@mui/material/List";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import ListItemIcon from "@mui/material/ListItemIcon";
import Checkbox from "@mui/material/Checkbox";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import axios from "axios";

import { getToken } from "../services/auth";
import { generateStartingXIGraphic } from "../services/club";

function not(a, b) {
  return a.filter((value) => !b.includes(value));
}

function intersection(a, b) {
  return a.filter((value) => b.includes(value));
}

export default function StartingXISelection() {
  const [checked, setChecked] = useState([]);
  const [squad, setSquad] = useState([]); // Full squad
  const [left, setLeft] = useState([]); // Available players
  const [right, setRight] = useState([]); // Selected Starting XI
  const [imageUrl, setImageUrl] = useState(""); // Stores generated graphic URL

  const token = getToken();

  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/api/users/squad/", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setSquad(response.data);
        setLeft(response.data.map((player) => player.name)); // Populate left list
      })
      .catch((error) => console.error("❌ Error fetching squad:", error));
  }, []);

  const handleToggle = (value) => () => {
    const currentIndex = checked.indexOf(value);
    const newChecked = [...checked];

    if (currentIndex === -1) {
      newChecked.push(value);
    } else {
      newChecked.splice(currentIndex, 1);
    }

    setChecked(newChecked);
  };

const handleCheckedRight = () => {
  const selectedPlayers = checked.filter((p) => left.includes(p));

  // Ensure at least 1 player is selected before moving
  if (selectedPlayers.length === 0) {
    alert("❌ You must select at least 1 player!");
    return;
  }

  // Move selected players to "Starting XI"
  setRight(right.concat(selectedPlayers));
  setLeft(not(left, selectedPlayers));
  setChecked([]);
};

  const handleCheckedLeft = () => {
    setLeft(left.concat(right.filter((p) => checked.includes(p))));
    setRight(not(right, checked));
    setChecked([]);
  };

const generateGraphic = async () => {
  if (right.length < 1) {
    alert("❌ You must select at least 1 player!");
    return;
  }

  try {
    const response = await generateStartingXIGraphic(token, right);
    setImageUrl(response.data.image_url);
  } catch (error) {
    console.error("❌ Error generating graphic:", error);
    alert("Failed to generate graphic.");
  }
};

  const customList = (title, items) => (
    <Card>
      <CardHeader
        sx={{ px: 2, py: 1 }}
        avatar={
          <Checkbox
            onClick={() =>
              setChecked((prev) =>
                intersection(prev, items).length === items.length ? not(prev, items) : [...prev, ...items]
              )
            }
            checked={intersection(checked, items).length === items.length && items.length !== 0}
            indeterminate={
              intersection(checked, items).length !== items.length &&
              intersection(checked, items).length !== 0
            }
            disabled={items.length === 0}
            inputProps={{ "aria-label": "all items selected" }}
          />
        }
        title={title}
        subheader={`${intersection(checked, items).length}/${items.length} selected`}
      />
      <Divider />
      <List sx={{ width: 250, height: 300, overflow: "auto" }} dense component="div" role="list">
        {items.map((value) => {
          const labelId = `transfer-list-item-${value}`;

          return (
            <ListItemButton key={value} role="listitem" onClick={handleToggle(value)}>
              <ListItemIcon>
                <Checkbox
                  checked={checked.includes(value)}
                  tabIndex={-1}
                  disableRipple
                  inputProps={{ "aria-labelledby": labelId }}
                />
              </ListItemIcon>
              <ListItemText id={labelId} primary={value} />
            </ListItemButton>
          );
        })}
      </List>
    </Card>
  );

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <h1 className="text-3xl font-bold mb-6">Starting XI Selection</h1>

      <Grid container spacing={2} sx={{ justifyContent: "center", alignItems: "center" }}>
        <Grid item>{customList("Available Players", left)}</Grid>
        <Grid item>
          <Grid container direction="column" sx={{ alignItems: "center" }}>
            <Button
              sx={{ my: 0.5 }}
              variant="contained"
              size="small"
              onClick={handleCheckedRight}
              disabled={intersection(checked, left).length === 0}
            >
              ➡
            </Button>
            <Button
              sx={{ my: 0.5 }}
              variant="contained"
              size="small"
              onClick={handleCheckedLeft}
              disabled={intersection(checked, right).length === 0}
            >
              ⬅
            </Button>
          </Grid>
        </Grid>
        <Grid item>{customList("Selected Starting XI", right)}</Grid>
      </Grid>

      <Button
        variant="contained"
        color="primary"
        sx={{ mt: 4 }}
        onClick={generateGraphic}
        disabled={right.length < 1}
      >
        Generate Starting XI Graphic
      </Button>

      {imageUrl && (
        <div className="mt-4">
          <h2 className="text-xl font-bold">Generated Graphic:</h2>
          <img src={imageUrl} alt="Starting XI Graphic" className="mt-2 border-2 border-gray-300 rounded" />
          <a href={imageUrl} download className="btn btn-primary mt-2">
            Download Graphic
          </a>
        </div>
      )}
    </div>
  );
}