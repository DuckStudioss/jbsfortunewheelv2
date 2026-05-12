import React, { useState, useMemo } from "react";
import { Spin } from "../types/types";
import "./AdminTable.css";

interface AdminTableProps {
  spins: Spin[];
  onDisbursed?: (id: string) => void;
  onRefresh?: () => void;
}

const FIELD_LABELS: Record<string, string> = {
  couponCode: "Cupón",
  customerName: "Nombre del Cliente",
  email: "Email",
  award: "Premio",
  createdAt: "Fecha",
  isSpecialPrize: "Es Premio Especial",
  isDisbursed: "Entregado",
};

const COLUMNS = [
  { field: "couponCode", label: "Cupón", className: "col-coupon" },
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
  onRefresh,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "delivered" | "pending">("all");
  const [sortField, setSortField] = useState<keyof Spin>("createdAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(10);

  const sortedAndFilteredSpins = useMemo(() => {
    return spins
      .filter((spin) => {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = 
          spin.customerName.toLowerCase().includes(searchLower) ||
          spin.award.toLowerCase().includes(searchLower) ||
          spin.email.toLowerCase().includes(searchLower) ||
          spin.cedula.toLowerCase().includes(searchLower) ||
          spin.phoneNumber.toLowerCase().includes(searchLower) ||
          (spin.couponCode && spin.couponCode.toLowerCase().includes(searchLower)) ||
          spin.id.toLowerCase().includes(searchLower);

        const matchesStatus = 
          statusFilter === "all" ||
          (statusFilter === "delivered" && spin.isDisbursed) ||
          (statusFilter === "pending" && !spin.isDisbursed);

        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        const aValue = a[sortField] ?? "";
        const bValue = b[sortField] ?? "";
        if (sortDirection === "asc") {
          return aValue < bValue ? -1 : 1;
        } else {
          return aValue > bValue ? -1 : 1;
        }
      });
  }, [spins, searchTerm, statusFilter, sortField, sortDirection]);

  const totalPages = pageSize === -1 ? 1 : Math.ceil(sortedAndFilteredSpins.length / pageSize);
  
  const paginatedSpins = useMemo(() => {
    if (pageSize === -1) return sortedAndFilteredSpins;
    const startIndex = (currentPage - 1) * pageSize;
    return sortedAndFilteredSpins.slice(startIndex, startIndex + pageSize);
  }, [sortedAndFilteredSpins, currentPage, pageSize]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };

  const handleSort = (field: keyof Spin) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleRefresh = async () => {
    if (onRefresh) {
      setIsRefreshing(true);
      await onRefresh();
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  return (
    <div className="admin-table">
      <div className="filters-container">
        <div className="filters-wrapper">
          <div className="filter-main">
            <div className="filter-group search-group">
              <label htmlFor="search">Buscar:</label>
              <div className="search-bar">
                <input
                  id="search"
                  type="text"
                  placeholder="Buscar por cupón, nombre, cédula, correo o teléfono..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="filter-group status-group">
              <label>Estatus:</label>
              <div className="status-filters">
                <button 
                  className={`filter-btn ${statusFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setStatusFilter('all')}
                >
                  Todos
                </button>
                <button 
                  className={`filter-btn ${statusFilter === 'pending' ? 'active' : ''}`}
                  onClick={() => setStatusFilter('pending')}
                >
                  Pendientes
                </button>
                <button 
                  className={`filter-btn ${statusFilter === 'delivered' ? 'active' : ''}`}
                  onClick={() => setStatusFilter('delivered')}
                >
                  Entregados
                </button>
              </div>
            </div>
          </div>

          <div className="actions-group">
            <button 
              className={`refresh-btn ${isRefreshing ? 'refreshing' : ''}`}
              onClick={handleRefresh}
              title="Actualizar tabla"
            >
              <svg 
                viewBox="0 0 24 24" 
                width="20" 
                height="20" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M23 4v6h-6"></path>
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
              </svg>
              <span>Actualizar</span>
            </button>
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
            {paginatedSpins.map((spin) => (
              <tr key={spin.id}>
                <td className="col-coupon">{spin.couponCode || spin.id.substring(0, 8).toUpperCase()}</td>
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

      <div className="pagination-container">
        <div className="pagination-info">
          Mostrando <strong>{paginatedSpins.length}</strong> de <strong>{sortedAndFilteredSpins.length}</strong> registros
        </div>

        <div className="pagination-controls">
          <div className="page-size-selector">
            <label>Mostrar:</label>
            <select 
              value={pageSize} 
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
            >
              <option value={10}>10</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={500}>500</option>
              <option value={-1}>Todos</option>
            </select>
          </div>

          <div className="page-navigation">
            <button 
              disabled={currentPage === 1} 
              onClick={() => handlePageChange(currentPage - 1)}
              className="nav-btn"
            >
              Anterior
            </button>
            <div className="page-numbers">
              Página <strong>{currentPage}</strong> de {totalPages}
            </div>
            <button 
              disabled={currentPage === totalPages || totalPages === 0} 
              onClick={() => handlePageChange(currentPage + 1)}
              className="nav-btn"
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
