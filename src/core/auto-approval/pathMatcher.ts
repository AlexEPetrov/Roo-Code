import { minimatch } from "minimatch"

/**
 * Check if a file path matches any of the allowed directory patterns.
 * Supports glob patterns like `src/**`, `tests/**`, `node_modules/**`, etc.
 *
 * @param filePath - The file path to check (relative to workspace root)
 * @param allowedPatterns - Array of glob patterns or directory paths
 * @returns true if the file path matches any of the allowed patterns
 *
 * @example
 * // Basic directory match
 * isPathInAllowedDirs("src/index.ts", ["src"])
 * // Returns true
 *
 * // Glob pattern match
 * isPathInAllowedDirs("src/utils/helpers.ts", ["src/**"])
 * // Returns true
 *
 * // Multiple patterns
 * isPathInAllowedDirs("tests/unit.test.ts", ["src", "tests/**", "build"])
 * // Returns true
 *
 * // Nested glob
 * isPathInAllowedDirs("src/core/tools/file.ts", ["src/core/**"])
 * // Returns true
 */
export function isPathInAllowedDirs(filePath: string, allowedPatterns?: string[]): boolean {
	if (!allowedPatterns || allowedPatterns.length === 0) {
		return false
	}

	// Normalize path to forward slashes for consistent matching
	const normalizedPath = filePath.replace(/\\/g, "/")

	// Check each pattern
	return allowedPatterns.some((pattern) => {
		const normalizedPattern = pattern.replace(/\\/g, "/")

		// If pattern doesn't contain *, treat it as a directory prefix
		// This means "src" matches "src/file.ts", "src/subfolder/file.ts", etc.
		if (!normalizedPattern.includes("*")) {
			const dirPattern = normalizedPattern.endsWith("/") ? normalizedPattern : normalizedPattern + "/"
			return normalizedPath.startsWith(dirPattern) || normalizedPath === normalizedPattern
		}

		// Use minimatch for glob patterns
		return minimatch(normalizedPath, normalizedPattern, {
			dot: true, // Allow matching dotfiles
			noglobstar: false, // Support ** for matching any number of directories
		})
	})
}

/**
 * Extract the directory path from a full file path.
 *
 * @example
 * extractDirFromPath("src/utils/helpers.ts")
 * // Returns "src/utils"
 *
 * extractDirFromPath("file.ts")
 * // Returns ""
 */
export function extractDirFromPath(filePath: string): string {
	const normalized = filePath.replace(/\\/g, "/")
	const lastSlashIndex = normalized.lastIndexOf("/")
	return lastSlashIndex === -1 ? "" : normalized.slice(0, lastSlashIndex)
}
