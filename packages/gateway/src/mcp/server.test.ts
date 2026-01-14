/**
 * Tests for ONDC MCP Server
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ONDCMcpServer } from './server';

// Mock the MCP SDK modules
vi.mock('@modelcontextprotocol/sdk/server/mcp.js', () => ({
  McpServer: vi.fn().mockImplementation(() => ({
    connect: vi.fn().mockResolvedValue(undefined),
    close: vi.fn().mockResolvedValue(undefined),
    registerTool: vi.fn(),
  })),
}));

vi.mock('@modelcontextprotocol/sdk/server/stdio.js', () => ({
  StdioServerTransport: vi.fn().mockImplementation(() => ({})),
}));

describe('ONDCMcpServer', () => {
  let server: ONDCMcpServer;

  beforeEach(() => {
    server = new ONDCMcpServer({
      name: 'test-server',
      version: '1.0.0',
    });
    // Clear any SIGINT listeners from previous tests
    vi.clearAllMocks();
  });

  afterEach(async () => {
    if (server.isRunning()) {
      await server.stop();
    }
  });

  describe('constructor', () => {
    it('should create server with config', () => {
      expect(server).toBeDefined();
      expect(server.isRunning()).toBe(false);
    });

    it('should expose underlying McpServer', () => {
      const mcpServer = server.getServer();
      expect(mcpServer).toBeDefined();
    });
  });

  describe('start', () => {
    it('should connect via stdio transport', async () => {
      await server.start();

      expect(server.isRunning()).toBe(true);
      const mcpServer = server.getServer();
      expect(mcpServer.connect).toHaveBeenCalledTimes(1);
    });

    it('should throw if already connected', async () => {
      await server.start();

      await expect(server.start()).rejects.toThrow('Server is already connected');
    });

    it('should register SIGINT handler', async () => {
      const onSpy = vi.spyOn(process, 'on');

      await server.start();

      expect(onSpy).toHaveBeenCalledWith('SIGINT', expect.any(Function));
      onSpy.mockRestore();
    });
  });

  describe('stop', () => {
    it('should close server and disconnect', async () => {
      await server.start();
      expect(server.isRunning()).toBe(true);

      await server.stop();

      expect(server.isRunning()).toBe(false);
      const mcpServer = server.getServer();
      expect(mcpServer.close).toHaveBeenCalledTimes(1);
    });

    it('should be safe to call when not connected', async () => {
      await server.stop(); // Should not throw
      expect(server.isRunning()).toBe(false);
    });

    it('should remove SIGINT handler', async () => {
      const removeSpy = vi.spyOn(process, 'removeListener');

      await server.start();
      await server.stop();

      expect(removeSpy).toHaveBeenCalledWith('SIGINT', expect.any(Function));
      removeSpy.mockRestore();
    });
  });

  describe('isRunning', () => {
    it('should return false before start', () => {
      expect(server.isRunning()).toBe(false);
    });

    it('should return true after start', async () => {
      await server.start();
      expect(server.isRunning()).toBe(true);
    });

    it('should return false after stop', async () => {
      await server.start();
      await server.stop();
      expect(server.isRunning()).toBe(false);
    });
  });

  describe('getServer', () => {
    it('should return McpServer instance for tool registration', () => {
      const mcpServer = server.getServer();

      expect(mcpServer).toBeDefined();
      expect(typeof mcpServer.registerTool).toBe('function');
    });
  });

  describe('graceful shutdown', () => {
    it('should handle SIGINT gracefully', async () => {
      // Create a mock for process.exit to prevent actual exit
      const exitSpy = vi.spyOn(process, 'exit').mockImplementation((() => {}) as never);
      const onSpy = vi.spyOn(process, 'on');

      await server.start();

      // Get the SIGINT handler that was registered
      const sigintCall = onSpy.mock.calls.find(([event]) => event === 'SIGINT');
      expect(sigintCall).toBeDefined();

      const sigintHandler = sigintCall![1] as () => Promise<void>;

      // Simulate SIGINT
      await sigintHandler();

      expect(server.isRunning()).toBe(false);
      expect(exitSpy).toHaveBeenCalledWith(0);

      exitSpy.mockRestore();
      onSpy.mockRestore();
    });
  });
});
