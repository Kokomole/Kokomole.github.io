<!-- meta {"date":"2020-08-31","slug":"dplyr","title":"dplyr","tags":["R"]} -->

所用的数据为`datasets`包提供的`ChickWeight`数据集，它描述了不同时间小鸡的体重和喂食种类。

```
library(datasets)
head(ChickWeight)

# Grouped Data: weight ~ Time | Chick
#   weight Time Chick Diet
# 1     42    0     1    1
# 2     51    2     1    1
# 3     59    4     1    1
# 4     64    6     1    1
# 5     76    8     1    1
# 6     93   10     1    1
```

## 1. 计数：count

用于分类变量（也可用于连续变量）的统计描述，计算不同类别数据的数量。格式为：

```
count(data, group)
```

统计4种喂食方式的样本量：

```
count(ChickWeight, Diet)
#  A tibble: 4 x 2
#  Diet      n
#  <fct> <int>
#1 1       220
#2 2       120
#3 3       120
#4 4       118
```

## 2. 总结：summarise

对连续变量进行统计描述，计算均值、最值、分位数等。格式为：

```
summarise(data, function)
```

可选择是否移除NA值。示例如下：

```
summarise(ChickWeight, 
          mean(weight, na.rm = T), min(weight), max(weight),
          median(weight), quantile(weight,0.05), quantile(weight,0.95))
#  mean(weight, na.rm = T) min(weight) max(weight) median(weight)
#1                121.8183          35         373            103
#  quantile(weight, 0.05) quantile(weight, 0.95)
#1                     41                    264
```

## 3. 分组：group\_by

将数按照某项内容进行分组，方面后续分析。格式为：

```
group_by(data, group_by(group))
```

根据喂食方式（4种）分组：

```
group_by(ChickWeight, Diet)
#  A tibble: 578 x 4
#  Groups:   Diet [4]
#   weight  Time Chick Diet 
# *  <dbl> <dbl> <ord> <fct>
# 1     42     0 1     1    
# 2     51     2 1     1    
# 3     59     4 1     1    
# 4     64     6 1     1    
# 5     76     8 1     1    
# 6     93    10 1     1    
# 7    106    12 1     1    
# 8    125    14 1     1    
# 9    149    16 1     1    
#10    171    18 1     1    
#  ... with 568 more rows
```

`group_by`命令可以与`summarise`联用，分组进行连续变量的描述。格式为：

```
summarise(group_by(data,group), function)
```

示例如下：

```
summarise(group_by(ChickWeight,Diet), 
          mean(weight),median(weight))
#  A tibble: 4 x 3
#  Diet  `mean(weight)` `median(weight)`
#  <fct>          <dbl>            <dbl>
#1 1               103.              88 
#2 2               123.             104.
#3 3               143.             126.
#4 4               135.             130.
```

## 4. 筛选：filter

可设置多个筛选条件，“与”用`,`连接，“或”用`|`连接。格式为：

```
filter(data, condition 1, condition 2, ...)
```

挑选出体重大于320，喂食种类为2或4的数据：

```
filter(ChickWeight, weight >= 320)
#  weight Time Chick Diet
#1    331   21    21    2
#2    327   20    34    3
#3    341   21    34    3
#4    332   18    35    3
#5    361   20    35    3
#6    373   21    35    3
#7    321   21    40    3
#8    322   21    48    4

filter(ChickWeight, weight >= 320, Diet == 2|Diet == 4)
#  weight Time Chick Diet
#1    331   21    21    2
#2    322   21    48    4
```

## 5. 选择：select

用于选出数据中某些变量（列），可以用列名，也可以用列号，前面加`-`表示去掉该列。格式为：

```
select(data, var1, var2)
```

示例如下，由于dplyr中的`select`与MASS包中的同名命令冲突，因此需指定来自dplyr包：

```
dplyr::select(ChickWeight, Time, weight)
#Grouped Data: weight ~ Time | Chick
#    Time weight
#1      0     42
#2      2     51

dplyr::select(ChickWeight, c(2,1))
#Grouped Data: weight ~ Time | Chick
#    Time weight
#1      0     42
#2      2     51

dplyr::select(ChickWeight, Time:weight)
#Grouped Data: weight ~ Time | Chick
#    Time weight
#1      0     42
#2      2     51
```

## 6. 增加变量：mutate

用于在原数据集上增加新的列，格式为：

```
mutate(data, name = value)
```

增加`Diff`变量，表示改行体重与均值之差：

```
mutate(ChickWeight, Diff = weight - mean(weight))
#    weight Time Chick Diet        Diff
#1       42    0     1    1 -79.8183391
#2       51    2     1    1 -70.8183391
#3       59    4     1    1 -62.8183391
#4       64    6     1    1 -57.8183391
```

## 7. 管道命令：pipe

在R中，pipe命令用`$>$`表示。使用管道命令的格式为：

```
data %>%
	operation 1 %>%
	operation 2 %>%
	...
	last opration
```

对数据依次执行以下操作：

-   增加Diff列，存放体重与均值之差
-   去掉weight这一列
-   选择编号为1或2的小鸡
-   根据Diet分组
-   计算Diff的中位数和95%分位数

```
ChickWeight %>%
  mutate(Diff = weight - mean(weight)) %>%
  dplyr::select(-weight) %>%
  filter(Chick == 1|Chick == 2) %>%
  group_by(Diet) %>%
  summarise(quantile(Diff,0.05), median(Diff), quantile(Diff,0.95))
#  A tibble: 1 x 4
#  Diet  `quantile(Diff, 0.05)` `median(Diff)` `quantile(Diff, 0.95)`
#  <fct>                  <dbl>          <dbl>                  <dbl>
#1 1                      -78.8          -17.3                   86.6
```
