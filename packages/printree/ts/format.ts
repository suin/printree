import { type Options as RenderingOptions, render } from "./render.js";
import { type Input, type Mapping, transform } from "./transform.js";

/**
 * Formats a tree structure into a human-readable ASCII tree representation.
 *
 * This function combines the transformation and rendering steps to create a formatted
 * string representation of a tree structure. It supports various types of tree data,
 * including:
 * - Basic tree structures
 * - Directory trees
 * - Abstract Syntax Trees (AST)
 * - JSON-like structures
 *
 * @typeParam T - The type of nodes in the input tree
 * @param input - The tree structure to format. Can be a single node or an array of nodes
 * @param options - Configuration options for transformation and rendering
 * @returns A string representation of the tree using ASCII characters
 *
 * @example
 * ```typescript
 * // Basic tree example
 * type Node = {
 *   kind: string;
 *   children?: Node[];
 *   value?: string;
 * };
 *
 * const tree: Node = {
 *   kind: "root",
 *   children: [
 *     {
 *       kind: "node",
 *       children: [
 *         { kind: "leaf", value: "Hello" },
 *         { kind: "leaf", value: "World" }
 *       ]
 *     }
 *   ]
 * };
 *
 * const result = format(tree, {
 *   mapping: {
 *     getChildren: node => node.children,
 *     toText: node => node.kind + (node.value ? `: ${node.value}` : "")
 *   }
 * });
 *
 * // Result:
 * // root
 * // └─ node
 * //    ├─ leaf: Hello
 * //    └─ leaf: World
 * ```
 */
export function format<T>(
	input: Input<T>,
	{ mapping, rendering }: Options<T>,
): string {
	return render(transform(input, mapping), rendering);
}

/**
 * Configuration options for tree formatting.
 *
 * @typeParam T - The type of nodes in the input tree
 */
export type Options<T> = {
	/** Mapping configuration for transforming the input tree */
	readonly mapping: Mapping<T>;
	/** Optional rendering configuration for customizing the output appearance */
	readonly rendering?: undefined | RenderingOptions;
};
