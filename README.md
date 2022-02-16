# parent-id-tree
build a tree using the records which has parent id



## usage

```typescript
import ParentIdTree from "parent-id-tree"

const tree = new ParentIdTree<string>()
tree.add({ id: 1, value: "A" })
tree.add({ id: 2, value: "B", parentId: 1 })
tree.add({ id: 3, value: "C", parentId: 1 })
tree.add({ id: 4, value: "D", parentId: 2 })

console.log(tree.get(1, {
  cb: (v) => {
    return {
      id: v.id
    }
  }
}))
/*
{
  id: 1,
  child: [
    { id: 2, child: [{ id: 4, child: [] }] },
    { id: 3, child: [] }
  ]
}
*/

console.log(tree.depth()) // 3

console.log(tree.downMap(1, {
  cb: v => v.id
})) // [1,2,3,4]

console.log(tree.upMap(4, {
  cb: v => v.id
})) // [4,2,1]

```

