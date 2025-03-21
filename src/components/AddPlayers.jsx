import * as React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { animated, useSpring } from '@react-spring/web';
import { useState, useEffect } from "react";
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Collapse from '@mui/material/Collapse';
import Typography from '@mui/material/Typography';
import { getToken } from "../services/auth";
import { useNavigate } from "react-router-dom";
import { addPlayer } from "../services/club";

import { useTheme } from '@mui/material/styles';



export default function AddPlayers({ user }) {
  const [squad, setSquad] = useState([]);
  const [error, setError] = useState("");
  const token = getToken();
  const [newPlayer, setNewPlayer] = useState({ name: "", position: "" });
  const navigate = useNavigate();

    const handleAddPlayer = async () => {
    await addPlayer(token, newPlayer);
    setNewPlayer({ name: "", position: "" });
  };


  return (
    <Card
      variant="outlined"
      sx={{ display: 'flex', flexDirection: 'column', gap: '8px', flexGrow: 1 }}
    >
      <CardContent>
        <Typography component="h2" variant="subtitle2">
          Add Players
        </Typography>

      <input placeholder="Player Name" class="input input-bordered" value={newPlayer.name} onChange={e => setNewPlayer({ ...newPlayer, name: e.target.value })} />
      <input placeholder="Position" class="input input-bordered" value={newPlayer.position} onChange={e => setNewPlayer({ ...newPlayer, position: e.target.value })} />
      <button className="btn btn-primary" onClick={handleAddPlayer}>Add Player</button>

{/*         <RichTreeView */}
{/*           items={ITEMS} */}
{/*           aria-label="pages" */}
{/*           multiSelect */}
{/*           defaultExpandedItems={['1', '1.1']} */}
{/*           defaultSelectedItems={['1.1', '1.1.1']} */}
{/*           sx={{ */}
{/*             m: '0 -8px', */}
{/*             pb: '8px', */}
{/*             height: 'fit-content', */}
{/*             flexGrow: 1, */}
{/*             overflowY: 'auto', */}
{/*           }} */}
{/*           slots={{ item: CustomTreeItem }} */}
{/*         /> */}
      </CardContent>
    </Card>
  );
}
