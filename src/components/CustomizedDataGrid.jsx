import * as React from 'react';
import { useState, useEffect } from "react";
import { DataGrid } from '@mui/x-data-grid';
import { columns, rows } from '../internals/data/gridData';
import { addPlayer, getSquad } from "../services/club";  // ✅ Ensure this is correctly imported
import { getToken } from "../services/auth";
import { useNavigate } from "react-router-dom";


export default function CustomizedDataGrid({ user }) {
  const [squad, setSquad] = useState([]);
  const [error, setError] = useState("");
  const token = getToken();
  const [newPlayer, setNewPlayer] = useState({ name: "", position: "" });
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      setError("User not authenticated. Redirecting to login...");
      setTimeout(() => navigate("/login"), 2000);
      return;
    }

    getSquad(token)

      .then((response) => setSquad(response.data))
      .catch((err) => {
        console.error("Error fetching squad:", err);
        setError("Failed to load squad. Please log in again.");
        setTimeout(() => navigate("/login"), 2000);
      });
  }, [token, navigate]);

    const handleAddPlayer = async () => {
    await addPlayer(token, newPlayer);
    setNewPlayer({ name: "", position: "" });
  };

//     fetchSquad();
//   }, [user, navigate]); // Dependency array: updates when `user` changes

  return (
    <DataGrid
      checkboxSelection
      rows={squad}
      columns={columns}
      getRowClassName={(params) =>
        params.indexRelativeToCurrentPage % 2 === 0 ? 'even' : 'odd'
      }
      initialState={{
        pagination: { paginationModel: { pageSize: 20 } },
      }}
      pageSizeOptions={[10, 20, 50]}
      disableColumnResize
      density="compact"
      slotProps={{
        filterPanel: {
          filterFormProps: {
            logicOperatorInputProps: {
              variant: 'outlined',
              size: 'small',
            },
            columnInputProps: {
              variant: 'outlined',
              size: 'small',
              sx: { mt: 'auto' },
            },
            operatorInputProps: {
              variant: 'outlined',
              size: 'small',
              sx: { mt: 'auto' },
            },
            valueInputProps: {
              InputComponentProps: {
                variant: 'outlined',
                size: 'small',
              },
            },
          },
        },
      }}
    />
  );
}
