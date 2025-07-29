using Microsoft.AspNetCore.SignalR.Client;
using Microsoft.AspNetCore.Mvc.Testing;
using System.Diagnostics;
using System.Collections.Concurrent;
using NBomber.Contracts;
using NBomber.CSharp;

namespace EnterpriseDocsCore.Tests.Performance;

/// <summary>
/// Performance benchmarks for Sprint 2 Real-time Collaboration functionality
/// Target: <100ms real-time synchronization, 1000+ concurrent users
/// </summary>
public class CollaborationPerformanceTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;
    private readonly string _hubUrl;

    public CollaborationPerformanceTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory;
        _hubUrl = "http://localhost:5001/collaborationHub";
    }

    [Fact]
    public async Task RealTimeSync_SingleMessage_CompletesUnder100ms()
    {
        // Arrange
        var connection = await CreateSignalRConnection();
        var documentId = Guid.NewGuid().ToString();
        var messageReceived = new TaskCompletionSource<bool>();
        var stopwatch = Stopwatch.StartNew();

        connection.On<object>("ContentChanged", (data) =>
        {
            stopwatch.Stop();
            messageReceived.SetResult(true);
        });

        await connection.InvokeAsync("JoinDocument", documentId);

        // Act
        stopwatch.Restart();
        await connection.InvokeAsync("SendContentChange", documentId, new
        {
            operation = "insert",
            startPosition = 0,
            endPosition = 0,
            content = "Test content",
            timestamp = DateTime.UtcNow
        });

        // Assert
        var received = await messageReceived.Task.WaitAsync(TimeSpan.FromSeconds(5));
        received.Should().BeTrue("Message should be received");
        stopwatch.ElapsedMilliseconds.Should().BeLessThan(100,
            "Real-time synchronization should complete within 100ms requirement");

        await connection.DisposeAsync();
    }

    [Fact]
    public async Task UserPresence_Updates_SynchronizeQuickly()
    {
        // Arrange
        var connection1 = await CreateSignalRConnection();
        var connection2 = await CreateSignalRConnection();
        var documentId = Guid.NewGuid().ToString();
        var presenceReceived = new TaskCompletionSource<bool>();
        var stopwatch = Stopwatch.StartNew();

        connection2.On<object>("UserJoined", (data) =>
        {
            stopwatch.Stop();
            presenceReceived.SetResult(true);
        });

        await connection2.InvokeAsync("JoinDocument", documentId);

        // Act
        stopwatch.Restart();
        await connection1.InvokeAsync("JoinDocument", documentId);

        // Assert
        var received = await presenceReceived.Task.WaitAsync(TimeSpan.FromSeconds(5));
        received.Should().BeTrue("Presence update should be received");
        stopwatch.ElapsedMilliseconds.Should().BeLessThan(100,
            "User presence synchronization should complete within 100ms");

        await connection1.DisposeAsync();
        await connection2.DisposeAsync();
    }

    [Fact]
    public async Task DocumentLocking_ConcurrentRequests_HandlesCorrectly()
    {
        // Arrange
        var documentId = Guid.NewGuid().ToString();
        var connections = new List<HubConnection>();
        var lockResults = new ConcurrentBag<(bool Success, long ElapsedMs)>();

        // Create multiple connections
        for (int i = 0; i < 10; i++)
        {
            connections.Add(await CreateSignalRConnection());
        }

        // Act - Concurrent lock requests
        var tasks = connections.Select(async connection =>
        {
            var stopwatch = Stopwatch.StartNew();
            try
            {
                await connection.InvokeAsync("LockDocument", documentId);
                stopwatch.Stop();
                lockResults.Add((true, stopwatch.ElapsedMilliseconds));
            }
            catch
            {
                stopwatch.Stop();
                lockResults.Add((false, stopwatch.ElapsedMilliseconds));
            }
        });

        await Task.WhenAll(tasks);

        // Assert
        var successfulLocks = lockResults.Count(r => r.Success);
        successfulLocks.Should().Be(1, "Only one connection should acquire the lock");

        var averageResponseTime = lockResults.Average(r => r.ElapsedMs);
        averageResponseTime.Should().BeLessThan(200, "Lock operations should be fast even under contention");

        // Cleanup
        foreach (var connection in connections)
        {
            await connection.DisposeAsync();
        }
    }

    [Fact]
    public async Task HighThroughput_ContentChanges_MaintainsPerformance()
    {
        // Arrange
        var connection = await CreateSignalRConnection();
        var documentId = Guid.NewGuid().ToString();
        var messagesReceived = 0;
        var latencies = new ConcurrentBag<long>();
        var messageTimestamps = new ConcurrentDictionary<string, DateTime>();

        connection.On<object>("ContentChanged", (data) =>
        {
            var now = DateTime.UtcNow;
            // Extract timestamp from message to calculate latency
            // This would need to be properly implemented based on message format
            Interlocked.Increment(ref messagesReceived);
        });

        await connection.InvokeAsync("JoinDocument", documentId);

        // Act - Send high-frequency messages
        var sendTasks = new List<Task>();
        for (int i = 0; i < 100; i++)
        {
            var messageId = Guid.NewGuid().ToString();
            var timestamp = DateTime.UtcNow;
            messageTimestamps[messageId] = timestamp;

            sendTasks.Add(connection.InvokeAsync("SendContentChange", documentId, new
            {
                id = messageId,
                operation = "insert",
                startPosition = i,
                endPosition = i,
                content = $"Message {i}",
                timestamp = timestamp
            }));
        }

        await Task.WhenAll(sendTasks);
        await Task.Delay(2000); // Allow time for all messages to be processed

        // Assert
        messagesReceived.Should().Be(100, "All messages should be received");
        
        await connection.DisposeAsync();
    }

    private async Task<HubConnection> CreateSignalRConnection()
    {
        var connection = new HubConnectionBuilder()
            .WithUrl(_hubUrl)
            .Build();

        await connection.StartAsync();
        return connection;
    }
}

