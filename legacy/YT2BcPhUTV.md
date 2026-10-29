<!-- meta {"date":"2022-06-09","slug":"YT2BcPhUTV","title":"群体药动学入门","tags":["NONMEM"]} -->

群体药动学（Population PK）是药代动力学和统计学结合的产物，这里简述其统计学理论基础。

## 1. 最大似然估计和最小二乘法

### 1.1 最大似然估计

最大似然估计（MLE）是一种估计未知参数的方法。它将参数$\theta$的所有取值中，有最大的可能性得到当前样本结果的值$\hat{\theta}$，作为参数的估计值。

在参数$\theta$的条件下，产生当前样本$Y$的概率是$P(Y \mid \theta)$。MLE估计$\theta$的过程就是使这一概率最大化，解出对应的$\theta$值。似然函数$L(\theta \mid Y) = P(Y \mid \theta)$。

### 1.2 正态分布的MLE

自变量$x_j$和因变量$y_j$有如下关系：

$$
y_j = f(x_j, \theta) + \varepsilon_j \tag{1}
$$

其中，$j$表示第$j$次观测，$f$是结构模型，$\theta$是模型中的参数，$\varepsilon_j$是残差，服从正态分布：$\varepsilon_j \sim N(0, \sigma^2)$。因此，

$$
y_j \sim N(f(x_j, \theta), \sigma^2) \tag{2}
$$

根据正态分布的概率密度函数（$f(x)=\frac{1}{\sqrt{2\pi \sigma^2}}e^{-\frac{(x-\mu)^2}{2\sigma^2}}$），在参数$\theta$和$\sigma^2$的条件下，产生观测值$y_j$的概率是

$$
L(\theta, \sigma^2 \mid y_j) = P(y_j \mid \theta, \sigma^2) = \frac{1}{\sqrt{2\pi \sigma^2}} \cdot \exp(\frac{(y_j-f(x_j, \theta))^2}{-2 \sigma^2}) \tag{3}
$$

由于每次观测（$y_j$）之间相互独立，则进行$n$次观测之后，构成样本$Y = (y_1, y_2, \cdots, y_n)$的概率是每次观测值的概率之积

$$
L(\theta, \sigma^2 \mid Y) = P(Y \mid \theta, \sigma^2) = \prod_{j=1}^{n} (\frac{1}{\sqrt{2\pi \sigma^2}} \cdot \exp(\frac{(y_j-f(x_j, \theta))^2}{-2 \sigma^2})) \tag{4}
$$

由于似然函数是连乘的形式，计算导数求极值点不方便，因此将其取对数

$$
\begin{aligned} \ln L(\theta, \sigma^2 \mid Y) &=\sum_{j=1}^{n} \ln (\frac{1}{\sqrt{2\pi \sigma^2}} \cdot \exp(\frac{(y_j-f(x_j, \theta))^2}{-2 \sigma^2})) \\ &=\sum_{j=1}^{n} (\ln \frac{1}{\sqrt{2\pi \sigma^2}} + \frac{(y_j-f(x_j, \theta))^2}{-2 \sigma^2}) \\ &=\sum_{j=1}^{n} \ln (2\pi \sigma^2)^{-\frac{1}{2}} + \sum_{j=1}^{n} \frac{(y_j-f(x_j, \theta))^2}{-2 \sigma^2} \\ &=-\frac{n}{2}\ln (2\pi \sigma^2) -\frac{1}{2} \sum_{j=1}^{n} \frac{(y_j-f(x_j, \theta))^2}{\sigma^2} \\ \end{aligned} \tag{5}
$$

将式（5）两边乘以-2，得

$$
\begin{aligned} -2 \ln L(\theta \mid Y) &= n\ln (2\pi \sigma^2) + \sum_{j=1}^{n} \frac{(y_j-f(x_j, \theta))^2}{\sigma^2} \\ &= \sum_{j=1}^{n} (\frac{(y_j-f(x_j, \theta))^2}{\sigma^2} + \ln\sigma^2) + n\ln(2\pi) \end{aligned} \tag{6}
$$

式（6）中的$n\ln(2\pi)$项是常数，NONMEM计算时不会纳入这部分，因此，式（7）为NONMEM中正态分布MLE的目标函数

