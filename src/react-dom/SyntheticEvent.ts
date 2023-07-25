import { Container } from './hostConfig';
import { Props } from '@/shared/ReactTypes';

export const elementPropsKey = '__props';
const validEventTypeList = ['click'];

type EventCallback = (e: Event) => void;

interface SyntheticEvent extends Event {
    __stopPropagation: boolean;
}

interface Paths {
    capture: EventCallback[];
    bubble: EventCallback[];
}

export interface DOMElement extends Element {
    [elementPropsKey]: Props;
}

// dom[xxx] = reactElemnt props
export function updateFiberProps(node: DOMElement, props: Props) {
    node[elementPropsKey] = props;
}

export function initEvent(container: Container, eventType: string) {
    if (!validEventTypeList.includes(eventType)) {
        console.warn('当前不支持', eventType, '事件');
        return;
    }
    console.log('初始化事件：', eventType);

    // debugger

    // 在react中事件都绑定在  rect的容器根节点
    container.addEventListener(eventType, (e) => {
        dispatchEvent(container, eventType, e);
    });
}

function createSyntheticEvent(e: Event) {
    const syntheticEvent = e as SyntheticEvent;
    syntheticEvent.__stopPropagation = false;

    // 浏览器原生的阻止冒泡
    const originStopPropagation = e.stopPropagation;

    syntheticEvent.stopPropagation = () => {
        syntheticEvent.__stopPropagation = true;
        if (originStopPropagation) {
            originStopPropagation();
        }
    };
    return syntheticEvent;
}

function dispatchEvent(container: Container, eventType: string, e: Event) {


    // 点击的哪个元素？
    const targetElement = e.target;

    if (targetElement === null) {
        console.warn('事件不存在target', e);
        return;
    }
    // 1. 收集沿途的事件   点击之后将会触发哪些事件
    const { bubble, capture } = collectPaths(
        targetElement as DOMElement,
        container,
        eventType
    );
    // 2. 构造合成事件
    const se = createSyntheticEvent(e);

    // 3. 遍历captue   执行捕获事件
    triggerEventFlow(capture, se);

    if (!se.__stopPropagation) {
        // 4. 遍历bubble   执行冒泡事件
        triggerEventFlow(bubble, se);
    }
}

function triggerEventFlow(paths: EventCallback[], se: SyntheticEvent) {
    for (let i = 0; i < paths.length; i++) {
        const callback = paths[i];
        callback.call(null, se);

        if (se.__stopPropagation) {
            break;
        }
    }
}

function getEventCallbackNameFromEventType(
    eventType: string
): string[] | undefined {
    return {
        click: ['onClickCapture', 'onClick']
    }[eventType];
}

function collectPaths(
    targetElement: DOMElement,
    container: Container,
    eventType: string
) {
    const paths: Paths = {
        capture: [],
        bubble: []
    };

    while (targetElement && targetElement !== container) {
        // 收集

        // 这里可以获取真实dom对应的props
        // 创建fiber树的时候，会生成statNode
        const elementProps = targetElement[elementPropsKey];
        if (elementProps) {
            // click -> onClick onClickCapture
            const callbackNameList = getEventCallbackNameFromEventType(eventType);

            console.log('callbackNameList',callbackNameList)

            if (callbackNameList) {
                callbackNameList.forEach((callbackName, i) => {
                    const eventCallback = elementProps[callbackName];
                    if (eventCallback) {
                        if (i === 0) {
                            // capture
                            paths.capture.unshift(eventCallback);
                        } else {
                            paths.bubble.push(eventCallback);
                        }
                    }
                });
            }
        }
        targetElement = targetElement.parentNode as DOMElement;
    }

    console.log('paths', paths)
    return paths;
}