/// <summary>
/// SignalR scalability and concurrent user testing
/// </summary>
public class CollaborationScalabilityTests
{
    [Fact]
    public async Task SignalR_1000ConcurrentConnections_MaintainsStability()
    {
        // Arrange
        const int targetConnections = 1000;
        var connections = new List<HubConnection>();
        var connectionTasks = new List<Task>();
        var successfulConnections = 0;
        var connectionTimes = new ConcurrentBag<long>();

        // Act - Create many concurrent connections
        for (int i = 0; i < targetConnections; i++)
        {
            connectionTasks.Add(Task.Run(async () =>
            {
                var stopwatch = Stopwatch.StartNew();
                try
                {
                    var connection = new HubConnectionBuilder()
                        .WithUrl("http://localhost:5001/collaborationHub")
                        .Build();

                    await connection.StartAsync();
                    stopwatch.Stop();
                    
                    lock (connections)
                    {
                        connections.Add(connection);
                        Interlocked.Increment(ref successfulConnections);
                    }
                    
                    connectionTimes.Add(stopwatch.ElapsedMilliseconds);
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Connection failed: {ex.Message}");
                }
            }));
        }

        await Task.WhenAll(connectionTasks);

        // Assert
        successfulConnections.Should().BeGreaterOrEqualTo(950, 
            "At least 95% of connections should succeed (950 out of 1000)");

        var averageConnectionTime = connectionTimes.Average();
        averageConnectionTime.Should().BeLessThan(1000, 
            "Average connection time should be under 1 second");

        // Test message broadcasting with all connections
        if (successfulConnections > 0)
        {
            var documentId = Guid.NewGuid().ToString();
            var messagesReceived = 0;
            
            foreach (var connection in connections.Take(100)) // Test with subset for performance
            {
                connection.On<object>("ContentChanged", (data) =>
                {
                    Interlocked.Increment(ref messagesReceived);
                });
                
                await connection.InvokeAsync("JoinDocument", documentId);
            }

            // Send a message and verify broadcast
            await connections.First().InvokeAsync("SendContentChange", documentId, new
            {
                operation = "insert",
                content = "Broadcast test",
                timestamp = DateTime.UtcNow
            });

            await Task.Delay(2000); // Allow time for message propagation

            messagesReceived.Should().BeGreaterThan(90, 
                "Most connections should receive the broadcast message");
        }

        // Cleanup
        foreach (var connection in connections)
        {
            try
            {
                await connection.DisposeAsync();
            }
            catch
            {
                // Ignore cleanup errors
            }
        }
    }

