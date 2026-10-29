<!-- meta {"date":"2022-06-09","slug":"YT2BcPhUTV","title":"群体药动学入门","tags":["NONMEM"]} -->

群体药动学（Population PK）是药代动力学和统计学结合的产物，这里简述其统计学理论基础。

## 1. 最大似然估计和最小二乘法

### 1.1 最大似然估计

最大似然估计（MLE）是一种估计未知参数的方法。它将参数θ\\thetaθ的所有取值中，有最大的可能性得到当前样本结果的值θ^\\hat{\\theta}θ^，作为参数的估计值。

在参数θ\\thetaθ的条件下，产生当前样本YYY的概率是P(Y∣θ)P(Y \\mid \\theta)P(Y∣θ)。MLE估计θ\\thetaθ的过程就是使这一概率最大化，解出对应的θ\\thetaθ值。似然函数L(θ∣Y)\=P(Y∣θ)L(\\theta \\mid Y) = P(Y \\mid \\theta)L(θ∣Y)\=P(Y∣θ)。

### 1.2 正态分布的MLE

自变量xjx\_jxj​和因变量yjy\_jyj​有如下关系：

(1)yj\=f(xj,θ)+εjy\_j = f(x\_j, \\theta) + \\varepsilon\_j \\tag{1} yj​\=f(xj​,θ)+εj​(1)

其中，jjj表示第jjj次观测，fff是结构模型，θ\\thetaθ是模型中的参数，εj\\varepsilon\_jεj​是残差，服从正态分布：εj∼N(0,σ2)\\varepsilon\_j \\sim N(0, \\sigma^2)εj​∼N(0,σ2)。因此，

(2)yj∼N(f(xj,θ),σ2)y\_j \\sim N(f(x\_j, \\theta), \\sigma^2) \\tag{2} yj​∼N(f(xj​,θ),σ2)(2)

根据正态分布的概率密度函数（f(x)\=12πσ2e−(x−μ)22σ2f(x)=\\frac{1}{\\sqrt{2\\pi \\sigma^2}}e^{-\\frac{(x-\\mu)^2}{2\\sigma^2}}f(x)\=2πσ2​1​e−2σ2(x−μ)2​），在参数θ\\thetaθ和σ2\\sigma^2σ2的条件下，产生观测值yjy\_jyj​的概率是

(3)L(θ,σ2∣yj)\=P(yj∣θ,σ2)\=12πσ2⋅exp⁡((yj−f(xj,θ))2−2σ2)L(\\theta, \\sigma^2 \\mid y\_j) = P(y\_j \\mid \\theta, \\sigma^2) = \\frac{1}{\\sqrt{2\\pi \\sigma^2}} \\cdot \\exp(\\frac{(y\_j-f(x\_j, \\theta))^2}{-2 \\sigma^2}) \\tag{3} L(θ,σ2∣yj​)\=P(yj​∣θ,σ2)\=2πσ2​1​⋅exp(−2σ2(yj​−f(xj​,θ))2​)(3)

由于每次观测（yjy\_jyj​）之间相互独立，则进行nnn次观测之后，构成样本Y\=(y1,y2,⋯ ,yn)Y = (y\_1, y\_2, \\cdots, y\_n)Y\=(y1​,y2​,⋯,yn​)的概率是每次观测值的概率之积

(4)L(θ,σ2∣Y)\=P(Y∣θ,σ2)\=∏j\=1n(12πσ2⋅exp⁡((yj−f(xj,θ))2−2σ2))L(\\theta, \\sigma^2 \\mid Y) = P(Y \\mid \\theta, \\sigma^2) = \\prod\_{j=1}^{n} (\\frac{1}{\\sqrt{2\\pi \\sigma^2}} \\cdot \\exp(\\frac{(y\_j-f(x\_j, \\theta))^2}{-2 \\sigma^2})) \\tag{4} L(θ,σ2∣Y)\=P(Y∣θ,σ2)\=j\=1∏n​(2πσ2​1​⋅exp(−2σ2(yj​−f(xj​,θ))2​))(4)

由于似然函数是连乘的形式，计算导数求极值点不方便，因此将其取对数