$$
OF_{ML}(x_j, \theta, \sigma^2) = \sum_{j=1}^{n} (\frac{(y_j-f(x_j, \theta))^2}{\sigma^2} + \ln\sigma^2) \tag{7}
$$

将$OF_{ML}(x_j, \theta, \sigma^2)$最小化（即将似然最大化），对应的$\theta$和$\sigma^2$就是似然估计值。

### 1.3 普通最小二乘法（OLS）

普通最小二乘法不作任何处理，目标函数为

$$
OF_{OLS} = \sum_{j=1}^{n} (obs_j-pred_j)^2 \tag{8}
$$

其中，$obs_j$和$pred_j$分别是第$j$次观测的实测值和预测值。

### 1.4 加权最小二乘法（WLS）

当观测值的尺度很大时，对应的变异值也会很大，直接相加不合理，需要根据观测值进行加权。目标函数为

$$
OF_{WLS} = \sum_{j=1}^{n} ((obs_j-pred_j)^2 \cdot w_j)\tag{9}
$$

其中，$w_j = \frac{1}{obs_j}$。

### 1.5 扩展最小二乘法（ELS）

WLS的权重是固定的（观测值），而不是模型估计的结果，扩展最小二乘法使用模型估计值作为权重。目标函数为

$$
OF_{ELS} = \sum_{j=1}^{n} (\frac{(obs_j-pred_j)^2}{\sigma_j^2} + \ln\sigma_j^2) \tag{10}
$$

式（10）的形式就是NONMEM中正态分布MLE的目标函数。

## 2. 群体PK分析方法

### 2.1 简单聚集法（NP）

简单聚集法将所有的数据视为来自同一人，忽略了个体间变异。目标函数为

$$
OF_{WLS,NP} = \sum_{j=1}^{n} ((obs_j-f(\theta)_j)^2 \cdot w_j)\tag{11}
$$

### 2.2 简单平均法（NA）

简单平均法是先计算所有人在各个时间点的均值，再使用最小二乘法。目标函数为

$$
OF_{WLS,NA} = \sum_{j=1}^{n} ((obs_j-f(\theta)_j)^2 \cdot w_j)\tag{12}
$$

其中，$obs_j$是所有人在第$j$次观测的均值。

### 2.3 标准两步法（STS）

第1步：计算每个人的参数$\theta_i$

$$
OF_{WLS,STS} = \sum_{j=1}^{n} ((obs_j-f(\theta)_j)^2 \cdot w_j)\tag{13}
$$

第2步：根据每个人的参数值，计算均值、方差、变异系数等，并探索协变量关系

$$
CL_i = A + B \cdot CrCL_i \tag{14}
$$

### 2.4 最大后验贝叶斯估计（MAPB）

在已知群体典型值（$\theta$）、个体间变异（$\Omega$）、残差变异（$\sigma^2$）这些先验信息的情况下，最大化后验概率来估计个体参数（$\eta_i$：刻画了个体参数与群体典型值的差异）。这通过最小化以下目标函数实现

$$
\begin{aligned} OF_{POSTHOC_i} &= \sum_{j=1}^{n_i} \frac{(y_{i,j}-f_{i,j}(\theta, \eta_i))^2}{\sigma^2}+ \eta'\Omega^{-1}\eta \\ &= \sum_{j=1}^{n_i} \frac{(y_{i,j}-f_{i,j}(\theta, \eta_i))^2}{\sigma^2}+ \sum_{k=1}^{p} \frac{(\ln \theta_{i,k}-\ln \theta_k)^2}{\omega_k^2} \end{aligned} \tag{15}
$$

式（15）中，$y_{i,j}$、$f_{i,j}$分别是个体$i$的第$j$个实测值和预测值；$\sigma^2$、$\omega^2$分别是残差变异和个体间变异；$\theta_k$、$\theta_{i,k}$分别是第$k$个参数的群体典型值和在个体$i$中的值，由于参数通常服从对数正态分布，因此做了对数转换。

公式的前半部分$\sum_{j=1}^{n_i} \frac{(y_{i,j}-f_{i,j}(\theta, \eta_i))^2}{\sigma^2}$是奖励项，它表示预测值和实测值的接近程度，拟合程度越好，这部分越小；后半部分$\sum_{k=1}^{p} \frac{(\ln \theta_{i,k}-\ln \theta_k)^2}{\omega_k^2}$是惩罚项，它表示个体参数值与参数群体值的接近程度，个体参数越靠近群体典型值，这部分越小。

