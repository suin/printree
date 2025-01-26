import { outdent } from "outdent";
import { describe, expect, it } from "vitest";
import { type Input, leaf, parent, render } from "./render.js";

describe("render", () => {
	it.each<[message: string, input: Input, expected: string]>([
		[
			"should render array of leaves",
			[leaf("a"), leaf("b"), leaf("c")],
			outdent`
				├─ a
				├─ b
				└─ c
			`,
		],
		[
			"should render array of parents",
			[
				parent("a", [leaf("a1"), leaf("a2")]),
				parent("b", [leaf("b1"), leaf("b2")]),
				parent("c", [leaf("c1"), leaf("c2")]),
			],
			outdent`
				├─ a
				│  ├─ a1
				│  └─ a2
				├─ b
				│  ├─ b1
				│  └─ b2
				└─ c
				   ├─ c1
				   └─ c2
			`,
		],
		[
			"should render array of mixtures of leaves and parents",
			[leaf("a"), parent("b", [leaf("b1"), leaf("b2")]), leaf("c")],
			outdent`
				├─ a
				├─ b
				│  ├─ b1
				│  └─ b2
				└─ c
			`,
		],
		[
			"should render root leaf",
			leaf("a"),
			outdent`
				a
			`,
		],
		[
			"should render root parent",
			parent("a", [leaf("a1"), leaf("a2")]),
			outdent`
				a
				├─ a1
				└─ a2
			`,
		],
		[
			"should render nested parents",
			parent("a", [leaf("a1"), parent("a2", [leaf("a21"), leaf("a22")])]),
			outdent`
				a
				├─ a1
				└─ a2
				   ├─ a21
				   └─ a22
			`,
		],
		["should render empty array", [], outdent``],
		[
			"should render parent with empty children",
			parent("empty", []),
			outdent`
				empty
			`,
		],
		[
			"should render deeply nested tree (3+ levels)",
			parent("root", [parent("a", [parent("b", [leaf("c"), leaf("d")])])]),
			outdent`
				root
				└─ a
				   └─ b
				      ├─ c
				      └─ d
			`,
		],
		[
			"should render Japanese text",
			parent("root", [leaf("子ノード1"), leaf("子ノード2"), leaf("子ノード3")]),
			outdent`
				root
				├─ 子ノード1
				├─ 子ノード2
				└─ 子ノード3
			`,
		],
		[
			"should render parent with many children",
			parent("root", [leaf("a"), leaf("b"), leaf("c"), leaf("d"), leaf("e")]),
			outdent`
				root
				├─ a
				├─ b
				├─ c
				├─ d
				└─ e
			`,
		],
		[
			"should render nested parent with empty children",
			parent("root", [parent("empty-nested", [])]),
			outdent`
				root
				└─ empty-nested
			`,
		],
		[
			"should render deep tree with multiple children at each level",
			parent("root", [
				parent("a1", [
					parent("b1", [leaf("c1"), leaf("c2"), leaf("c3")]),
					parent("b2", [leaf("c4"), leaf("c5"), leaf("c6")]),
					parent("b3", [leaf("c7"), leaf("c8"), leaf("c9")]),
				]),
			]),
			outdent`
				root
				└─ a1
				   ├─ b1
				   │  ├─ c1
				   │  ├─ c2
				   │  └─ c3
				   ├─ b2
				   │  ├─ c4
				   │  ├─ c5
				   │  └─ c6
				   └─ b3
				      ├─ c7
				      ├─ c8
				      └─ c9
			`,
		],
		[
			"should render nodes with empty text",
			[leaf(""), parent("", [leaf("")])],
			outdent`
				├─ 
				└─ 
				   └─ 
			`,
		],
	])("%s", (_, input, expected) => {
		expect(render(input)).toBe(expected);
	});
});

describe("render with custom glyphs", () => {
	it("should render with simple glyphs", () => {
		const input = parent("root", [
			leaf("a"),
			parent("b", [leaf("b1"), leaf("b2")]),
			leaf("c"),
		]);
		const customGlyphs = {
			corner: "\\_ ",
			branch: "|- ",
			vertical: "|  ",
			indent: "   ",
		};
		const expected = outdent`
			root
			|- a
			|- b
			|  |- b1
			|  \\_ b2
			\\_ c
		`;
		expect(render(input, { glyphs: customGlyphs })).toBe(expected);
	});

	it("should render with double-line glyphs", () => {
		const input = parent("root", [
			leaf("a"),
			parent("b", [leaf("b1"), leaf("b2")]),
			leaf("c"),
		]);
		const customGlyphs = {
			corner: "└── ",
			branch: "├── ",
			vertical: "│   ",
			indent: "    ",
		};
		const expected = outdent`
			root
			├── a
			├── b
			│   ├── b1
			│   └── b2
			└── c
		`;
		expect(render(input, { glyphs: customGlyphs })).toBe(expected);
	});

	it("should render with ASCII glyphs", () => {
		const input = parent("root", [
			leaf("a"),
			parent("b", [leaf("b1"), leaf("b2")]),
			leaf("c"),
		]);
		const customGlyphs = {
			corner: "+-- ",
			branch: "+-- ",
			vertical: "|   ",
			indent: "    ",
		};
		const expected = outdent`
			root
			+-- a
			+-- b
			|   +-- b1
			|   +-- b2
			+-- c
		`;
		expect(render(input, { glyphs: customGlyphs })).toBe(expected);
	});
});

describe("AST", () => {
	it("should render AST", () => {
		const ast = {
			text: "Program",
			children: [
				{
					text: "body",
					children: [
						{
							text: "Assignment",
							children: [
								{ text: "variable: Token 'x'" },
								{
									text: "value: BinaryOp",
									children: [
										{ text: "operator: Token '+'" },
										{ text: "left: Number '1'" },
										{ text: "right: Number '2'" },
									],
								},
							],
						},
					],
				},
			],
		};
		expect(render(ast)).toMatchInlineSnapshot(`
			"Program
			└─ body
			   └─ Assignment
			      ├─ variable: Token 'x'
			      └─ value: BinaryOp
			         ├─ operator: Token '+'
			         ├─ left: Number '1'
			         └─ right: Number '2'"
		`);
	});
});