(5)ln⁡L(θ,σ2∣Y)\=∑j\=1nln⁡(12πσ2⋅exp⁡((yj−f(xj,θ))2−2σ2))\=∑j\=1n(ln⁡12πσ2+(yj−f(xj,θ))2−2σ2)\=∑j\=1nln⁡(2πσ2)−12+∑j\=1n(yj−f(xj,θ))2−2σ2\=−n2ln⁡(2πσ2)−12∑j\=1n(yj−f(xj,θ))2σ2\\begin{aligned} \\ln L(\\theta, \\sigma^2 \\mid Y) &=\\sum\_{j=1}^{n} \\ln (\\frac{1}{\\sqrt{2\\pi \\sigma^2}} \\cdot \\exp(\\frac{(y\_j-f(x\_j, \\theta))^2}{-2 \\sigma^2})) \\\\ &=\\sum\_{j=1}^{n} (\\ln \\frac{1}{\\sqrt{2\\pi \\sigma^2}} + \\frac{(y\_j-f(x\_j, \\theta))^2}{-2 \\sigma^2}) \\\\ &=\\sum\_{j=1}^{n} \\ln (2\\pi \\sigma^2)^{-\\frac{1}{2}} + \\sum\_{j=1}^{n} \\frac{(y\_j-f(x\_j, \\theta))^2}{-2 \\sigma^2} \\\\ &=-\\frac{n}{2}\\ln (2\\pi \\sigma^2) -\\frac{1}{2} \\sum\_{j=1}^{n} \\frac{(y\_j-f(x\_j, \\theta))^2}{\\sigma^2} \\\\ \\end{aligned} \\tag{5} lnL(θ,σ2∣Y)​\=j\=1∑n​ln(2πσ2​1​⋅exp(−2σ2(yj​−f(xj​,θ))2​))\=j\=1∑n​(ln2πσ2​1​+−2σ2(yj​−f(xj​,θ))2​)\=j\=1∑n​ln(2πσ2)−21​+j\=1∑n​−2σ2(yj​−f(xj​,θ))2​\=−2n​ln(2πσ2)−21​j\=1∑n​σ2(yj​−f(xj​,θ))2​​(5)

将式（5）两边乘以-2，得

(6)−2ln⁡L(θ∣Y)\=nln⁡(2πσ2)+∑j\=1n(yj−f(xj,θ))2σ2\=∑j\=1n((yj−f(xj,θ))2σ2+ln⁡σ2)+nln⁡(2π)\\begin{aligned} -2 \\ln L(\\theta \\mid Y) &= n\\ln (2\\pi \\sigma^2) + \\sum\_{j=1}^{n} \\frac{(y\_j-f(x\_j, \\theta))^2}{\\sigma^2} \\\\ &= \\sum\_{j=1}^{n} (\\frac{(y\_j-f(x\_j, \\theta))^2}{\\sigma^2} + \\ln\\sigma^2) + n\\ln(2\\pi) \\end{aligned} \\tag{6} −2lnL(θ∣Y)​\=nln(2πσ2)+j\=1∑n​σ2(yj​−f(xj​,θ))2​\=j\=1∑n​(σ2(yj​−f(xj​,θ))2​+lnσ2)+nln(2π)​(6)

式（6）中的nln⁡(2π)n\\ln(2\\pi)nln(2π)项是常数，NONMEM计算时不会纳入这部分，因此，式（7）为NONMEM中正态分布MLE的目标函数

(7)OFML(xj,θ,σ2)\=∑j\=1n((yj−f(xj,θ))2σ2+ln⁡σ2)OF\_{ML}(x\_j, \\theta, \\sigma^2) = \\sum\_{j=1}^{n} (\\frac{(y\_j-f(x\_j, \\theta))^2}{\\sigma^2} + \\ln\\sigma^2) \\tag{7} OFML​(xj​,θ,σ2)\=j\=1∑n​(σ2(yj​−f(xj​,θ))2​+lnσ2)(7)

将OFML(xj,θ,σ2)OF\_{ML}(x\_j, \\theta, \\sigma^2)OFML​(xj​,θ,σ2)最小化（即将似然最大化），对应的θ\\thetaθ和σ2\\sigma^2σ2就是似然估计值。

### 1.3 普通最小二乘法（OLS）

普通最小二乘法不作任何处理，目标函数为

(8)OFOLS\=∑j\=1n(obsj−predj)2OF\_{OLS} = \\sum\_{j=1}^{n} (obs\_j-pred\_j)^2 \\tag{8} OFOLS​\=j\=1∑n​(obsj​−predj​)2(8)

