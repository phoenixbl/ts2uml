# ts2uml

#### 介紹

将 typescript 代码自动生成 UML 图。UML 提供方为：https://yuml.me/

#### 安裝教程

```sh
npm install -g ts2uml
```

#### 使用說明

```
ts2uml --glob ./src/**/*.ts

(不设则默认路径通配符为./src/**/*.ts)
```

#### 来源及说明

1.  代码基于[TsUML@remojansen@github]https://github.com/remojansen/TsUML 增强

2.  新增特性：

    > 支持生成的 UML 图输出本地，默认位置：运行路径下 uml.svg

    > 支持不同颜色表示类、接口、枚举，简单关联

    > TS 的 DGL 增强

#### 示例

![](/assets/uml_demo.svg)