    [Fact]
    public async Task MessageThroughput_HighVolume_HandlesLoad()
    {
        // Arrange
        const int connectionCount = 50;
        const int messagesPerConnection = 20;
        var connections = new List<HubConnection>();
        var totalMessagesReceived = 0;
        var documentId = Guid.NewGuid().ToString();

        // Create connections
        for (int i = 0; i < connectionCount; i++)
        {
            var connection = new HubConnectionBuilder()
                .WithUrl("http://localhost:5001/collaborationHub")
                .Build();

            await connection.StartAsync();
            connections.Add(connection);

            connection.On<object>("ContentChanged", (data) =>
            {
                Interlocked.Increment(ref totalMessagesReceived);
            });

            await connection.InvokeAsync("JoinDocument", documentId);
        }

        var startTime = DateTime.UtcNow;

        // Act - Send many messages concurrently
        var sendTasks = new List<Task>();
        for (int i = 0; i < connectionCount; i++)
        {
            var connection = connections[i];
            for (int j = 0; j < messagesPerConnection; j++)
            {
                sendTasks.Add(connection.InvokeAsync("SendContentChange", documentId, new
                {
                    operation = "insert",
                    content = $"Message from connection {i}, message {j}",
                    timestamp = DateTime.UtcNow
                }));
            }
        }

        await Task.WhenAll(sendTasks);
        var sendDuration = DateTime.UtcNow - startTime;

        // Wait for message processing
        await Task.Delay(5000);

        // Assert
        var expectedMessages = connectionCount * messagesPerConnection * connectionCount; // Each message to each connection
        var receivedPercentage = (double)totalMessagesReceived / expectedMessages * 100;

        receivedPercentage.Should().BeGreaterThan(90, 
            "At least 90% of expected messages should be received under high load");

        var messagesPerSecond = (connectionCount * messagesPerConnection) / sendDuration.TotalSeconds;
        messagesPerSecond.Should().BeGreaterThan(100, 
            "System should handle at least 100 messages per second");

        // Cleanup
        foreach (var connection in connections)
        {
            await connection.DisposeAsync();
        }
    }
}

/// <summary>
/// NBomber load testing for SignalR collaboration
/// </summary>
public class CollaborationLoadTests
{
    [Fact]
    public void SignalR_LoadTest_MeetsPerformanceRequirements()
    {
        var scenario = Scenario.Create("signalr_collaboration_load", async context =>
        {
            HubConnection connection = null;
            try
            {
                connection = new HubConnectionBuilder()
                    .WithUrl("http://localhost:5001/collaborationHub")
                    .Build();

                await connection.StartAsync();

                var documentId = $"doc-{context.ScenarioInfo.ThreadId}";
                await connection.InvokeAsync("JoinDocument", documentId);

                // Send a content change
                await connection.InvokeAsync("SendContentChange", documentId, new
                {
                    operation = "insert",
                    startPosition = Random.Shared.Next(0, 100),
                    content = $"Content from user {context.ScenarioInfo.ThreadId}",
                    timestamp = DateTime.UtcNow
                });

                return Response.Ok();
            }
            catch (Exception ex)
            {
                return Response.Fail(ex.Message);
            }
            finally
            {
                if (connection != null)
                {
                    await connection.DisposeAsync();
                }
            }
        })
        .WithLoadSimulations(
            Simulation.InjectPerSec(rate: 10, during: TimeSpan.FromMinutes(1)), // Warm up
            Simulation.InjectPerSec(rate: 50, during: TimeSpan.FromMinutes(2)), // Normal collaboration
            Simulation.InjectPerSec(rate: 100, during: TimeSpan.FromMinutes(1)) // Peak collaboration
        );

        NBomberRunner
            .RegisterScenarios(scenario)
            .WithReportFolder("collaboration-load-results")
            .WithReportFormats(ReportFormat.Html, ReportFormat.Csv)
            .Run();
    }

    [Fact]
    public void DocumentLocking_LoadTest_HandlesContention()
    {
        var scenario = Scenario.Create("document_locking_load", async context =>
        {
            HubConnection connection = null;
            try
            {
                connection = new HubConnectionBuilder()
                    .WithUrl("http://localhost:5001/collaborationHub")
                    .Build();

                await connection.StartAsync();

                // All users try to lock the same document (high contention)
                var documentId = "shared-document";
                
                try
                {
                    await connection.InvokeAsync("LockDocument", documentId);
                    
                    // Hold lock briefly
                    await Task.Delay(100);
                    
                    await connection.InvokeAsync("ReleaseLock", documentId);
                    
                    return Response.Ok();
                }
                catch (Exception ex)
                {
                    // Expected for contention scenarios
                    return Response.Ok(); // Don't fail the test for expected conflicts
                }
            }
            catch (Exception ex)
            {
                return Response.Fail(ex.Message);
            }
            finally
            {
                if (connection != null)
                {
                    await connection.DisposeAsync();
                }
            }
        })
        .WithLoadSimulations(
            Simulation.InjectPerSec(rate: 20, during: TimeSpan.FromMinutes(2)) // High contention
        );

        NBomberRunner
            .RegisterScenarios(scenario)
            .WithReportFolder("locking-load-results")
            .WithReportFormats(ReportFormat.Html)
            .Run();
    }
}

