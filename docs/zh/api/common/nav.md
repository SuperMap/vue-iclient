# 导航栏

```vue
    <sm-nav
      :items="[
        { key: 1, title: '菜单1' },
        { key: 2, title: '菜单2' },
        { key: 3, title: '菜单3' },
        { key: 4, title: '菜单4' },
        { key: 5, title: '菜单5' },
        { key: 6, title: '菜单6' }
      ]"
      :title="{ title: '导航栏', position: 'center'}"
    ></sm-nav>
```

### Attributes

| 参数              | 说明                                                   | 类型              | 可选值    | 默认值   |
| :---------------- | :----------------------------------------------------- | :--------------- | :-------- | :---------------------------------------------------------- |
| navStyle           | 自定义样式。                                           | Object           | -         | -                                                           |
| title             | 标题数据。<a href="#title">配置项</a>                  | object           | -         | -                                                           |
| items          | 导航项数据。<a href="#navItems">配置项</a>                | object[ ]        | -         | -                                                           |
| itemStyle         | 自定义导航项样式 <a href="#itemstyle">使用</a>       | Function(item)   | -         | -                                                           |
| itemActiveStyle   | 自定义导航项选中样式 <a href="#itemstyle">使用</a>   | Function(item)   | -         | -                                                           |
| itemAlign         | 导航项对齐方式                                         | Function(item)   | -         | (item) => { return { align: 'center'\| 'left' \| 'right' }}        |

### title

| 参数                | 说明                  | 类型          | 可选值                                        | 默认值                                    |
| :----------------   | :-------------------  | :----------- | :------------------------------------------  | :------------------------------------------------------ |
| text                | 名称                  | string       | -                                             | -                                                       |
| position            | 位置                  | string       | -                                             | -                                                       |
| href                | 超链接地址            | string       | -                                              | -                                                       |
| target              | 跳转窗口              | string       | '\_blank' \| '\_self' \| '\_parent' \| '\_top' | '\_self'                                                |
| style               | 自定义样式            | Object       | -                                              | { width: '30%', letterSpacing: '5px',fontSize: '22px';}    |
| activeStyle         | 自定义选中样式        | Object       | -                                              | -                                                       |


### items

| 参数                | 说明                                                 | 类型            | 可选值      | 默认值       |
| :----------------   | :--------------------------------------------------- | :-------------- | :--------- | :--------    |
| key                 | 唯一标识                                             | number          | -           |  -           |
| title               | 名称                                                 | string          | -           | -            |

### Events

| 参数   | 说明                           | 回调参数                 |
| :----- | :----------------------------- | :---------------------- |
| change | 切换当前活动导航项时将触发事件  | function(item, index)    |

### Methods

| 名称          | 描述                                                |
| :------------ | :-------------------------------------------------- |
| goTo(index)   | 切换到指定的导航项( index: 导航项的索引 )            |
| next()        | 切换到下一个导航项                                   |
| prev()        | 切换到上一个导航项                                   |

### itemStyle
适用于 itemStyle itemActiveStyle

```js
<sm-nav
  itemStyle={(item) => {
    return {
        width: '100%',
        height: '100%',
        fontSize: '18px'
    }
  )}
/>
```