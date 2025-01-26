/**
 * Renders a tree structure as a text representation with ASCII art-style branch
 * connections.
 * @param input - The tree structure to render (a single node or an array of
 * nodes)
 * @param options - Optional rendering options
 * @returns The text representation of the tree
 */
export function render(input: Input, options: Options = {}): string {
	const glyphs = options.glyphs ?? DEFAULT_GLYPHS;
	if (isArray(input)) {
		return input
			.map((node, index) =>
				renderNode(node, glyphs, "", index === input.length - 1, false),
			)
			.join("\n");
	}
	return renderNode(input, glyphs, "", true, true);
}

/**
 * Represents the glyphs used for rendering the tree structure.
 */
export interface Glyphs {
	readonly corner: string;
	readonly branch: string;
	readonly vertical: string;
	readonly indent: string;
}

/**
 * Represents the options for rendering the tree structure.
 */
export interface Options {
	readonly glyphs?: undefined | Glyphs;
}

/**
 * Default glyphs used for rendering the tree structure.
 */
export const DEFAULT_GLYPHS: Glyphs = {
	corner: "└─ ",
	branch: "├─ ",
	vertical: "│  ",
	indent: "   ",
};

/**
 * Represents a leaf node in the tree structure. A leaf node has no children and
 * contains only text content.
 */
export interface Leaf {
	readonly text: string;
	readonly children?: never;
}

/**
 * Represents a parent node in the tree structure. A parent node contains text
 * content and can have child nodes.
 */
export interface Parent {
	readonly text: string;
	readonly children: ReadonlyArray<Node>;
}

/**
 * Represents any node in the tree structure. Can be either a leaf node or a
 * parent node.
 */
export type Node = Leaf | Parent;

/**
 * Represents the input for the tree renderer. Can be either a single node or an
 * array of nodes.
 */
export type Input = Node | ReadonlyArray<Node>;

/**
 * Creates a new leaf node.
 * @param text - The text content of the leaf node
 * @returns A new leaf node
 */
export function leaf(text: string): Leaf {
	return { text };
}

/**
 * Creates a new parent node.
 * @param text - The text content of the parent node
 * @param children - An array of child nodes
 * @returns A new parent node
 */
export function parent(text: string, children: ReadonlyArray<Node>): Parent {
	return { text, children };
}

/**
 * Type guard to check if a node is a leaf node.
 * @param node - The node to check
 * @returns True if the node is a leaf node, false otherwise
 */
export function isLeaf(node: Node): node is Leaf {
	return node.children === undefined;
}

/**
 * Type guard to check if a node is a parent node.
 * @param node - The node to check
 * @returns True if the node is a parent node, false otherwise
 */
export function isParent(node: Node): node is Parent {
	return node.children !== undefined;
}

/**
 * Type guard to check if a value is a ReadonlyArray.
 * @param value - The value to check
 * @returns True if the value is an array, false otherwise
 * @internal
 */
function isArray<T>(value: T | ReadonlyArray<T>): value is ReadonlyArray<T> {
	return Array.isArray(value);
}

/**
 * Renders a tree node as a text representation with ASCII art-style branch
 * connections.
 * @param node - The node to render
 * @param glyphs - The glyphs to use for rendering
 * @param prefix - The prefix string for indentation and branch lines
 * @param isLast - Whether this node is the last child of its parent
 * @param isRoot - Whether this node is the root node
 * @returns The text representation of the node and its children
 * @internal
 */
function renderNode(
	node: Node,
	glyphs: Glyphs,
	prefix = "",
	isLast = true,
	isRoot = true,
): string {
	const nodePrefix = isRoot
		? ""
		: `${prefix}${isLast ? glyphs.corner : glyphs.branch}`;
	const childPrefix = isRoot
		? ""
		: `${prefix}${isLast ? glyphs.indent : glyphs.vertical}`;

	if (isLeaf(node)) {
		return `${nodePrefix}${node.text}`;
	}

	const childrenStr =
		node.children.length > 0
			? `\n${node.children
					.map((child, index) =>
						renderNode(
							child,
							glyphs,
							childPrefix,
							index === node.children.length - 1,
							false,
						),
					)
					.join("\n")}`
			: "";

	return `${nodePrefix}${node.text}${childrenStr}`;
}
