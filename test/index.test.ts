import assert from 'assert';
import ParentIdTree from "../src"

describe("index", () => {
  type Data = {
    id: number,
    value: string,
    parentId?: number,
  }
  const data: Data[] = [
    { id: 1, value: "a" },
    { id: 2, parentId: 1, value: "b" },
    { id: 3, parentId: 1, value: "c" },
    { id: 4, parentId: 2, value: "d" },
  ]
  const tree = new ParentIdTree<string>()
  for(const d of data) {
    tree.add(d)
  }

  it("get", () => {
    const t = tree.get(1)
    console.log(t)
    assert(t !== undefined)
    assert(t.id === 1)
    assert(t.value === 'a')
    assert(t.child.length === 2)
    assert(t.child[0].value === 'b')
    assert(t.child[1].value === 'c')
    assert(t.child[0].child[0].value === 'd')
  })

  it("downForEach", () => {
    const arr: number[] = []
    tree.downForEach(1, v => arr.push(v.id))
    assert(arr[0] === 1)
    assert(arr[1] === 2)
    assert(arr[2] === 3)
    assert(arr[3] === 4)
  })

  it("downMap", () => {
    const arr: number[] = tree.downMap(1, {
      cb: v => v.id
    })
    assert(arr[0] === 1)
    assert(arr[1] === 2)
    assert(arr[2] === 3)
    assert(arr[3] === 4)
  })

  it("upForEach", () => {
    const arr: number[] = []
    tree.upForEach(4, v => arr.push(v.id))
    assert(arr[0] === 4)
    assert(arr[1] === 2)
    assert(arr[2] === 1)
  })

  it("upMap", () => {
    const arr: number[] = tree.upMap(4, {
      cb: v => v.id
    })
    assert(arr[0] === 4)
    assert(arr[1] === 2)
    assert(arr[2] === 1)
  })

  it("depth", () => {
    assert(tree.depth() === 3)
  })

  it("nodeDepth", () => {
    assert(tree.nodeDepth(1) === 1)
    assert(tree.nodeDepth(2) === 2)
    assert(tree.nodeDepth(3) === 2)
    assert(tree.nodeDepth(4) === 3)
  })

  it("nodeGet", () => {
    for (const dt of data) {
      const v = tree.nodeGet(dt.id)
      assert(v !== undefined)
      assert(v.id === dt.id)
      assert(v.parentId === dt.parentId)
      assert(v.value === dt.value)
    }
  })
})