为了使目标函数最小，模型需要通过调节每个个体的参数值，使预测值和实测值尽可能接近。但是个体参数不能无限制地调节，否则惩罚项会很大。比如，为了能拟合一些离群观测值，个体参数值必须偏离群体值很多。因此，MAPB是奖励项和惩罚项平衡的结果。

考虑如下2种情况：

-   $\sigma^2 \gg \omega^2$：导致这种情况原因可能是个体采样信息不足、生物分析方法不灵敏、采样点设计不合理、个体间变异参数过多等。在这种情况下，改善奖励项对目标函数最小化贡献很小，此时模型将倾向于使惩罚项变小，让个体参数值尽可能接近群体典型值（向群体典型值收缩），这会导致个体间变异估计失真。这种现象称为ETA收缩。
-   $\omega^2 \gg \sigma^2$：导致这种情况原因可能是个体间变异参数过少等。此时奖励项占主导地位，模型将倾向于使预测值尽可能接近实测值，残差接近于0（残差向0收缩），这会导致错误的完美拟合。这种现象称为EPSILON收缩。

ETA收缩和EPSILON收缩的计算公式（以sd形式表示）分别是：

$$
\mathrm{Shrinkage}_{ETA} = (1-\frac{\mathrm{sd}(\eta)}{\omega})\times 100\% \tag{16}
$$

$$
\mathrm{Shrinkage}_{EPS} = (1-\mathrm{sd}(\mathrm{IWRES}))\times 100\% \tag{17}
$$

## 3. 非线性混合效应模型（NONMEM）

### 3.1 多层嵌套的随机效应

NONMEM同时估计个体间变异和残差变异，它们构成了2层随机效应。

第1层：个体间变异（IIV）

$$
\theta_i = \theta_{TV} \cdot e^{\eta_{i}} \tag{18}
$$

第2层：残差变异（RUV）

$$
y_{i,j} = f(\theta_i, t_{i,j})+\varepsilon_{i,j} \tag{19}
$$

嵌套模型：

$$
y_{i,j} =f(\theta_{TV}\cdot e^{\eta_i}, t_{i,j})+\varepsilon_{i,j} \tag{20}
$$

其中，$\eta_{i} \sim N(0, \omega^2)$，$\varepsilon \sim N(0, \sigma^2)$。

### 3.2 NONMEM的目标函数

对于一个个体$x$（有$j$个观测值）：

$$
OF(x, \theta, \sigma^2) = \sum_{j=1}^{n} (\frac{(y_j-f(x_j, \theta))^2}{\sigma^2}+\ln \sigma^2) \tag{21}
$$

对于群体中的某个个体$x_i$：

$$
OF(x_i, \theta, C_i) = \sum_{j=1}^{n_i} ((y_j-f(x_j, \theta))^T C_i^{-1} (y_j-f(x_j, \theta)))+\ln(\det C_i) \tag{22}
$$

对于群体$X = (x_1, x_2, \cdots ,x_m)$：

$$
OF(X, \theta, C) = \sum_{i=1,j=1}^{m,n_i} ((y_{i,j}-f(x_{i,j}, \theta))^T C^{-1} (y_{i,j}-f(x_{i,j}, \theta)))+\sum_{i=1}^{m} \ln(\det C) \tag{23}
$$

其中，$C_i$是个体方差-协方差矩阵：

$$
C_i = G_i \Omega G_i^T + H_i \Sigma H_i^T \tag{24}
$$

式（23）中，$\Omega$、$\Sigma$分别是个体间变异和残差变异的协方差矩阵（即NONMEM中定义的OMEGA和SIGMA）；$G_i$、$H_i$分别是$f_{i,j}(x_{i,j},\theta)$在$\eta$和$\varepsilon$方向上的偏导数。

OMEGA矩阵：

$$
\Omega= \begin{bmatrix} \omega_{1,1} & \omega_{1,2}\\ \omega_{2,1} & \omega_{2,2} \end{bmatrix} \tag{25}
$$

SIGMA矩阵：

$$
\Sigma= \begin{bmatrix} \sigma_{1,1} & \sigma_{1,2}\\ \sigma_{2,1} & \sigma_{2,2} \end{bmatrix} \tag{26}
$$

### 3.3 FO近似

多层嵌套的混合效应模型的通式为

