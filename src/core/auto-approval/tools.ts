import type { ClineSayTool } from "@roo-code/types"
import { isPathInAllowedDirs } from "./pathMatcher"

export function isWriteToolAction(tool: ClineSayTool): boolean {
	return ["editedExistingFile", "appliedDiff", "newFileCreated", "generateImage"].includes(tool.tool)
}

export function isReadOnlyToolAction(tool: ClineSayTool): boolean {
	return [
		"readFile",
		"listFiles",
		"listFilesTopLevel",
		"listFilesRecursive",
		"searchFiles",
		"codebaseSearch",
		"runSlashCommand",
	].includes(tool.tool)
}

/**
 * Check if a write operation is in an allowed directory.
 * If allowedWriteDirs is provided and not empty, the file must be in one of those directories.
 *
 * @param tool - The tool being executed
 * @param allowedWriteDirs - List of allowed directories for auto-approval (glob patterns supported)
 * @returns true if write is allowed in this directory, false if explicitly restricted
 */
export function isWriteInAllowedDir(tool: ClineSayTool, allowedWriteDirs?: string[]): boolean {
	// If no restrictions are configured, return true (use default behavior)
	if (!allowedWriteDirs || allowedWriteDirs.length === 0) {
		return true
	}

	// Get the file path from the tool
	const filePath = getFilePathFromTool(tool)
	if (!filePath) {
		return true // If we can't determine path, allow it (safer default)
	}

	// Check if path matches any allowed directory
	return isPathInAllowedDirs(filePath, allowedWriteDirs)
}

/**
 * Check if a read operation is in an allowed directory.
 * If allowedReadDirs is provided and not empty, the file must be in one of those directories.
 *
 * @param tool - The tool being executed
 * @param allowedReadDirs - List of allowed directories for auto-approval (glob patterns supported)
 * @returns true if read is allowed in this directory, false if explicitly restricted
 */
export function isReadInAllowedDir(tool: ClineSayTool, allowedReadDirs?: string[]): boolean {
	// If no restrictions are configured, return true (use default behavior)
	if (!allowedReadDirs || allowedReadDirs.length === 0) {
		return true
	}

	// Get the file path from the tool
	const filePath = getFilePathFromTool(tool)
	if (!filePath) {
		return true // If we can't determine path, allow it (safer default)
	}

	// Check if path matches any allowed directory
	return isPathInAllowedDirs(filePath, allowedReadDirs)
}

/**
 * Extract file path from a tool object based on tool type.
 * Returns the path that should be checked against allowed directories.
 *
 * @param tool - The tool object
 * @returns The file/directory path, or undefined if not applicable
 */
function getFilePathFromTool(tool: ClineSayTool): string | undefined {
	// Write operations
	if (tool.tool === "editedExistingFile" || tool.tool === "appliedDiff") {
		return (tool as any).path || (tool as any).filePath
	}

	if (tool.tool === "newFileCreated") {
		return (tool as any).path || (tool as any).filePath
	}

	if (tool.tool === "generateImage") {
		return (tool as any).path || (tool as any).filePath
	}

	// Read operations
	if (tool.tool === "readFile") {
		return (tool as any).path || (tool as any).filePath
	}

	if (tool.tool === "listFiles" || tool.tool === "listFilesTopLevel" || tool.tool === "listFilesRecursive") {
		return (tool as any).path || (tool as any).directory || (tool as any).dirPath
	}

	if (tool.tool === "searchFiles") {
		return (tool as any).path || (tool as any).directory
	}

	if (tool.tool === "codebaseSearch") {
		// Codebase search operates on whole codebase, not a specific path
		return undefined
	}

	if (tool.tool === "runSlashCommand") {
		// Slash commands don't have a specific file path
		return undefined
	}

	return undefined
}
