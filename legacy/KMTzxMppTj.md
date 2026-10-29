<!-- meta {"date":"2021-10-13","slug":"KMTzxMppTj","title":"群体药动学算法推导","tags":["NONMEM"]} -->

对群体药动学参数估计算法的推导，内容主要来自王亚宁早年的一篇[文章](https://link.springer.com/article/10.1007/s10928-007-9060-6)。本文最初写作于2021年，目前已烂尾。

## 1. 基础知识

### 1.1 正态分布

设随机变量xxx来自正态分布N(μ,σ2)N(\\mu, \\sigma^2)N(μ,σ2)，则

(1)P(x∣μ,σ2)\=12πσ2⋅exp⁡(x−μ−2σ2)P(x \\mid \\mu, \\sigma^2) = \\frac{1}{\\sqrt{2\\pi \\sigma^2}} \\cdot \\exp(\\frac{x-\\mu}{-2 \\sigma^2}) \\tag{1} P(x∣μ,σ2)\=2πσ2​1​⋅exp(−2σ2x−μ​)(1)

式（1）称为正态分布的概率密度函数。将式（1）取对数，得

(2)−2ln⁡P(x∣μ,σ2)\=ln⁡(2πσ2)+(x−μ)2σ2\-2 \\ln P(x \\mid \\mu, \\sigma^2) = \\ln(2\\pi \\sigma^2)+\\frac{(x-\\mu)^2}{\\sigma^2} \\tag{2} −2lnP(x∣μ,σ2)\=ln(2πσ2)+σ2(x−μ)2​(2)

### 1.2 泰勒公式

泰勒公式可以将复杂的函数近似地用多项式表示。f(x)f(x)f(x)在x0x\_0x0​处的一阶展开式为

(3)f(x)\=f(x0)+f′(x0)(x−x0)+ξf(x)=f(x\_0)+{f}'(x\_0)(x-x\_0)+\\xi \\tag{3} f(x)\=f(x0​)+f′(x0​)(x−x0​)+ξ(3)

在x0x\_0x0​处的二阶展开式为

(4)f(x)\=f(x0)+f′′(x0)2(x−x0)2+f′(x0)(x−x0)+ξf(x)=f(x\_0)+\\frac{{f}''(x\_0)}{2} (x-x\_0)^2+{f}'(x\_0)(x-x\_0)+\\xi \\tag{4} f(x)\=f(x0​)+2f′′(x0​)​(x−x0​)2+f′(x0​)(x−x0​)+ξ(4)

在一定的允许范围内，余项ξ\\xiξ可以忽略。

### 1.3 条件概率

设某离散型随机变量XXX来自分布f(θ)f(\\theta)f(θ)。XXX有2个取值：aaa、bbb，参数θ\\thetaθ也有2个取值：111、222，则可写出如下分布律，其中，P(a,1)P(a,1)P(a,1)称为**联合概率**，P(1)P(1)P(1)、P(a)P(a)P(a)均称为**边缘概率**。

|  | 111 | 222 |  |
| --- | --- | --- | --- |
| aaa | P(a,1)P(a,1)P(a,1) | P(a,2)P(a,2)P(a,2) | P(a)P(a)P(a) |
| bbb | P(b,1)P(b,1)P(b,1) | P(b,2P(b,2P(b,2) | P(b)P(b)P(b) |
|  | P(1)P(1)P(1) | P(2)P(2)P(2) | 111 |

X\=aX=aX\=a的边缘概率为

(5)P(a)\=P(a,1)+P(a,2)\=P(a∣1)⋅P(1)+P(a∣2)⋅P(2)P(a) = P(a,1) + P(a,2) = P(a \\mid 1)\\cdot P(1) + P(a \\mid 2) \\cdot P(2) \\tag{5} P(a)\=P(a,1)+P(a,2)\=P(a∣1)⋅P(1)+P(a∣2)⋅P(2)(5)

θ\=1\\theta=1θ\=1的边缘概率为

(6)P(1)\=P(1,a)+P(1,b)\=P(1∣a)⋅P(a)+P(1∣b)⋅P(b)P(1) = P(1,a) + P(1,b) = P(1 \\mid a)\\cdot P(a) + P(1 \\mid b) \\cdot P(b) \\tag{6} P(1)\=P(1,a)+P(1,b)\=P(1∣a)⋅P(a)+P(1∣b)⋅P(b)(6)

P(a∣1)\=P(a,1)P(1)、P(1∣a)\=P(1,a)P(a)P(a \\mid 1)=\\frac{P(a, 1)}{P(1)}、P(1 \\mid a)=\\frac{P(1, a)}{P(a)}P(a∣1)\=P(1)P(a,1)​、P(1∣a)\=P(a)P(1,a)​均称为**条件概率**。可见

条件概率\=联合概率边缘概率条件概率=\\frac{联合概率}{边缘概率} 条件概率\=边缘概率联合概率​

将式（5）扩展

(7)P(a)\=∑P(a,i)\=∑P(a∣i)⋅P(i)P(a) = \\sum P(a,i) = \\sum P(a \\mid i)\\cdot P(i) \\tag{7} P(a)\=∑P(a,i)\=∑P(a∣i)⋅P(i)(7)

将θ\\thetaθ的取值从离散（iii）扩展到连续（ttt），XXX从离散型随机变量扩展到连续型

(8)P(x)\=∫P(x,t)dt\=∫P(x∣t)⋅P(t)dtP(x) = \\int P(x,t) \\mathrm{d}t = \\int P(x \\mid t)\\cdot P(t) \\mathrm{d}t \\tag{8} P(x)\=∫P(x,t)dt\=∫P(x∣t)⋅P(t)dt(8)

### 1.4 似然

P(x∣t)P(x\\mid t)P(x∣t)表示在参数θ\=t\\theta=tθ\=t的条件下，X\=xX=xX\=x的概率。大多数时候，我们并不知道θ\\thetaθ的值，却有XXX的结果，即参数未知而数据已知。但是，未知参数的取值会影响数据结果，即产生数据的概率反映了未知参数的可能取值。因此，可以根据数据结果反推参数取值。

将已知数据X\=xX=xX\=x的情况下，θ\=t\\theta=tθ\=t的可能性称为**似然**，有

(9)L(t∣x)\=P(x∣t)L(t \\mid x)= P(x \\mid t) \\tag{9} L(t∣x)\=P(x∣t)(9)

因此，可以根据已知数据XXX，计算出θ\\thetaθ不同取值的可能性

(10)L(θ∣X)\=P(X∣θ)L(\\theta \\mid X)=P(X \\mid \\theta) \\tag{10} L(θ∣X)\=P(X∣θ)(10)

L(θ∣X)L(\\theta \\mid X)L(θ∣X)是一个关于θ\\thetaθ的函数。在θ\\thetaθ的所有取值中，能够使L(θ∣X)L(\\theta \\mid X)L(θ∣X)最大化的值θ^\\hat{\\theta}θ^就是θ\\thetaθ最有可能的取值。我们可以把θ^\\hat{\\theta}θ^作为θ\\thetaθ的估计值，这种方法称为**最大似然估计**（MLE）。

### 1.5 经验贝叶斯估计

在1.3节中，已知X\=aX=aX\=a的条件下，θ\=1\\theta=1θ\=1的概率

(11)P(1∣a)\=P(1,a)P(a)\=P(a∣1)P(1)P(a)P(1 \\mid a)=\\frac{P(1,a)}{P(a)}=\\frac{P(a \\mid 1)P(1)}{P(a)}\\tag{11} P(1∣a)\=P(a)P(1,a)​\=P(a)P(a∣1)P(1)​(11)

式（10）中，P(1)P(1)P(1)、P(1∣a)P(1\\mid a)P(1∣a)都表示θ\=1\\theta=1θ\=1的概率，但是P(1)P(1)P(1)的值与XXX的取值无关，称为**先验概率**；P(1∣a)P(1 \\mid a)P(1∣a)是建立在X\=aX=aX\=a的基础上的（额外知晓了一些信息），称为**后验概率**。分子中的P(a∣1)\=L(1∣a)P(a \\mid 1)=L(1 \\mid a)P(a∣1)\=L(1∣a)，表示θ\=1\\theta=1θ\=1时产生数据X\=aX=aX\=a的概率，称为**似然**。分母中P(a)P(a)P(a)是X\=aX=aX\=a的**边缘概率**，在θ\\thetaθ所有的值都确定，并且θ\\thetaθ各个取值下产生aaa的概率也确定的情况下，P(a)P(a)P(a)是一个常数。

因此，有

(12)后验概率\=似然×先验概率边缘概率∝似然×先验概率后验概率=\\frac{似然\\times 先验概率}{边缘概率} \\propto 似然\\times 先验概率 \\tag{12} 后验概率\=边缘概率似然×先验概率​∝似然×先验概率(12)

换成连续变量，在x\=xix=x\_ix\=xi​的条件下，θ\\thetaθ的后验概率

(13)P(θ∣xi)\=P(xi∣θ)⋅P(θ)∫P(x∣θ)P(θ)dx∝P(xi∣θ)⋅P(θ)P(\\theta \\mid x\_i)=\\frac{P(x\_i \\mid \\theta)\\cdot P(\\theta)}{\\int P(x \\mid \\theta) P(\\theta) \\mathrm{d}x} \\propto P(x\_i \\mid \\theta)\\cdot P(\\theta) \\tag{13} P(θ∣xi​)\=∫P(x∣θ)P(θ)dxP(xi​∣θ)⋅P(θ)​∝P(xi​∣θ)⋅P(θ)(13)

P(θ∣xi)P(\\theta \\mid x\_i)P(θ∣xi​)称为θ\\thetaθ的**经验贝叶斯后验分布**，将该概率最大化（最大似然），对应的θ^\\hat{\\theta}θ^就是θ\\thetaθ的**经验贝叶斯估计值**（EBE）。

## 2. NONMEM的参数估计

### 2.1 多层嵌套的随机效应

在NONMEM中，随机效应分为两层：（1）参数层面：个体间变异；（2）函数值层面：残差变异。

数据产生的过程如下：

-   第1步：从参数的随机变异N(0,ω2)N(0, \\omega^2)N(0,ω2)中抽样出一个值η\\etaη
-   第2步：**在已经抽到η\\etaη的条件下**，将参数的典型值θ\\thetaθ和变异η\\etaη，带入到事先选定的结构模型fff中，得到预测值f(θ,η)f(\\theta, \\eta)f(θ,η)
-   第3步：将预测值加上一个随机变异ε\\varepsilonε，以表示预测值与实测值之间的残差，其中ε\\varepsilonε服从N(0,σ2)N(0, \\sigma^2)N(0,σ2)

因此，在已知参数典型值θ\\thetaθ、个体间变异分布N(0,ω2)N(0, \\omega^2)N(0,ω2)、残差变异分布N(0,σ2)N(0, \\sigma^2)N(0,σ2)的情况下，得到数据yyy的概率（即yyy的边缘概率）为

(14)P(y∣θ,ω2,σ2)\=∫P(y∣θ,σ2,η)P(η∣ω2)dηP(y\\mid \\theta, \\omega^2, \\sigma^2)=\\int P(y \\mid\\theta, \\sigma^2, \\eta) P(\\eta \\mid \\omega^2) \\mathrm{d}\\eta \\tag{14} P(y∣θ,ω2,σ2)\=∫P(y∣θ,σ2,η)P(η∣ω2)dη(14)

式（14）中，P(η∣ω2)P(\\eta \\mid \\omega^2)P(η∣ω2)表示第1步（抽取η\\etaη）的概率，P(y∣θ,σ2,η)P(y \\mid\\theta, \\sigma^2, \\eta)P(y∣θ,σ2,η)表示第2、3步（在抽到η\\etaη情况下生成yyy）的概率。

式（14）就是NONMEM的目标函数的雏形。NONMEM的参数估计，就是根据现有数据yyy，找到最合适的θ\\thetaθ、ω2\\omega^2ω2、σ2\\sigma^2σ2的值，使现有数据出现的概率最大化：

(15)L(θ,σ2,η∣y)\=P(y∣θ,σ2,η)L(\\theta, \\sigma^2, \\eta \\mid y)=P(y \\mid\\theta, \\sigma^2, \\eta) \\tag{15} L(θ,σ2,η∣y)\=P(y∣θ,σ2,η)(15)

相应的取值就是对应参数的估计值，这实际上前文所述的最大似然估计过程。通常会对似然函数取对数再乘以-2，因此似然函数的最大化对应NONMEM目标函数值（OFV）的最小化。

NONMEM的目标函数比较复杂，所以会进行一些近似。

### 2.2 拉普拉斯近似

式（4）是泰勒二阶展开式，由于目标函数是积分形式，并且会对其做对数处理，因此在以下表达式中对函数f(x)f(x)f(x)在x0x\_0x0​处做二阶泰勒展开

(16)∫exp⁡(f(x))≈∫exp⁡(f(x0)+f′′(x0)2(x−x0)2+f′(x0)(x−x0))\=exp⁡(f(x0))⋅∫exp⁡(f′′(x0)2(x−x0)2+f′(x0)(x−x0))\=exp⁡(f(x0))⋅2π−f′′(x0)⋅exp⁡(−f′(x0)22f′′(x0))\\begin{aligned} \\int \\exp(f(x))&\\approx\\int \\exp \\left (f(x\_0)+\\frac{{f}''(x\_0)}{2} (x-x\_0)^2+{f}'(x\_0)(x-x\_0) \\right ) \\\\ &= \\exp(f(x\_0))\\cdot \\int \\exp(\\frac{{f}''(x\_0)}{2} (x-x\_0)^2+{f}'(x\_0)(x-x\_0)) \\\\ &= \\exp(f(x\_0))\\cdot \\sqrt{\\frac{2\\pi}{-{f}''(x\_0)}} \\cdot \\exp(-\\frac{{f}'(x\_0)^2}{2{f}''(x\_0)}) \\end{aligned} \\tag{16} ∫exp(f(x))​≈∫exp(f(x0​)+2f′′(x0​)​(x−x0​)2+f′(x0​)(x−x0​))\=exp(f(x0​))⋅∫exp(2f′′(x0​)​(x−x0​)2+f′(x0​)(x−x0​))\=exp(f(x0​))⋅−f′′(x0​)2π​​⋅exp(−2f′′(x0​)f′(x0​)2​)​(16)

式（16）的推导来自正态分布，过程略。

NONMEM的似然函数为

(17)L(θ,σ2,η∣y)\=P(y∣θ,σ2,η)\=∫P(y∣θ,σ2,η)P(η∣ω2)dηL(\\theta, \\sigma^2, \\eta \\mid y)=P(y \\mid\\theta, \\sigma^2, \\eta)=\\int P(y \\mid\\theta, \\sigma^2, \\eta) P(\\eta \\mid \\omega^2) \\mathrm{d}\\eta \\tag{17} L(θ,σ2,η∣y)\=P(y∣θ,σ2,η)\=∫P(y∣θ,σ2,η)P(η∣ω2)dη(17)

式（17）中，P(y∣θ,σ2,η)P(y \\mid\\theta, \\sigma^2, \\eta)P(y∣θ,σ2,η)这一项是似然。令l(η)\=P(y∣θ,σ2,η)l(\\eta)=P(y \\mid\\theta, \\sigma^2, \\eta)l(η)\=P(y∣θ,σ2,η)，-2倍的对数似然为

(18)Φ(η)\=−2ln⁡l(η)\\Phi(\\eta)=-2 \\ln l(\\eta) \\tag{18} Φ(η)\=−2lnl(η)(18)

Φ(η)\\Phi(\\eta)Φ(η)的一阶导数和二阶导数分别是

(19)G(η)\=−2⋅l′(η)l(η)G(\\eta)=-2\\cdot \\frac{{l}'(\\eta)}{l(\\eta)} \\tag{19} G(η)\=−2⋅l(η)l′(η)​(19)

(20)H(η)\=−2⋅(l′(η)l(η))′H(\\eta)=-2\\cdot {\\left (\\frac{{l}'(\\eta)}{l(\\eta)} \\right )}' \\tag{20} H(η)\=−2⋅(l(η)l′(η)​)′(20)

式（17）中，P(η∣ω2)P(\\eta \\mid \\omega^2)P(η∣ω2)这一项是η\\etaη的先验分布。令h(η)\=P(η∣ω2)h(\\eta)=P(\\eta \\mid \\omega^2)h(η)\=P(η∣ω2)，这是一个正态分布N(0,ω2)N(0,\\omega^2)N(0,ω2)，因此

(21)h(η)\=12πω2⋅exp⁡(η2−2ω2)h(\\eta) = \\frac{1}{\\sqrt{2\\pi \\omega^2}} \\cdot \\exp(\\frac{\\eta^2}{-2\\omega^2}) \\tag{21} h(η)\=2πω2​1​⋅exp(−2ω2η2​)(21)

(22)h′(η)\=12πω2⋅exp⁡(η2−2ω2)⋅(η−ω2){h}'(\\eta) = \\frac{1}{\\sqrt{2\\pi \\omega^2}} \\cdot \\exp(\\frac{\\eta^2}{-2\\omega^2})\\cdot (\\frac{\\eta}{-\\omega^2}) \\tag{22} h′(η)\=2πω2​1​⋅exp(−2ω2η2​)⋅(−ω2η​)(22)

(23)h′(η)h(η)\=η−ω2\\frac{{h}'(\\eta)}{h(\\eta)} = \\frac{\\eta}{-\\omega^2} \\tag{23} h(η)h′(η)​\=−ω2η​(23)

(24)(h′(η)h(η))′\=1−ω2{\\left (\\frac{{h}'(\\eta)}{h(\\eta)} \\right )}' = \\frac{1}{-\\omega^2} \\tag{24} (h(η)h′(η)​)′\=−ω21​(24)

令

g(η)\=ln⁡(l(η)⋅h(η))g(\\eta)= \\ln (l(\\eta) \\cdot h(\\eta)) g(η)\=ln(l(η)⋅h(η))

则

(25)g′(η)\=ln⁡l(η)′+ln⁡h(η)′\=l′(η)l(η)+h′(η)h(η)\=−12G(η)−ηω2{g}'(\\eta)={\\ln l(\\eta)}'+{\\ln h(\\eta)}'=\\frac{{l}'(\\eta)}{l(\\eta)}+\\frac{{h}'(\\eta)}{h(\\eta)}=-\\frac{1}{2}G(\\eta)-\\frac{\\eta}{\\omega^2} \\tag{25} g′(η)\=lnl(η)′+lnh(η)′\=l(η)l′(η)​+h(η)h′(η)​\=−21​G(η)−ω2η​(25)

(26)g′′(η)\=(l′(η)l(η))′+(h′(η)h(η))′\=−12H(η)−1ω2{g}''(\\eta)={\\left (\\frac{{l}'(\\eta)}{l(\\eta)} \\right )}'+{\\left (\\frac{{h}'(\\eta)}{h(\\eta)} \\right )}'=-\\frac{1}{2}H(\\eta)-\\frac{1}{\\omega^2} \\tag{26} g′′(η)\=(l(η)l′(η)​)′+(h(η)h′(η)​)′\=−21​H(η)−ω21​(26)

则NONMEM的目标函数（即-2倍的似然函数）为

(27)−2ln⁡L(θ,σ2,η∣y)\=−2ln⁡∫l(η)⋅h(η)dη\=−2ln⁡∫exp⁡(g(x))dη≈−2ln⁡(exp⁡(g(η0))⋅2π−g′′(η0)⋅exp⁡(−g′(η0)22g′′(η0)))\=−2g(η0)−2ln⁡2π−g′′(η0)−2⋅(−g′(η0)22g′′(η0))\=−2ln⁡(l(η0)⋅h(η0))−2ln⁡(2π−g′′(η0))12+g′(η0)2g′′(η0)\=−2ln⁡l(η0)−2ln⁡h(η0)−ln⁡2π−g′′(η0)+g′(η0)2g′′(η0)\=−2ln⁡l(η0)+ln⁡(2πω2)+η02ω2−ln⁡(2π)+ln⁡(−g′′(η0))+g′(η0)2g′′(η0)\=−2ln⁡l(η0)+ln⁡ω2+η02ω2+ln⁡(−g′′(η0))+g′(η0)2g′′(η0)\=Φ(η0)+ln⁡ω2+η02ω2+ln⁡(H(η0)2+1ω2)−(G(η0)2+η0ω2)2H(η0)2+1ω2\\begin{aligned} -2\\ln L(\\theta, \\sigma^2, \\eta \\mid y) &= -2\\ln \\int l(\\eta)\\cdot h(\\eta) \\mathrm{d}\\eta \\\\ &= -2 \\ln \\int \\exp(g(x)) \\mathrm{d}\\eta \\\\ &\\approx -2 \\ln \\left (\\exp(g(\\eta\_0))\\cdot \\sqrt{\\frac{2\\pi}{-{g}''(\\eta\_0)}} \\cdot \\exp\\left (-\\frac{{g}'(\\eta\_0)^2}{2{g}''(\\eta\_0)}\\right )\\right ) \\\\ &= -2g(\\eta\_0) -2 \\ln \\sqrt{\\frac{2\\pi}{-{g}''(\\eta\_0)}} -2 \\cdot \\left (-\\frac{{g}'(\\eta\_0)^2}{2{g}''(\\eta\_0)}\\right ) \\\\ &= -2 \\ln (l(\\eta\_0) \\cdot h(\\eta\_0)) -2 \\ln \\left (\\frac{2\\pi}{-{g}''(\\eta\_0)} \\right )^{\\frac{1}{2}} + \\frac{{g}'(\\eta\_0)^2}{{g}''(\\eta\_0)} \\\\ &= -2 \\ln l(\\eta\_0) -2 \\ln h(\\eta\_0) - \\ln \\frac{2\\pi}{-{g}''(\\eta\_0)} + \\frac{{g}'(\\eta\_0)^2}{{g}''(\\eta\_0)} \\\\ &= -2 \\ln l(\\eta\_0) +\\ln(2\\pi \\omega^2)+\\frac{\\eta\_0^2}{\\omega^2} - \\ln(2\\pi) + \\ln(-{g}''(\\eta\_0)) + \\frac{{g}'(\\eta\_0)^2}{{g}''(\\eta\_0)} \\\\ &= -2 \\ln l(\\eta\_0) +\\ln\\omega^2+\\frac{\\eta\_0^2}{\\omega^2} + \\ln(-{g}''(\\eta\_0)) + \\frac{{g}'(\\eta\_0)^2}{{g}''(\\eta\_0)} \\\\ &= \\Phi(\\eta\_0) +\\ln\\omega^2+\\frac{\\eta\_0^2}{\\omega^2} + \\ln \\left (\\frac{H(\\eta\_0)}{2}+\\frac{1}{\\omega^2}\\right ) - \\frac{(\\frac{G(\\eta\_0)}{2}+\\frac{\\eta\_0}{\\omega^2})^2}{\\frac{H(\\eta\_0)}{2}+\\frac{1}{\\omega^2}} \\\\ \\end{aligned} \\tag{27} −2lnL(θ,σ2,η∣y)​\=−2ln∫l(η)⋅h(η)dη\=−2ln∫exp(g(x))dη≈−2ln(exp(g(η0​))⋅−g′′(η0​)2π​​⋅exp(−2g′′(η0​)g′(η0​)2​))\=−2g(η0​)−2ln−g′′(η0​)2π​​−2⋅(−2g′′(η0​)g′(η0​)2​)\=−2ln(l(η0​)⋅h(η0​))−2ln(−g′′(η0​)2π​)21​+g′′(η0​)g′(η0​)2​\=−2lnl(η0​)−2lnh(η0​)−ln−g′′(η0​)2π​+g′′(η0​)g′(η0​)2​\=−2lnl(η0​)+ln(2πω2)+ω2η02​​−ln(2π)+ln(−g′′(η0​))+g′′(η0​)g′(η0​)2​\=−2lnl(η0​)+lnω2+ω2η02​​+ln(−g′′(η0​))+g′′(η0​)g′(η0​)2​\=Φ(η0​)+lnω2+ω2η02​​+ln(2H(η0​)​+ω21​)−2H(η0​)​+ω21​(2G(η0​)​+ω2η0​​)2​​(27)

当η0\\eta\_0η0​是g(x)g(x)g(x)的极值点时，式（6）的最后一项等于0，因此

(28)−2ln⁡L(θ,σ2,η∣y)\=Φ(η0)+ln⁡ω2+η02ω2+ln⁡(H(η0)2+1ω2)\-2\\ln L(\\theta, \\sigma^2, \\eta \\mid y) = \\Phi(\\eta\_0) +\\ln\\omega^2+\\frac{\\eta\_0^2}{\\omega^2} + \\ln \\left (\\frac{H(\\eta\_0)}{2}+\\frac{1}{\\omega^2}\\right ) \\tag{28} −2lnL(θ,σ2,η∣y)\=Φ(η0​)+lnω2+ω2η02​​+ln(2H(η0​)​+ω21​)(28)