其中，obsjobs\_jobsj​和predjpred\_jpredj​分别是第jjj次观测的实测值和预测值。

### 1.4 加权最小二乘法（WLS）

当观测值的尺度很大时，对应的变异值也会很大，直接相加不合理，需要根据观测值进行加权。目标函数为

(9)OFWLS\=∑j\=1n((obsj−predj)2⋅wj)OF\_{WLS} = \\sum\_{j=1}^{n} ((obs\_j-pred\_j)^2 \\cdot w\_j)\\tag{9} OFWLS​\=j\=1∑n​((obsj​−predj​)2⋅wj​)(9)

其中，wj\=1obsjw\_j = \\frac{1}{obs\_j}wj​\=obsj​1​。

### 1.5 扩展最小二乘法（ELS）

WLS的权重是固定的（观测值），而不是模型估计的结果，扩展最小二乘法使用模型估计值作为权重。目标函数为

(10)OFELS\=∑j\=1n((obsj−predj)2σj2+ln⁡σj2)OF\_{ELS} = \\sum\_{j=1}^{n} (\\frac{(obs\_j-pred\_j)^2}{\\sigma\_j^2} + \\ln\\sigma\_j^2) \\tag{10} OFELS​\=j\=1∑n​(σj2​(obsj​−predj​)2​+lnσj2​)(10)

式（10）的形式就是NONMEM中正态分布MLE的目标函数。

## 2. 群体PK分析方法

### 2.1 简单聚集法（NP）

简单聚集法将所有的数据视为来自同一人，忽略了个体间变异。目标函数为

(11)OFWLS,NP\=∑j\=1n((obsj−f(θ)j)2⋅wj)OF\_{WLS,NP} = \\sum\_{j=1}^{n} ((obs\_j-f(\\theta)\_j)^2 \\cdot w\_j)\\tag{11} OFWLS,NP​\=j\=1∑n​((obsj​−f(θ)j​)2⋅wj​)(11)

### 2.2 简单平均法（NA）

简单平均法是先计算所有人在各个时间点的均值，再使用最小二乘法。目标函数为

(12)OFWLS,NA\=∑j\=1n((obsj−f(θ)j)2⋅wj)OF\_{WLS,NA} = \\sum\_{j=1}^{n} ((obs\_j-f(\\theta)\_j)^2 \\cdot w\_j)\\tag{12} OFWLS,NA​\=j\=1∑n​((obsj​−f(θ)j​)2⋅wj​)(12)

其中，obsjobs\_jobsj​是所有人在第jjj次观测的均值。

### 2.3 标准两步法（STS）

第1步：计算每个人的参数θi\\theta\_iθi​

(13)OFWLS,STS\=∑j\=1n((obsj−f(θ)j)2⋅wj)OF\_{WLS,STS} = \\sum\_{j=1}^{n} ((obs\_j-f(\\theta)\_j)^2 \\cdot w\_j)\\tag{13} OFWLS,STS​\=j\=1∑n​((obsj​−f(θ)j​)2⋅wj​)(13)

第2步：根据每个人的参数值，计算均值、方差、变异系数等，并探索协变量关系

(14)CLi\=A+B⋅CrCLiCL\_i = A + B \\cdot CrCL\_i \\tag{14} CLi​\=A+B⋅CrCLi​(14)

### 2.4 最大后验贝叶斯估计（MAPB）

在已知群体典型值（θ\\thetaθ）、个体间变异（Ω\\OmegaΩ）、残差变异（σ2\\sigma^2σ2）这些先验信息的情况下，最大化后验概率来估计个体参数（ηi\\eta\_iηi​：刻画了个体参数与群体典型值的差异）。这通过最小化以下目标函数实现

