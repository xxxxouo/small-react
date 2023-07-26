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
