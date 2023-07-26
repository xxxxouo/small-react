import { Container } from '@/react-dom/hostConfig';
import { ReactElementType } from '@/shared/ReactTypes';
import { FiberNode, FiberRootNode } from './fiber';
import { requestUpdateLane } from './fiberLanes';
import {
	createUpdate,
	createUpdateQueue,
	enqueueUpdate,
	UpdateQueue
} from './updateQueue';
import { scheduleUpdateOnFiber } from './workLoop';
import { HostRoot } from './workTags';

// 通过container创建fiberRootNode
export function createContainer(container: Container) {
	const hostRootFiber = new FiberNode(HostRoot, {}, null);
	 // 给容器和hostRootFiber之间建立关联关系
	const root = new FiberRootNode(container, hostRootFiber); 
	hostRootFiber.updateQueue = createUpdateQueue();
	return root;
}
// 通过fiberRootNode更新
export function updateContainer(
	element: ReactElementType | null,
	root: FiberRootNode
) {
	const hostRootFiber = root.current;
	const lane = requestUpdateLane(); // 设置优先级
  // 创建更新
	const update = createUpdate<ReactElementType | null>(element, lane);
	// 将更新添加到更新队列中
	enqueueUpdate(
		hostRootFiber.updateQueue as UpdateQueue<ReactElementType | null>,
		update
	);
	// 调度更新  传入fiberRootNode和优先级
	scheduleUpdateOnFiber(hostRootFiber, lane); 
	return element;
}