(15)OFPOSTHOCi\=∑j\=1ni(yi,j−fi,j(θ,ηi))2σ2+η′Ω−1η\=∑j\=1ni(yi,j−fi,j(θ,ηi))2σ2+∑k\=1p(ln⁡θi,k−ln⁡θk)2ωk2\\begin{aligned} OF\_{POSTHOC\_i} &= \\sum\_{j=1}^{n\_i} \\frac{(y\_{i,j}-f\_{i,j}(\\theta, \\eta\_i))^2}{\\sigma^2}+ \\eta'\\Omega^{-1}\\eta \\\\ &= \\sum\_{j=1}^{n\_i} \\frac{(y\_{i,j}-f\_{i,j}(\\theta, \\eta\_i))^2}{\\sigma^2}+ \\sum\_{k=1}^{p} \\frac{(\\ln \\theta\_{i,k}-\\ln \\theta\_k)^2}{\\omega\_k^2} \\end{aligned} \\tag{15} OFPOSTHOCi​​​\=j\=1∑ni​​σ2(yi,j​−fi,j​(θ,ηi​))2​+η′Ω−1η\=j\=1∑ni​​σ2(yi,j​−fi,j​(θ,ηi​))2​+k\=1∑p​ωk2​(lnθi,k​−lnθk​)2​​(15)

式（15）中，yi,jy\_{i,j}yi,j​、fi,jf\_{i,j}fi,j​分别是个体iii的第jjj个实测值和预测值；σ2\\sigma^2σ2、ω2\\omega^2ω2分别是残差变异和个体间变异；θk\\theta\_kθk​、θi,k\\theta\_{i,k}θi,k​分别是第kkk个参数的群体典型值和在个体iii中的值，由于参数通常服从对数正态分布，因此做了对数转换。

公式的前半部分∑j\=1ni(yi,j−fi,j(θ,ηi))2σ2\\sum\_{j=1}^{n\_i} \\frac{(y\_{i,j}-f\_{i,j}(\\theta, \\eta\_i))^2}{\\sigma^2}∑j\=1ni​​σ2(yi,j​−fi,j​(θ,ηi​))2​是奖励项，它表示预测值和实测值的接近程度，拟合程度越好，这部分越小；后半部分∑k\=1p(ln⁡θi,k−ln⁡θk)2ωk2\\sum\_{k=1}^{p} \\frac{(\\ln \\theta\_{i,k}-\\ln \\theta\_k)^2}{\\omega\_k^2}∑k\=1p​ωk2​(lnθi,k​−lnθk​)2​是惩罚项，它表示个体参数值与参数群体值的接近程度，个体参数越靠近群体典型值，这部分越小。

为了使目标函数最小，模型需要通过调节每个个体的参数值，使预测值和实测值尽可能接近。但是个体参数不能无限制地调节，否则惩罚项会很大。比如，为了能拟合一些离群观测值，个体参数值必须偏离群体值很多。因此，MAPB是奖励项和惩罚项平衡的结果。

考虑如下2种情况：

-   σ2≫ω2\\sigma^2 \\gg \\omega^2σ2≫ω2：导致这种情况原因可能是个体采样信息不足、生物分析方法不灵敏、采样点设计不合理、个体间变异参数过多等。在这种情况下，改善奖励项对目标函数最小化贡献很小，此时模型将倾向于使惩罚项变小，让个体参数值尽可能接近群体典型值（向群体典型值收缩），这会导致个体间变异估计失真。这种现象称为ETA收缩。
-   ω2≫σ2\\omega^2 \\gg \\sigma^2ω2≫σ2：导致这种情况原因可能是个体间变异参数过少等。此时奖励项占主导地位，模型将倾向于使预测值尽可能接近实测值，残差接近于0（残差向0收缩），这会导致错误的完美拟合。这种现象称为EPSILON收缩。

ETA收缩和EPSILON收缩的计算公式（以sd形式表示）分别是：

(16)ShrinkageETA\=(1−sd(η)ω)×100%\\mathrm{Shrinkage}\_{ETA} = (1-\\frac{\\mathrm{sd}(\\eta)}{\\omega})\\times 100\\% \\tag{16} ShrinkageETA​\=(1−ωsd(η)​)×100%(16)

(17)ShrinkageEPS\=(1−sd(IWRES))×100%\\mathrm{Shrinkage}\_{EPS} = (1-\\mathrm{sd}(\\mathrm{IWRES}))\\times 100\\% \\tag{17} ShrinkageEPS​\=(1−sd(IWRES))×100%(17)

## 3. 非线性混合效应模型（NONMEM）

### 3.1 多层嵌套的随机效应

NONMEM同时估计个体间变异和残差变异，它们构成了2层随机效应。

第1层：个体间变异（IIV）

