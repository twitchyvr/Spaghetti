using BenchmarkDotNet.Running;
using Microsoft.AspNetCore.Mvc.Testing;
using System.Diagnostics;
using System.Net.Http.Json;
using System.Text.Json;
using NBomber.Contracts;
using NBomber.CSharp;

namespace EnterpriseDocsCore.Tests.Performance;

/// <summary>
/// Performance benchmarks for Sprint 2 Search functionality
/// Target: <200ms search response time under load
/// </summary>
public class SearchPerformanceTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;
    private readonly HttpClient _client;
    private readonly JsonSerializerOptions _jsonOptions;

    public SearchPerformanceTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
        _jsonOptions = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
    }

    [Fact]
    public async Task SearchResponse_SingleRequest_CompletesUnder200ms()
    {
        // Arrange
        var searchRequest = new
        {
            query = "enterprise document management",
            page = 1,
            pageSize = 20,
            sortBy = "relevance",
            sortOrder = "desc"
        };

        var stopwatch = Stopwatch.StartNew();

        // Act
        var response = await _client.PostAsJsonAsync("/api/search/advanced", searchRequest);

        // Assert
        stopwatch.Stop();
        response.Should().BeSuccessful();
        stopwatch.ElapsedMilliseconds.Should().BeLessThan(200, 
            "Search response should complete within 200ms requirement");
    }

    [Fact]
    public async Task AutoComplete_SingleRequest_CompletesUnder100ms()
    {
        // Arrange
        var stopwatch = Stopwatch.StartNew();

        // Act
        var response = await _client.GetAsync("/api/search/suggestions?query=doc&limit=10");

        // Assert
        stopwatch.Stop();
        response.Should().BeSuccessful();
        stopwatch.ElapsedMilliseconds.Should().BeLessThan(100,
            "Auto-complete should complete within 100ms requirement");
    }

    [Fact]
    public async Task ConcurrentSearch_50Users_MaintainsPerformance()
    {
        // Arrange
        var searchRequest = new
        {
            query = "concurrent performance test",
            page = 1,
            pageSize = 10
        };

        var tasks = new List<Task<(HttpResponseMessage Response, long ElapsedMs)>>();

        // Act - Simulate 50 concurrent users
        for (int i = 0; i < 50; i++)
        {
            tasks.Add(MeasureSearchRequest(searchRequest));
        }

        var results = await Task.WhenAll(tasks);

        // Assert
        results.Should().AllSatisfy(result =>
        {
            result.Response.Should().BeSuccessful("All concurrent requests should succeed");
            result.ElapsedMs.Should().BeLessThan(500, "Response time should remain reasonable under load");
        });

        var averageResponseTime = results.Average(r => r.ElapsedMs);
        averageResponseTime.Should().BeLessThan(300, "Average response time should be acceptable under load");
    }

    private async Task<(HttpResponseMessage Response, long ElapsedMs)> MeasureSearchRequest(object searchRequest)
    {
        var stopwatch = Stopwatch.StartNew();
        var response = await _client.PostAsJsonAsync("/api/search/advanced", searchRequest);
        stopwatch.Stop();
        return (response, stopwatch.ElapsedMilliseconds);
    }
}

/// <summary>
/// NBomber load testing scenarios for Sprint 2 Search
/// </summary>
public class SearchLoadTests
{
    [Fact]
    public void SearchEndpoint_LoadTest_MeetsPerformanceRequirements()
    {
        var scenario = Scenario.Create("search_load_test", async context =>
        {
            var client = new HttpClient();
            client.BaseAddress = new Uri("http://localhost:5001");

            var searchRequest = new
            {
                query = $"test query {context.ScenarioInfo.ThreadId}",
                page = 1,
                pageSize = 20
            };

            try
            {
                var response = await client.PostAsJsonAsync("/api/search/advanced", searchRequest);
                
                if (response.IsSuccessStatusCode)
                {
                    return Response.Ok();
                }
                else
                {
                    return Response.Fail($"Status: {response.StatusCode}");
                }
            }
            catch (Exception ex)
            {
                return Response.Fail(ex.Message);
            }
        })
        .WithLoadSimulations(
            Simulation.InjectPerSec(rate: 10, during: TimeSpan.FromMinutes(1)), // Warm up
            Simulation.InjectPerSec(rate: 50, during: TimeSpan.FromMinutes(2)), // Normal load
            Simulation.InjectPerSec(rate: 100, during: TimeSpan.FromMinutes(1)) // Peak load
        );

        NBomberRunner
            .RegisterScenarios(scenario)
            .WithReportFolder("load-test-results")
            .WithReportFormats(ReportFormat.Html, ReportFormat.Csv)
            .Run();
    }

    [Fact]
    public void AutoComplete_LoadTest_HandlesHighFrequencyRequests()
    {
        var scenario = Scenario.Create("autocomplete_load_test", async context =>
        {
            var client = new HttpClient();
            client.BaseAddress = new Uri("http://localhost:5001");

            var queries = new[] { "doc", "ent", "man", "pro", "con" };
            var query = queries[Random.Shared.Next(queries.Length)];

            try
            {
                var response = await client.GetAsync($"/api/search/suggestions?query={query}&limit=10");
                
                if (response.IsSuccessStatusCode)
                {
                    return Response.Ok();
                }
                else
                {
                    return Response.Fail($"Status: {response.StatusCode}");
                }
            }
            catch (Exception ex)
            {
                return Response.Fail(ex.Message);
            }
        })
        .WithLoadSimulations(
            Simulation.InjectPerSec(rate: 20, during: TimeSpan.FromMinutes(1)), // High frequency typing
            Simulation.InjectPerSec(rate: 100, during: TimeSpan.FromSeconds(30)) // Burst load
        );

        NBomberRunner
            .RegisterScenarios(scenario)
            .WithReportFolder("autocomplete-load-results")
            .WithReportFormats(ReportFormat.Html)
            .Run();
    }
}

