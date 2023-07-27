import { Props, Key, Ref, ReactElementType } from '@/shared/ReactTypes';
import {
	Fragment,
	FunctionComponent,
	HostComponent,
	WorkTag
} from './workTags';
import { Flags, NoFlags } from './fiberFlags';
import { Container } from '@/react-dom/hostConfig';
import { Lane, Lanes, NoLane, NoLanes } from './fiberLanes';
import { Effect } from './fiberHooks';

export class FiberNode {
	type: any;
	tag: WorkTag;
	pendingProps: Props;
	key: Key;
	stateNode: any; // 指向真实DOM
	ref: Ref;

	return: FiberNode | null;  // fiber 节点的父级
	sibling: FiberNode | null; // 右边兄弟节点
	child: FiberNode | null;  //子节点是谁
	index: number;    // 属于以上节点的第几个

	memoizedProps: Props | null; // memoizedProps 用于记录当前fiber节点的属性
	memoizedState: any; // memoizedState 用于记录当前fiber节点的状态
	// 双缓存
	alternate: FiberNode | null; // 用于记录前后两次的fiber节点 用于diff 比较 一旦更新了 会把current的值赋值给alternate 
	flags: Flags;   // 副作用标记
	subtreeFlags: Flags; // 子树的副作用标记
	updateQueue: unknown; // 更新队列
	deletions: FiberNode[] | null; // 删除的节点

	/**
	 * @param tag  // fiber 节点的类型
	 * @param pendingProps  // fiber 节点的属性
	 * @param key  // fiber 节点的key
	 */
	constructor(tag: WorkTag, pendingProps: Props, key: Key) {
		// 实例
		this.tag = tag;
		this.key = key || null;
		// HostComponent <div> div DOM
		this.stateNode = null;
		// FunctionComponent () => {}
		this.type = null;

		// 构成树状结构
		this.return = null;
		this.sibling = null;
		this.child = null;
		this.index = 0;

		this.ref = null;

		// 作为工作单元
		this.pendingProps = pendingProps; // 刚开始工作阶段的props 
		this.memoizedProps = null;  // 工作结束后的props
		this.memoizedState = null; // 更新后的state
		this.updateQueue = null; // fiber产生的更新操作都放在更新队列中
		// 通过是否为null 来判断是否是第一次渲染 还是更新
		this.alternate = null; // 用于记录前后两次的fiber节点 用于diff比较 一旦更新了 会把current的值赋值给alternate
		// 副作用
		this.flags = NoFlags; // 副作用标记(删除, 更新, 插入等)
		this.subtreeFlags = NoFlags; // 子树的副作用标记
		this.deletions = null; // 存放要删除的子节点
	}
}

export interface PendingPassiveEffects {
	unmount: Effect[];
	update: Effect[];
}
export class FiberRootNode {
	container: Container; // 容器
	current: FiberNode;  // 当前的fiber节点
	finishedWork: FiberNode | null; // 已经完成的fiber节点
	pendingLanes: Lanes; // 优先级
	finishedLane: Lane; // 已经完成的优先级
	pendingPassiveEffects: PendingPassiveEffects; // 副作用
	constructor(container: Container, hostRootFiber: FiberNode) {
		this.container = container;
		this.current = hostRootFiber;
		hostRootFiber.stateNode = this;
		this.finishedWork = null;
		this.pendingLanes = NoLanes;
		this.finishedLane = NoLane;

		this.pendingPassiveEffects = {
			unmount: [],
			update: []
		};
	}
}

// current 老节点的子节点， 新element对象的props
export const createWorkInProgress = (
	current: FiberNode,
	pendingProps: Props
): FiberNode => {
	let wip = current.alternate;
	// debugger
	// 双缓存 一旦更新会把current的值赋值给alternate  用于diff 比较 
	if (wip === null) {
		// mount
		wip = new FiberNode(current.tag, pendingProps, current.key);
		wip.stateNode = current.stateNode;
		// debugger
		wip.alternate = current;
		current.alternate = wip;
	} else {
		// update
		wip.pendingProps = pendingProps;
		wip.flags = NoFlags;
		wip.subtreeFlags = NoFlags;
		wip.deletions = null;
	}
	wip.type = current.type;
	wip.updateQueue = current.updateQueue;
	wip.child = current.child;
	wip.memoizedProps = current.memoizedProps;
	wip.memoizedState = current.memoizedState;

	return wip;
};

export function createFiberFromElement(element: ReactElementType): FiberNode {
	const { type, key, props } = element;
	let fiberTag: WorkTag = FunctionComponent;

	if (typeof type === 'string') {
		// <div/> type: 'div'
		fiberTag = HostComponent;
	} else if (typeof type !== 'function') {
		console.warn('为定义的type类型', element);
	}
	const fiber = new FiberNode(fiberTag, props, key);
	fiber.type = type;
	return fiber;
}

export function createFiberFromFragment(elements: any[], key: Key): FiberNode {
	const fiber = new FiberNode(Fragment, elements, key);
	return fiber;
}