(18)θi\=θTV⋅eηi\\theta\_i = \\theta\_{TV} \\cdot e^{\\eta\_{i}} \\tag{18} θi​\=θTV​⋅eηi​(18)

第2层：残差变异（RUV）

(19)yi,j\=f(θi,ti,j)+εi,jy\_{i,j} = f(\\theta\_i, t\_{i,j})+\\varepsilon\_{i,j} \\tag{19} yi,j​\=f(θi​,ti,j​)+εi,j​(19)

嵌套模型：

(20)yi,j\=f(θTV⋅eηi,ti,j)+εi,jy\_{i,j} =f(\\theta\_{TV}\\cdot e^{\\eta\_i}, t\_{i,j})+\\varepsilon\_{i,j} \\tag{20} yi,j​\=f(θTV​⋅eηi​,ti,j​)+εi,j​(20)

其中，ηi∼N(0,ω2)\\eta\_{i} \\sim N(0, \\omega^2)ηi​∼N(0,ω2)，ε∼N(0,σ2)\\varepsilon \\sim N(0, \\sigma^2)ε∼N(0,σ2)。

### 3.2 NONMEM的目标函数

对于一个个体xxx（有jjj个观测值）：

(21)OF(x,θ,σ2)\=∑j\=1n((yj−f(xj,θ))2σ2+ln⁡σ2)OF(x, \\theta, \\sigma^2) = \\sum\_{j=1}^{n} (\\frac{(y\_j-f(x\_j, \\theta))^2}{\\sigma^2}+\\ln \\sigma^2) \\tag{21} OF(x,θ,σ2)\=j\=1∑n​(σ2(yj​−f(xj​,θ))2​+lnσ2)(21)

对于群体中的某个个体xix\_ixi​：

(22)OF(xi,θ,Ci)\=∑j\=1ni((yj−f(xj,θ))TCi−1(yj−f(xj,θ)))+ln⁡(det⁡Ci)OF(x\_i, \\theta, C\_i) = \\sum\_{j=1}^{n\_i} ((y\_j-f(x\_j, \\theta))^T C\_i^{-1} (y\_j-f(x\_j, \\theta)))+\\ln(\\det C\_i) \\tag{22} OF(xi​,θ,Ci​)\=j\=1∑ni​​((yj​−f(xj​,θ))TCi−1​(yj​−f(xj​,θ)))+ln(detCi​)(22)

对于群体X\=(x1,x2,⋯ ,xm)X = (x\_1, x\_2, \\cdots ,x\_m)X\=(x1​,x2​,⋯,xm​)：

(23)OF(X,θ,C)\=∑i\=1,j\=1m,ni((yi,j−f(xi,j,θ))TC−1(yi,j−f(xi,j,θ)))+∑i\=1mln⁡(det⁡C)OF(X, \\theta, C) = \\sum\_{i=1,j=1}^{m,n\_i} ((y\_{i,j}-f(x\_{i,j}, \\theta))^T C^{-1} (y\_{i,j}-f(x\_{i,j}, \\theta)))+\\sum\_{i=1}^{m} \\ln(\\det C) \\tag{23} OF(X,θ,C)\=i\=1,j\=1∑m,ni​​((yi,j​−f(xi,j​,θ))TC−1(yi,j​−f(xi,j​,θ)))+i\=1∑m​ln(detC)(23)

其中，CiC\_iCi​是个体方差-协方差矩阵：

(24)Ci\=GiΩGiT+HiΣHiTC\_i = G\_i \\Omega G\_i^T + H\_i \\Sigma H\_i^T \\tag{24} Ci​\=Gi​ΩGiT​+Hi​ΣHiT​(24)

式（23）中，Ω\\OmegaΩ、Σ\\SigmaΣ分别是个体间变异和残差变异的协方差矩阵（即NONMEM中定义的OMEGA和SIGMA）；GiG\_iGi​、HiH\_iHi​分别是fi,j(xi,j,θ)f\_{i,j}(x\_{i,j},\\theta)fi,j​(xi,j​,θ)在η\\etaη和ε\\varepsilonε方向上的偏导数。

OMEGA矩阵：

(25)Ω\=\[ω1,1ω1,2ω2,1ω2,2\]\\Omega= \\begin{bmatrix} \\omega\_{1,1} & \\omega\_{1,2}\\\\ \\omega\_{2,1} & \\omega\_{2,2} \\end{bmatrix} \\tag{25} Ω\=\[ω1,1​ω2,1​​ω1,2​ω2,2​​\](25)

