import * as React from 'react';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Button from '@mui/material/Button';
import Divider, { dividerClasses } from '@mui/material/Divider';
import Link from '@mui/material/Link';

import TodayIcon from '@mui/icons-material/Today';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import axios from 'axios';

import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import { useState, useEffect } from "react";
import { addPlayer } from "../hooks/club";
import { getToken } from "../hooks/auth";
import CreatePlayer from '../pages/createplayer';


const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '0px solid #000',
  boxShadow: 24,
  pt: 2,
  px: 4,
  pb: 3,
};

function ChildModal() {
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  return (
    <React.Fragment>
      <Button onClick={handleOpen}>Open Child Modal</Button>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="child-modal-title"
        aria-describedby="child-modal-description"
      >
        <Box sx={{ ...style, width: 200 }}>
          <h2 id="child-modal-title">Text in a child modal</h2>
          <p id="child-modal-description">
            Lorem ipsum, dolor sit amet consectetur adipisicing elit.
          </p>
          <Button onClick={handleClose}>Close Child Modal</Button>
        </Box>
      </Modal>
    </React.Fragment>
  );
}

export default function NestedModal() {
  const theme = useTheme();
  const [open, setOpen] = React.useState(false);
  const [newPlayer, setNewPlayer] = useState({ name: "", position: "" });
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const token = getToken();

  const handleAddPlayer = async () => {
      await addPlayer(token, newPlayer);
      setNewPlayer({ name: "", position: "" });
    };

  const handleOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div>
      <Button onClick={handleOpen}
                variant="contained"
                size="small"
                color="primary"
                endIcon={<ChevronRightRoundedIcon />}
                fullWidth={isSmallScreen}
                >
        Create Player</Button>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="parent-modal-title"
        aria-describedby="parent-modal-description"
      >
        <Box sx={{ ...style, width: 400 }}>
          {/* <h2 id="parent-modal-title">Add Player</h2> */}
          {/* <p id="parent-modal-description">
            Duis mollis, est non commodo luctus, nisi erat porttitor ligula.
          </p> */}
            <CreatePlayer/>
            {/* <Divider />
          <ChildModal /> */}
        </Box>
      </Modal>
    </div>
  );
}
