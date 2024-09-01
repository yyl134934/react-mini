# react-mini

- Build Your Own React： [中译地址](https://qcsite.gatsbyjs.io/build-your-own-react/)、[原文地址](https://pomb.us/build-your-own-react/)
- 尝试理解React思想，并实现一个简易版的React（16.8）

# 怎么实现？

#### 步骤一：构建createElement函数

- babel将jsx解析后的数据，由createElement函数转换成render需要的数据结构

#### 步骤二：构建render函数

- 根据props创建DOM节点
- 添加DOM属性
- 关联子节点

#### 步骤三：Concurrent模式

- 分割任务，避免主线程阻塞，保证体验流畅
- 把调度权限交给调度器Scheduler——对应浏览器requestIdleCallback

#### 步骤四：Fiber

- 每一个element都是一个Fiber，每一Fiber都是一个任务单元
- 建立Fiber树——parent、child、sibling节点之间相互关联
- 深度遍历Fiber树
- 每一个Fiber节点都必须做3件事：
  1. 把element转换成DOM节点，并添加到DOM树
  2. 为该 fiber 节点的子节点新建 fiber
  3. 挑选出下一个工作单元

#### 步骤五：Render和Commit Phases

- 把修改DOM节点环节，从perform环节抽出，放到整个fiber树修改完之后进行
- 再依据fiber树的记录，完成DOM树的修改

#### 步骤六：Reconciliation协调器

- 在Reconciliation协调器中完成对新旧Fiber树的对比更新

#### 步骤七：添加对函数组件的支持

- 函数组件的不同点在于：
  1. 函数组件的fiber没有DOM节点
  2. 并且子节点由函数组件运行的来，而不是从props属性中获取
#### 步骤八：添加对Hooks.setState()的支持

#### 步骤九：添加对Hooks.useEffect()的支持
- 完成componentDidMount、componetWillUpdate以及componentWillUnmount三个周期的正确调用

#### 步骤十：添加对Hooks.useRef()的支持
- 实现一个ref对象，通过ref.current属性获取DOM节点
- 保证ref对象在组件更新时，不会被重新创建