SIGMA矩阵：

(26)Σ\=\[σ1,1σ1,2σ2,1σ2,2\]\\Sigma= \\begin{bmatrix} \\sigma\_{1,1} & \\sigma\_{1,2}\\\\ \\sigma\_{2,1} & \\sigma\_{2,2} \\end{bmatrix} \\tag{26} Σ\=\[σ1,1​σ2,1​​σ1,2​σ2,2​​\](26)

### 3.3 FO近似

多层嵌套的混合效应模型的通式为

(27)yi,j\=fi,j(θ,ηi)+εi,jy\_{i,j} = f\_{i,j}(\\theta, \\eta\_i) + \\varepsilon\_{i,j} \\tag{27} yi,j​\=fi,j​(θ,ηi​)+εi,j​(27)

将上式在θ\\thetaθ处进行一阶泰勒（f(x)\=f(x0)+f′(x0)⋅(x−x0)+ξf(x)=f(x\_0)+{f}'(x\_0) \\cdot (x-x\_0) + \\xif(x)\=f(x0​)+f′(x0​)⋅(x−x0​)+ξ）展开

(28)yi,j\=fi,j(θ)+∂fi,j(θ)∂ηi⋅ηi+εi,j+ξi,jy\_{i,j} = f\_{i,j}(\\theta) + \\frac{\\partial f\_{i,j}(\\theta)}{\\partial \\eta\_i} \\cdot \\eta\_i + \\varepsilon\_{i,j} + \\xi\_{i,j} \\tag{28} yi,j​\=fi,j​(θ)+∂ηi​∂fi,j​(θ)​⋅ηi​+εi,j​+ξi,j​(28)

其中，ξi,j\\xi\_{i,j}ξi,j​是泰勒展开的余项。由于个体间变异和残差变异均服从均值为0的正态分布，因此yi,jy\_{i,j}yi,j​的数学期望等于

(29)E(yi,j)\=fi,j(θ)+∂fi,j(θ)∂ηi⋅0+0+E(ξi,j)E(y\_{i,j})=f\_{i,j}(\\theta) + \\frac{\\partial f\_{i,j}(\\theta)}{\\partial \\eta\_i} \\cdot 0 + 0 + E(\\xi\_{i,j}) \\tag{29} E(yi,j​)\=fi,j​(θ)+∂ηi​∂fi,j​(θ)​⋅0+0+E(ξi,j​)(29)

在允许的范围内，余项可以忽略，因此

(30)E(yi,j)≅fi,j(θ)E(y\_{i,j}) \\cong f\_{i,j}(\\theta) \\tag{30} E(yi,j​)≅fi,j​(θ)(30)

以上就是一阶估计（FO）的过程。

在FO算法中，个体间变异η\=0\\eta=0η\=0，计算出群体典型值，再利用MAPB过程计算ηi\\eta\_iηi​。

在FOCE算法中，η\=ηi\\eta=\\eta\_iη\=ηi​；在含FOCE-I算法中，η\=ηi\\eta=\\eta\_iη\=ηi​，并且ηi\\eta\_iηi​包含在残差变异的方差中；在拉普拉斯算法中，进行二阶展开，η\=ηi\\eta=\\eta\_iη\=ηi​。

### 3.4 模型诊断

主要包括：OFV、参数点估计值、参数估计标准误（区间估计）、ETABAR、诊断图、AIC、似然比检验。

WRES仅用于FO算法（NONMEM6及之前）：

(31)EFO,ij(f)\=f(xi,j,θ,0)E\_{FO,ij}(f)=f(x\_{i,j},\\theta, 0) \\tag{31} EFO,ij​(f)\=f(xi,j​,θ,0)(31)

