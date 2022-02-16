import assert from 'assert';

/**
 * parent child tree
 */
class ParentIdTree<TValue> {
  /** Map<id,node> */
  private _mapNode = new Map<number, ParentIdTree.Node<TValue>>()
  /** Map<parentId, childNode> */
  private _mapChild = new Map<number, ParentIdTree.Node<TValue>[]>()
  private _depth = 0

  /**
   * clear all node in tree
   */
  public clear() {
    this._mapNode.clear();
    this._mapChild.clear();
    this._depth = 0;
  }

  /**
   * add node
   * @param {Object} node
   */
  public add(node: ParentIdTree.Node<TValue>) {
    assert(node.parentId !== node.id, 'not allow set self as parent');

    let depth = 1;
    let parentId = node.parentId;

    while (parentId !== undefined) {
      const parent = this._mapNode.get(parentId);
      assert(parent !== undefined, 'parent not exists');
      assert(parent.id !== node.id, 'node loop');
      depth++;
      parentId = parent.parentId;
    }

    if (depth > this._depth) this._depth = depth;

    this._mapNode.set(node.id, node);

    if (node.parentId !== undefined) {
      const brother = this._mapChild.get(node.parentId);

      brother ? brother.push(node) : this._mapChild.set(node.parentId, [node]);
    }
  }

  /**
   * return tree of {id}
   * @param {id} id
   * @param {Object} option
   * @return {Object}
   */
  public get<
    T2 extends Record<string | number | symbol, any> = ParentIdTree.Node<TValue>
  >(
      id: number,
      option?: {
      cb?: (v: ParentIdTree.Node<TValue>) => T2,
      stopDepth?: number
    },
  ): ParentIdTree.Child<T2> | undefined {
    const depth = 0;
    const stopDepth = (option && option.stopDepth) || Number.MAX_SAFE_INTEGER;

    if (stopDepth < depth) return undefined;

    const node = this._mapNode.get(id);

    if (node === undefined) return undefined;

    const cb: (v: ParentIdTree.Node<TValue>) => T2 =
      option && option.cb ||
      function(v) {
        return v as any as T2;
      };

    return {
      ...cb(node),
      child: this._child(id, depth + 1, {
        cb,
        stopDepth,
      }),
    };
  }

  /**
   * return the child of {id}
   * @param {number} id
   * @param {number} depth
   * @param {Object} option
   * @return {Array}
   */
  private _child<T2 extends Record<string | number | symbol, any>>(
      id: number,
      depth: number,
      option: {
      cb: (v: ParentIdTree.Node<TValue>) => T2,
      stopDepth: number
    },
  ) {
    if (option.stopDepth < depth) return [];

    return (this._mapChild.get(id) || [])
        .map((v) => {
          const child: ParentIdTree.Child<T2>[] =
            this._child(v.id, depth + 1, option);
          return Object.assign({}, option.cb(v), {child});
        });
  }

  /**
   * traverse the child of {id} and itself
   * @param {number} id
   * @param {functon} cb
   * @param {Object} option
   */
  public downForEach(
      id: number,
      cb: (v: ParentIdTree.DownForEachNode<TValue>) => void,
      option?: {
      startDepth?: number,
      stopDepth?: number
    },
  ) {
    const startDepth = (option && option.startDepth) || 0;
    const stopDepth = (option && option.stopDepth) || Number.MAX_SAFE_INTEGER;
    const depth = 0;

    if (stopDepth < depth) return;

    const self = this._mapNode.get(id);

    startDepth <= depth &&
      self !== undefined &&
      cb({...self, depth});

    this._childForEach(id, depth + 1, {
      cb,
      startDepth,
      stopDepth,
    });
  }

