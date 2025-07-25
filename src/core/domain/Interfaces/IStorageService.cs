namespace EnterpriseDocsCore.Domain.Interfaces;

/// <summary>
/// Interface for file storage operations
/// </summary>
public interface IStorageService
{
    /// <summary>
    /// Saves a file and returns the storage path/identifier
    /// </summary>
    Task<string> SaveFileAsync(Stream fileStream, string fileName, CancellationToken cancellationToken = default);
    
    /// <summary>
    /// Retrieves a file by its storage path/identifier
    /// </summary>
    Task<Stream> GetFileAsync(string storagePath, CancellationToken cancellationToken = default);
    
    /// <summary>
    /// Deletes a file by its storage path/identifier
    /// </summary>
    Task<bool> DeleteFileAsync(string storagePath, CancellationToken cancellationToken = default);
    
    /// <summary>
    /// Gets the URL for direct file access (if supported)
    /// </summary>
    Task<string?> GetFileUrlAsync(string storagePath, TimeSpan? expiry = null, CancellationToken cancellationToken = default);
    
    /// <summary>
    /// Checks if a file exists
    /// </summary>
    Task<bool> FileExistsAsync(string storagePath, CancellationToken cancellationToken = default);
    
    /// <summary>
    /// Gets file metadata
    /// </summary>
    Task<FileMetadata?> GetFileMetadataAsync(string storagePath, CancellationToken cancellationToken = default);
    
    /// <summary>
    /// Copies a file to a new location
    /// </summary>
    Task<string> CopyFileAsync(string sourceStoragePath, string destinationFileName, CancellationToken cancellationToken = default);
    
    /// <summary>
    /// Gets the total storage usage for a tenant
    /// </summary>
    Task<long> GetStorageUsageAsync(string tenantId, CancellationToken cancellationToken = default);
    
    /// <summary>
    /// Lists files in a directory/container
    /// </summary>
    Task<IEnumerable<FileInfo>> ListFilesAsync(string path = "", CancellationToken cancellationToken = default);
}

/// <summary>
/// File metadata information
/// </summary>
public class FileMetadata
{
    public string FileName { get; set; } = string.Empty;
    public long Size { get; set; }
    public string ContentType { get; set; } = string.Empty;
    public DateTime Created { get; set; }
    public DateTime LastModified { get; set; }
    public string ETag { get; set; } = string.Empty;
    public Dictionary<string, string> CustomMetadata { get; set; } = new();
}

/// <summary>
/// File information for directory listings
/// </summary>
public class FileInfo
{
    public string Name { get; set; } = string.Empty;
    public string FullPath { get; set; } = string.Empty;
    public long Size { get; set; }
    public DateTime LastModified { get; set; }
    public bool IsDirectory { get; set; }
    public string ContentType { get; set; } = string.Empty;
}