$$
y_{i,j} = f_{i,j}(\theta, \eta_i) + \varepsilon_{i,j} \tag{27}
$$

将上式在$\theta$处进行一阶泰勒（$f(x)=f(x_0)+{f}'(x_0) \cdot (x-x_0) + \xi$）展开

$$
y_{i,j} = f_{i,j}(\theta) + \frac{\partial f_{i,j}(\theta)}{\partial \eta_i} \cdot \eta_i + \varepsilon_{i,j} + \xi_{i,j} \tag{28}
$$

其中，$\xi_{i,j}$是泰勒展开的余项。由于个体间变异和残差变异均服从均值为0的正态分布，因此$y_{i,j}$的数学期望等于

$$
E(y_{i,j})=f_{i,j}(\theta) + \frac{\partial f_{i,j}(\theta)}{\partial \eta_i} \cdot 0 + 0 + E(\xi_{i,j}) \tag{29}
$$

在允许的范围内，余项可以忽略，因此

$$
E(y_{i,j}) \cong f_{i,j}(\theta) \tag{30}
$$

以上就是一阶估计（FO）的过程。

在FO算法中，个体间变异$\eta=0$，计算出群体典型值，再利用MAPB过程计算$\eta_i$。

在FOCE算法中，$\eta=\eta_i$；在含FOCE-I算法中，$\eta=\eta_i$，并且$\eta_i$包含在残差变异的方差中；在拉普拉斯算法中，进行二阶展开，$\eta=\eta_i$。

### 3.4 模型诊断

主要包括：OFV、参数点估计值、参数估计标准误（区间估计）、ETABAR、诊断图、AIC、似然比检验。

WRES仅用于FO算法（NONMEM6及之前）：

$$
E_{FO,ij}(f)=f(x_{i,j},\theta, 0) \tag{31}
$$

$$
C_i=\frac{\mathrm{d}f }{\mathrm{d} \eta_i}\mid_{\eta_i=0}\cdot \Omega \cdot \frac{\mathrm{d}f^T}{\mathrm{d} \eta_i}\mid_{\eta_i=0} + diag\left ( \frac{\mathrm{d}f }{\mathrm{d} \varepsilon_{ij}}\mid_{\varepsilon_{ij}=0}\cdot \Sigma \cdot \frac{\mathrm{d}f^T}{\mathrm{d} \varepsilon_{ij}}\mid_{\varepsilon_{ij}=0} \right )\tag{32}
$$

$$
WRES_{ij}=\frac{y_{ij}-E_{FO,ij}(f)}{\sqrt{C_i}} \tag{33}
$$

CWRES适用于各种条件算法：

$$
E_{FOCE,ij}(f)=f(x_{i,j},\theta, \eta_i)- \frac{\mathrm{d}f }{\mathrm{d} \eta_i}\mid_{\eta_i=\eta_i} \cdot \eta_i\tag{34}
$$

$$
C_i=\frac{\mathrm{d}f }{\mathrm{d} \eta_i}\mid_{\eta_i=\eta_i}\cdot \Omega \cdot \frac{\mathrm{d}f^T}{\mathrm{d} \eta_i}\mid_{\eta_i=\eta_i} + diag\left ( \frac{\mathrm{d}f }{\mathrm{d} \varepsilon_{ij}}\mid_{\varepsilon_{ij}=0}\cdot \Sigma \cdot \frac{\mathrm{d}f^T}{\mathrm{d} \varepsilon_{ij}}\mid_{\varepsilon_{ij}=0} \right )\tag{35}
$$

$$
CWRES_{ij}=\frac{y_{ij}-E_{FO,ij}(f)}{\sqrt{C_i}} \tag{36}
$$

AIC、BIC用于比较拟合优度，越低表明拟合越好，公式为

$$
AIC = -2\ln L + 2k \tag{37}
$$

$$
BIC = -2\ln L + k \ln n \tag{38}
$$

式中，$L$为似然函数，$-2\ln L$即OFV，$k$是参数个数，$n$是观测值个数。

似然比检验用于比较嵌套模型的拟合优度，检验参数的统计显著性，统计量为-2倍的似然比：

$$
-2\ln \frac{L_{full}}{L_{reduced}}=-2\ln L_{full} - (-2\ln L_{reduced})\sim \chi^2(df=\Delta p) \tag{39}
$$
