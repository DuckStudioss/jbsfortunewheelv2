import React, { useState, useMemo } from "react";
import { Spin } from "../types/types";
import "./AdminTable.css";

interface AdminTableProps {
  spins: Spin[];
  onDisbursed?: (id: string) => void;
}

const FIELD_LABELS: Record<string, string> = {
  id: "ID",
  customerName: "Nombre del Cliente",
  email: "Email",
  award: "Premio",
  createdAt: "Fecha",
  isSpecialPrize: "Es Premio Especial",
  isDisbursed: "Entregado",
};

const COLUMNS = [
  { field: "id", label: "ID", className: "col-id" },
  { field: "customerName", label: "Nombre", className: "col-name" },
  { field: "cedula", label: "Cédula", className: "col-cedula" },
  { field: "email", label: "Email", className: "col-email" },
  { field: "phoneNumber", label: "Teléfono", className: "col-phone" },
  { field: "award", label: "Premio", className: "col-prize" },
  { field: "createdAt", label: "Fecha", className: "col-date" },
  { field: "isDisbursed", label: "Estado", className: "col-status" },
] as const;

export const AdminTable: React.FC<AdminTableProps> = ({
  spins,
  onDisbursed,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<keyof Spin>("createdAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const sortedAndFilteredSpins = useMemo(() => {
    return spins
      .filter((spin) => {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch =
          spin.customerName.toLowerCase().includes(searchLower) ||
          spin.award.toLowerCase().includes(searchLower);

        return matchesSearch;
      })
      .sort((a, b) => {
        const aValue = a[sortField];
        const bValue = b[sortField];
        if (sortDirection === "asc") {
          return aValue < bValue ? -1 : 1;
        } else {
          return aValue > bValue ? -1 : 1;
        }
      });
  }, [spins, searchTerm, sortField, sortDirection]);

  const handleSort = (field: keyof Spin) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  return (
    <div className="admin-table">
      <div className="filters-container">
        <div className="filters-wrapper">
          <div className="filter-group">
            <label htmlFor="search">Buscar:</label>
            <div className="search-bar">
              <input
                id="search"
                type="text"
                placeholder="Buscar por orden, nombre, premio..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              {COLUMNS.map(({ field, label, className }) => (
                <th
                  key={field}
                  onClick={() => handleSort(field as keyof Spin)}
                  className={`${className || ""} ${
                    sortField === field ? `sorted-${sortDirection}` : ""
                  }`}
                >
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedAndFilteredSpins.map((spin) => (
              <tr key={spin.id}>
                <td className="col-id">{spin.id.substring(0, 8)}...</td>
                <td className="col-name">{spin.customerName}</td>
                <td className="col-cedula">{spin.cedula}</td>
                <td className="col-email">{spin.email}</td>
                <td className="col-phone">{spin.phoneNumber}</td>
                <td className="col-prize">{spin.award}</td>
                <td className="col-date">
                  {new Date(spin.createdAt).toLocaleString("es-CR", {
                    dateStyle: "short",
                    timeStyle: "short",
                  })}
                </td>
                <td className="col-status">
                  {spin.isDisbursed ? (
                    <span className="status-badge">Entregado</span>
                  ) : (
                    <div className="button-group">
                      <button
                        onClick={() => onDisbursed?.(spin.id)}
                        className="status-button approve"
                      >
                        Entregar
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
