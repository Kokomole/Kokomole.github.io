<!-- meta {"date":"2020-09-02","slug":"2fjNs-43i","title":"RxODE","tags":["R","PK/PD"]} -->

RxODE是一个基于常微分方程进行PK/PD模拟的R包。

## 1. 安装

使用RxODE需要C编译器。使用以下命令检查是否存在编译器：

```
pkgbuild::has_build_tools(debug = TRUE)
```

如果没有编译器，需要安装Rtools：

```
library(installr)
install.rtools()
```

报错如下：

```
> install.rtools()
#Loading required namespace: pkgbuild
#Loading required package: htmltab
#No encoding supplied: defaulting to UTF-8.
#Error in loadNamespace(name) : there is no package called ‘XML’
```

提示需要安装`XML`包，但是这个包只支持4.0以上版本的R。可使用以下命令：

```
install.packages("XML", repos = "http://www.omegahat.net/R")
```

报错配置失败：

```
ERROR: configuration failed for package ‘XML’
```

这个版本的XML包依然不兼容。尝试另一种方法，但依然报错：

```
> devtools::install_version('XML', '3.99-0.3')
Error in download_version_url(package, version, repos, type) : 
  couldn't find package 'XML'
```

不过CRAN上提供了之前的版本（3.99-0.3）。载到本地后安装，终于成功：

```
> utils:::menuInstallLocal()
package ‘XML’ successfully unpacked and MD5 sums checked
```

安装好XML后，继续安装Rtools：

```
> install.rtools()
No encoding supplied: defaulting to UTF-8.
Argument 'which' was left unspecified. Choosing first table.
Error: Couldn't find a table.
```

后RxODE可以顺利运行。

## 2. 给药和观测事件

与NONMEM一样，RxODE也是以事件来区分的，包括给药和采样2种事件类型。NM数据文件中的AMT、II、ADDL、RATE等变量，在RxODE中同样使用。

在官网中，我发现有2种创建事件表格的函数：`et`和`eventTable`。我还没有搞清楚这2者的区别是什么，也不知道作者为什么提供2种方法。由于`eventTable`函数可以自动补全，我选择了后者。

### 2.1 一种给药方案

无论是给药事件，还是观测事件，都需要先利用`eventTable`函数生成一个用以存放的对象，然后增加事件。`eventTable`函数中可以指定时间和剂量的单位。使用`add.dosing`增加给药事件。

```
eventTable(time.units = "hours", amount.units = "μg") %>%
  add.dosing(dose = 10000, nbr.doses = 10, dosing.interval = 12)
```

### 2.2 多种给药方案

如果使用了不同的给药方案（剂量、给药间隔的调整等等），需要将2种给药方案分别赋值给变量，然后用`seq`函数连接起来。这样做的目的是使时间能对得上。

给药方案：首先给予5天的10mg、bid给药，共计10次给药；再给予5天的20mg、qd给药给药，共计5次。

-   错误写法：

    ```
    eventTable(time.units = "hours", amount.units = "μg") %>%
      add.dosing(dose = 10000, nbr.doses = 10, dosing.interval = 12) %>%
      add.dosing(dose = 20000, nbr.doses = 5, dosing.interval = 24) 
    ```
    
    结果如下，可以发现2次给药事件的`time`都等于0：

    ```
    #--------------------------- EventTable with 2 records --------------------------
    #   2 dosing records (see $get.dosing(); add with add.dosing or et)
    #   0 observation times (see $get.sampling(); add with add.sampling or et)
    #   multiple doses in `addl` columns, expand with $expand(); or etExpand()
    #-- First part of : -------------------------------------------------------------
    # A tibble: 2 x 5
    #   time   amt    ii  addl evid        
    #    [h]  [µg]   [h] <int> <evid>      
    #1     0 10000    12     9 1:Dose (Add)
    #2     0 20000    24     4 1:Dose (Add)
    #--------------------------------------------------------------------------------
    ```
    
-   正确写法

    ```
    dose1 <- eventTable(time.units = "hours", amount.units = "μg") %>%
      add.dosing(dose = 10000, nbr.doses = 10, dosing.interval = 12)
    
    dose2 <- eventTable(time.units = "hours", amount.units = "μg") %>%
      add.dosing(dose = 20000, nbr.doses = 5, dosing.interval = 24) 
    
    seq(dose1, dose2)
    ```
    
    首次给药方案开始于第0小时，经过10次间隔为12小时的给药之后（12\*10 = 120），开始下一给药方案：

    ```
    --------------------------- EventTable with 2 records --------------------------
       2 dosing records (see $get.dosing(); add with add.dosing or et)
       0 observation times (see $get.sampling(); add with add.sampling or et)
       multiple doses in `addl` columns, expand with $expand(); or etExpand()
    -- First part of : -------------------------------------------------------------
    # A tibble: 2 x 5
       time   amt    ii  addl evid        
      <dbl> <dbl> <dbl> <int> <evid>      
    1     0 10000    12     9 1:Dose (Add)
    2   120 20000    24     4 1:Dose (Add)
    --------------------------------------------------------------------------------
    ```
    

