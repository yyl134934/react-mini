let nextUnitOfWork = null;
// 把修改 DOM 这部分内容记录在 fiber tree 上，通过追踪这颗树来收集所有 DOM 节点的修改（work in progress root）
let wipRoot = null;
let currentRoot = null;
let deletions = null;

/**
 * 协调器 reconcile
 * 对比新旧节点，根据变化更新节点
 * @param {*} wipFiber
 * @param {*} elements
 */
function reconcileChildren(wipFiber, elements) {
  let index = 0;
  let oldFiber = wipFiber.alternate && wipFiber.alternate.child;
  let prevSibling = null;

  while (index < elements.length ?? oldFiber) {
    const element = elements[index];
    let newFiber = null;
    // 对比标签类型——但React使用 key 这个属性来优化 reconciliation 过程。比如, key 属性可以用来检测 elements 数组中的子组件是否仅仅是更换了位置。
    const sameType = oldFiber && element && oldFiber.type === element.type;

    if (sameType) {
      //TODO update the node
      newFiber = {
        type: element.type,
        props: element.props,
        parent: wipFiber,
        dom: oldFiber.dom,
        alternate: oldFiber,
        effectTag: 'UPDATE',
      };
    }

    if (element && !sameType) {
      //TODO add this node
      newFiber = {
        type: element.type,
        props: element.props,
        parent: wipFiber,
        dom: null,
        alternate: null,
        effectTag: 'PLACEMENT',
      };
    }

    if (oldFiber && !sameType) {
      //TODO delete the oldFiber's node
      oldFiber.effectTag = 'DELETION';
      deletions.push(oldFiber);
    }

    if (oldFiber) {
      oldFiber = oldFiber.sibling;
    }

    if (index === 0) {
      wipFiber.child = newFiber;
    } else {
      console.info('element：', element);
      console.info('sameType：', sameType);
      prevSibling.sibling = newFiber;
    }
    prevSibling = newFiber;
    index++;
  }
}

let wipFiber = null;
let hookIndex = null;

function useState(initial) {
  const oldHook = wipFiber?.alternate?.hooks[hookIndex];
  const hook = {
    state: oldHook ? oldHook.state : initial,
    queue: [],
  };

  const actions = oldHook ? oldHook.queue : [];
  actions.forEach((action) => {
    hook.state = action(hook.state);
  });

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
  hookIndex++;

  return [hook.state, setState];
}

function updateFunctionComponent(fiber) {
  wipFiber = fiber;
  hookIndex = 0;
  wipFiber.hooks = [];

  const children = [fiber.type(fiber.props)];

  reconcileChildren(fiber, children);
}

function updateHostComponent(fiber) {
  if (!fiber.dom) {
    fiber.dom = createDom(fiber);
  }

  reconcileChildren(fiber, fiber.props.children);
}

function performUnitOfWork(fiber) {
  // add dom node
  const { dom, props, type } = fiber;

  const isFunctionComponent = type instanceof Function;
  if (isFunctionComponent) {
    updateFunctionComponent(fiber);
  } else {
    updateHostComponent(fiber);
  }

  // return next unit of work
  if (fiber.child) {
    return fiber.child;
  }
  let nextFiber = fiber;
  while (nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling;
    }

    nextFiber = nextFiber.parent;
  }
}

const TEXT_ELEMENT = 'TEXT_ELEMENT';

function createTextElement(text) {
  return {
    type: TEXT_ELEMENT,
    props: {
      nodeValue: text,
      children: [],
    },
  };
}

function createElement(type, attrs, ...children) {
  return {
    type,
    props: {
      ...attrs,
      children: children.map((child) => (typeof child === 'object' ? child : createTextElement(child))),
    },
  };
}

function createDom(fiber) {
  const {
    type,
    props: { children = [], ...rest },
  } = fiber;

  //根据type新建节点
  const dom = type === TEXT_ELEMENT ? document.createTextNode('') : document.createElement(type);

  //给节点添加属性
  for (const [key, value] of Object.entries(rest)) {
    dom[key] = value;
  }

  updateDom(dom, {}, fiber.props);

  return dom;
}

const isEvent = (key) => key.startsWith('on');

