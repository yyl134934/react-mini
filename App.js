let nextUnitOfWork = null;
// 我们把修改 DOM 这部分内容记录在 fiber tree 上，通过追踪这颗树来收集所有 DOM 节点的修改，这棵树叫做 wipRoot（work in progress root）。
let wipRoot = null;
let currentRoot = null;
let deletions = null;
// 当前正在处理的Fiber
let wipFiber = null;
// hook计数索引
let hookIndex = null;
const effectTags = {
  UPDATE: 'UPDATE',
  PLACEMENT: 'PLACEMENT',
  DELETION: 'DELETION',
};

function createDom(fiber) {
  // 创建dom节点
  const {
    type,
    props: { nodeVlaue },
  } = fiber;
  const dom = type === TEXT_ELEMENT ? document.createTextNode(nodeVlaue) : document.createElement(type);
  // 添加属性
  updateDom(dom, {}, fiber.props);
  // 返回dom节点
  return dom;
}

function reconcileChildren(wipFiber, elements) {
  let index = 0;
  let prevSibling = null;
  let oldFiber = wipFiber?.alternate?.child;

  while (index < elements.length || oldFiber) {
    const element = elements[index];
    const { type, props } = element;

    let newFiber = null;

    // 对比新旧节点之间的差别
    const sameType = oldFiber && element && oldFiber.type === type;

    if (sameType) {
      // 相同更新
      newFiber = {
        type: type,
        dom: oldFiber.dom,
        parent: wipFiber,
        props: props,
        alternate: oldFiber,
        effectTag: effectTags.UPDATE,
      };
    }

    if (element && !sameType) {
      // 不同新增
      newFiber = {
        type: type,
        dom: null,
        parent: wipFiber,
        props: props,
        alternate: null,
        effectTag: effectTags.PLACEMENT,
      };
    }

    if (oldFiber && !sameType) {
      // 旧树有，新树无，删除
      oldFiber.effectTag = effectTags.DELETION;
      deletions.push(oldFiber);
    }

    if (oldFiber) {
      oldFiber = oldFiber.sibling;
    }

    if (index == 0) {
      wipFiber.child = newFiber;
    } else if (element) {
      prevSibling.sibling = newFiber;
    }

    prevSibling = newFiber;
    index++;
  }
}

function useState(initail) {
  const oldHook = wipFiber?.alternate?.hooks?.shift();

  const hook = { state: oldHook?.state ?? initail, queue: [] };

  const actions = oldHook?.queue || [];
  for (const action of actions) {
    if (typeof action === 'function') {
      hook.state = action(hook.state);
    } else {
      hook.state = action;
    }
  }

  const setState = (action) => {
    hook.queue.push(action);
    wipRoot = {
      dom: currentRoot.dom,
      props: currentRoot.props,
      alternate: currentRoot,
    };
    nextUnitOfWork = wipRoot;
    deletions = [];
  };

  wipFiber.hooks.push(hook);

  return [hook.state, setState];
}

function useEffect(action, deps) {
  const oldHook = wipFiber?.alternate?.effectHooks?.shift();
  const hook = {
    unmountAction: oldHook?.unmountAction,
    deps: oldHook?.deps ?? deps,
  };

  const hasDepsChanged = () => {
    if (deps === undefined) {
      return true;
    }
    return hook?.deps?.some((dep, index) => !Object.is(dep, deps[index]));
  };

  if (!hasInitailized || hasDepsChanged()) {
    // 在componentDidMount和componentDidUpdate时调用
    hook.unmountAction = action();
  }

  wipFiber.effectHooks.push(hook);
  wipRoot.alternate = currentRoot;
}

function initializeUseEffect(fiber) {
  fiber.effectHooks = [];
}

function initializeUseState(fiber) {
  fiber.hooks = [];
}

let hasInitailized = false;

function updateFunctionComponent(fiber) {
  wipFiber = fiber;
  //初始化hooks-useState相关参数
  initializeUseState(wipFiber);
  //初始化hooks-useEffect相关参数
  initializeUseEffect(wipFiber);
  // 处理函数组件
  const children = [fiber.type(fiber.props)];
  hasInitailized = true;
  reconcileChildren(fiber, children);
}

function updateHostComponent(fiber) {
  if (!fiber.dom) {
    fiber.dom = createDom(fiber);
  }

  const {
    props: { children: elements },
  } = fiber;

  reconcileChildren(fiber, elements);
}

function performUnitOfWork(fiber) {
  // 新建dom
  //判断是否为函数组件
  const isFunctionComponent = fiber.type instanceof Function;
  if (isFunctionComponent) {
    updateFunctionComponent(fiber);
  } else {
    updateHostComponent(fiber);
  }

  // 新建Fiber

  // 返回下一个工作单元
  if (fiber.child) {
    return fiber.child;
  }

  let nextFiber = fiber;
  while (nextFiber) {
    // 取兄弟节点或者叔伯节点
    if (nextFiber.sibling) {
      return nextFiber.sibling;
    }
    nextFiber = nextFiber.parent;
  }
}

const isEvent = (key) => key.startsWith('on');
const isProperty = (key) => key !== 'children' && !isEvent(key);
const isNew = (prev, next) => (key) => prev[key] !== next[key];
const isGone = (prev, next) => (key) => !(key in next);