### 2.3 观测事件

在给药事件的基础上，使用`add.sampling`函数增加观测事件，指定开始时间，结束时间，步长，其中步长可以用次数代替：

```
et <- seq(dose1, dose2) %>% 
  add.sampling(seq(from = 0, to = 10*24, by = 1))
```

## 3. 结构模型

```
model <- RxODE({
  
  # 参数
  t_KA = 2.94E-01
  eta_KA = 0
  KA ~ t_KA*exp(eta_KA)
  
  t_CL = 1.86E+01
  eta_CL = 0
  CL ~ t_CL*exp(eta_CL)
  
  t_V2 = 4.02E+01 
  eta_V2 = 0
  V2 ~ t_V2*exp(eta_V2)
  
  t_Q = 1.05E+01
  eta_Q = 0
  Q ~ t_Q*exp(eta_Q)
  
  t_V3 = 2.97E+02
  eta_V3 = 0
  V3 ~ t_V3*exp(eta_V3)
  
  t_Kin = 1
  eta_Kin = 0
  Kin ~ t_Kin*exp(eta_Kin)
  
  t_Kout = 1
  eta_Kout = 0
  Kout ~ t_Kout*exp(eta_Kout)
  
  t_EC50 = 200
  eta_EC50 = 0
  EC50 ~ t_EC50*exp(eta_EC50)
  
  # 微分方程
  C2 = centr/V2
  C3 = peri/V3
  
  d/dt(depot) =-KA*depot
  d/dt(centr) = KA*depot - CL*C2 - Q*C2 + Q*C3
  d/dt(peri)  =                    Q*C2 - Q*C3
  d/dt(eff)  = Kin - Kout*(1 - C2/(EC50 + C2))*eff 
  
  # 残差模型
  err_PK_prop <- 0
  C2 <- centr*(1 + err_PK_prop)
  
  # 微分方程初始条件
  eff(0) = 1
})
```

## 4. 个体间变异

```
omega <- lotri({
  eta_KA ~ 0.04
  eta_CL ~ 0.09
  eta_V2 ~ 0.04
  eta_Q ~ 0.01
  eta_V3 ~ 0.01
  eta_Kin ~ 0.01
  eta_Kout ~ 0.01
  eta_EC50 ~ 0.04
})
```

## 5. 残差变异

```
sigma <- lotri(err_PK_prop ~ 0.09)
```

```
rxSolve(object = model_name, events = et, 
        omega = omega, nSub = 3, sigma = sigma) %>%
  plot(C2,eff)
```

## 6. 协方差矩阵

```
rseVar <- function(est, rse){
  return(est*rse/100)^2
}

thetaMat <- lotri(t_KA ~ rseVar(2.94E-01, 5),
                  t_CL ~ rseVar(1.86E+01, 7),
                  t_V2 ~ rseVar(4.02E+01, 16),
                  t_Q ~ rseVar(1.05E+01, 35),
                  t_V3 ~ rseVar(2.97E+02, 21),
                  t_Kin ~ rseVar(1, 37),
                  t_Kout ~ rseVar(1, 33),
                  t_EC50 ~ rseVar(200,5)
)
```

```
> thetaMat
#         t_KA  t_CL  t_V2   t_Q  t_V3 t_Kin t_Kout t_EC50
#t_KA   0.0147 0.000 0.000 0.000  0.00  0.00   0.00      0
#t_CL   0.0000 1.302 0.000 0.000  0.00  0.00   0.00      0
#t_V2   0.0000 0.000 6.432 0.000  0.00  0.00   0.00      0
#t_Q    0.0000 0.000 0.000 3.675  0.00  0.00   0.00      0
#t_V3   0.0000 0.000 0.000 0.000 62.37  0.00   0.00      0
#t_Kin  0.0000 0.000 0.000 0.000  0.00  0.37   0.00      0
#t_Kout 0.0000 0.000 0.000 0.000  0.00  0.00   0.33      0
#t_EC50 0.0000 0.000 0.000 0.000  0.00  0.00   0.00     10
```

## 7. 最终结果

```
rxSolve(object = model_name,events = et,dfSub=760,
        nSub = 60, nStud = 60, omega = omega, sigma = sigma,
        thetaMat = thetaMat, thetaLower = 0) %>% 
  confint(c("C2","eff"),level = 0.90) %>% 
  plot()
```
