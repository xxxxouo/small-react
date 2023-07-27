// WorkTag 是fiber节点的类型	 
// 用来判断两个Fiber节点是否是同一类型的节点 从而进行同层比较 然后比较其他属性(key, type, props...) 
// 优化diff算法
export type WorkTag = // fiber 节点的类型
	| typeof FunctionComponent
	| typeof HostRoot
	| typeof HostComponent
	| typeof HostText
	| typeof Fragment;

export const FunctionComponent = 0; // 函数组件
export const HostRoot = 3; // 根节点 全局只有一个

export const HostComponent = 5; // 原生节点
// <div>123</div>
export const HostText = 6; // 文本节点
export const Fragment = 7; // 文档碎片
