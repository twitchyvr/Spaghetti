import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Save, 
  Download, 
  History, 
  BookOpen, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Database,
  FileText
} from 'lucide-react';
import { Card, CardHeader, CardContent } from '../pantry/Card';
import { Button } from '../pantry/Button';
import { Input } from '../pantry/Input';
import { Badge } from '../pantry/Badge';
import { Alert } from '../pantry/Alert';
import { CustomQuery, QueryResult } from '../../types/database-admin';
import { databaseAdminApi } from '../../services/database-admin-api';

export function QueryInterface() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<QueryResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedQueries, setSavedQueries] = useState<CustomQuery[]>([]);
  const [queryHistory, setQueryHistory] = useState<Array<{
    query: string;
    timestamp: string;
    executionTime: number;
    success: boolean;
    error?: string;
  }>>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showSaved, setShowSaved] = useState(false);

  useEffect(() => {
    loadSavedQueries();
    loadQueryHistory();
  }, []);

  const loadSavedQueries = async () => {
    try {
      const queries = await databaseAdminApi.getSavedQueries();
      setSavedQueries(queries);
    } catch (error) {
      console.error('Failed to load saved queries:', error);
    }
  };

  const loadQueryHistory = async () => {
    try {
      const history = await databaseAdminApi.getQueryHistory();
      setQueryHistory(history);
    } catch (error) {
      console.error('Failed to load query history:', error);
    }
  };

  const executeQuery = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const result = await databaseAdminApi.executeQuery(query);

      setResult(result);
      
      // Add to history
      setQueryHistory(prev => [{
        query: query.trim(),
        timestamp: new Date().toISOString(),
        executionTime: result.executionTime,
        success: true
      }, ...prev.slice(0, 49)]); // Keep last 50 queries
      
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Query execution failed';
      setError(errorMessage);
      
      // Add failed query to history
      setQueryHistory(prev => [{
        query: query.trim(),
        timestamp: new Date().toISOString(),
        executionTime: 0,
        success: false,
        error: errorMessage
      }, ...prev.slice(0, 49)]);
    } finally {
      setLoading(false);
    }
  };

  const saveQuery = async () => {
    if (!query.trim()) return;

    const name = prompt('Enter a name for this query:');
    if (!name) return;

    try {
      await databaseAdminApi.saveQuery({
        name,
        sql: query.trim(),
        description: '',
        category: 'other',
        parameters: [],
        isPublic: true,
        createdBy: 'current-user'
      });
      
      loadSavedQueries();
    } catch (error) {
      console.error('Failed to save query:', error);
    }
  };

  const loadSavedQuery = (savedQuery: CustomQuery) => {
    setQuery(savedQuery.sql);
    setShowSaved(false);
  };

  const loadHistoryQuery = (historyItem: any) => {
    setQuery(historyItem.query);
    setShowHistory(false);
  };

  const exportResults = (format: 'csv' | 'json') => {
    if (!result || !result.rows.length) return;

    let content: string;
    let mimeType: string;
    let extension: string;

    if (format === 'csv') {
      const headers = result.columns.map(col => col.name).join(',');
      const rows = result.rows.map(row => 
        result.columns.map(col => {
          const value = row[col.name];
          return typeof value === 'string' && value.includes(',') 
            ? `"${value.replace(/"/g, '""')}"` 
            : value;
        }).join(',')
      );
      content = [headers, ...rows].join('\n');
      mimeType = 'text/csv';
      extension = 'csv';
    } else {
      content = JSON.stringify(result.rows, null, 2);
      mimeType = 'application/json';
      extension = 'json';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `query_results_${new Date().toISOString().split('T')[0]}.${extension}`;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const commonQueries = [
    {
      name: 'Show all tables',
      sql: `SELECT table_name, table_rows, data_length, index_length 
FROM information_schema.tables 
WHERE table_schema = DATABASE()
ORDER BY table_name;`
    },
    {
      name: 'Recent user activity',
      sql: `SELECT u.email, u.first_name, u.last_name, u.last_login_at, u.is_active
FROM users u 
ORDER BY u.last_login_at DESC 
LIMIT 20;`
    },
    {
      name: 'Document statistics by tenant',
      sql: `SELECT t.name as tenant_name, COUNT(d.id) as document_count, 
       AVG(LENGTH(d.content)) as avg_content_length
FROM tenants t
LEFT JOIN documents d ON t.id = d.tenant_id
GROUP BY t.id, t.name
ORDER BY document_count DESC;`
    }
  ];

  return (
    <div className="space-y-6">
      {/* Query Input */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Database className="h-5 w-5" />
              SQL Query Interface
            </h3>
            <div className="flex items-center gap-2">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => setShowSaved(!showSaved)}
              >
                <BookOpen className="h-4 w-4 mr-1" />
                Saved ({savedQueries.length})
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => setShowHistory(!showHistory)}
              >
                <History className="h-4 w-4 mr-1" />
                History
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative">
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter your SQL query here..."
                className="w-full h-32 p-3 border rounded-lg font-mono text-sm resize-vertical"
                spellCheck={false}
              />
              <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                {query.length} characters
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button onClick={executeQuery} disabled={!query.trim() || loading}>
                {loading ? (
                  <>
                    <Clock className="h-4 w-4 mr-1 animate-spin" />
                    Executing...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-1" />
                    Execute Query
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={saveQuery} disabled={!query.trim()}>
                <Save className="h-4 w-4 mr-1" />
                Save Query
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Common Queries */}
      <Card>
        <CardHeader>
          <h4 className="font-semibold">Common Queries</h4>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {commonQueries.map((commonQuery, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => setQuery(commonQuery.sql)}
                className="text-left justify-start h-auto p-3"
              >
                <div>
                  <p className="font-medium">{commonQuery.name}</p>
                  <p className="text-xs text-gray-500 truncate">
                    {commonQuery.sql.substring(0, 50)}...
                  </p>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Saved Queries */}
      {showSaved && (
        <Card>
          <CardHeader>
            <h4 className="font-semibold">Saved Queries</h4>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {savedQueries.length > 0 ? (
                savedQueries.map((savedQuery) => (
                  <div
                    key={savedQuery.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => loadSavedQuery(savedQuery)}
                  >
                    <div>
                      <p className="font-medium">{savedQuery.name}</p>
                      <p className="text-sm text-gray-500">{savedQuery.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" size="sm">{savedQuery.category}</Badge>
                        <span className="text-xs text-gray-400">
                          Executed {savedQuery.executionCount} times
                        </span>
                      </div>
                    </div>
                    <FileText className="h-4 w-4 text-gray-400" />
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No saved queries yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Query History */}
      {showHistory && (
        <Card>
          <CardHeader>
            <h4 className="font-semibold">Query History</h4>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {queryHistory.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() => loadHistoryQuery(item)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {item.success ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                      )}
                      <span className="text-xs text-gray-500">
                        {new Date(item.timestamp).toLocaleString()}
                      </span>
                      {item.success && (
                        <Badge variant="outline" size="sm">
                          {item.executionTime}ms
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm font-mono truncate">{item.query}</p>
                    {item.error && (
                      <p className="text-xs text-red-600 truncate">{item.error}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <Alert variant="error">
          <AlertTriangle className="h-4 w-4" />
          <div>
            <h4 className="font-medium">Query Error</h4>
            <p className="text-sm">{error}</p>
          </div>
        </Alert>
      )}

      {/* Results */}
      {result && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h4 className="font-semibold flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Query Results
                </h4>
                <Badge variant="outline">
                  {result.totalRows.toLocaleString()} rows
                </Badge>
                <Badge variant="outline">
                  {result.executionTime}ms
                </Badge>
              </div>
              {result.rows.length > 0 && (
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={() => exportResults('csv')}>
                    <Download className="h-4 w-4 mr-1" />
                    CSV
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => exportResults('json')}>
                    <Download className="h-4 w-4 mr-1" />
                    JSON
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {result.rows.length > 0 ? (
              <div className="overflow-x-auto border rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {result.columns.map((column) => (
                        <th
                          key={column.name}
                          className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {column.name}
                          <Badge size="sm" className="ml-2 bg-blue-100 text-blue-800">
                            {column.type}
                          </Badge>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {result.rows.slice(0, 100).map((row, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        {result.columns.map((column) => (
                          <td key={column.name} className="px-4 py-2 text-sm">
                            <div className="max-w-xs truncate" title={String(row[column.name])}>
                              {row[column.name] === null ? (
                                <span className="text-gray-400 italic">NULL</span>
                              ) : (
                                String(row[column.name])
                              )}
                            </div>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Query executed successfully but returned no results.
              </div>
            )}
            
            {result.affectedRows !== undefined && (
              <div className="mt-2 text-sm text-gray-600">
                {result.affectedRows} rows affected
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}