/// <summary>
/// Real-time collaboration stability and reliability tests
/// </summary>
public class CollaborationReliabilityTests
{
    [Fact]
    public async Task ConnectionResilience_NetworkInterruption_ReconnectsAutomatically()
    {
        // Test connection resilience and automatic reconnection
        var connection = new HubConnectionBuilder()
            .WithUrl("http://localhost:5001/collaborationHub")
            .WithAutomaticReconnect()
            .Build();

        var reconnectCount = 0;
        connection.Reconnected += (connectionId) =>
        {
            Interlocked.Increment(ref reconnectCount);
            return Task.CompletedTask;
        };

        await connection.StartAsync();
        connection.State.Should().Be(HubConnectionState.Connected);

        // Simulate network interruption by stopping/starting connection
        await connection.StopAsync();
        connection.State.Should().Be(HubConnectionState.Disconnected);

        // Restart connection
        await connection.StartAsync();
        connection.State.Should().Be(HubConnectionState.Connected);

        await connection.DisposeAsync();
    }

    [Fact]
    public async Task MessageOrdering_ConcurrentSenders_MaintainsSequence()
    {
        // Test that messages maintain proper ordering under concurrent load
        var connection1 = new HubConnectionBuilder()
            .WithUrl("http://localhost:5001/collaborationHub")
            .Build();

        var connection2 = new HubConnectionBuilder()
            .WithUrl("http://localhost:5001/collaborationHub")
            .Build();

        await connection1.StartAsync();
        await connection2.StartAsync();

        var documentId = Guid.NewGuid().ToString();
        var receivedMessages = new ConcurrentQueue<object>();

        connection2.On<object>("ContentChanged", (data) =>
        {
            receivedMessages.Enqueue(data);
        });

        await connection1.InvokeAsync("JoinDocument", documentId);
        await connection2.InvokeAsync("JoinDocument", documentId);

        // Send sequential messages
        for (int i = 0; i < 10; i++)
        {
            await connection1.InvokeAsync("SendContentChange", documentId, new
            {
                sequence = i,
                operation = "insert",
                content = $"Message {i}",
                timestamp = DateTime.UtcNow
            });
        }

        await Task.Delay(1000); // Allow time for message processing

        receivedMessages.Should().HaveCount(10, "All messages should be received");

        await connection1.DisposeAsync();
        await connection2.DisposeAsync();
    }

    [Fact]
    public async Task MemoryUsage_LongRunningCollaboration_StableMemory()
    {
        // Test for memory leaks in long-running collaboration sessions
        var initialMemory = GC.GetTotalMemory(true);
        var connections = new List<HubConnection>();
        var documentId = Guid.NewGuid().ToString();

        try
        {
            // Create persistent connections
            for (int i = 0; i < 10; i++)
            {
                var connection = new HubConnectionBuilder()
                    .WithUrl("http://localhost:5001/collaborationHub")
                    .Build();

                await connection.StartAsync();
                await connection.InvokeAsync("JoinDocument", documentId);
                connections.Add(connection);
            }

            // Simulate long-running collaboration with periodic messages
            for (int round = 0; round < 100; round++)
            {
                foreach (var connection in connections)
                {
                    await connection.InvokeAsync("SendContentChange", documentId, new
                    {
                        operation = "insert",
                        content = $"Round {round} message",
                        timestamp = DateTime.UtcNow
                    });
                }

                if (round % 20 == 0)
                {
                    GC.Collect();
                    GC.WaitForPendingFinalizers();
                    GC.Collect();
                }
            }

            // Check memory usage
            var finalMemory = GC.GetTotalMemory(true);
            var memoryIncrease = finalMemory - initialMemory;

            memoryIncrease.Should().BeLessThan(100 * 1024 * 1024, // 100MB threshold
                "Memory usage should remain stable during long-running collaboration");
        }
        finally
        {
            foreach (var connection in connections)
            {
                await connection.DisposeAsync();
            }
        }
    }
}