(32)Ci\=dfdηi∣ηi\=0⋅Ω⋅dfTdηi∣ηi\=0+diag(dfdεij∣εij\=0⋅Σ⋅dfTdεij∣εij\=0)C\_i=\\frac{\\mathrm{d}f }{\\mathrm{d} \\eta\_i}\\mid\_{\\eta\_i=0}\\cdot \\Omega \\cdot \\frac{\\mathrm{d}f^T}{\\mathrm{d} \\eta\_i}\\mid\_{\\eta\_i=0} + diag\\left ( \\frac{\\mathrm{d}f }{\\mathrm{d} \\varepsilon\_{ij}}\\mid\_{\\varepsilon\_{ij}=0}\\cdot \\Sigma \\cdot \\frac{\\mathrm{d}f^T}{\\mathrm{d} \\varepsilon\_{ij}}\\mid\_{\\varepsilon\_{ij}=0} \\right )\\tag{32} Ci​\=dηi​df​∣ηi​\=0​⋅Ω⋅dηi​dfT​∣ηi​\=0​+diag(dεij​df​∣εij​\=0​⋅Σ⋅dεij​dfT​∣εij​\=0​)(32)

(33)WRESij\=yij−EFO,ij(f)CiWRES\_{ij}=\\frac{y\_{ij}-E\_{FO,ij}(f)}{\\sqrt{C\_i}} \\tag{33} WRESij​\=Ci​​yij​−EFO,ij​(f)​(33)

CWRES适用于各种条件算法：

(34)EFOCE,ij(f)\=f(xi,j,θ,ηi)−dfdηi∣ηi\=ηi⋅ηiE\_{FOCE,ij}(f)=f(x\_{i,j},\\theta, \\eta\_i)- \\frac{\\mathrm{d}f }{\\mathrm{d} \\eta\_i}\\mid\_{\\eta\_i=\\eta\_i} \\cdot \\eta\_i\\tag{34} EFOCE,ij​(f)\=f(xi,j​,θ,ηi​)−dηi​df​∣ηi​\=ηi​​⋅ηi​(34)

(35)Ci\=dfdηi∣ηi\=ηi⋅Ω⋅dfTdηi∣ηi\=ηi+diag(dfdεij∣εij\=0⋅Σ⋅dfTdεij∣εij\=0)C\_i=\\frac{\\mathrm{d}f }{\\mathrm{d} \\eta\_i}\\mid\_{\\eta\_i=\\eta\_i}\\cdot \\Omega \\cdot \\frac{\\mathrm{d}f^T}{\\mathrm{d} \\eta\_i}\\mid\_{\\eta\_i=\\eta\_i} + diag\\left ( \\frac{\\mathrm{d}f }{\\mathrm{d} \\varepsilon\_{ij}}\\mid\_{\\varepsilon\_{ij}=0}\\cdot \\Sigma \\cdot \\frac{\\mathrm{d}f^T}{\\mathrm{d} \\varepsilon\_{ij}}\\mid\_{\\varepsilon\_{ij}=0} \\right )\\tag{35} Ci​\=dηi​df​∣ηi​\=ηi​​⋅Ω⋅dηi​dfT​∣ηi​\=ηi​​+diag(dεij​df​∣εij​\=0​⋅Σ⋅dεij​dfT​∣εij​\=0​)(35)

(36)CWRESij\=yij−EFO,ij(f)CiCWRES\_{ij}=\\frac{y\_{ij}-E\_{FO,ij}(f)}{\\sqrt{C\_i}} \\tag{36} CWRESij​\=Ci​​yij​−EFO,ij​(f)​(36)

AIC、BIC用于比较拟合优度，越低表明拟合越好，公式为

(37)AIC\=−2ln⁡L+2kAIC = -2\\ln L + 2k \\tag{37} AIC\=−2lnL+2k(37)

(38)BIC\=−2ln⁡L+kln⁡nBIC = -2\\ln L + k \\ln n \\tag{38} BIC\=−2lnL+klnn(38)

式中，LLL为似然函数，−2ln⁡L\-2\\ln L−2lnL即OFV，kkk是参数个数，nnn是观测值个数。

似然比检验用于比较嵌套模型的拟合优度，检验参数的统计显著性，统计量为-2倍的似然比：

(39)−2ln⁡LfullLreduced\=−2ln⁡Lfull−(−2ln⁡Lreduced)∼χ2(df\=Δp)\-2\\ln \\frac{L\_{full}}{L\_{reduced}}=-2\\ln L\_{full} - (-2\\ln L\_{reduced})\\sim \\chi^2(df=\\Delta p) \\tag{39} −2lnLreduced​Lfull​​\=−2lnLfull​−(−2lnLreduced​)∼χ2(df\=Δp)(39)
