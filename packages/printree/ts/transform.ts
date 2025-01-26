import type * as render from "./render.js";
import { leaf, parent } from "./render.js";

/**
 * Transforms a tree-structured data into a renderable format.
 *
 * This function converts any tree-structured data (e.g., AST) into a renderable format ({@link render.Input}).
 * The transformation process can be customized through mapping functions that define how to get child nodes
 * and generate text representations.
 *
 * @typeParam T - The type of input nodes
 * @param input - The tree-structured data to transform. Can be a single node or an array of nodes
 * @param mapping - Object defining transformation methods
 * @returns A renderable data structure
 *
 * @example
 * // AST example
 * interface Node {
 *   type: string;
 *   value?: number;
 * }
 *
 * const ast = {
 *   type: "Program",
 *   body: [{
 *     type: "Number",
 *     value: 42
 *   }]
 * };
 *
 * const result = transform<Node>(ast, {
 *   getChildren: node => node.type === "Program" ? node.body : undefined,
 *   toText: node => `${node.type}${node.value ? ` ${node.value}` : ""}`
 * });
 */
export function transform<T>(
	input: Input<T>,
	{ getChildren, toText }: Mapping<T>,
): render.Input {
	const fromNodeList = (nodes: ReadonlyArray<T>): ReadonlyArray<render.Node> =>
		nodes.map((node, index) => fromNode(node, index));

	const fromNode = (node: T, index: number, name?: string): render.Node => {
		const children = getChildren(node);
		const context = contextFor(index, name, children);
		return !children
			? leaf(toText(node, context))
			: parent(
					toText(node, context),
					children.map((child, index) =>
						isNamedChildren(child)
							? parent(child.name, fromNodeList(child.nodes))
							: isNamedChild(child)
								? fromNode(child.node, index, child.name)
								: fromNode(child, index),
					),
				);
	};

	return isArray(input) ? fromNodeList(input) : fromNode(input, 0);
}

/**
 * Input data type for transformation.
 * Accepts either a single node or an array of nodes.
 */
export type Input<T> = T | ReadonlyArray<T>;

/**
 * Mapping object that defines transformation methods.
 * Consists of two functions: getChildren and toText.
 */
export interface Mapping<T> {
	getChildren(node: T): undefined | Children<T>;
	toText(node: T, context: Context<T>): string;
}

/**
 * Array of child nodes.
 * Each child can be a regular node, a named child, or a group of named children.
 */
export type Children<T> = ReadonlyArray<Child<T>>;

/**
 * Represents a child node in the tree structure.
 * Can be either a regular node, a named child node, or a group of named children.
 */
export type Child<T> = T | NamedChild<T> | NamedChildren<T>;

/**
 * Named child node.
 * Used for nodes with named fields, such as "variable" or "value" in AST.
 */
export interface NamedChild<T> {
	readonly name: string;
	readonly node: T;
}

/**
 * Group of named children nodes.
 * Used for representing multiple nodes under a common name, such as "body" in AST.
 */
export interface NamedChildren<T> {
	readonly name: string;
	readonly nodes: ReadonlyArray<T>;
}

/**
 * Context information provided during node transformation.
 * Contains metadata about the current node being transformed.
 */
export interface Context<T> {
	readonly name?: undefined | string;
	readonly index: number;
	readonly children?: undefined | ReadonlyArray<T | ReadonlyArray<T>>;
}

/**
 * Creates a transformation context from the given parameters.
 * @internal
 */
const contextFor = <T>(
	index: number,
	name: undefined | string,
	children: undefined | Children<T>,
): Context<T> => {
	return {
		index,
		name,
		children: children?.map((child) =>
			isNamedChildren(child)
				? child.nodes
				: isNamedChild(child)
					? child.node
					: child,
		),
	};
};

/**
 * Type guard for checking if a value is an array.
 * @internal
 */
const isArray = (value: unknown): value is ReadonlyArray<unknown> =>
	Array.isArray(value);

/**
 * Type guard for checking if a value is a non-null object.
 * @internal
 */
const isObject = (value: unknown): value is object =>
	typeof value === "object" && value !== null;

/**
 * Type guard for checking if a child has a name property.
 * @internal
 */
const isNamed = <T>(
	child: Child<T>,
): child is NamedChild<T> | NamedChildren<T> =>
	isObject(child) && "name" in child && typeof child.name === "string";

/**
 * Type guard for checking if a child is a named child node.
 * @internal
 */
const isNamedChild = <T>(child: Child<T>): child is NamedChild<T> =>
	isNamed(child) && "node" in child;

/**
 * Type guard for checking if a child is a group of named children.
 * @internal
 */
const isNamedChildren = <T>(child: Child<T>): child is NamedChildren<T> =>
	isNamed(child) && "nodes" in child && isArray(child.nodes);
