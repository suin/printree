import { describe, expect, it } from "vitest";
import { leaf, parent } from "./render.js";
import { transform } from "./transform.js";

describe("transform", () => {
	describe("AST", () => {
		type NodeType = "Program" | "Number" | "Assignment" | "BinaryOp" | "Token";
		type AnyNode = Program | NumberNode | AssignmentNode | BinaryOpNode | Token;

		interface Node {
			type: NodeType;
		}

		interface Program extends Node {
			type: "Program";
			body: Statement[];
		}

		type Statement = AssignmentNode;

		type Expression = NumberNode | BinaryOpNode;

		interface NumberNode extends Node {
			type: "Number";
			value: number;
		}

		interface AssignmentNode extends Node {
			type: "Assignment";
			variable: Token;
			value: Expression;
		}

		interface BinaryOpNode extends Node {
			type: "BinaryOp";
			operator: Token;
			left: Expression;
			right: Expression;
		}

		interface Token extends Node {
			type: "Token";
			name: string;
		}

		const program: Program = {
			type: "Program",
			body: [
				{
					type: "Assignment",
					variable: {
						type: "Token",
						name: "x",
					},
					value: {
						type: "BinaryOp",
						operator: {
							type: "Token",
							name: "+",
						},
						left: {
							type: "Number",
							value: 1,
						},
						right: {
							type: "Number",
							value: 2,
						},
					},
				},
			],
		};

		it("should transform input to render.Input", () => {
			const actual = transform<AnyNode>(program, {
				getChildren(node) {
					switch (node.type) {
						case "Program":
							return [{ name: "body", nodes: node.body }];
						case "Assignment":
							return [
								{ name: "variable", node: node.variable },
								{ name: "value", node: node.value },
							];
						case "BinaryOp":
							return [
								{ name: "operator", node: node.operator },
								{ name: "left", node: node.left },
								{ name: "right", node: node.right },
							];
						default:
							return undefined;
					}
				},
				toText(node, { name }) {
					const common = `${name ? `${name}: ` : ""}${node.type}`;
					if (node.type === "Token") {
						return `${common} '${node.name}'`;
					}
					if (node.type === "Number") {
						return `${common} '${node.value}'`;
					}
					return common;
				},
			});
			const expected = {
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
			expect(actual).toEqual(expected);
		});

		it("should transform input to render.Input with index", () => {
			const actual = transform<AnyNode>(program, {
				getChildren(node) {
					switch (node.type) {
						case "Program":
							return [{ name: "body", nodes: node.body }];
						case "Assignment":
							return [
								{ name: "variable", node: node.variable },
								{ name: "value", node: node.value },
							];
						case "BinaryOp":
							return [
								{ name: "operator", node: node.operator },
								{ name: "left", node: node.left },
								{ name: "right", node: node.right },
							];
						default:
							return undefined;
					}
				},
				toText(node, { name, index }) {
					const common = `#${index} ${name ? `${name}: ` : ""}${node.type}`;
					if (node.type === "Token") {
						return `${common} '${node.name}'`;
					}
					if (node.type === "Number") {
						return `${common} '${node.value}'`;
					}
					return common;
				},
			});
			const expected = {
				text: "#0 Program",
				children: [
					{
						text: "body",
						children: [
							{
								text: "#0 Assignment",
								children: [
									{ text: "#0 variable: Token 'x'" },
									{
										text: "#1 value: BinaryOp",
										children: [
											{ text: "#0 operator: Token '+'" },
											{ text: "#1 left: Number '1'" },
											{ text: "#2 right: Number '2'" },
										],
									},
								],
							},
						],
					},
				],
			};
			expect(actual).toEqual(expected);
		});
	});
});
