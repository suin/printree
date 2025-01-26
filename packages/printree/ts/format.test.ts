import { outdent } from "outdent";
import { describe, expect, test } from "vitest";
import { type Options, format } from "./format.js";

describe("format", () => {
	describe("Basic tree formatting", () => {
		type Node = Parent | Leaf;
		type Parent = { kind: string; children: Node[] };
		type Leaf = { kind: string; value: string };
		const options: Options<Node> = {
			mapping: {
				getChildren(node) {
					return "children" in node ? node.children : undefined;
				},
				toText(node) {
					let text = node.kind;
					if ("value" in node) {
						text += `: ${JSON.stringify(node.value)}`;
					}
					return text;
				},
			},
		};

		test("should format tree with root node into ASCII tree representation", () => {
			const input: Node = {
				kind: "root",
				children: [
					{
						kind: "node",
						children: [
							{ kind: "leaf", value: "Hello" },
							{ kind: "leaf", value: "World!" },
						],
					},
					{
						kind: "node",
						children: [
							{ kind: "leaf", value: "Bonjour" },
							{ kind: "leaf", value: "le monde!" },
						],
					},
				],
			};
			const expected = outdent`
				root
				├─ node
				│  ├─ leaf: "Hello"
				│  └─ leaf: "World!"
				└─ node
				   ├─ leaf: "Bonjour"
				   └─ leaf: "le monde!"
			`;
			expect(format(input, options)).toBe(expected);
		});

		test("should format array of nodes without root into ASCII tree representation", () => {
			const input: Node[] = [
				{
					kind: "node",
					children: [
						{ kind: "leaf", value: "Hello" },
						{ kind: "leaf", value: "World!" },
					],
				},
				{
					kind: "node",
					children: [
						{ kind: "leaf", value: "Bonjour" },
						{ kind: "leaf", value: "le monde!" },
					],
				},
			];
			const expected = outdent`
				├─ node
				│  ├─ leaf: "Hello"
				│  └─ leaf: "World!"
				└─ node
				   ├─ leaf: "Bonjour"
				   └─ leaf: "le monde!"
			`;
			expect(format(input, options)).toBe(expected);
		});

		test("should format deeply nested tree (4 levels) into ASCII tree representation", () => {
			const input: Node = {
				kind: "root",
				children: [
					{
						kind: "node",
						children: [
							{
								kind: "node",
								children: [
									{
										kind: "node",
										children: [{ kind: "leaf", value: "Hello" }],
									},
								],
							},
						],
					},
				],
			};
			const expected = outdent`
				root
				└─ node
				   └─ node
				      └─ node
				         └─ leaf: "Hello"
			`;
			expect(format(input, options)).toBe(expected);
		});
	});

	describe("Tree formatting with node indices", () => {
		type Node = Parent | Leaf;
		type Parent = { kind: string; children: Node[] };
		type Leaf = { kind: string; value: string };
		const options: Options<Node> = {
			mapping: {
				getChildren(node) {
					return "children" in node ? node.children : undefined;
				},
				toText(node, { index }) {
					let text = node.kind;
					if ("value" in node) {
						text += `: ${JSON.stringify(node.value)}`;
					}
					return index !== undefined ? `${index} ${text}` : text;
				},
			},
		};

		test("should format tree with node indices", () => {
			const input: Node = {
				kind: "root",
				children: [
					{
						kind: "node",
						children: [
							{ kind: "leaf", value: "Hello" },
							{ kind: "leaf", value: "World!" },
						],
					},
					{
						kind: "node",
						children: [
							{ kind: "leaf", value: "Bonjour" },
							{ kind: "leaf", value: "le monde!" },
						],
					},
				],
			};
			const expected = outdent`
      0 root
      ├─ 0 node
      │  ├─ 0 leaf: "Hello"
      │  └─ 1 leaf: "World!"
      └─ 1 node
         ├─ 0 leaf: "Bonjour"
         └─ 1 leaf: "le monde!"
    `;
			expect(format(input, options)).toBe(expected);
		});
	});

	describe("Tree formatting with children count", () => {
		type Node = Parent | Leaf;
		type Parent = { kind: string; children: Node[] };
		type Leaf = { kind: string; value: string };
		const options: Options<Node> = {
			mapping: {
				getChildren(node) {
					return "children" in node ? node.children : undefined;
				},
				toText(node, { children }) {
					let text = node.kind;
					if (children) {
						text += `[${children.length}]`;
					}
					if ("value" in node) {
						text += `: ${JSON.stringify(node.value)}`;
					}
					return text;
				},
			},
		};

		test("should format tree with children count", () => {
			const input: Node = {
				kind: "root",
				children: [
					{
						kind: "node",
						children: [
							{ kind: "leaf", value: "Hello" },
							{ kind: "leaf", value: "World!" },
						],
					},
					{
						kind: "node",
						children: [
							{ kind: "leaf", value: "Bonjour" },
							{ kind: "leaf", value: "le monde!" },
						],
					},
				],
			};
			const expected = outdent`
				root[2]
				├─ node[2]
				│  ├─ leaf: "Hello"
				│  └─ leaf: "World!"
				└─ node[2]
				   ├─ leaf: "Bonjour"
				   └─ leaf: "le monde!"
			`;
			expect(format(input, options)).toBe(expected);
		});

		test("should format tree with varying children counts", () => {
			const input: Node = {
				kind: "root",
				children: [
					{
						kind: "node",
						children: [{ kind: "leaf", value: "One" }],
					},
					{
						kind: "node",
						children: [
							{ kind: "leaf", value: "Two" },
							{ kind: "leaf", value: "Three" },
							{ kind: "leaf", value: "Four" },
						],
					},
				],
			};
			const expected = outdent`
				root[2]
				├─ node[1]
				│  └─ leaf: "One"
				└─ node[3]
				   ├─ leaf: "Two"
				   ├─ leaf: "Three"
				   └─ leaf: "Four"
			`;
			expect(format(input, options)).toBe(expected);
		});
	});

	describe("Tree formatting with key-value labels at start", () => {
		type Parent = { [key: string]: Node };
		type Node = Parent | string;
		const options: Options<Node> = {
			mapping: {
				getChildren(node) {
					if (typeof node === "object") {
						return Object.entries(node).map(([name, node]) => ({ name, node }));
					}
					return undefined;
				},
				toText(node, { name }) {
					const prefix = name ? `${name} = ` : "";
					if (typeof node === "string") {
						return `${prefix}${JSON.stringify(node)}`;
					}
					return name ? name : ".";
				},
			},
		};

		test("should format object with key-value pairs into labeled ASCII tree", () => {
			const input = {
				a: "Hello",
				b: "World!",
			};
			const expected = outdent`
				.
				├─ a = "Hello"
				└─ b = "World!"
			`;
			expect(format(input, options)).toBe(expected);
		});

		test("should format nested object with key-value pairs into labeled ASCII tree", () => {
			const input = {
				a: "Hello",
				b: {
					c: "World!",
				},
			};
			const expected = outdent`
				.
				├─ a = "Hello"
				└─ b
				   └─ c = "World!"
			`;
			expect(format(input, options)).toBe(expected);
		});
	});

	describe("Tree formatting with key-value labels at end", () => {
		type Parent = { [key: string]: Node };
		type Node = Parent | string;
		const options: Options<Node> = {
			mapping: {
				getChildren(node) {
					if (typeof node === "object") {
						return Object.entries(node).map(([name, node]) => ({ name, node }));
					}
					return undefined;
				},
				toText(node, { name }) {
					const postfix = name ? ` = ${name}` : "";
					if (typeof node === "string") {
						return `${JSON.stringify(node)}${postfix}`;
					}
					return `object${postfix}`;
				},
			},
		};

		test("should format object with key-value pairs into ASCII tree with labels at end", () => {
			const input = {
				a: "Hello",
				b: "World!",
			};
			const expected = outdent`
				object
				├─ "Hello" = a
				└─ "World!" = b
			`;
			expect(format(input, options)).toBe(expected);
		});

		test("should format nested object into ASCII tree with labels at end", () => {
			const input = {
				a: "Hello",
				b: {
					c: "World!",
				},
			};
			const expected = outdent`
				object
				├─ "Hello" = a
				└─ object = b
				   └─ "World!" = c
			`;
			expect(format(input, options)).toBe(expected);
		});
	});

	describe("Directory tree formatting", () => {
		type Entry = Directory | File;
		type Directory = { type: "directory"; name: string; children: Entry[] };
		type File = { type: "file"; name: string };
		const options: Options<Entry> = {
			mapping: {
				getChildren(node) {
					return node.type === "directory" ? node.children : undefined;
				},
				toText(node) {
					return node.name;
				},
			},
		};

		test("should format directory tree into ASCII file structure representation", () => {
			const input: Entry = {
				type: "directory",
				name: ".",
				children: [
					{
						type: "directory",
						name: "src",
						children: [
							{ type: "file", name: "index.ts" },
							{ type: "file", name: "utils.ts" },
						],
					},
					{
						type: "directory",
						name: "test",
						children: [
							{ type: "file", name: "index.test.ts" },
							{ type: "file", name: "utils.test.ts" },
						],
					},
				],
			};
			const expected = outdent`
				.
				├─ src
				│  ├─ index.ts
				│  └─ utils.ts
				└─ test
				   ├─ index.test.ts
				   └─ utils.test.ts
			`;
			expect(format(input, options)).toBe(expected);
		});
	});

	describe("JSON Abstract Syntax Tree formatting", () => {
		type Node = ObjectNode | ArrayNode | ValueNode;
		type ObjectNode = { type: "Object"; properties: Record<string, Node> };
		type ArrayNode = { type: "Array"; elements: Node[] };
		type ValueNode = { type: "Scalar"; value: string };
		const options: Options<Node> = {
			mapping: {
				getChildren(node) {
					if (node.type === "Array") {
						return node.elements;
					}
					if (node.type === "Object") {
						return Object.entries(node.properties).map(([name, node]) => ({
							name,
							node,
						}));
					}
					return undefined;
				},
				toText(node, { name }) {
					const propetyName = name ? `${name}: ` : "";
					if (node.type === "Scalar") {
						return `${propetyName}Scalar ${JSON.stringify(node.value)}`;
					}
					return `${propetyName}${node.type}`;
				},
			},
		};

		test("should format flat JSON object into labeled ASCII tree", () => {
			const input: Node = {
				type: "Object",
				properties: {
					hello: { type: "Scalar", value: "world" },
					foo: { type: "Scalar", value: "bar" },
				},
			};
			const expected = outdent`
				Object
				├─ hello: Scalar "world"
				└─ foo: Scalar "bar"
			`;
			expect(format(input, options)).toBe(expected);
		});

		test("should format nested JSON object into labeled ASCII tree", () => {
			const input: Node = {
				type: "Object",
				properties: {
					hello: {
						type: "Object",
						properties: {
							foo: { type: "Scalar", value: "bar" },
						},
					},
				},
			};
			const expected = outdent`
				Object
				└─ hello: Object
				   └─ foo: Scalar "bar"
			`;
			expect(format(input, options)).toBe(expected);
		});

		test("should format JSON array with mixed types into labeled ASCII tree", () => {
			const input: Node = {
				type: "Array",
				elements: [
					{ type: "Scalar", value: "hello" },
					{
						type: "Object",
						properties: {
							foo: { type: "Scalar", value: "bar" },
						},
					},
				],
			};
			const expected = outdent`
				Array
				├─ Scalar "hello"
				└─ Object
				   └─ foo: Scalar "bar"
			`;
			expect(format(input, options)).toBe(expected);
		});
	});
});
