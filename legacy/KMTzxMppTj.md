<!-- meta {"date":"2021-10-13","slug":"KMTzxMppTj","title":"群体药动学算法推导","tags":["NONMEM"]} -->

对群体药动学参数估计算法的推导，内容主要来自王亚宁早年的一篇[文章](https://link.springer.com/article/10.1007/s10928-007-9060-6)。本文最初写作于2021年，目前已烂尾。

## 1. 基础知识

### 1.1 正态分布

设随机变量$x$来自正态分布$N(\mu, \sigma^2)$，则

$$
P(x \mid \mu, \sigma^2) = \frac{1}{\sqrt{2\pi \sigma^2}} \cdot \exp(\frac{x-\mu}{-2 \sigma^2}) \tag{1}
$$

式（1）称为正态分布的概率密度函数。将式（1）取对数，得

$$
-2 \ln P(x \mid \mu, \sigma^2) = \ln(2\pi \sigma^2)+\frac{(x-\mu)^2}{\sigma^2} \tag{2}
$$

### 1.2 泰勒公式

泰勒公式可以将复杂的函数近似地用多项式表示。$f(x)$在$x_0$处的一阶展开式为

$$
f(x)=f(x_0)+{f}'(x_0)(x-x_0)+\xi \tag{3}
$$

在$x_0$处的二阶展开式为

$$
f(x)=f(x_0)+\frac{{f}''(x_0)}{2} (x-x_0)^2+{f}'(x_0)(x-x_0)+\xi \tag{4}
$$

在一定的允许范围内，余项$\xi$可以忽略。

### 1.3 条件概率

设某离散型随机变量$X$来自分布$f(\theta)$。$X$有2个取值：$a$、$b$，参数$\theta$也有2个取值：$1$、$2$，则可写出如下分布律，其中，$P(a,1)$称为**联合概率**，$P(1)$、$P(a)$均称为**边缘概率**。

|  | $1$ | $2$ |  |
| --- | --- | --- | --- |
| $a$ | $P(a,1)$ | $P(a,2)$ | $P(a)$ |
| $b$ | $P(b,1)$ | $P(b,2$) | $P(b)$ |
|  | $P(1)$ | $P(2)$ | $1$ |

$X=a$的边缘概率为

$$
P(a) = P(a,1) + P(a,2) = P(a \mid 1)\cdot P(1) + P(a \mid 2) \cdot P(2) \tag{5}
$$

$\theta=1$的边缘概率为

$$
P(1) = P(1,a) + P(1,b) = P(1 \mid a)\cdot P(a) + P(1 \mid b) \cdot P(b) \tag{6}
$$

$P(a \mid 1)=\frac{P(a, 1)}{P(1)}、P(1 \mid a)=\frac{P(1, a)}{P(a)}$均称为**条件概率**。可见

$$
条件概率=\frac{联合概率}{边缘概率}
$$

将式（5）扩展

$$
P(a) = \sum P(a,i) = \sum P(a \mid i)\cdot P(i) \tag{7}
$$

将$\theta$的取值从离散（$i$）扩展到连续（$t$），$X$从离散型随机变量扩展到连续型

$$
P(x) = \int P(x,t) \mathrm{d}t = \int P(x \mid t)\cdot P(t) \mathrm{d}t \tag{8}
$$

### 1.4 似然

$P(x\mid t)$表示在参数$\theta=t$的条件下，$X=x$的概率。大多数时候，我们并不知道$\theta$的值，却有$X$的结果，即参数未知而数据已知。但是，未知参数的取值会影响数据结果，即产生数据的概率反映了未知参数的可能取值。因此，可以根据数据结果反推参数取值。

将已知数据$X=x$的情况下，$\theta=t$的可能性称为**似然**，有

$$
L(t \mid x)= P(x \mid t) \tag{9}
$$

因此，可以根据已知数据$X$，计算出$\theta$不同取值的可能性

$$
L(\theta \mid X)=P(X \mid \theta) \tag{10}
$$

$L(\theta \mid X)$是一个关于$\theta$的函数。在$\theta$的所有取值中，能够使$L(\theta \mid X)$最大化的值$\hat{\theta}$就是$\theta$最有可能的取值。我们可以把$\hat{\theta}$作为$\theta$的估计值，这种方法称为**最大似然估计**（MLE）。

### 1.5 经验贝叶斯估计

在1.3节中，已知$X=a$的条件下，$\theta=1$的概率

$$
P(1 \mid a)=\frac{P(1,a)}{P(a)}=\frac{P(a \mid 1)P(1)}{P(a)}\tag{11}
$$

式（10）中，$P(1)$、$P(1\mid a)$都表示$\theta=1$的概率，但是$P(1)$的值与$X$的取值无关，称为**先验概率**；$P(1 \mid a)$是建立在$X=a$的基础上的（额外知晓了一些信息），称为**后验概率**。分子中的$P(a \mid 1)=L(1 \mid a)$，表示$\theta=1$时产生数据$X=a$的概率，称为**似然**。分母中$P(a)$是$X=a$的**边缘概率**，在$\theta$所有的值都确定，并且$\theta$各个取值下产生$a$的概率也确定的情况下，$P(a)$是一个常数。

因此，有

$$
后验概率=\frac{似然\times 先验概率}{边缘概率} \propto 似然\times 先验概率 \tag{12}
$$

换成连续变量，在$x=x_i$的条件下，$\theta$的后验概率

$$
P(\theta \mid x_i)=\frac{P(x_i \mid \theta)\cdot P(\theta)}{\int P(x \mid \theta) P(\theta) \mathrm{d}x} \propto P(x_i \mid \theta)\cdot P(\theta) \tag{13}
$$

$P(\theta \mid x_i)$称为$\theta$的**经验贝叶斯后验分布**，将该概率最大化（最大似然），对应的$\hat{\theta}$就是$\theta$的**经验贝叶斯估计值**（EBE）。

## 2. NONMEM的参数估计

### 2.1 多层嵌套的随机效应

在NONMEM中，随机效应分为两层：（1）参数层面：个体间变异；（2）函数值层面：残差变异。

数据产生的过程如下：

-   第1步：从参数的随机变异$N(0, \omega^2)$中抽样出一个值$\eta$
-   第2步：**在已经抽到$\eta$的条件下**，将参数的典型值$\theta$和变异$\eta$，带入到事先选定的结构模型$f$中，得到预测值$f(\theta, \eta)$
-   第3步：将预测值加上一个随机变异$\varepsilon$，以表示预测值与实测值之间的残差，其中$\varepsilon$服从$N(0, \sigma^2)$

因此，在已知参数典型值$\theta$、个体间变异分布$N(0, \omega^2)$、残差变异分布$N(0, \sigma^2)$的情况下，得到数据$y$的概率（即$y$的边缘概率）为

$$
P(y\mid \theta, \omega^2, \sigma^2)=\int P(y \mid\theta, \sigma^2, \eta) P(\eta \mid \omega^2) \mathrm{d}\eta \tag{14}
$$

式（14）中，$P(\eta \mid \omega^2)$表示第1步（抽取$\eta$）的概率，$P(y \mid\theta, \sigma^2, \eta)$表示第2、3步（在抽到$\eta$情况下生成$y$）的概率。

式（14）就是NONMEM的目标函数的雏形。NONMEM的参数估计，就是根据现有数据$y$，找到最合适的$\theta$、$\omega^2$、$\sigma^2$的值，使现有数据出现的概率最大化：

$$
L(\theta, \sigma^2, \eta \mid y)=P(y \mid\theta, \sigma^2, \eta) \tag{15}
$$

相应的取值就是对应参数的估计值，这实际上前文所述的最大似然估计过程。通常会对似然函数取对数再乘以-2，因此似然函数的最大化对应NONMEM目标函数值（OFV）的最小化。

NONMEM的目标函数比较复杂，所以会进行一些近似。

### 2.2 拉普拉斯近似

式（4）是泰勒二阶展开式，由于目标函数是积分形式，并且会对其做对数处理，因此在以下表达式中对函数$f(x)$在$x_0$处做二阶泰勒展开

$$
\begin{aligned} \int \exp(f(x))&\approx\int \exp \left (f(x_0)+\frac{{f}''(x_0)}{2} (x-x_0)^2+{f}'(x_0)(x-x_0) \right ) \\ &= \exp(f(x_0))\cdot \int \exp(\frac{{f}''(x_0)}{2} (x-x_0)^2+{f}'(x_0)(x-x_0)) \\ &= \exp(f(x_0))\cdot \sqrt{\frac{2\pi}{-{f}''(x_0)}} \cdot \exp(-\frac{{f}'(x_0)^2}{2{f}''(x_0)}) \end{aligned} \tag{16}
$$

式（16）的推导来自正态分布，过程略。

NONMEM的似然函数为

$$
L(\theta, \sigma^2, \eta \mid y)=P(y \mid\theta, \sigma^2, \eta)=\int P(y \mid\theta, \sigma^2, \eta) P(\eta \mid \omega^2) \mathrm{d}\eta \tag{17}
$$

式（17）中，$P(y \mid\theta, \sigma^2, \eta)$这一项是似然。令$l(\eta)=P(y \mid\theta, \sigma^2, \eta)$，-2倍的对数似然为

$$
\Phi(\eta)=-2 \ln l(\eta) \tag{18}
$$

$\Phi(\eta)$的一阶导数和二阶导数分别是

$$
G(\eta)=-2\cdot \frac{{l}'(\eta)}{l(\eta)} \tag{19}
$$

$$
H(\eta)=-2\cdot {\left (\frac{{l}'(\eta)}{l(\eta)} \right )}' \tag{20}
$$

式（17）中，$P(\eta \mid \omega^2)$这一项是$\eta$的先验分布。令$h(\eta)=P(\eta \mid \omega^2)$，这是一个正态分布$N(0,\omega^2)$，因此

$$
h(\eta) = \frac{1}{\sqrt{2\pi \omega^2}} \cdot \exp(\frac{\eta^2}{-2\omega^2}) \tag{21}
$$

$$
{h}'(\eta) = \frac{1}{\sqrt{2\pi \omega^2}} \cdot \exp(\frac{\eta^2}{-2\omega^2})\cdot (\frac{\eta}{-\omega^2}) \tag{22}
$$

$$
\frac{{h}'(\eta)}{h(\eta)} = \frac{\eta}{-\omega^2} \tag{23}
$$

$$
{\left (\frac{{h}'(\eta)}{h(\eta)} \right )}' = \frac{1}{-\omega^2} \tag{24}
$$

令

$$
g(\eta)= \ln (l(\eta) \cdot h(\eta))
$$

则

$$
{g}'(\eta)={\ln l(\eta)}'+{\ln h(\eta)}'=\frac{{l}'(\eta)}{l(\eta)}+\frac{{h}'(\eta)}{h(\eta)}=-\frac{1}{2}G(\eta)-\frac{\eta}{\omega^2} \tag{25}
$$

$$
{g}''(\eta)={\left (\frac{{l}'(\eta)}{l(\eta)} \right )}'+{\left (\frac{{h}'(\eta)}{h(\eta)} \right )}'=-\frac{1}{2}H(\eta)-\frac{1}{\omega^2} \tag{26}
$$

则NONMEM的目标函数（即-2倍的似然函数）为

$$
\begin{aligned} -2\ln L(\theta, \sigma^2, \eta \mid y) &= -2\ln \int l(\eta)\cdot h(\eta) \mathrm{d}\eta \\ &= -2 \ln \int \exp(g(x)) \mathrm{d}\eta \\ &\approx -2 \ln \left (\exp(g(\eta_0))\cdot \sqrt{\frac{2\pi}{-{g}''(\eta_0)}} \cdot \exp\left (-\frac{{g}'(\eta_0)^2}{2{g}''(\eta_0)}\right )\right ) \\ &= -2g(\eta_0) -2 \ln \sqrt{\frac{2\pi}{-{g}''(\eta_0)}} -2 \cdot \left (-\frac{{g}'(\eta_0)^2}{2{g}''(\eta_0)}\right ) \\ &= -2 \ln (l(\eta_0) \cdot h(\eta_0)) -2 \ln \left (\frac{2\pi}{-{g}''(\eta_0)} \right )^{\frac{1}{2}} + \frac{{g}'(\eta_0)^2}{{g}''(\eta_0)} \\ &= -2 \ln l(\eta_0) -2 \ln h(\eta_0) - \ln \frac{2\pi}{-{g}''(\eta_0)} + \frac{{g}'(\eta_0)^2}{{g}''(\eta_0)} \\ &= -2 \ln l(\eta_0) +\ln(2\pi \omega^2)+\frac{\eta_0^2}{\omega^2} - \ln(2\pi) + \ln(-{g}''(\eta_0)) + \frac{{g}'(\eta_0)^2}{{g}''(\eta_0)} \\ &= -2 \ln l(\eta_0) +\ln\omega^2+\frac{\eta_0^2}{\omega^2} + \ln(-{g}''(\eta_0)) + \frac{{g}'(\eta_0)^2}{{g}''(\eta_0)} \\ &= \Phi(\eta_0) +\ln\omega^2+\frac{\eta_0^2}{\omega^2} + \ln \left (\frac{H(\eta_0)}{2}+\frac{1}{\omega^2}\right ) - \frac{(\frac{G(\eta_0)}{2}+\frac{\eta_0}{\omega^2})^2}{\frac{H(\eta_0)}{2}+\frac{1}{\omega^2}} \\ \end{aligned} \tag{27}
$$

当$\eta_0$是$g(x)$的极值点时，式（6）的最后一项等于0，因此

$$
-2\ln L(\theta, \sigma^2, \eta \mid y) = \Phi(\eta_0) +\ln\omega^2+\frac{\eta_0^2}{\omega^2} + \ln \left (\frac{H(\eta_0)}{2}+\frac{1}{\omega^2}\right ) \tag{28}
$$
