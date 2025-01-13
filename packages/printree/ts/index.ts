export function format<T>(
	tree: T | ReadonlyArray<T>,
	options: Options<T>,
): string {
	if (isArray(tree)) {
		return formatTreeArray(tree, options);
	}

	return formatTree(tree, createRootContext(options)).trimEnd();
}

export interface Options<T> {
	getChildren(
		node: T,
	): ReadonlyArray<T> | ReadonlyArray<LabeledNode<T>> | undefined;
	formatNode(
		node: T,
		opts: {
			readonly label?: undefined | string;
			readonly children?:
				| undefined
				| ReadonlyArray<T>
				| ReadonlyArray<LabeledNode<T>>;
			readonly index?: number;
		},
	): string;
}

export type LabeledNode<T> = readonly [label: string, node: T];

type FormatTreeContext<T> = Options<T> & {
	readonly guide: string;
	readonly prefix: string;
	readonly isRoot: boolean;
	readonly isLastChild: boolean;
	readonly label?: string | undefined;
	readonly index: number;
};

function formatNodes<T>(
	nodes: ReadonlyArray<T> | ReadonlyArray<LabeledNode<T>>,
	context: FormatTreeContext<T>,
): string {
	let result = "";
	type Entry<T> = { node: T; index: number; label?: string | undefined };
	const entries: Entry<T>[] = nodes.map<Entry<T>>((nodeOrTuple, index) => {
		if (isLabeledNode(nodeOrTuple)) {
			const [label, node] = nodeOrTuple;
			return { node, index, label };
		}
		return { node: nodeOrTuple, index };
	});

	entries.forEach(({ node, index, label }, i) => {
		const isLastChild = i === entries.length - 1;
		const nodePrefix = isLastChild ? "└─ " : "├─ ";
		result += formatTree(node, {
			...context,
			prefix: nodePrefix,
			isRoot: false,
			isLastChild,
			label,
			index,
		});
	});
	return result;
}

function formatTree<T>(node: T, context: FormatTreeContext<T>): string {
	const children = context.getChildren(node);
	let result = context.isRoot
		? `${context.formatNode(node, { label: context.label, children })}\n`
		: `${context.guide}${context.prefix}${context.formatNode(node, { label: context.label, children, index: context.index })}\n`;

	if (children?.length) {
		const nextGuide = context.isRoot
			? ""
			: context.guide + (context.isLastChild ? "   " : "│  ");
		result += formatNodes(children, {
			...context,
			guide: nextGuide,
		});
	}

	return result;
}

function createRootContext<T>(options: Options<T>): FormatTreeContext<T> {
	return {
		...options,
		guide: "",
		prefix: "",
		isRoot: true,
		isLastChild: true,
		index: 0,
	};
}

function formatTreeArray<T>(
	tree: ReadonlyArray<T>,
	options: Options<T>,
): string {
	return formatNodes(tree, {
		...options,
		guide: "",
		prefix: "├─ ",
		isRoot: false,
		isLastChild: false,
		index: 0,
	}).trimEnd();
}

function isArray<T>(value: T | ReadonlyArray<T>): value is ReadonlyArray<T> {
	return Array.isArray(value);
}

function isLabeledNode<T>(value: T | LabeledNode<T>): value is LabeledNode<T> {
	return isArray(value) && value.length === 2 && typeof value[0] === "string";
}
