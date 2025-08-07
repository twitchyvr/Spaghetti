import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Table as TableIcon, 
  Search, 
  Edit, 
  Trash2, 
  Plus, 
  Eye,
  Download,
  RefreshCw,
  Filter,
  MoreHorizontal,
  Key,
  Info
} from 'lucide-react';
import { Card, CardHeader, CardContent } from '../pantry/Card';
import { Button } from '../pantry/Button';
import { Input } from '../pantry/Input';
import { Badge } from '../pantry/Badge';
import { Table } from '../pantry/Table';
import { TableInfo, QueryResult } from '../../types/database-admin';
import { databaseAdminApi } from '../../services/database-admin-api';

export function TableBrowser() {
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [tableData, setTableData] = useState<QueryResult | null>(null);
  const [tableInfo, setTableInfo] = useState<TableInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(50);
  const [showStructure, setShowStructure] = useState(false);

  useEffect(() => {
    loadTables();
  }, []);

  useEffect(() => {
    if (selectedTable) {
      loadTableData();
      loadTableStructure();
    }
  }, [selectedTable, currentPage]);

  const loadTables = async () => {
    try {
      const tables = await databaseAdminApi.getTables();
      setTables(tables);
    } catch (error) {
      console.error('Failed to load tables:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTableData = async () => {
    if (!selectedTable) return;
    
    setDataLoading(true);
    try {
      const data = await databaseAdminApi.getTableData(
        selectedTable, 
        currentPage, 
        pageSize, 
        searchTerm || undefined
      );
      setTableData(data);
    } catch (error) {
      console.error('Failed to load table data:', error);
    } finally {
      setDataLoading(false);
    }
  };

  const loadTableStructure = async () => {
    if (!selectedTable) return;
    
    try {
      const structure = await databaseAdminApi.getTableStructure(selectedTable);
      setTableInfo(structure);
    } catch (error) {
      console.error('Failed to load table structure:', error);
    }
  };

  const handleTableSelect = (tableName: string) => {
    setSelectedTable(tableName);
    setCurrentPage(1);
    setSearchTerm('');
    setShowStructure(false);
  };

  const handleSearch = () => {
    setCurrentPage(1);
    loadTableData();
  };

  const exportTableData = async (format: 'csv' | 'json' | 'sql') => {
    if (!selectedTable || !tableData) return;
    
    try {
      let content: string;
      
      if (format === 'csv') {
        const headers = tableData.columns.map(col => col.name).join(',');
        const rows = tableData.rows.map(row => 
          tableData.columns.map(col => {
            const value = row[col.name];
            return typeof value === 'string' && value.includes(',') 
              ? `"${value.replace(/"/g, '""')}"` 
              : value;
          }).join(',')
        );
        content = [headers, ...rows].join('\n');
      } else {
        content = JSON.stringify(tableData.rows, null, 2);
      }
      
      const blob = new Blob([content], { type: format === 'csv' ? 'text/csv' : 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedTable}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const filteredTables = tables.filter(table => 
    table.tableName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTypeColor = (type: string) => {
    const typeColors: Record<string, string> = {
      'int': 'bg-blue-100 text-blue-800',
      'varchar': 'bg-green-100 text-green-800',
      'text': 'bg-yellow-100 text-yellow-800',
      'datetime': 'bg-purple-100 text-purple-800',
      'boolean': 'bg-red-100 text-red-800',
      'uuid': 'bg-indigo-100 text-indigo-800'
    };
    return typeColors[type.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center gap-2">
          <Database className="h-5 w-5 animate-spin" />
          Loading database tables...
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
      {/* Tables List */}
      <div className="lg:col-span-1">
        <Card className="h-full">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <TableIcon className="h-5 w-5" />
                Tables ({tables.length})
              </h3>
              <Button size="sm" variant="outline" onClick={loadTables}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
            <Input
              placeholder="Search tables..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search className="h-4 w-4" />}
            />
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-[600px] overflow-y-auto">
              {filteredTables.map((table) => (
                <button
                  key={table.tableName}
                  onClick={() => handleTableSelect(table.tableName)}
                  className={`w-full text-left p-3 border-b hover:bg-gray-50 transition-colors ${
                    selectedTable === table.tableName ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{table.tableName}</p>
                      <p className="text-xs text-gray-500">
                        {table.rowCount.toLocaleString()} rows • {(table.sizeKB / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    {table.tableName.includes('audit') && (
                      <Badge variant="secondary" size="sm">Audit</Badge>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table Content */}
      <div className="lg:col-span-3">
        {selectedTable ? (
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  {selectedTable}
                  {tableInfo && (
                    <Badge variant="outline">
                      {tableInfo.rowCount.toLocaleString()} rows
                    </Badge>
                  )}
                </h3>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant={showStructure ? "default" : "outline"}
                    onClick={() => setShowStructure(!showStructure)}
                  >
                    <Info className="h-4 w-4 mr-1" />
                    Structure
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => exportTableData('csv')}>
                    <Download className="h-4 w-4 mr-1" />
                    Export
                  </Button>
                  <Button size="sm" variant="outline" onClick={loadTableData}>
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {!showStructure && (
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Search in table..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-xs"
                    leftIcon={<Search className="h-4 w-4" />}
                  />
                  <Button size="sm" onClick={handleSearch}>
                    Search
                  </Button>
                </div>
              )}
            </CardHeader>
            
            <CardContent>
              {showStructure ? (
                // Table Structure View
                <div className="space-y-4">
                  {tableInfo && (
                    <>
                      <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="text-sm text-gray-600">Columns</p>
                          <p className="text-lg font-semibold">{tableInfo.columns.length}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Indexes</p>
                          <p className="text-lg font-semibold">{tableInfo.indexes.length}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Size</p>
                          <p className="text-lg font-semibold">{(tableInfo.sizeKB / 1024).toFixed(2)} MB</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="font-semibold">Columns</h4>
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nullable</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Default</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Key</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                              {tableInfo.columns.map((column) => (
                                <tr key={column.name}>
                                  <td className="px-4 py-2 text-sm font-medium">
                                    {column.name}
                                    {column.isPrimaryKey && <Key className="inline h-3 w-3 ml-1 text-yellow-500" />}
                                  </td>
                                  <td className="px-4 py-2">
                                    <Badge size="sm" className={getTypeColor(column.type)}>
                                      {column.type}
                                    </Badge>
                                  </td>
                                  <td className="px-4 py-2 text-sm">
                                    {column.nullable ? '✓' : '✗'}
                                  </td>
                                  <td className="px-4 py-2 text-sm text-gray-500">
                                    {column.defaultValue || '—'}
                                  </td>
                                  <td className="px-4 py-2 text-sm">
                                    {column.isPrimaryKey && <Badge size="sm" variant="secondary">PK</Badge>}
                                    {column.isForeignKey && <Badge size="sm" variant="outline">FK</Badge>}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                // Table Data View
                <div className="space-y-4">
                  {dataLoading ? (
                    <div className="flex items-center justify-center p-8">
                      <div className="flex items-center gap-2">
                        <RefreshCw className="h-5 w-5 animate-spin" />
                        Loading table data...
                      </div>
                    </div>
                  ) : tableData ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <p>
                          Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, tableData.totalRows)} of {tableData.totalRows.toLocaleString()} rows
                        </p>
                        <p>Query executed in {tableData.executionTime}ms</p>
                      </div>

                      <div className="overflow-x-auto border rounded-lg">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              {tableData.columns.map((column) => (
                                <th
                                  key={column.name}
                                  className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                  {column.name}
                                  <Badge size="sm" className={`ml-2 ${getTypeColor(column.type)}`}>
                                    {column.type}
                                  </Badge>
                                </th>
                              ))}
                              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {tableData.rows.map((row, index) => (
                              <tr key={index} className="hover:bg-gray-50">
                                {tableData.columns.map((column) => (
                                  <td key={column.name} className="px-4 py-2 text-sm">
                                    <div className="max-w-xs truncate" title={String(row[column.name])}>
                                      {row[column.name] === null ? (
                                        <span className="text-gray-400 italic">NULL</span>
                                      ) : column.type.includes('date') ? (
                                        new Date(row[column.name]).toLocaleString()
                                      ) : (
                                        String(row[column.name])
                                      )}
                                    </div>
                                  </td>
                                ))}
                                <td className="px-4 py-2 text-right">
                                  <div className="flex items-center gap-1">
                                    <Button size="sm" variant="ghost">
                                      <Eye className="h-3 w-3" />
                                    </Button>
                                    <Button size="sm" variant="ghost">
                                      <Edit className="h-3 w-3" />
                                    </Button>
                                    <Button size="sm" variant="ghost">
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Pagination */}
                      <div className="flex items-center justify-between">
                        <Button
                          disabled={currentPage === 1}
                          onClick={() => setCurrentPage(currentPage - 1)}
                        >
                          Previous
                        </Button>
                        <span className="text-sm text-gray-600">
                          Page {currentPage} of {Math.ceil(tableData.totalRows / pageSize)}
                        </span>
                        <Button
                          disabled={currentPage * pageSize >= tableData.totalRows}
                          onClick={() => setCurrentPage(currentPage + 1)}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center p-8 text-gray-500">
                      Select a table to view its data
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className="h-full">
            <CardContent className="flex items-center justify-center h-64">
              <div className="text-center text-gray-500">
                <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Select a table from the left panel to browse its data</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}