function updateDom(dom, prevProps, nextProps) {
  //remove old or changed event listeners
  for (const [key, prevValue] of Object.entries(prevProps)) {
    if (!key.startsWith('on')) {
      continue;
    }
    if (nextProps.hasOwnProperty(key)) {
      continue;
    }
    if (prevValue !== nextProps[key]) {
      continue;
    }
    const eventType = key.toLowerCase().substring(2);
    dom.removeEventListener(eventType, prevValue);
  }

  //Add event listeners
  for (const [key, nextValue] of Object.entries(nextProps)) {
    if (!key.startsWith('on')) {
      continue;
    }
    if (nextValue === prevProps[key]) {
      continue;
    }
    const eventType = key.toLowerCase().substring(2);
    dom.addEventListener(eventType, nextValue);
  }

  //remove old properties
  const { children, ...rest } = prevProps;

  const attrs = Object.keys(rest).filter((key) => !isEvent(key));

  for (const key of Object.keys(attrs)) {
    const hasOwn = nextProps.hasOwnProperty(key);

    if (!hasOwn) {
      dom[key] = '';
    }
  }

  //set new or changed properties
  const { children: nextChildren, ...nextRest } = nextProps;

  for (const [key, nextValue] of Object.entries(nextRest)) {
    const prevValue = prevProps[key];

    if (key.startsWith('on')) {
      continue;
    }

    if (prevValue !== nextValue) {
      dom[key] = nextValue;
    }
  }
}

function commitDeletion(fiber, domParent) {
  if (fiber.dom) {
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
    // 函数组件没有 DOM 节点，在实际的 DOM 寻找父子节点等操作中需要被跳过。
    domParentFiber = domParentFiber.parent;
  }

  const domParent = domParentFiber.dom;
  if (fiber.effectTag === 'PLACEMENT' && fiber.dom !== null) {
    domParent.appendChild(fiber.dom);
  } else if (fiber.effectTag === 'UPDATE' && fiber.dom !== null) {
    updateDom(fiber.dom, fiber.alternate.props, fiber.props);
  } else if (fiber.effectTag === 'DELETION' && fiber.dom !== null) {
    commitDeletion(fiber, domParent);
  }
  commitWork(fiber.child);
  commitWork(fiber.sibling);
}

function commitRoot() {
  // add/update nodes to dom
  deletions.forEach(commitWork);
  commitWork(wipRoot.child);
  currentRoot = wipRoot;
  console.info(wipRoot);
  wipRoot = null;
}

function workLoop(deadline) {
  let shouldYield = false;

  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    shouldYield = deadline.timeRemaining() < 1;
  }

  if (!nextUnitOfWork && wipRoot) {
    commitRoot();
  }

  // 把控制权交给浏览器
  requestIdleCallback(workLoop);
}

/**
 * 渲染器 renderer
 * @param {*} element
 * @param {*} container
 */
function render(element, container) {
  wipRoot = {
    dom: container,
    props: {
      children: [element],
    },
    alternate: currentRoot,
  };
  deletions = [];
  nextUnitOfWork = wipRoot;
}

// 调度器 scheduler
requestIdleCallback(workLoop);

//库
const ReactDOM = {
  createElement,
  render,
  useState,
};

//加载时调用
window.onloadstart = App();

function foo(props) {
  return ReactDOM.createElement('h1', null, 'Hi ', props.name);
}
const element = ReactDOM.createElement(App, {
  name: 'foo',
});

function Counter() {
  const [count, setCount] = ReactDOM.useState(0);

  return ReactDOM.createElement('button', { onClick: () => setCount((prev) => prev + 1) }, count);
}
function App() {
  //渲染内容
  // <div title='mini react'>
  //   <h1>纳贤</h1>
  //   <span>为了世界和平！</span>
  //   <a href='#'>加入我们！</a>
  //   <h1>打钱</h1>
  //   <div>
  //     <span>我是秦始皇！</span>
  //     <a href='#'>打钱！</a>
  //   </div>
  // </div>;
  const element = ReactDOM.createElement(
    'div',
    { title: 'mini react' },
    ReactDOM.createElement('h1', null, '纳贤'),
    ReactDOM.createElement('span', null, '为了世界和平！'),
    ReactDOM.createElement('a', { href: '#' }, '加入我们！'),
    ReactDOM.createElement('h1', null, '打钱'),
    ReactDOM.createElement(
      'div',
      null,
      ReactDOM.createElement('span', null, '我是秦始皇！'),
      ReactDOM.createElement('a', { href: '#' }, '打钱！'),
    ),
    ReactDOM.createElement('h1', null, '查收'),
    ReactDOM.createElement(
      'div',
      null,
      ReactDOM.createElement('span', null, '快快快，查收！'),
      ReactDOM.createElement('span', null, '哎哟！竟然赚了'),
      ReactDOM.createElement(Counter, null),
      ReactDOM.createElement('span', null, '个小目标！'),
    ),
  );

  // const element = ReactDOM.createElement(Counter, null);

  const container = document.getElementById('root');
  ReactDOM.render(element, container);
}