  /**
   * traverse the child of node which id equel {id}
   * @param {number} id
   * @param {depth} depth
   * @param {Object} option
   */
  private _childForEach(
      id: number,
      depth: number,
      option: {
      cb: (v: ParentIdTree.DownForEachNode<TValue>) => void,
      startDepth: number,
      stopDepth: number
    },
  ) {
    if (option.stopDepth < depth) return;

    const child = this._mapChild.get(id);

    if (child) {
      // traverse child twice to ensure the data
      // callback earlier which depth smaller
      child.forEach((c) => {
        option.startDepth <= depth && option.cb({...c, depth});
      });

      child.forEach((c) => {
        this._childForEach(c.id, depth + 1, option);
      });
    }
  }

  /**
   * return the child of {id} and itself
   * @param {number} id node id
   * @param {Object} option
   * @return {Array}
   */
  public downMap<T2 = ParentIdTree.DownForEachNode<TValue>>(
      id: number,
      option?: {
      cb?: (v: ParentIdTree.DownForEachNode<TValue>) => T2,
      startDepth?: number,
      stopDepth?: number
    },
  ) {
    const ret: T2[] = [];

    const cb: (v: ParentIdTree.DownForEachNode<TValue>) => T2 =
      option && option.cb ||
      function(v) {
        return v as any as T2;
      };

    this.downForEach(id, (v) => ret.push(cb(v)), option);

    return ret;
  }

  /**
   * traverse all node which on the path from {id} to root
   * @param {number} id
   * @param {function} cb
   * @param {Object} option
   */
  public upForEach(
      id: number,
      cb: (v: ParentIdTree.Node<TValue>) => void,
      option?: {
      startDepth?: number,
      stopDepth?: number
    },
  ) {
    this._upForEach(id, 0, {
      cb,
      startDepth: (option && option.startDepth) || 0,
      stopDepth: (option && option.stopDepth) || Number.MAX_SAFE_INTEGER,
    });
  }

  /**
   * traverse all node which on the path from {id} to root
   * @param {number} id
   * @param {number} depth
   * @param {Object} option
   * @return {void}
   */
  private _upForEach(
      id: number,
      depth: number,
      option: {
      cb: (v: ParentIdTree.Node<TValue>) => void,
      startDepth: number,
      stopDepth: number
    },
  ) {
    if (option.stopDepth < depth) return;

    const node = this._mapNode.get(id);

    option.startDepth <= depth &&
      node !== undefined &&
      option.cb(node);

    node !== undefined &&
      node.parentId !== undefined &&
      this._upForEach(node.parentId, depth + 1, option);
  }

  /**
   * return all node which on the path from {id} to root
   * @param {number} id node id
   * @param {Object} option
   * @return {Array}
   */
  public upMap<T2>(
      id: number,
      option?: {
      cb?: (v: ParentIdTree.Node<TValue>) => T2,
      startDepth?: number,
      stopDepth?: number
    },
  ) {
    const ret: T2[] = [];

    const cb: (v: ParentIdTree.Node<TValue>) => T2 =
      option && option.cb ||
      function(v) {
        return v as any as T2;
      };

    this.upForEach(id, (v) => ret.push(cb(v)), option);

    return ret;
  }

  /**
   * return the depth of tree
   * @return {number} depth
   */
  public depth() {
    return this._depth;
  }

  /**
   * return node depth which id equel {id}
   * @param {number} id node id
   * @return {number} node depth
   */
  public nodeDepth(id: number) {
    let depth = 0;
    let _id: number | undefined = id;
    let node;

    while (
      _id !== undefined &&
      (node = this._mapNode.get(_id)) !== undefined
    ) {
      depth++;
      _id = node.parentId;
    }

    return depth;
  }

  /**
   * return node info which id equal {id}
   * @param {number} id node id
   * @return {Object} node info
   */
  public nodeGet(id: number) {
    return this._mapNode.get(id);
  }
}

namespace ParentIdTree {
  export type Node<T> = {
    id: number;
    parentId?: number;
    value: T
  };

  export type DownForEachNode<T> = Node<T> & {
    depth: number
  }

  export type Child<T> = T & {
    child: Child<T>[]
  }
}

export default ParentIdTree;