/// <summary>
/// BenchmarkDotNet micro-benchmarks for search operations
/// </summary>
[MemoryDiagnoser]
[SimpleJob(BenchmarkDotNet.Jobs.RuntimeMoniker.Net80)]
public class SearchMicroBenchmarks
{
    private readonly HttpClient _client;
    private readonly object _searchRequest;

    public SearchMicroBenchmarks()
    {
        _client = new HttpClient();
        _client.BaseAddress = new Uri("http://localhost:5001");
        
        _searchRequest = new
        {
            query = "benchmark test query",
            page = 1,
            pageSize = 10
        };
    }

    [Benchmark]
    public async Task<HttpResponseMessage> AdvancedSearchBenchmark()
    {
        return await _client.PostAsJsonAsync("/api/search/advanced", _searchRequest);
    }

    [Benchmark]
    public async Task<HttpResponseMessage> AutoCompleteBenchmark()
    {
        return await _client.GetAsync("/api/search/suggestions?query=bench&limit=5");
    }

    [Benchmark]
    public async Task<HttpResponseMessage> FullTextSearchBenchmark()
    {
        return await _client.GetAsync("/api/search/fulltext?query=benchmark&page=1&pageSize=10");
    }

    [GlobalCleanup]
    public void Cleanup()
    {
        _client.Dispose();
    }
}

/// <summary>
/// Memory and resource usage tests for search functionality
/// </summary>
public class SearchResourceTests
{
    [Fact]
    public async Task SearchOperations_RepeatedRequests_NoMemoryLeaks()
    {
        // Arrange
        var client = new HttpClient();
        client.BaseAddress = new Uri("http://localhost:5001");
        
        var initialMemory = GC.GetTotalMemory(true);
        var searchRequest = new
        {
            query = "memory leak test",
            page = 1,
            pageSize = 20
        };

        // Act - Perform many search requests
        for (int i = 0; i < 1000; i++)
        {
            var response = await client.PostAsJsonAsync("/api/search/advanced", searchRequest);
            response.Dispose();
            
            if (i % 100 == 0)
            {
                GC.Collect();
                GC.WaitForPendingFinalizers();
                GC.Collect();
            }
        }

        // Assert
        var finalMemory = GC.GetTotalMemory(true);
        var memoryIncrease = finalMemory - initialMemory;
        
        // Allow for some memory increase but detect significant leaks
        memoryIncrease.Should().BeLessThan(50 * 1024 * 1024, // 50MB threshold
            "Memory usage should not increase significantly after repeated operations");
    }

    [Fact]
    public async Task ConcurrentSearches_HighLoad_StableResourceUsage()
    {
        // Test resource stability under concurrent load
        var client = new HttpClient();
        client.BaseAddress = new Uri("http://localhost:5001");
        
        var searchRequest = new
        {
            query = "concurrent resource test",
            page = 1,
            pageSize = 10
        };

        var beforeMemory = GC.GetTotalMemory(true);
        var tasks = new List<Task>();

        // Generate high concurrent load
        for (int i = 0; i < 100; i++)
        {
            tasks.Add(client.PostAsJsonAsync("/api/search/advanced", searchRequest));
        }

        await Task.WhenAll(tasks);
        
        GC.Collect();
        GC.WaitForPendingFinalizers();
        GC.Collect();
        
        var afterMemory = GC.GetTotalMemory(true);
        var memoryIncrease = afterMemory - beforeMemory;
        
        memoryIncrease.Should().BeLessThan(30 * 1024 * 1024, // 30MB threshold
            "Concurrent operations should not cause excessive memory usage");
    }
}

/// <summary>
/// Performance regression detection tests
/// </summary>
public class SearchRegressionTests
{
    private readonly Dictionary<string, long> _baselineMetrics = new()
    {
        { "AdvancedSearch", 150 }, // 150ms baseline
        { "AutoComplete", 75 },    // 75ms baseline
        { "FullTextSearch", 100 }  // 100ms baseline
    };

    [Theory]
    [InlineData("AdvancedSearch", "/api/search/advanced")]
    [InlineData("AutoComplete", "/api/search/suggestions?query=test&limit=10")]
    [InlineData("FullTextSearch", "/api/search/fulltext?query=test&page=1&pageSize=10")]
    public async Task SearchEndpoint_PerformanceRegression_WithinThreshold(string operation, string endpoint)
    {
        // Arrange
        var client = new HttpClient();
        client.BaseAddress = new Uri("http://localhost:5001");
        var baseline = _baselineMetrics[operation];
        var measurements = new List<long>();

        // Act - Take multiple measurements
        for (int i = 0; i < 10; i++)
        {
            var stopwatch = Stopwatch.StartNew();
            
            HttpResponseMessage response;
            if (operation == "AdvancedSearch")
            {
                var request = new { query = "regression test", page = 1, pageSize = 10 };
                response = await client.PostAsJsonAsync(endpoint, request);
            }
            else
            {
                response = await client.GetAsync(endpoint);
            }
            
            stopwatch.Stop();
            response.Should().BeSuccessful();
            measurements.Add(stopwatch.ElapsedMilliseconds);
        }

        // Assert - Check for performance regression
        var averageTime = measurements.Average();
        var regressionThreshold = baseline * 1.2; // 20% regression threshold
        
        averageTime.Should().BeLessThan(regressionThreshold,
            $"{operation} performance should not regress beyond 20% of baseline ({baseline}ms)");
    }
}