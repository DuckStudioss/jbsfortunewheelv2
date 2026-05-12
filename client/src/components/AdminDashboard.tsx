import React, { useEffect, useState } from "react";
import { AdminTable } from "./AdminTable";
import { Spin } from "../types/types";
import { API_URL } from "../config";
import axios from "axios";

export const AdminDashboard: React.FC = () => {
  const [spins, setSpins] = useState<Spin[]>([]);

  const fetchSpins = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/spins`);
      setSpins(response.data);
    } catch (error) {
      console.error("Error fetching spins:", error);
    }
  };

  useEffect(() => {
    fetchSpins();
  }, []);

  const handleDisbursed = async (id: string) => {
    try {
      await axios.patch(`${API_URL}/api/spins/${id}/disburse`);
      // Refresh spins after disbursement
      await fetchSpins();
    } catch (error) {
      console.error("Error updating disbursement:", error);
    }
  };

  return (
    <div className="main-container">
      <div className="admin-dashboard">
        <div className="admin-header">
          <h1 className="admin-title">Panel de Control</h1>
          <button 
            className="logout-btn" 
            onClick={() => {
              localStorage.removeItem("isAdminAuthenticated");
              window.location.reload();
            }}
          >
            Cerrar Sesión
          </button>
        </div>
        <AdminTable spins={spins} onDisbursed={handleDisbursed} onRefresh={fetchSpins} />
      </div>
    </div>
  );
};
