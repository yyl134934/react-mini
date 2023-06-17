# react-mini

- Build Your Own React： [中译地址](https://qcsite.gatsbyjs.io/build-your-own-react/)、[原文地址](https://pomb.us/build-your-own-react/)
- 尝试理解React思想，并实现一个简易版的React（16.8）

# 怎么实现？

#### 步骤一：构建createElement函数

- babel将jsx解析后的数据，由createElement函数转换成render需要的数据结构

#### 步骤二：构建render函数

- 根据props创建dom节点
- 添加dom属性
- 关联子节点

#### 步骤三：Concurrent模式

- 分割任务，避免主线程阻塞，保证体验流畅
- 把调度权限交给调度器Scheduler——对应浏览器requestIdleCallback

#### 步骤四：Fiber

- 每一个element都是一个Fiber，每一Fiber都是一个任务单元
- 建立Fiber树——parent、child、sibling节点之间相互关联
- 深度遍历Fiber树
- 每一个Fiber节点都必须做3件事：
  1. 把element转换成dom节点，并添加到dom树
  2. 为该 fiber 节点的子节点新建 fiber
  3. 挑选出下一个工作单元
