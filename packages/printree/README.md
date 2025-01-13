# printree

A flexible TypeScript library for rendering tree structures as ASCII art.

## Installation

```bash
npm install @suin/printree
```

## Features

- 🌳 Render any tree structure as ASCII art
- 🎨 Fully customizable node formatting
- 🏷️ Support for labeled nodes
- 📊 Optional node indices and children count
- 📁 Perfect for directory trees, JSON AST, and more
- 💪 Written in TypeScript with full type safety

## Usage

### Basic Example

```typescript
import { format, type Options } from "@suin/printree";

// Define your tree node types
type Node = Parent | Leaf;
type Parent = { kind: string; children: Node[] };
type Leaf = { kind: string; value: string };

// Configure how to format your tree
const options: Options<Node> = {
  getChildren(node) {
    return "children" in node ? node.children : undefined;
  },
  formatNode(node) {
    let text = node.kind;
    if ("value" in node) {
      text += `: ${JSON.stringify(node.value)}`;
    }
    return text;
  },
};

// Create your tree
const tree: Node = {
  kind: "root",
  children: [
    {
      kind: "node",
      children: [
        { kind: "leaf", value: "Hello" },
        { kind: "leaf", value: "World!" },
      ],
    },
  ],
};

// Format it!
console.log(format(tree, options));
```

Output:
```
root
└─ node
   ├─ leaf: "Hello"
   └─ leaf: "World!"
```

### Directory Tree Example

```typescript
type Entry = Directory | File;
type Directory = { type: "directory"; name: string; children: Entry[] };
type File = { type: "file"; name: string };

const options: Options<Entry> = {
  getChildren(node) {
    return node.type === "directory" ? node.children : undefined;
  },
  formatNode(node) {
    return node.name;
  },
};

const tree: Entry = {
  type: "directory",
  name: "project",
  children: [
    {
      type: "directory",
      name: "src",
      children: [
        { type: "file", name: "index.ts" },
        { type: "file", name: "utils.ts" },
      ],
    },
    { type: "file", name: "README.md" },
  ],
};

console.log(format(tree, options));
```

Output:
```
project
├─ src
│  ├─ index.ts
│  └─ utils.ts
└─ README.md
```

### Advanced Features

#### Node Indices

```typescript
const options: Options<Node> = {
  // ...
  formatNode(node, { index }) {
    return index !== undefined ? `${index} ${node.name}` : node.name;
  },
};
```

Output:
```
root
├─ 0 node
│  ├─ 0 leaf
│  └─ 1 leaf
└─ 1 node
```

#### Children Count

```typescript
const options: Options<Node> = {
  // ...
  formatNode(node, { children }) {
    return children ? `${node.name}[${children.length}]` : node.name;
  },
};
```

Output:
```
root[2]
├─ node[2]
│  ├─ leaf
│  └─ leaf
└─ node[0]
```

#### Labeled Nodes

```typescript
const options: Options<Node> = {
  // ...
  formatNode(node, { label }) {
    return label ? `${label}: ${node.name}` : node.name;
  },
};
```

Output:
```
root
├─ key1: value1
└─ key2: value2
```

## API

### `format<T>(tree: T | ReadonlyArray<T>, options: Options<T>): string`

Formats a tree structure or array of nodes into an ASCII tree representation.

#### Options

```typescript
interface Options<T> {
  // Get children of a node (return undefined for leaf nodes)
  getChildren(node: T): ReadonlyArray<T> | ReadonlyArray<LabeledNode<T>> | undefined;
  
  // Format a node into a string
  formatNode(node: T, opts: {
    readonly label?: string;
    readonly children?: ReadonlyArray<T> | ReadonlyArray<LabeledNode<T>>;
    readonly index?: number;
  }): string;
}
```

## License

MIT

## Author

[suin](https://github.com/suin)