function updateDom(dom, prevProps, nextProps) {
  //移除旧的事件监听
  Object.keys(prevProps)
    .filter(isEvent)
    .filter((key) => key in nextProps || isNew(prevProps, nextProps)(key))
    .forEach((name) => {
      const eventType = name.toLowerCase().substring(2);
      dom.removeEventListener(eventType, prevProps[name]);
    });

  // 添加新的事件监听
  Object.keys(nextProps)
    .filter(isEvent)
    .filter(isNew(prevProps, nextProps))
    .forEach((name) => {
      const eventType = name.toLowerCase().substring(2);
      dom.addEventListener(eventType, nextProps[name]);
    });

  // 移除旧属性
  Object.keys(prevProps)
    .filter(isProperty)
    .filter(isGone(prevProps, nextProps))
    .forEach((name) => {
      dom[name] = '';
    });

  // 新增新属性
  Object.keys(nextProps)
    .filter(isProperty)
    .filter(isNew(prevProps, nextProps))
    .forEach((name) => {
      dom[name] = nextProps[name];
    });
}

function commitDeletion(fiber, domParent) {
  if (fiber.dom) {
    // 执行unmount action
    for (const unmountAction of fiber.effectHooks) {
      unmountAction && unmountAction();
    }
    domParent.removeChild(fiber.dom);
  } else {
    commitDeletion(fiber.child, domParent);
  }
}

function commitWork(fiber) {
  if (!fiber) {
    return;
  }

  let domParentFiber = fiber.parent;
  while (!domParentFiber.dom) {
    domParentFiber = domParentFiber.parent;
  }
  const domParent = domParentFiber.dom;

  if (fiber.effectTag === effectTags.PLACEMENT && fiber.dom !== null) {
    domParent.appendChild(fiber.dom);
  } else if (fiber.effectTag === effectTags.UPDATE && fiber.dom !== null) {
    updateDom(fiber.dom, fiber.alternate.props, fiber.props);
  } else if (fiber.effectTag === effectTags.DELETION) {
    commitDeletion(fiber, domParent);
  }

  commitWork(fiber.child);
  commitWork(fiber.sibling);
}

function commitRoot() {
  // 修改dom树
  deletions.forEach(commitWork);
  commitWork(wipRoot.child);
  currentRoot = wipRoot;
  wipRoot = null;
}

function workLoop(deadline) {
  let shouldYield = false;

  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);

    //判断离浏览器再次拿回控制权还有多少时间
    shouldYield = deadline.timeRemaining() < 1;
  }

  if (!nextUnitOfWork && wipRoot) {
    commitRoot();
  }

  requestIdleCallback(workLoop);
}

const TEXT_ELEMENT = 'TEXT_ELEMENT';

function createTextElement(text) {
  return { type: TEXT_ELEMENT, props: { nodeValue: text, children: [] } };
}

function createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      children: children.map((child) => (typeof child === 'object' ? child : createTextElement(child))),
    },
  };
}

function render(element, container) {
  // 设置下一个工作单元/初始工作单元
  wipRoot = {
    dom: container,
    props: {
      children: [element],
    },
    // 存储旧的fiber树
    alternate: currentRoot,
  };
  deletions = [];
  nextUnitOfWork = wipRoot;

  requestIdleCallback(workLoop);
}

//库
const React = {
  createElement,
  useState,
  useEffect,
};
const ReactDOM = {
  render,
};

//加载时调用
window.onloadstart = App();

function Counter() {
  const [targetCount, setTargetCount] = React.useState(1);
  const [count, setCount] = React.useState(5);

  React.useEffect(() => {
    console.info('useEffect=>componentDidMount=>componentDidUpdate=>componentWillUnMount');
    return () => {
      console.info('useEffect=>componentWillUnMount!');
    };
  });

  React.useEffect(() => {
    console.info('useEffect=>componentDidMount!');
  }, []);

  React.useEffect(() => {
    console.info('useEffect=>componentDidMount=>componentDidUpdate:', targetCount, count);
  }, [targetCount, count]);

  // <button onClick={() => setCount((prev) => prev + 1)}>count</button>;
  const element = React.createElement(
    'div',
    null,
    React.createElement(
      'button',
      {
        onClick: () => setTargetCount(5),
      },
      `今年轻轻松松实现${targetCount}个小目标！`,
    ),
    React.createElement(
      'button',
      {
        onClick: () => setCount((prev) => prev + 1),
      },
      `今年轻轻松松长个${count}斤肉！`,
    ),
  );

  return element;
}

function FunctionComponent() {
  return React.createElement('h1', null, '我！秦始皇！打钱！');
}

function App() {
  //渲染内容
  // <div title='mini react'>
  //   <h1>纳贤</h1>
  //   <span>为了世界和平！</span>
  //   <a href='#'>加入我们！</a>
  // </div>;
  // const element = React.createElement(
  //   'div',
  //   { title: 'mini react' },
  //   React.createElement('h1', null, '纳贤'),
  //   React.createElement('span', null, '为了世界和平！'),
  //   React.createElement('a', { href: '#' }, '加入我们！'),
  //   React.createElement(FunctionComponent, null),
  //   React.createElement(Counter, null),
  // );
  const element = React.createElement(
    'div',
    null,
    React.createElement(Counter, null),
    // React.createElement(Counter, null),
  );

  const container = document.getElementById('root');
  ReactDOM.render(element, container);
}
